import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de peticiones CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Inicializar cliente de Supabase usando la clave del sistema (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Leer el cuerpo de la petición enviada por Wompi
    const body = await req.json()
    console.log("📦 Evento recibido de Wompi:", JSON.stringify(body))

    const { event, data } = body
    const transaction = data?.transaction

    // 3. Validar que sea el evento correcto de transacción terminada
    if (event === 'transaction.updated' && transaction) {
      const reference = transaction.reference // Esta es la cadena 'MARA-XXXXXX'
      const status = transaction.status       // 'APPROVED', 'DECLINED', etc.
      const wompiId = transaction.id

      console.log(`🎯 Procesando transacción ${wompiId}. Referencia: ${reference}. Estado: ${status}`)

      // Mapeamos el estado de Wompi al estado que manejas en tu columna 'estado_pago'
      let nuevoEstado = 'pendiente'
      if (status === 'APPROVED') {
        nuevoEstado = 'pagado'
      } else if (status === 'DECLINED' || status === 'ERROR') {
        nuevoEstado = 'rechazado'
      }

      // 4. Actualizar usando los nombres exactos del esquema de image_ad13a2.png
      const { error, data: updateData } = await supabaseAdmin
        .from('pedidos')
        .update({ 
          estado_pago: nuevoEstado,     // ✅ Verificado en el esquema
          transaccion_id: wompiId       // ✅ Verificado en el esquema
        })
        .eq('referencia_wompi', reference) // 🎯 ¡CORREGIDO! Así se llama tu columna real

      if (error) {
        console.error("❌ Error actualizando la base de datos:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`✅ Base de datos actualizada con éxito para la referencia: ${reference}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("❌ Error crítico en el Webhook:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})