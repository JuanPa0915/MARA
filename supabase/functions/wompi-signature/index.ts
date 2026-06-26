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

function countItems(items: Array<{ id: string | number }>) {
  return items.reduce((counts, item) => {
    const id = String(item?.id ?? '').trim()
    if (!id) return counts
    counts.set(id, (counts.get(id) ?? 0) + 1)
    return counts
  }, new Map<string, number>())
}

async function calculateAmountFromCatalog(items: Array<{ id: string | number }>) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Carrito invalido')
  }

  const counts = countItems(items)
  if (counts.size === 0 || counts.size > 50 || items.length > 100) {
    throw new Error('Carrito invalido')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin no configurado')
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('id, precio, stock')
    .in('id', [...counts.keys()])

  if (error) throw error

  const productsById = new Map((data ?? []).map((product) => [String(product.id), product]))
  let total = 0

  for (const [id, quantity] of counts) {
    const product = productsById.get(id)
    const price = Number(product?.precio)
    const stock = Number(product?.stock ?? 0)

    if (!product || !Number.isSafeInteger(price) || price <= 0) {
      throw new Error('Producto invalido')
    }

    if (stock < quantity) {
      throw new Error('Stock insuficiente')
    }

    total += price * quantity
  }

  return total * 100
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) })
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Metodo no permitido' }, 405)
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return jsonResponse(req, { error: 'Body JSON invalido' }, 400)
    }

    const reference = String(body.reference ?? '').trim()
    const amountInCents = Number(body.amountInCents)
    const currency = String(body.currency || 'COP').trim().toUpperCase()
    const items = Array.isArray(body.items) ? body.items : []

    if (!/^MARA-\d{10,}-[A-Z0-9]{6}$/.test(reference)) {
      return jsonResponse(req, { error: 'Referencia invalida' }, 400)
    }

    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      return jsonResponse(req, { error: 'Monto invalido' }, 400)
    }

    if (currency !== 'COP') {
      return jsonResponse(req, { error: 'Moneda no soportada' }, 400)
    }

    const catalogAmountInCents = await calculateAmountFromCatalog(items).catch((error) => {
      console.error('[wompi-signature] Validacion de catalogo fallida:', error)
      return null
    })

    if (!catalogAmountInCents) {
      return jsonResponse(req, { error: 'No se pudo validar el total del carrito' }, 400)
    }

    if (catalogAmountInCents !== amountInCents) {
      return jsonResponse(req, { error: 'El monto no coincide con el catalogo' }, 400)
    }

    const integrityKey = Deno.env.get('WOMPI_INTEGRITY_KEY')?.trim()
    if (!integrityKey) {
      return jsonResponse(req, { error: 'WOMPI_INTEGRITY_KEY no configurada' }, 500)
    }

    const textToHash = `${reference}${catalogAmountInCents}${currency}${integrityKey}`
    const encoded = new TextEncoder().encode(textToHash)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')

    return jsonResponse(req, { signature, amountInCents: catalogAmountInCents })
  } catch (error) {
    console.error('[wompi-signature] Error inesperado:', error)
    return jsonResponse(req, { error: 'Error inesperado en el servidor' }, 500)
  }
})
