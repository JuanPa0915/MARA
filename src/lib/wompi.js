const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

const SUPABASE_URL = 'https://uxoltcjvvkicrzewtdab.supabase.co';

if (!PUBLIC_KEY) {
  console.warn(
    '[Wompi] Falta VITE_WOMPI_PUBLIC_KEY en el archivo vite.config.js'
  );
}

export function generateReference() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MARA-${Date.now()}-${rand}`;
}

export async function generateSignature(reference, amountInCents, currency = 'COP') {
  const functionUrl = `${SUPABASE_URL}/functions/v1/wompi-signature`;

  console.log('🔍 Solicitando firma al servidor...', { reference, amountInCents, currency });

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey,
    },
    body: JSON.stringify({ reference, amountInCents, currency }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error HTTP ${res.status} al generar la firma`);
  }

  const data = await res.json();
  console.log('✅ Firma generada desde el servidor');
  
  if (data.debug) {
    console.log('🔬 DEBUG - textWithCurrency:', data.debug.textWithCurrency);
    console.log('🔬 DEBUG - textWithoutCurrency:', data.debug.textWithoutCurrency);
    console.log('🔬 DEBUG - amountInCents:', data.debug.amountInCents);
    console.log('🔬 DEBUG - reference:', data.debug.reference);
    console.log('🔬 DEBUG - keyPreview:', data.debug.keyPreview);
  }
  
  console.log('🔬 DEBUG - signatureWithCurrency:', data.signatureWithCurrency);
  console.log('🔬 DEBUG - signatureWithoutCurrency:', data.signatureWithoutCurrency);
  
  // SOLUCIÓN AL 403: Retornamos prioritariamente la firma obligatoria con "COP" 
  // que es la requerida por el validador estándar de Wompi.
  return data.signatureWithCurrency || data.signature || data;
}

export const openWompiWidget = (config) => {
  return new Promise((resolve) => {
    if (!PUBLIC_KEY) {
      alert(
        'Error de configuración: Falta la llave pública de Wompi (VITE_WOMPI_PUBLIC_KEY).\n' +
        'Revisa la consola para más detalles.'
      );
      resolve({ status: 'ERROR' });
      return;
    }

    if (!window.WidgetCheckout) {
      console.log('Inyectando script de Wompi dinámicamente...');
      const urls = [
        'https://checkout.wompi.co/widget.js',
        'https://checkout.wompi.co/widget/v1.js',
      ];
      tryCargarScript(urls, 0, config, resolve);
    } else {
      inicializarWidget(config, resolve);
    }
  });
};

const tryCargarScript = (urls, index, config, resolve) => {
  if (index >= urls.length) {
    console.error('❌ Se agotaron todas las URLs de Wompi.');
    alert('Error de carga del widget. Revisa la consola (F12) para ver el reporte técnico.');
    resolve({ status: 'ERROR' });
    return;
  }

  const script = document.createElement('script');
  script.src = urls[index];
  script.async = true;
  script.onload = () => {
    console.log(`Script de Wompi cargado con éxito desde: ${urls[index]}`);
    inicializarWidget(config, resolve);
  };
  script.onerror = (errorEvent) => {
    console.error(`❌ Falló URL ${urls[index]}:`, errorEvent);
    tryCargarScript(urls, index + 1, config, resolve);
  };
  document.head.appendChild(script);
};

const inicializarWidget = (config, resolve) => {
  try {
    const widgetConfig = {
      currency: 'COP',
      publicKey: PUBLIC_KEY,
      amountInCents: Number(config.amountInCents),
      reference: config.reference,
      redirectUrl: config.redirectUrl,
      // FIRMA REACTIVADA: Le pasamos el valor que retorna generateSignature
      signature: config.signature, 
    };

    // Log ultra blindado con encadenamiento opcional para evitar fallos de "substring"
    console.log('🔬 WidgetCheckout config:', {
      ...widgetConfig,
      publicKey: widgetConfig.publicKey ? widgetConfig.publicKey.substring(0, 12) + '…' : 'Falta',
      signature: widgetConfig.signature ? widgetConfig.signature.substring(0, 16) + '…' : 'Falta / No generada',
    });

    const checkout = new window.WidgetCheckout(widgetConfig);

    checkout.open((result) => {
      resolve(result.transaction);
    });
  } catch (err) {
    console.error('Error al instanciar el Widget Checkout:', err);
    resolve({ status: 'ERROR', error: err });
  }
};