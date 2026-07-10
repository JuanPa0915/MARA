import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function buildCorsHeaders(_req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "https://mara-bags.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    status,
  });
}

async function sha256(cadena: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(cadena);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyEventSignature(
  body: Record<string, unknown>,
  eventsSecret: string
): Promise<boolean> {
  const signature = body.signature as Record<string, unknown> | undefined;
  const checksum = String(signature?.checksum ?? "").trim();

  if (!checksum) {
    console.warn("[wompi-webhook] Payload sin signature.checksum");
    return false;
  }

  const data = body.data as Record<string, unknown> | undefined;
  const transaction = data?.transaction as Record<string, unknown> | undefined;

  if (!transaction) {
    console.warn("[wompi-webhook] Payload sin data.transaction");
    return false;
  }

  const id = String(transaction.id ?? "");
  const status = String(transaction.status ?? "");
  const amount = String(transaction.amount_in_cents ?? "");
  const timestampRaiz = body.timestamp ? String(body.timestamp) : "";

  if (!id || !status) {
    console.warn("[wompi-webhook] transaction.id o transaction.status vacios");
    return false;
  }

  const checksumLower = checksum.toLowerCase();

  // Estandar Wompi: SHA-256(id + status + amount + timestamp + secret)
  const hashEstandar = await sha256(`${id}${status}${amount}${timestampRaiz}${eventsSecret}`);
  if (hashEstandar === checksumLower) return true;

  // Fallback (versiones previas de Wompi sin timestamp): SHA-256(id + status + amount + secret)
  const hashFallback = await sha256(`${id}${status}${amount}${eventsSecret}`);
  if (hashFallback === checksumLower) return true;

  console.error("[wompi-webhook] FIRMA INVALIDA — ninguna combinacion coincide");
  return false;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: buildCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Metodo no permitido" }, 405);
  }

  try {
    const eventsSecret = Deno.env.get("WOMPI_EVENTS_SECRET")?.trim();
    if (!eventsSecret) {
      console.error("[wompi-webhook] WOMPI_EVENTS_SECRET no configurado");
      return jsonResponse(
        req,
        { error: "Error de configuracion del servidor" },
        500
      );
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse(req, { error: "Body JSON invalido" }, 400);
    }

    const eventBody = body as Record<string, unknown>;
    const data = eventBody.data as Record<string, unknown> | undefined;
    const transaction = data?.transaction as Record<string, unknown> | undefined;
    const id = String(transaction?.id ?? "").trim();
    const status = String(transaction?.status ?? "").trim();

    console.log(
      `[wompi-webhook] Evento recibido: ${String(eventBody.event ?? "desconocido")}, transaccion ${id}, estado: ${status}`
    );

    // ─── VALIDACION ESTRICTA DE FIRMA ───────────────────────────────
    const isValid = await verifyEventSignature(eventBody, eventsSecret);

    if (!isValid) {
      console.error("[wompi-webhook] Firma invalida — rechazando evento");
      return jsonResponse(req, { error: "Firma invalida" }, 401);
    }

    console.log("[wompi-webhook] Firma verificada exitosamente");

    // ─── PROCESAR SOLO TRANSACCIONES APROBADAS ─────────────────────
    if (status === "APPROVED") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Supabase admin no configurado");
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const referenciaWompi = (transaction?.reference as string) ?? "";
      const transaccionId = transaction?.id ?? "";

      console.log(`[wompi-webhook] Procesando transaccion ${transaccionId}, referencia: ${referenciaWompi}`);

      // Buscar el pedido por transaccion_id o referencia_wompi
      const { data: pedido } = await supabaseAdmin
        .from("pedidos")
        .select("id, producto_id, estado_pago")
        .or(`transaccion_id.eq.${transaccionId},referencia_wompi.eq.${referenciaWompi}`)
        .limit(1)
        .single();

      if (!pedido) {
        console.warn(`[wompi-webhook] No se encontro pedido para transaccion ${transaccionId}`);
        return jsonResponse(req, { received: true });
      }

      if (pedido.estado_pago === "APROBADO" || pedido.estado_pago === "pagado") {
        console.log(`[wompi-webhook] Pedido ${pedido.id} ya fue procesado — omitiendo`);
        return jsonResponse(req, { received: true });
      }

      const { error: updateError } = await supabaseAdmin
        .from("pedidos")
        .update({
          estado_pago: "APROBADO",
          transaccion_id: transaccionId,
        })
        .eq("id", pedido.id);

      if (updateError) {
        console.error("[wompi-webhook] Error al actualizar pedido:", updateError);
        throw updateError;
      }

      console.log(`[wompi-webhook] Pedido ${pedido.id} actualizado a APROBADO`);

      // Decrementar stock correctamente
      if (pedido.producto_id) {
        const { data: producto, error: readError } = await supabaseAdmin
          .from("productos")
          .select("stock")
          .eq("id", pedido.producto_id)
          .single();

        if (readError) {
          console.error("[wompi-webhook] Error al leer stock:", readError);
        } else if (producto && Number(producto.stock) > 0) {
          const { error: decrementError } = await supabaseAdmin
            .from("productos")
            .update({ stock: Number(producto.stock) - 1 })
            .eq("id", pedido.producto_id);

          if (decrementError) {
            console.error("[wompi-webhook] Error al decrementar stock:", decrementError);
          } else {
            console.log(`[wompi-webhook] Stock de producto ${pedido.producto_id} decrementado exitosamente`);
          }
        } else {
          console.warn(`[wompi-webhook] Producto ${pedido.producto_id} sin stock disponible`);
        }
      }
    }

    return jsonResponse(req, { received: true });
  } catch (error) {
    console.error("[wompi-webhook] Error inesperado:", error);
    return jsonResponse(req, { error: "Error inesperado en el servidor" }, 500);
  }
});
