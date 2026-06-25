import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reference, amountInCents, currency } = await req.json()
    const rawKey = Deno.env.get('WOMPI_INTEGRITY_KEY') || ''

    const refStr = String(reference).replace(/[\r\n\t ]/g, '')
    const amountStr = String(amountInCents).replace(/[\r\n\t ]/g, '')
    const currencyStr = String(currency || 'COP').replace(/[\r\n\t ]/g, '')
    const keyStr = rawKey.replace(/[\r\n\t ]/g, '')

    if (!keyStr) {
      throw new Error('Falta la variable WOMPI_INTEGRITY_KEY en el servidor')
    }

    const textWithCurrency = `${refStr}${amountStr}${currencyStr}${keyStr}`
    const textWithoutCurrency = `${refStr}${amountStr}${keyStr}`

    console.log('[wompi-signature] reference:', refStr)
    console.log('[wompi-signature] amountInCents:', amountStr)
    console.log('[wompi-signature] currency:', currencyStr)
    console.log('[wompi-signature] integrityKey (primeros 10):', keyStr.substring(0, 10))
    console.log('[wompi-signature] textWithCurrency:', `${refStr}${amountStr}${currencyStr}[KEY_OCULTA]`)
    console.log('[wompi-signature] textWithoutCurrency:', `${refStr}${amountStr}[KEY_OCULTA]`)

    const encoder = new TextEncoder()

    const dataWith = encoder.encode(textWithCurrency)
    const hashWith = await crypto.subtle.digest('SHA-256', dataWith)
    const arrWith = Array.from(new Uint8Array(hashWith))
    const signatureWithCurrency = arrWith.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase()

    const dataWithout = encoder.encode(textWithoutCurrency)
    const hashWithout = await crypto.subtle.digest('SHA-256', dataWithout)
    const arrWithout = Array.from(new Uint8Array(hashWithout))
    const signatureWithoutCurrency = arrWithout.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase()

    console.log('[wompi-signature] signatureWithCurrency:', signatureWithCurrency)
    console.log('[wompi-signature] signatureWithoutCurrency:', signatureWithoutCurrency)

    const keyPreview = keyStr.substring(0, 8) + '...' + keyStr.slice(-4)

    return new Response(
      JSON.stringify({
        signatureWithCurrency,
        signatureWithoutCurrency,
        signature: signatureWithCurrency,
        debug: {
          reference: refStr,
          amountInCents: amountStr,
          currency: currencyStr,
          keyPreview,
          textWithCurrency: `${refStr}${amountStr}${currencyStr}[${keyPreview}]`,
          textWithoutCurrency: `${refStr}${amountStr}[${keyPreview}]`,
          keyLength: keyStr.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[wompi-signature] error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
