const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
const SUPABASE_URL = 'https://uxoltcjvvkicrzewtdab.supabase.co';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js';

/**
 * Genera una referencia única para el pedido.
 */
export function generateReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `MARA-${Date.now()}-${rand}`;
}

/**
 * Firma la transacción solicitando el hash al backend.
 * Pasamos los items para que el backend pueda validar el precio real en la BD.
 */
export async function generateSignature(reference, amountInCents, items = []) {
  if (!reference || !amountInCents) {
    throw new Error('Datos incompletos para generar la firma.');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/wompi-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({ 
      reference, 
      amountInCents: Math.round(Number(amountInCents)),
      // 🎯 CLAVE: Le enviamos los IDs de los productos al backend para la validación
      items: items.map((item) => ({ id: item.id }))
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al firmar la transacción con el servidor.');
  }
  
  return data.signature;
}

/**
 * Carga el widget de Wompi y abre el checkout.
 */
export const openWompiWidget = (config) => new Promise((resolve, reject) => {
  if (!config.amountInCents || !config.reference || !config.signature) {
    return reject(new Error('Configuración de pago incompleta.'));
  }

  const init = () => {
    try {
      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        publicKey: PUBLIC_KEY,
        amountInCents: Math.round(Number(config.amountInCents)),
        reference: config.reference,
        signature: { integrity: config.signature },
        customerData: {
          email: config.customerData.email,
          fullName: config.customerData.fullName,
          phoneNumber: config.customerData.phoneNumber,
          phoneNumberPrefix: config.customerData.phoneNumberPrefix,
          legalId: config.customerData.legalId,
          legalIdType: config.customerData.legalIdType
        }
      });

      checkout.open((result) => {
        if (result.transaction) {
          resolve(result.transaction);
        } else {
          resolve({ status: 'CANCELLED' });
        }
      });
    } catch (e) {
      reject(new Error('Error al inicializar el widget de Wompi: ' + e.message));
    }
  };

  if (!window.WidgetCheckout) {
    const script = document.createElement('script');
    script.src = WOMPI_WIDGET_URL;
    script.async = true;
    script.onload = init;
    script.onerror = () => reject(new Error('No se pudo cargar el script de Wompi.'));
    document.head.appendChild(script);
  } else {
    init();
  }
});