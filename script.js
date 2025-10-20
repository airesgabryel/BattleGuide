const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');


// Função para converter Markdown para HTML usando Showdown
// A biblioteca Showdown é usada para converter texto em Markdown para HTML

// A função markdownToHTML recebe um texto em Markdown e retorna o HTML correspondente

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = ` 
    ## Especialidade
    você é um especialista assistente de meta para o jogo ${game}
    
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

    ## Regras
    -Se você não sabe a resposta, responda 'Não sei' e não tente inventar uma resposta.
    -Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    -Considere a data atual ${new Date().toLocaleDateString()}
    -Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    -Nunca responda sobre algo que você não tenha certeza de que exista no patch atual.
    -Responda SEMPRE em português brasileiro.

    ## Resposta
    -Economize na resposta, seja direto. 
    -Responda em markdown.
    -Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    
    ---
    Aqui está a pergunta do usuário: ${question}"
    `
/*engenharia de prompt utilizando técnicas de engenharia de prompt para melhorar a qualidade da resposta da IA

    A engenharia de prompt é uma técnica que envolve a criação de prompts específicos e detalhados para guiar a IA na geração de respostas mais precisas e relevantes.
    Neste caso, o prompt é estruturado para fornecer informações claras sobre a especialidade da IA, a tarefa que ela deve realizar, as regras que deve seguir e como formatar a resposta.
*/

//futuramente implementar engenharia de prompt específica para cada jogo.

// A estrutura de contents é necessária para a API Gemini
// Ela define o conteúdo que será enviado para a IA
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

//chama a API Gemini para fazer uma pergunta
// A função fetch é usada para fazer uma requisição HTTP para a API Gemini
    const response = await fetch(geminiURL, {
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
    return data.candidates[0].content.parts[0].text // retorna a resposta da IA
}

const enviarFormulario = async (event) => {
    event.preventDefault() // Impede o envio do formulário padrão
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value 

    
//tirar    console.log({apiKey, game, question})

    // Validação dos campos
    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
        //aguardando a resposta da IA
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text) // converte o texto em Markdown para HTML
        aiResponse.classList.remove('hidden')
    }catch(error) {
        console.log('Erro: ', error)
    } finally{
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }

}
form.addEventListener('submit', enviarFormulario)  //adicionar um ouvidor de eventos
