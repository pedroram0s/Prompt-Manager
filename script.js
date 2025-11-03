document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "prompts_storage_v1"

  const state = {
    prompts: [],
    selectedId: null,
  }

  const elements = {
    promptTitle: document.getElementById("prompt-title"),
    promptContent: document.getElementById("prompt-content"),
    titleWrapper: document.getElementById("title-wrapper"),
    contentWrapper: document.getElementById("content-wrapper"),
    btnOpen: document.getElementById("btn-open"),
    btnCollapse: document.getElementById("btn-collapse"),
    sidebar: document.querySelector(".sidebar"),
    btnCopy: document.getElementById("btn-copy"),
    btnSave: document.getElementById("btn-save"),
    promptList: document.getElementById("prompt-list"),
    btnNew: document.getElementById("btn-new"),
    searchInput: document.getElementById("search-input"),
  }

  const {
    promptTitle,
    promptContent,
    titleWrapper,
    contentWrapper,
    btnOpen,
    btnCollapse,
    sidebar,
    btnCopy,
    btnSave,
    promptList,
    btnNew,
    searchInput,
  } = elements

  // --- Funções Utilitárias de Armazenamento ---
  function saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
    }
  }

  function loadStateFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (storedData) {
      try {
        const loadedState = JSON.parse(storedData)
        if (loadedState && Array.isArray(loadedState.prompts)) {
          state.prompts = loadedState.prompts.map((prompt) => ({
            ...prompt,
            createdAt: prompt.createdAt || Date.now(),
            updatedAt: prompt.updatedAt || Date.now(),
          }))
          state.selectedId = null
        } else {
          initializeDefaultState()
        }
      } catch (error) {
        console.error("Erro ao carregar do localStorage:", error)
        initializeDefaultState()
      }
    } else {
      initializeDefaultState()
    }
  }

  function initializeDefaultState() {
    const now = Date.now()
    state.prompts = [
      {
        id: crypto.randomUUID(),
        title: "Planejamento de tarefas semanais",
        content:
          "Ajude-me a organizar minha semana de forma equilibrada.<br>Distribua minhas tarefas profissionais e pessoais...",
        createdAt: now - 3000,
        updatedAt: now - 3000,
      },
      {
        id: crypto.randomUUID(),
        title: "Geração de Ideias",
        content: "Liste 10 ideias criativas e objetivas para ...",
        createdAt: now - 2000,
        updatedAt: now - 2000,
      },
      {
        id: crypto.randomUUID(),
        title: "Refatoração",
        content: "Refatore o seguinte código para torná-lo mais ...",
        createdAt: now - 1000,
        updatedAt: now - 1000,
      },
      {
        id: crypto.randomUUID(),
        title: "Checklist",
        content: "Monte um checklist de ações necessárias para ...",
        createdAt: now,
        updatedAt: now,
      },
    ]
    state.selectedId = null
    saveStateToStorage()
  }

  // --- Lógica do Placeholder ---
  function updateEditableWrapperState(element, wrapper) {
    if (!element || !wrapper) return
    const hasVisibleContent = element.textContent.trim().length > 0
    const hasMeaningfulHTML =
      element.innerHTML.trim().length > 0 && element.innerHTML.trim() !== "<br>"
    const isEmpty = !hasVisibleContent && !hasMeaningfulHTML
    wrapper.classList.toggle("is-empty", isEmpty)
  }

  // --- Lógica da Sidebar ---
  function toggleSidebar() {
    if (!sidebar || !btnOpen) return

    const isCollapsed = sidebar.classList.contains("is-collapsed")

    // Lógica Invertida: Se estiver 'collapsed', queremos que ABRA (remova 'is-collapsed')
    // Se NÃO estiver 'collapsed', queremos que FECHE (adicione 'is-collapsed')
    sidebar.classList.toggle("is-collapsed", !isCollapsed)

    // O open-toggle só deve aparecer quando a sidebar está FECHADA/COLAPSED
    btnOpen.style.display = isCollapsed ? "none" : "flex"

    // Atualiza o display do open-toggle após a transição da sidebar
    setTimeout(() => {
      btnOpen.style.display = sidebar.classList.contains("is-collapsed")
        ? "flex"
        : "none"
    }, 300) // 300ms é a duração da transição no CSS
  }

  // --- Gerenciamento de Prompts ---
  function renderPromptList(promptsToRender = state.prompts) {
    if (!promptList) return
    promptList.innerHTML = ""

    // Ordenação: Ordena os prompts pelo campo 'updatedAt' (mais recente primeiro)
    const sortedPrompts = [...promptsToRender].sort(
      (a, b) => b.updatedAt - a.updatedAt
    )

    if (sortedPrompts.length === 0) {
      promptList.innerHTML =
        '<li class="empty-list-message">Nenhum prompt encontrado.</li>'
      return
    }

    sortedPrompts.forEach((prompt) => {
      const li = document.createElement("li")
      li.className = `prompt-item ${
        prompt.id === state.selectedId ? "is-selected" : ""
      }`
      li.dataset.id = prompt.id

      const contentDiv = document.createElement("div")
      contentDiv.className = "prompt-item-content"

      const titleSpan = document.createElement("span")
      titleSpan.className = "prompt-item-title"
      titleSpan.textContent = prompt.title

      const descSpan = document.createElement("span")
      descSpan.className = "prompt-item-description"
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = prompt.content
      const textContent = tempDiv.textContent || tempDiv.innerText || ""
      descSpan.textContent =
        textContent.substring(0, 50) + (textContent.length > 50 ? "..." : "")

      contentDiv.appendChild(titleSpan)
      contentDiv.appendChild(descSpan)

      const removeButton = document.createElement("button")
      removeButton.className = "btn-icon delete-btn" // Adiciona uma classe específica
      removeButton.title = "Remover"
      removeButton.innerHTML = `<img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />`

      li.appendChild(contentDiv)
      li.appendChild(removeButton)
      promptList.appendChild(li)
    })
  }

  function loadPromptIntoEditor(promptId) {
    const prompt = state.prompts.find((p) => p.id === promptId)
    if (prompt && promptTitle && promptContent) {
      promptTitle.textContent = prompt.title
      promptContent.innerHTML = prompt.content
      state.selectedId = promptId

      document.querySelectorAll(".prompt-item").forEach((item) => {
        item.classList.toggle("is-selected", item.dataset.id === promptId)
      })

      updateEditableWrapperState(promptTitle, titleWrapper)
      updateEditableWrapperState(promptContent, contentWrapper)
    } else if (promptId === null) {
      clearEditor()
    }
  }

  function savePrompt() {
    if (!promptTitle || !promptContent) return

    const title = promptTitle.textContent.trim()
    const contentHTML = promptContent.innerHTML.trim()
    const contentText = promptContent.textContent.trim()

    if (!title || !contentText) {
      alert("Título e Conteúdo não podem estar vazios!")
      return
    }

    const now = Date.now()
    let promptToUpdate = state.prompts.find((p) => p.id === state.selectedId)

    if (promptToUpdate) {
      // PROMPT EXISTENTE: Atualiza e move para o topo
      const index = state.prompts.findIndex((p) => p.id === state.selectedId)
      if (index > -1) {
        state.prompts.splice(index, 1)
      }

      promptToUpdate.title = title
      promptToUpdate.content = contentHTML
      promptToUpdate.updatedAt = now

      state.prompts.unshift(promptToUpdate)
      state.selectedId = promptToUpdate.id
    } else {
      // NOVO PROMPT: Cria e insere no topo
      const newPrompt = {
        id: crypto.randomUUID(),
        title,
        content: contentHTML,
        createdAt: now,
        updatedAt: now,
      }
      state.prompts.unshift(newPrompt)
      state.selectedId = newPrompt.id
    }

    saveStateToStorage()
    renderPromptList()
    alert("Prompt salvo!")
    updateEditableWrapperState(promptTitle, titleWrapper)
    updateEditableWrapperState(promptContent, contentWrapper)
  }

  function clearEditor() {
    if (promptTitle) promptTitle.textContent = ""
    if (promptContent) promptContent.innerHTML = ""
    state.selectedId = null

    document.querySelectorAll(".prompt-item.is-selected").forEach((item) => {
      item.classList.remove("is-selected")
    })

    updateEditableWrapperState(promptTitle, titleWrapper)
    updateEditableWrapperState(promptContent, contentWrapper)
    if (promptTitle) promptTitle.focus()
  }

  function deletePrompt(promptId) {
    const promptIndex = state.prompts.findIndex((p) => p.id === promptId)
    if (promptIndex > -1) {
      state.prompts.splice(promptIndex, 1)

      if (state.selectedId === promptId) {
        clearEditor()
      }

      saveStateToStorage()
      renderPromptList()
    }
  }

  function handleSearch() {
    if (!searchInput) return
    const searchTerm = searchInput.value.toLowerCase().trim()
    const filteredPrompts = state.prompts.filter((p) =>
      p.title.toLowerCase().includes(searchTerm)
    )
    renderPromptList(filteredPrompts)
  }

  async function copyContent() {
    if (promptContent && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(promptContent.innerText)
        alert("Conteúdo copiado!")
      } catch (err) {
        console.error("Erro ao copiar: ", err)
        alert("Falha ao copiar conteúdo.")
      }
    } else {
      alert(
        "Seu navegador não suporta a cópia para a área de transferência ou o campo de conteúdo está vazio."
      )
    }
  }

  // --- Configuração dos Event Listeners ---
  function attachEventListeners() {
    if (btnOpen) btnOpen.addEventListener("click", toggleSidebar)
    if (btnCollapse) btnCollapse.addEventListener("click", toggleSidebar)
    if (btnCopy) btnCopy.addEventListener("click", copyContent)
    if (btnSave) btnSave.addEventListener("click", savePrompt)
    if (btnNew) btnNew.addEventListener("click", clearEditor)
    if (searchInput) searchInput.addEventListener("input", handleSearch)

    if (promptTitle) {
      promptTitle.addEventListener("input", () =>
        updateEditableWrapperState(promptTitle, titleWrapper)
      )
    }
    if (promptContent) {
      promptContent.addEventListener("input", () =>
        updateEditableWrapperState(promptContent, contentWrapper)
      )
    }

    if (promptList) {
      promptList.addEventListener("click", (event) => {
        const item = event.target.closest(".prompt-item")
        const deleteBtn = event.target.closest(".delete-btn")

        if (deleteBtn && item) {
          const promptId = item.dataset.id
          if (
            promptId &&
            confirm("Tem certeza que deseja remover este prompt?")
          ) {
            deletePrompt(promptId)
          }
        } else if (item) {
          const promptId = item.dataset.id
          if (promptId !== state.selectedId) {
            loadPromptIntoEditor(promptId)
          }
        }
      })
    }
  }

  // --- Inicialização ---
  function init() {
    loadStateFromStorage()
    attachEventListeners()

    // Estado inicial: Sidebar aberta no desktop, Editor limpo
    if (sidebar) sidebar.classList.remove("is-collapsed")
    if (btnOpen) btnOpen.style.display = "none"

    renderPromptList()
    clearEditor()
  }

  init()
})
