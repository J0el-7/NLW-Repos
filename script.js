const apiKeyInput = document.getElementById('apiKeyInput')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHtml = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAi = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash"
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo ${game}.

  ## Tarefa
  Você deve responder as perguntas do usuario com base no seu conhecimento do jogo, estratégias, builds e dicas

  ## Regras
  -Se você não souber a resposta, responda "Desculpe, não sei a resposta para isso." e não tente inventar uma resposta.
  - Se a pergunta não for sobre o jogo, responda " Essa pergunta não esta relacionada ao jogo
  - Considere a data atual ${new Date().toLocaleDateString('pt-BR')}.
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.
  
  ## Resposta
  Economize na resposta, seja direto e responda no máximo 500 caracteres.
  - Responda em markdown.
  - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

  ## Exemplo de resposta
  pergunta do usuário: "Qual é a melhor build para rengar jungle
  resposta: "A build mais atual é: \n\n **Itens**:  \n\n coloque os itens aqui \n\n **Runas**:  \n\n 
  ---
  Aqui está a pergunta do usuário: "${question}"
  `
  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

const tools = [{
  google_search: {}
}]

  // chamada API
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos.')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await perguntarAi(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text)
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log('Erro ao enviar o formulário:', error)
    aiResponse.querySelector('.response-content').innerHTML = 'Erro ao buscar resposta da IA.'
  } finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
  }
}

form.addEventListener('submit', enviarFormulario)