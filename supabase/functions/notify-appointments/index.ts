import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendWhatsAppViaEvolution } from "../shared/evolutionService.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req) => {
  try {
    console.log("🔔 Iniciando notificação de agendamentos...")

    // 1. Calcular período: amanhã inteiro
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    console.log(
      `📅 Buscando agendamentos entre ${tomorrow.toISOString()} e ${tomorrowEnd.toISOString()}`
    )

    // 2. Buscar agendamentos que NÃO foram notificados
    const { data: appointments, error } = await supabase
      .from("agendamentos")
      .select(
        `
        id,
        data_agendamento,
        tipo_servico,
        observacoes,
        notificado_1_dia,
        cliente_id,
        clientes:cliente_id (
          id,
          nome,
          telefone
        )
      `
      )
      .gte("data_agendamento", tomorrow.toISOString())
      .lte("data_agendamento", tomorrowEnd.toISOString())
      .eq("notificado_1_dia", false)
      .eq("deve_notificar_1_dia", true)
      .neq("status", "cancelado")

    if (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`)
    }

    console.log(`✅ Encontrados ${appointments?.length || 0} agendamentos`)

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhum agendamento para notificar",
          count: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // 3. Enviar notificação para cada agendamento
    const results = []

    for (const appointment of appointments) {
      try {
        const client = appointment.clientes

        if (!client) {
          console.warn(`⚠️ Agendamento ${appointment.id}: Cliente não encontrado`)
          results.push({
            appointmentId: appointment.id,
            status: "skipped",
            reason: "Cliente não associado",
          })
          continue
        }

        // Validar dados obrigatórios
        if (!client.telefone) {
          console.warn(
            `⚠️ Agendamento ${appointment.id}: Cliente sem telefone`
          )
          results.push({
            appointmentId: appointment.id,
            status: "skipped",
            reason: "Sem número de telefone",
          })
          continue
        }

        // Montar mensagem
        const message = buildNotificationMessage({
          clientName: client.nome,
          appointmentDate: appointment.data_agendamento,
          serviceType: appointment.tipo_servico,
          observations: appointment.observacoes,
        })

        console.log(`📤 Enviando para ${client.telefone}`)

        // Enviar via Evolution
        const sendResult = await sendWhatsAppViaEvolution(
          client.telefone,
          message
        )

        if (sendResult.success) {
          // Atualizar BD: marcar como notificado
          const { error: updateError } = await supabase
            .from("agendamentos")
            .update({
              notificado_1_dia: true,
              data_notificacao: new Date().toISOString(),
            })
            .eq("id", appointment.id)

          if (updateError) {
            throw new Error(
              `Erro ao atualizar agendamento ${appointment.id}: ${updateError.message}`
            )
          }

          console.log(`✅ Notificado com sucesso: ${client.telefone}`)
          results.push({
            appointmentId: appointment.id,
            clientNumber: client.telefone,
            status: "sent",
          })
        } else {
          console.error(`❌ Erro ao enviar: ${sendResult.error}`)
          results.push({
            appointmentId: appointment.id,
            clientNumber: client.telefone,
            status: "failed",
            error: sendResult.error,
          })
        }
      } catch (error) {
        console.error(`❌ Erro processando agendamento ${appointment.id}:`, error)
        results.push({
          appointmentId: appointment.id,
          status: "error",
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Processamento concluído",
        totalAppointments: appointments.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("❌ Erro crítico:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})

/**
 * Monta a mensagem de notificação
 */
function buildNotificationMessage(data: {
  clientName: string
  appointmentDate: string
  serviceType?: string
  observations?: string
}): string {
  const date = new Date(data.appointmentDate)
  const formattedDate = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  let message = `👋 Olá *${data.clientName}*!\n\n`
  message += `Temos o prazer de lembrar sobre sua consulta agendada:\n\n`
  message += `📅 *Data:* ${formattedDate}\n`
  message += `⏰ *Hora:* ${formattedTime}\n`

  if (data.serviceType) {
    message += `🦷 *Tipo de Serviço:* ${data.serviceType}\n`
  }

  message += `\n`

  if (data.observations) {
    message += `📝 *Observações:* ${data.observations}\n\n`
  }

  message += `Caso precise remarcar ou tiver dúvidas, entre em contato conosco! 💬\n`
  message += `Até breve! 😊`

  return message
}
