import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const evolutionToken = "C0064D094559-4217-AB18-96537811AA51"
const evolutionInstanceId = "habitaleNotificacoes"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

interface EvolutionWebhookPayload {
  event: string
  instance: string
  data: {
    key?: string
    pushName?: string
    phoneNumber?: string
    message?: string
    timestamp?: number
    fromMe?: boolean
    [key: string]: any
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const payload: EvolutionWebhookPayload = await req.json()

  // Validate webhook authenticity (check token in header)
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${evolutionToken}`) {
    console.warn("Unauthorized webhook attempt")
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Validate instance ID matches expected instance
  if (payload.instance !== evolutionInstanceId) {
    console.warn(`Webhook from unexpected instance: ${payload.instance}`)
    return new Response(JSON.stringify({ error: "Invalid instance" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different Evolution events
    switch (payload.event) {
      case "messages.upsert":
        return handleMessageEvent(payload, supabase)

      case "connection.update":
        return handleConnectionEvent(payload, supabase)

      case "contacts.upsert":
        return handleContactEvent(payload, supabase)

      default:
        console.log(`Unhandled event: ${payload.event}`)
        return new Response(
          JSON.stringify({ message: "Event received but not processed" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

async function handleMessageEvent(
  payload: EvolutionWebhookPayload,
  supabase: any
) {
  const { data } = payload
  const { phoneNumber, message, timestamp, fromMe, pushName } = data

  // Store message in conversas/mensagens_conversa tables
  const { error } = await supabase
    .from("mensagens_conversa")
    .insert({
      telefone: phoneNumber,
      conteudo: message,
      enviado_em: new Date(timestamp * 1000).toISOString(),
      origem: fromMe ? "clinic" : "client",
      nome_contato: pushName,
    })

  if (error) {
    console.error("Error storing message:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

async function handleConnectionEvent(
  payload: EvolutionWebhookPayload,
  supabase: any
) {
  const { data } = payload
  const status = data.status || "unknown"

  console.log(`Connection status: ${status}`)

  return new Response(JSON.stringify({ success: true, status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

async function handleContactEvent(
  payload: EvolutionWebhookPayload,
  supabase: any
) {
  const { data } = payload
  const { phoneNumber, pushName } = data

  // Update or create contact
  const { error } = await supabase
    .from("clientes")
    .upsert({
      telefone: phoneNumber,
      nome: pushName,
      atualizado_em: new Date().toISOString(),
    })

  if (error) {
    console.error("Error updating contact:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
