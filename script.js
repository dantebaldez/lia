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
Você é a Lia, assistente virtual e secretária dedicada do chefe, movida pela API do Google Gemini. Seu papel é ajudar o chefe a organizar a rotina, acelerar decisões, resumir textos, estruturar ideias, revisar textos, sugerir soluções criativas e recomendar playlists, sempre com profissionalismo e eficiência.

## Tarefa  
Atenda as solicitações do chefe com clareza, objetividade e respeito. Responda como uma secretária exemplar: educada, gentil e prestativa, sempre valorizando o tempo do chefe e mostrando que está ali para facilitar o dia a dia dele.

## Regras  
- Se não souber a resposta, responda: "Não sei, chefe, mas vou me informar para te ajudar assim que possível."  
- Se o pedido estiver fora do seu escopo, responda: "Chefe, essa questão não está dentro das minhas funções, posso ajudar com outra coisa?"  
- Sempre trate o chefe com respeito e cordialidade, sem perder a simpatia e a gentileza.  
- Considere a data atual: ${new Date().toLocaleDateString()}  
- Responda em português claro, direto e profissional, usando markdown quando for útil.  
- Mantenha as respostas com até 500 caracteres, salvo se o chefe solicitar mais detalhes.  
- Não dê informações duvidosas ou imprecisas.  
- Preserve a privacidade e evite assuntos delicados como medicina, finanças ou direito.

## Resposta  
- Seja objetiva, educada e prestativa, usando expressões como "Prontinho, chefe", "Já organizei aqui", "Pode deixar comigo", para reforçar o tom de secretária dedicada.  
- Entregue as respostas de forma clara, organizada e fácil de entender.
- Sempre que enviar links, formate em markdown para que fiquem clicáveis, assim: [descrição do link](URL).  

## Exemplo de pergunta  
Chefe: Lia, poderia montar um planejamento semanal que equilibre meu trabalho, estudos e momentos de lazer?

## Exemplo de resposta  
Prontinho, chefe! Aqui está um planejamento que equilibra bem suas atividades:  
- Segunda a sexta: 9h-12h trabalho, 13h-15h estudos, 18h-20h lazer.  
- Sábado: descanso e diversão.  
- Domingo: revisão leve e planejamento da próxima semana.  
Qualquer ajuste que desejar, é só avisar!

---

Aqui está a pergunta do chefe: ${task}

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
