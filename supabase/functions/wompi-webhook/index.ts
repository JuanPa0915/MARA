import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WompiSignature {
  properties: string[];
  checksum: string;
}

function buildCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN")?.trim();
  const origin = req.headers.get("origin") ?? "";
  const responseOrigin =
    allowedOrigin && origin === allowedOrigin
      ? origin
      : allowedOrigin
      ? "null"
      : "*";

  return {
    "Access-Control-Allow-Origin": responseOrigin,
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

function getValueAtPath(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function extractFieldRaw(
  body: Record<string, unknown>,
  propPath: string
): string | undefined {
  if (propPath === "timestamp") {
    const ts = body.timestamp;
    return ts !== undefined && ts !== null ? String(ts) : undefined;
  }

  const data = body.data as Record<string, unknown> | undefined;
  if (!data) return undefined;

  const parts = propPath.split(".");
  if (parts[0] === "transaction" && parts.length >= 2) {
    const transaction = data.transaction as Record<string, unknown> | undefined;
    if (transaction) {
      const val = transaction[parts.slice(1).join(".")];
      if (val !== undefined && val !== null) return String(val);
    }
  }

  let value = getValueAtPath(data, propPath);
  if ((value === undefined || value === null) && data.transaction) {
    value = getValueAtPath(data.transaction as Record<string, unknown>, propPath);
  }

  if (value === undefined || value === null) return undefined;
  return String(value);
}

async function verifyEventSignature(
  body: Record<string, unknown>,
  eventsSecret: string
): Promise<boolean> {
  const signature = body.signature as WompiSignature | undefined;

  if (!signature?.checksum || !Array.isArray(signature.properties)) {
    console.warn(
      "[wompi-webhook] No se encontro signature.checksum o signature.properties en el payload"
    );
    return false;
  }

  console.log("[wompi-webhook] Propiedades declaradas por Wompi:", signature.properties);

  const rawValues: string[] = [];

  for (const prop of signature.properties) {
    const val = extractFieldRaw(body, prop);
    if (val === undefined) {
      console.warn(
        `[wompi-webhook] No se pudo extraer la propiedad "${prop}" del body`
      );
      return false;
    }
    rawValues.push(val);
  }

  // Estrategia 1: Solo valores de properties + secret (estilo SDK)
  const concatenatedProps = rawValues.join("");
  const concatenated = concatenatedProps + eventsSecret;

  const encoded = new TextEncoder().encode(concatenated);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  // Estrategia 2: Tambien calcular con timestamp (estilo docs anteriores)
  const rootTimestamp = String(body.timestamp ?? "").trim();
  const concatenatedWithTs = concatenatedProps + rootTimestamp + eventsSecret;
  const encodedWithTs = new TextEncoder().encode(concatenatedWithTs);
  const hashBufferWithTs = await crypto.subtle.digest("SHA-256", encodedWithTs);
  const hashWithTs = Array.from(new Uint8Array(hashBufferWithTs))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const checksum = signature.checksum.trim();
  const checksumLower = checksum.toLowerCase();
  const hashLower = hash.toLowerCase();
  const hashWithTsLower = hashWithTs.toLowerCase();

  // Acepta cualquiera de las dos estrategias
  const isValid = hashLower === checksumLower || hashWithTsLower === checksumLower;

  const secretPreview =
    eventsSecret.length > 8
      ? eventsSecret.slice(0, 4) + "..." + eventsSecret.slice(-4) + ` (len: ${eventsSecret.length})`
      : `"${eventsSecret}" (len: ${eventsSecret.length})`;

  console.log("[wompi-webhook] === VERIFICACION DE FIRMA ===");
  for (let i = 0; i < signature.properties.length; i++) {
    console.log(`[wompi-webhook]   ${signature.properties[i]}: "${rawValues[i]}" (${rawValues[i].length} chars)`);
  }
  console.log("[wompi-webhook] Secreto usado:", secretPreview);
  console.log("[wompi-webhook] Estrategia 1 (props+secret):");
  console.log("[wompi-webhook]   Cadena:", concatenated);
  console.log("[wompi-webhook]   SHA-256:", hashLower);
  console.log("[wompi-webhook] Estrategia 2 (props+ts+secret):");
  console.log("[wompi-webhook]   Cadena:", concatenatedWithTs);
  console.log("[wompi-webhook]   SHA-256:", hashWithTsLower);
  console.log("[wompi-webhook] Checksum recibido:", checksumLower + " (" + checksumLower.length + " hex chars)");
  console.log("[wompi-webhook] Firma valida:", isValid);

  return isValid;
}

serve(async (req: Request): Promise<Response> => {
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

    console.log("[wompi-webhook] Event recibido:", (eventBody as Record<string, unknown>).event ?? "desconocido");

    const isValid = await verifyEventSignature(eventBody, eventsSecret);
    if (!isValid) {
      console.warn("[wompi-webhook] Firma de evento invalida");
      return jsonResponse(req, { error: "Firma invalida" }, 401);
    }

    const event = eventBody.event as string | undefined;
    const data = eventBody.data as Record<string, unknown> | undefined;
    const transaction = data?.transaction as Record<string, unknown> | undefined;

    if (
      event === "transaction.updated" ||
      event === "transaction.created"
    ) {
      if (!transaction) {
        console.warn(
          "[wompi-webhook] Evento sin data.transaction, se omite"
        );
        return jsonResponse(req, { received: true, skipped: true });
      }

      const reference = String(transaction.reference ?? "").trim();
      const status = String(transaction.status ?? "").trim();
      const wompiId = String(transaction.id ?? "").trim();

      console.log(
        `[wompi-webhook] Transaccion ${wompiId}, referencia: ${reference}, estado: ${status}`
      );

      let nuevoEstado: string;
      if (status === "APPROVED") {
        nuevoEstado = "pagado";
      } else if (
        status === "DECLINED" ||
        status === "VOID" ||
        status === "ERROR"
      ) {
        nuevoEstado = "rechazado";
      } else {
        nuevoEstado = "pendiente";
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
      const serviceRoleKey = Deno.env
        .get("SUPABASE_SERVICE_ROLE_KEY")
        ?.trim();

      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Supabase admin no configurado");
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      const { error: updateError } = await supabaseAdmin
        .from("pedidos")
        .update({
          estado_pago: nuevoEstado,
          transaccion_id: wompiId,
        })
        .eq("referencia_wompi", reference);

      if (updateError) {
        console.error(
          "[wompi-webhook] Error actualizando la orden:",
          updateError
        );
        return jsonResponse(
          req,
          { error: "Error al actualizar la orden" },
          500
        );
      }

      console.log(
        `[wompi-webhook] Orden ${reference} actualizada a ${nuevoEstado}`
      );
    }

    return jsonResponse(req, { received: true });
  } catch (error) {
    console.error("[wompi-webhook] Error inesperado:", error);
    return jsonResponse(req, { error: "Error inesperado en el servidor" }, 500);
  }
});
