[Object: {"nome": "Cleiton", "telefone": "5519989174429", "tipo_paciente": "primeira_consulta", "duvida": "Quero fazer uma limpeza", "status": "novo", "conversa": "Usuário: Quero fazer uma limpeza\n\nAssistente: Obrigado pelas informações, Pedro! 😊\n\nEstamos te redirecionando para um de nossos atendentes.\n\nEle irá entrar em contato com você em breve para agendar e esclarecer \ntodas as suas dúvidas! 👋"}]

// Edge Function: salvar-conversa-whatsapp
// Salva na tabela conversas_whatsapp (sem usuario_id)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const {
      nome,
      telefone,
      tipo_paciente,
      duvida,
      observacoes,
      status,
      conversa
    } = await req.json()

    // Validar campos obrigatórios
    if (!nome || !telefone) {
      return new Response(
        JSON.stringify({
          error: "Campos obrigatórios faltando: nome, telefone",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Inserir na tabela conversas_whatsapp
    const { data, error } = await supabase
      .from("conversas_whatsapp")
      .insert([
        {
          nome,
          telefone,
          tipo_paciente: tipo_paciente || null,
          duvida: duvida || null,
          observacoes: observacoes || null,
          status: status || "novo",
          conversa
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao inserir:", error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conversa salva com sucesso!",
        conversa_id: data[0].id,
        data: data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Erro:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
