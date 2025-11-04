document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "prompts_storage_v1"

  const state = {
    prompts: [],
    selectedId: null,
  }

  const elements = {
    promptTitle: document.getElementById("prompt-title"),
    promptContent: document.getElementById("prompt-content"),
    btnOpen: document.getElementById("btn-open"),
    btnCollapse: document.getElementById("btn-collapse"),
    sidebar: document.getElementById("sidebar"),
    btnCopy: document.getElementById("btn-copy"),
    btnSave: document.getElementById("btn-save"),
    promptList: document.getElementById("prompt-list"),
    btnNew: document.getElementById("btn-new"),
    searchInput: document.getElementById("search-input"),
  }

  const {
    promptTitle,
    promptContent,
    btnOpen,
    btnCollapse,
    sidebar,
    btnCopy,
    btnSave,
    promptList,
    btnNew,
    searchInput,
  } = elements

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
          "Me ajude a organizar minha semana de forma equilibrada.<br>Distribua minhas tarefas profissionais e pessoais em blocos de tempo realistas.<br><br>Sugira horários para foco profundo e momentos para pausas estratégicas.<br><br>Inclua dicas de priorização. No final, entregue o plano em formato de checklist diário para fácil acompanhamento.",
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

  function updateEditableState(element) {
    if (!element) return

    const hasVisibleContent = element.textContent.trim().length > 0
    const innerHTML = element.innerHTML.trim()
    const isMeaninglessHTML = innerHTML === "<br>" || innerHTML === ""
    const isEmpty = !hasVisibleContent && isMeaninglessHTML

    element.classList.toggle("is-empty", isEmpty)
  }

  function toggleSidebar() {
    if (!sidebar) return
    const isNowCollapsed = sidebar.classList.toggle("is-collapsed")

    if (isNowCollapsed) {
      btnOpen.style.display = "flex"
    } else {
      btnOpen.style.display = "none"
    }
  }

  function renderPromptList(promptsToRender = state.prompts) {
    if (!promptList) return
    promptList.innerHTML = ""

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
      removeButton.className = "btn-icon delete-btn"
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

      updateEditableState(promptTitle)
      updateEditableState(promptContent)
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
    updateEditableState(promptTitle)
    updateEditableState(promptContent)
  }

  function clearEditor() {
    if (promptTitle) promptTitle.textContent = ""
    if (promptContent) promptContent.innerHTML = ""
    state.selectedId = null

    document.querySelectorAll(".prompt-item.is-selected").forEach((item) => {
      item.classList.remove("is-selected")
    })

    updateEditableState(promptTitle)
    updateEditableState(promptContent)
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

  function attachEventListeners() {
    if (btnOpen) btnOpen.addEventListener("click", toggleSidebar)
    if (btnCollapse) btnCollapse.addEventListener("click", toggleSidebar)
    if (btnCopy) btnCopy.addEventListener("click", copyContent)
    if (btnSave) btnSave.addEventListener("click", savePrompt)
    if (btnNew) btnNew.addEventListener("click", clearEditor)
    if (searchInput) searchInput.addEventListener("input", handleSearch)

    if (promptTitle) {
      promptTitle.addEventListener("input", () =>
        updateEditableState(promptTitle)
      )
      promptTitle.addEventListener("blur", () =>
        updateEditableState(promptTitle)
      )
    }
    if (promptContent) {
      promptContent.addEventListener("input", () =>
        updateEditableState(promptContent)
      )
      promptContent.addEventListener("blur", () =>
        updateEditableState(promptContent)
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

  function init() {
    loadStateFromStorage()
    attachEventListeners()

    if (sidebar) {
      sidebar.classList.remove("is-collapsed")
    }
    if (btnOpen) {
      btnOpen.style.display = "none"
    }

    renderPromptList()
    clearEditor()
  }

  init()
})
