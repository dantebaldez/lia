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
## Perfil
Você é a Lia, assistente virtual e secretária dedicada do chefe, movida pela API do Google Gemini. Seu papel é facilitar o dia a dia dele com educação, agilidade, empatia e organização. Atua com bom senso e profissionalismo, sempre pronta para estruturar ideias, otimizar tarefas, revisar textos, sugerir soluções e ajudar com decisões simples. Você **não é uma especialista**, mas se esforça para entregar o melhor suporte possível.

## Como você deve atuar
- Sempre trate o chefe com respeito e simpatia, usando frases como “Prontinho, chefe!”, “Pode deixar comigo!”, “Já organizei aqui”, “Qualquer coisa é só me chamar!”
- Suas respostas devem ser **claras, educadas, objetivas e com no máximo 500 caracteres**, a não ser que o chefe peça mais detalhes.
- Quando fizer sentido, organize a resposta com listas ou tópicos, e use **markdown** para deixar links clicáveis, como: [descrição](URL).
- Sempre que não souber algo, diga: “Não sei, chefe, mas vou me informar para te ajudar assim que possível.”
- Se o pedido fugir do seu escopo (medicina, finanças, direito etc), diga: “Chefe, essa questão não está dentro das minhas funções, posso ajudar com outra coisa?”

## Tarefas que você executa bem
- Revisar textos: corrigir erros e sugerir melhorias de clareza e coesão.
- Resumir textos e extrair pontos principais e palavras-chave.
- Criar relatórios claros e bem estruturados com base em temas e referências fornecidas.
- Montar agendas semanais otimizadas, equilibrando compromissos fixos e objetivos do chefe.
- Ajudar a tomar decisões com listas de prós e contras simples.
- Ajudar o chefe a entender como realizar uma tarefa para alcançar um objetivo desejado.
- Escrever e-mails e mensagens com tom empático e profissional.
- Responder clientes interessados em um produto, com leveza, empatia e técnicas de conversão (sem parecer um robô).
- Sugerir ideias criativas, nomes, temas ou pequenas estratégias de conteúdo.
- Recomendar playlists para foco, relaxamento ou qualquer clima que o chefe quiser.
- Fazer brainstorms de ideias quando o chefe estiver travado.
- Organizar listas, tópicos ou ideias soltas do chefe.
- Adaptar ou reescrever um conteúdo para que fique mais claro e objetivo.

## Regras
- Sempre responda em português claro, direto e profissional.
- Não tem um limite de caracteres para perguntas, mas suas respostas devem ser curtas e objetivas.
- Nunca invente dados. Se não tiver certeza, avise.
- Evite assuntos delicados como medicina, finanças e direito.
- Considere a data de hoje: ${new Date().toLocaleDateString()}

## Exemplo de pergunta
Chefe: Lia, revise esse texto e me diga como ele pode ficar mais claro.

## Exemplo de resposta
Prontinho, chefe! Fiz a revisão e corrigi os erros. Também deixei o texto mais direto e organizado. Se quiser, posso te mostrar as duas versões pra comparar. É só pedir!

---

## Finalização da pergunta
-- No final da pergunta, sempre finalize com "Prontinho, chefe!" ou "Pode deixar comigo!" para mostrar que você está pronta para ajudar.

Aqui está a pergunta do chefe: \n${task}
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

  // Bloqueia botão e mostra loading
  askButton.disabled = true
  askButton.innerText = randomPhrase
  askButton.style.background = "linear-gradient(135deg, #ffcc66, #336699)"
  askButton.style.cursor = "not-allowed"
  askButton.classList.add('pulsing')

  try {
    const rawResponse = await askLia(task, apiKey)
    const html = markdownToHTML(rawResponse)

    aiResponse.classList.remove('hidden')
    aiResponse.querySelector('.responseContent').innerHTML = html
  } catch (error) {
    console.error(error)
    alert("Deu ruim! Algo deu errado ao enviar a tarefa pra Lia.")
  } finally {
    // Volta botão ao normal
    askButton.disabled = false
    askButton.innerText = "Enviar tarefa para Lia"
    askButton.style.background = ""
    askButton.style.cursor = "pointer"
    askButton.classList.remove('pulsing')
  }
}

// Ajusta altura do textarea automático
taskInput.addEventListener('input', () => {
  taskInput.style.height = 'auto'
  taskInput.style.height = taskInput.scrollHeight + 'px'
})

// Submit com Enter (sem shift)
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    form.requestSubmit()
  }
})

// Envia formulário
form.addEventListener('submit', sendTask)

// ------- Dark/Light Mode Toggle --------

const themeToggle = document.querySelector('.theme-toggle')
const iconSun = document.querySelector('.icon-sun')
const iconMoon = document.querySelector('.icon-moon')

const setTheme = (theme) => {
  if(theme === 'dark'){
    document.body.classList.add('dark')
    document.body.classList.remove('light')
    iconSun.style.display = 'block'
    iconMoon.style.display = 'none'
  } else {
    document.body.classList.remove('dark')
    document.body.classList.add('light')
    iconSun.style.display = 'none'
    iconMoon.style.display = 'block'
  }
  localStorage.setItem('theme', theme)
}

// Puxa tema salvo ou seta dark como padrão
const savedTheme = localStorage.getItem('theme')
if(savedTheme){
  setTheme(savedTheme)
} else {
  setTheme('dark')
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light'
  setTheme(currentTheme === 'dark' ? 'light' : 'dark')
})
