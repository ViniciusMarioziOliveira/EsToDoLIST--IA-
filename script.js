// =============================================================
// EsToDoList - CRUD com barra lateral e tarefas excluídas
// =============================================================

var campoNovaTarefa = document.getElementById('nova-tarefa-input')
var botaoAdicionar = document.getElementById('adicionar-btn')
var listaTarefas = document.getElementById('lista-de-tarefas')

var btnAndamento = document.getElementById('btn-andamento')
var btnConcluidas = document.getElementById('btn-concluidas')
var btnExcluidas = document.getElementById('btn-excluidas')

var tarefas = []
var excluidas = []
var filtroAtual = 'andamento'

// -------------------------------
// Carregar dados salvos
// -------------------------------
function carregarTarefasSalvas() {
  var salvas = localStorage.getItem('tarefas')
  var deletadas = localStorage.getItem('excluidas')

  if (salvas) tarefas = JSON.parse(salvas)
  if (deletadas) excluidas = JSON.parse(deletadas)

  exibirTarefas()
}

function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas))
  localStorage.setItem('excluidas', JSON.stringify(excluidas))
}

// -------------------------------
// Adicionar tarefa
// -------------------------------
function adicionarTarefa() {
  var texto = campoNovaTarefa.value.trim()
  if (texto === '') {
    alert('Digite uma tarefa antes de adicionar!')
    return
  }

  var novaTarefa = {
    id: Date.now(),
    texto: texto,
    concluida: false
  }

  tarefas.push(novaTarefa)
  salvarTarefas()
  exibirTarefas()
  campoNovaTarefa.value = ''
}

// -------------------------------
// Exibir tarefas
// -------------------------------
function exibirTarefas() {
  listaTarefas.innerHTML = ''
  var listaMostrar = []

  if (filtroAtual === 'andamento') {
    listaMostrar = tarefas.filter(function (t) {
      return !t.concluida
    })
  } else if (filtroAtual === 'concluidas') {
    listaMostrar = tarefas.filter(function (t) {
      return t.concluida
    })
  } else if (filtroAtual === 'excluidas') {
    listaMostrar = excluidas
  }

  if (listaMostrar.length === 0) {
    listaTarefas.innerHTML =
      '<p class="text-gray-500 text-center py-4">Nenhuma tarefa aqui 😴</p>'
    return
  }

  for (var i = 0; i < listaMostrar.length; i++) {
    var tarefa = listaMostrar[i]
    var item = document.createElement('li')
    item.className =
      'flex justify-between items-center p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition'

    if (tarefa.concluida) {
      item.classList.add('concluida')
    }

    var textoTarefa = document.createElement('span')
    textoTarefa.textContent = tarefa.texto
    textoTarefa.className = 'tarefa-texto flex-grow cursor-pointer'

    if (filtroAtual !== 'excluidas') {
      textoTarefa.onclick = (function (id) {
        return function () {
          alternarConclusao(id)
        }
      })(tarefa.id)
    }

    var botoes = document.createElement('div')
    botoes.className = 'flex space-x-2'

    if (filtroAtual !== 'excluidas') {
      var botaoEditar = document.createElement('button')
      botaoEditar.textContent = '✏️'
      botaoEditar.className =
        'px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded'
      botaoEditar.onclick = (function (id) {
        return function () {
          editarTarefa(id)
        }
      })(tarefa.id)

      var botaoExcluir = document.createElement('button')
      botaoExcluir.textContent = '🗑️'
      botaoExcluir.className =
        'px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded'
      botaoExcluir.onclick = (function (id) {
        return function () {
          excluirTarefa(id)
        }
      })(tarefa.id)

      botoes.appendChild(botaoEditar)
      botoes.appendChild(botaoExcluir)
    }

    item.appendChild(textoTarefa)
    item.appendChild(botoes)
    listaTarefas.appendChild(item)
  }
}

// -------------------------------
// Alternar conclusão
// -------------------------------
function alternarConclusao(id) {
  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === id) {
      tarefas[i].concluida = !tarefas[i].concluida
    }
  }
  salvarTarefas()
  exibirTarefas()
}

// -------------------------------
// Editar tarefa
// -------------------------------
function editarTarefa(id) {
  var novaDescricao = prompt('Edite a tarefa:')
  if (!novaDescricao || novaDescricao.trim() === '') return

  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === id) {
      tarefas[i].texto = novaDescricao.trim()
    }
  }
  salvarTarefas()
  exibirTarefas()
}

// -------------------------------
// Excluir tarefa (move para “excluídas”)
// -------------------------------
function excluirTarefa(id) {
  var confirmar = window.confirm('Deseja realmente excluir esta tarefa?')
  if (!confirmar) return

  var removida = tarefas.find(function (t) {
    return t.id === id
  })

  if (removida) {
    excluidas.push(removida)
  }

  tarefas = tarefas.filter(function (t) {
    return t.id !== id
  })

  salvarTarefas()
  exibirTarefas()
}

// -------------------------------
// Importar e exportar
// -------------------------------
function exportarTarefas() {
  var dados = JSON.stringify(
    { tarefas: tarefas, excluidas: excluidas },
    null,
    2
  )
  var blob = new Blob([dados], { type: 'application/json' })
  var url = URL.createObjectURL(blob)
  var link = document.createElement('a')
  link.href = url
  link.download = 'tarefas.json'
  link.click()
  URL.revokeObjectURL(url)
}

function importarTarefas() {
  var inputArquivo = document.getElementById('importar-arquivo')
  inputArquivo.click()

  inputArquivo.onchange = function () {
    var arquivo = inputArquivo.files[0]
    if (!arquivo) return

    var leitor = new FileReader()
    leitor.onload = function (evento) {
      try {
        var conteudo = JSON.parse(evento.target.result)
        if (conteudo.tarefas && conteudo.excluidas) {
          tarefas = conteudo.tarefas
          excluidas = conteudo.excluidas
          salvarTarefas()
          exibirTarefas()
          alert('Tarefas importadas com sucesso!')
        } else {
          alert('Arquivo inválido!')
        }
      } catch (erro) {
        alert('Erro ao importar arquivo JSON.')
      }
    }

    leitor.readAsText(arquivo)
  }
}

// -------------------------------
// Filtros
// -------------------------------
function definirFiltro(tipo) {
  filtroAtual = tipo

  var botoes = document.querySelectorAll('.filtro-btn')
  botoes.forEach(function (b) {
    b.classList.remove('active-btn')
  })

  if (tipo === 'andamento') btnAndamento.classList.add('active-btn')
  if (tipo === 'concluidas') btnConcluidas.classList.add('active-btn')
  if (tipo === 'excluidas') btnExcluidas.classList.add('active-btn')

  exibirTarefas()
}

// -------------------------------
// Eventos
// -------------------------------
botaoAdicionar.addEventListener('click', adicionarTarefa)
campoNovaTarefa.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') adicionarTarefa()
})

btnAndamento.addEventListener('click', function () {
  definirFiltro('andamento')
})
btnConcluidas.addEventListener('click', function () {
  definirFiltro('concluidas')
})
btnExcluidas.addEventListener('click', function () {
  definirFiltro('excluidas')
})

document.getElementById('exportar-btn').addEventListener('click', exportarTarefas)
document.getElementById('importar-btn').addEventListener('click', importarTarefas)

// -------------------------------
// Inicializar
// -------------------------------
window.onload = carregarTarefasSalvas