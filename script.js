document.addEventListener("DOMContentLoaded", () => {
  // === 1. Seletores de Elementos ===
  const sidebar = document.querySelector(".sidebar")
  const openToggle = document.querySelector(".open-toggle")
  const closeToggle = document.querySelector(".close-toggle")

  // Elementos contenteditable (título e conteúdo)
  // Selecionando pelos IDs AGORA corretos
  const promptTitle = document.getElementById("prompt-title")
  const promptContent = document.getElementById("prompt-content")

  // === 2. Funções de Utilidade ===

  /**
   * Verifica se um elemento contenteditable está vazio,
   * ignorando espaços em branco e quebras de linha.
   * @param {HTMLElement} element
   * @returns {boolean} True se o elemento está vazio.
   */
  function isContentEmpty(element) {
    if (!element) return true
    // Usa innerText.trim() para remover todos os espaços e quebras de linha
    return element.innerText.trim().length === 0
  }

  /**
   * Adiciona/Remove a classe 'is-empty' com base no estado do conteúdo.
   * @param {HTMLElement} element
   */
  function checkEmptyState(element) {
    if (!element) return

    if (isContentEmpty(element)) {
      element.classList.add("is-empty")
    } else {
      element.classList.remove("is-empty")
    }
  }

  // === 3. Inicialização e Listeners da Sidebar ===

  if (openToggle && sidebar) {
    const toggleSidebar = () => {
      sidebar.classList.toggle("is-collapsed")
    }

    openToggle.addEventListener("click", toggleSidebar)

    if (closeToggle) {
      closeToggle.addEventListener("click", toggleSidebar)
    }
  }

  // === 4. Listeners para Contenteditable (Placeholders) ===

  // Array de elementos para iterar
  const editableElements = [promptTitle, promptContent].filter(
    (el) => el != null
  )

  editableElements.forEach((element) => {
    // 4.1. Inicializa o estado (Importante no carregamento)
    checkEmptyState(element)

    // 4.2. Adiciona o listener para atualizar o estado ao digitar/colar
    element.addEventListener("input", () => checkEmptyState(element))

    // 4.3. Adiciona um listener para o caso de o usuário focar e limpar o campo
    element.addEventListener("focusout", () => checkEmptyState(element))
  })

  // (Adicione aqui o restante da sua lógica JS, como salvar, copiar e a lista de prompts)
})
