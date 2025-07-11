const apiKeyInput = document.getElementById('apiKey')
const taskInput = document.getElementById('taskInput')
const askButton = document.getElementById('submitButton')
const aiResponse = document.getElementById('liaResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const askLia = async (task, apiKey) => {
  const model = "gemini-2.0-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const prompt = `
    ## Especialidade  
    Você é a Lia, uma assistente/secretária virtual inteligente, movida pela API do Google Gemini, especialista em ajudar o usuário a organizar a rotina, acelerar decisões, resumir textos, organizar ideias, dar feedbacks na escrita, sugerir soluções criativas e recomendar playlists personalizadas.

    ## Tarefa  
    Você deve responder as solicitações do usuário com clareza, objetividade e empatia, oferecendo ajuda prática e estratégica para produtividade e organização pessoal. Pode montar planejamentos semanais, analisar prós e contras de decisões, resumir conteúdos, ajudar na escrita, sugerir ideias e playlists para diferentes momentos do dia.

    ## Regras  
    - Se não souber a resposta, diga "Não sei" sem inventar nada.  
    - Se a pergunta não estiver relacionada às suas funções, responda "Essa pergunta está fora do meu escopo."  
    - Sempre mantenha o tom amigável, leve e profissional, com um toque descontraído e gentil.  
    - Considere o contexto da data atual: ${new Date().toLocaleDateString()}  
    - Responda em português claro e direto, usando markdown quando apropriado.  
    - Limite a resposta a 500 caracteres, a não ser que o usuário peça algo mais detalhado.  
    - Nunca forneça informações imprecisas ou sem certeza.  
    - Respeite a privacidade do usuário e evite dar conselhos médicos, legais ou financeiros complexos.

    ## Resposta  
    - Seja objetivo, prático e amigável.  
    - Use exemplos e estruturas claras quando for útil (listas, tópicos, etc).  
    - Adapte o estilo para parecer uma assistente prestativa, inteligente e acessível.

    ## Tarefa do usuário:  
    ${task}
  `

  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ]

  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  })

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: não recebi nenhuma resposta da API."
}

const sendTask = async (event) => {
  event.preventDefault()

  const task = taskInput.value.trim()
  const apiKey = apiKeyInput.value.trim()

  if (!apiKey || !task) {
    alert("Preencha todos os campos antes de enviar.")
    return
  }

  // Frases aleatórias para o loading
  const loadingPhrases = [
    "Lia está organizando as informações para você.",
    "A Lia está atendendo ao seu pedido.",
    "Lia está trabalhando na melhor resposta para você.",
    "Aguarde um instante, a Lia está cuidando disso.",
    "A Lia está processando os dados com atenção.",
    "Lia está preparando uma resposta sob medida.",
    "A Lia está analisando tudo com cuidado.",
		"Lia está verificando os detalhes antes de responder.",
		"A Lia está focada na sua solicitação.",
		"Lia está finalizando o que você pediu."
  ]

  const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]

  // muda botão pro estado de loading
  askButton.disabled = true
  askButton.innerText = randomPhrase
  askButton.style.background = "linear-gradient(135deg, #ffcc66, #336699)"
  askButton.style.cursor = "not-allowed"

  try {
    const rawResponse = await askLia(task, apiKey)
    const html = markdownToHTML(rawResponse)

    aiResponse.classList.remove('hidden')
    aiResponse.querySelector('.responseContent').innerHTML = html
  } catch (error) {
    console.error(error)
    alert("Deu ruim! Algo deu errado ao enviar a tarefa pra Lia.")
  } finally {
    // volta o botão ao normal
    askButton.disabled = false
    askButton.innerText = "Enviar tarefa para Lia"
    askButton.style.background = ""
    askButton.style.cursor = "pointer"
  }
}

// Textarea autoexpansiva
taskInput.addEventListener('input', () => {
  taskInput.style.height = 'auto'
  taskInput.style.height = taskInput.scrollHeight + 'px'
})

form.addEventListener('submit', sendTask)
