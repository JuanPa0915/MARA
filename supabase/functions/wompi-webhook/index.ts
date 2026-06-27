import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

function buildCorsHeaders(req: Request) {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN')?.trim()
  const origin = req.headers.get('origin') ?? ''
  const responseOrigin = allowedOrigin && origin === allowedOrigin ? origin : (allowedOrigin ? 'null' : '*')

  return {
    'Access-Control-Allow-Origin': responseOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      headers: { ...buildCorsHeaders(req), 'Content-Type': 'application/json' },
      status,
    },
  )
}

function getValueByPath(obj: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)

  if (value === undefined || value === null) return ''
  return String(value)
}

async function verifyEventSignature(
  body: Record<string, unknown>,
  eventsSecret: string,
): Promise<boolean> {
  const signature = body.signature as Record<string, unknown> | undefined
  if (!signature || !Array.isArray(signature.properties) || typeof signature.checksum !== 'string') {
    return false
  }

  const data = body.data as Record<string, unknown> | undefined
  if (!data) return false

  const properties = signature.properties as string[]
  const checksum = signature.checksum
  const concatenated = properties
    .map((prop) => getValueByPath(data, prop))
    .join('') + eventsSecret

  const encoded = new TextEncoder().encode(concatenated)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return hash === checksum
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) })
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Metodo no permitido' }, 405)
  }

  try {
    const eventsSecret = Deno.env.get('WOMPI_EVENTS_SECRET')?.trim()
    if (!eventsSecret) {
      console.error('[wompi-webhook] WOMPI_EVENTS_SECRET no configurado')
      return jsonResponse(req, { error: 'Error de configuracion del servidor' }, 500)
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return jsonResponse(req, { error: 'Body JSON invalido' }, 400)
    }

    const isValid = await verifyEventSignature(body as Record<string, unknown>, eventsSecret)
    if (!isValid) {
      console.warn('[wompi-webhook] Firma de evento invalida')
      return jsonResponse(req, { error: 'Firma invalida' }, 401)
    }

    const event = (body as Record<string, unknown>).event as string | undefined
    const data = (body as Record<string, unknown>).data as Record<string, unknown> | undefined
    const transaction = data?.transaction as Record<string, unknown> | undefined

    if (event === 'transaction.updated' && transaction) {
      const reference = String(transaction.reference ?? '').trim()
      const status = String(transaction.status ?? '').trim()
      const wompiId = String(transaction.id ?? '').trim()

      console.log(`[wompi-webhook] Transaccion ${wompiId}, referencia: ${reference}, estado: ${status}`)

      // Mapear estado de Wompi al estado en la base de datos
      // Estados posibles de Wompi: APPROVED, DECLINED, VOID, ERROR, PENDING
      let nuevoEstado: string
      if (status === 'APPROVED') {
        nuevoEstado = 'pagado'
      } else if (status === 'DECLINED' || status === 'VOID' || status === 'ERROR') {
        nuevoEstado = 'rechazado'
      } else {
        nuevoEstado = 'pendiente'
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()

      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase admin no configurado')
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

      // Si tu tabla se llama 'orders' en vez de 'pedidos',
      // cambia .from('pedidos') y ajusta las columnas segun tu esquema.
      const { error: updateError } = await supabaseAdmin
        .from('pedidos')
        .update({
          estado_pago: nuevoEstado,
          transaccion_id: wompiId,
        })
        .eq('referencia_wompi', reference)

      if (updateError) {
        console.error('[wompi-webhook] Error actualizando la orden:', updateError)
        return jsonResponse(req, { error: 'Error al actualizar la orden' }, 500)
      }

      console.log(`[wompi-webhook] Orden ${reference} actualizada a ${nuevoEstado}`)
    }

    return jsonResponse(req, { received: true })
  } catch (error) {
    console.error('[wompi-webhook] Error inesperado:', error)
    return jsonResponse(req, { error: 'Error inesperado en el servidor' }, 500)
  }
})
