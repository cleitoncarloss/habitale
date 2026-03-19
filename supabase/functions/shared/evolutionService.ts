interface EvolutionResponse {
  success: boolean
  error?: string
  messageId?: string
}

export async function sendWhatsAppViaEvolution(
  phoneNumber: string,
  message: string
): Promise<EvolutionResponse> {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL")
  const apiKey = Deno.env.get("EVOLUTION_API_KEY")
  const instance = Deno.env.get("EVOLUTION_INSTANCE")

  if (!apiUrl || !apiKey || !instance) {
    return {
      success: false,
      error: "Variáveis de ambiente não configuradas (EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE)",
    }
  }

  try {
    const cleanNumber = phoneNumber.replace(/\D/g, "")

    const payload = {
      number: cleanNumber,
      text: message,
      context: {
        quoted: null,
      },
    }

    console.log(`📤 Enviando para Evolution: ${cleanNumber}`)

    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: `Erro Evolution (${response.status}): ${JSON.stringify(data)}`,
      }
    }

    return {
      success: true,
      messageId: data.key?.id || data.id,
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro ao conectar com Evolution: ${error.message}`,
    }
  }
}
