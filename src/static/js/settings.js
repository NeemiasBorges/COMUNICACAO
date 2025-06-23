// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  // Carregar perfis
  loadProfiles();

  // Carregar pranchas
  loadBoards();

  // Carregar configurações do sistema
  loadSystemSettings();

  // Configurar eventos
  setupEvents();
});

// Carregar perfis de usuário
function loadProfiles() {
  try {
    // Obter perfis do localStorage
    const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");
    const profilesList = document.getElementById("profilesList");

    // Verificar se há perfis além do padrão
    if (profilesList) {
      // Limpar lista atual, mantendo o perfil padrão
      profilesList.innerHTML = `
                <div class="profile-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${
                              localStorage.getItem("defaultProfileName") ||
                              "Usuário 1"
                            }</h5>
                            <p class="mb-0 text-muted">Perfil padrão do sistema</p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editProfile('default')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" disabled>
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

      // Adicionar cada perfil
      profiles.forEach((profile) => {
        const profileCard = document.createElement("div");
        profileCard.className = "profile-card";
        profileCard.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${profile.name}</h5>
                            <p class="mb-0 text-muted">${
                              profile.description || "Sem descrição"
                            }</p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editProfile('${
                              profile.id
                            }')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProfile('${
                              profile.id
                            }')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
        profilesList.appendChild(profileCard);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar perfis:", error);
  }
}

// Carregar pranchas de comunicação
function loadBoards() {
  try {
    // Obter pranchas do localStorage
    const boards = JSON.parse(
      localStorage.getItem("communicationBoards") || "[]"
    );
    const boardsList = document.getElementById("boardsList");

    // Verificar se há pranchas além da padrão
    if (boardsList) {
      // Limpar lista atual, mantendo a prancha padrão
      boardsList.innerHTML = `
                <div class="board-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>Prancha Padrão</h5>
                            <p class="mb-0 text-muted">15 teclas • Padrão do sistema</p>
                            <div class="mt-2">
                                <span class="key-preview grey">❓</span>
                                <span class="key-preview yellow">👤</span>
                                <span class="key-preview green">🎯</span>
                                <span class="key-preview pink">😔</span>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editBoard('default')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="duplicateBoard('default')">
                                <i class="bi bi-files"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

      // Adicionar cada prancha
      boards.forEach((board) => {
        const keyPreviews = board.keys
          .slice(0, 4)
          .map(
            (key) =>
              `<span class="key-preview ${key.category}">${key.icon}</span>`
          )
          .join("");

        const boardItem = document.createElement("div");
        boardItem.className = "board-item";
        boardItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${board.name}</h5>
                            <p class="mb-0 text-muted">${board.keys.length} teclas • Personalizada</p>
                            <div class="mt-2">
                                ${keyPreviews}
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editBoard('${board.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="duplicateBoard('${board.id}')">
                                <i class="bi bi-files"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBoard('${board.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
        boardsList.appendChild(boardItem);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar pranchas:", error);
  }
}

// Carregar configurações do sistema
function loadSystemSettings() {
  try {
    // Obter configurações do localStorage
    const mouseSpeed = parseFloat(localStorage.getItem("mouseSpeed") || "0.3");
    const dwellTime = parseInt(localStorage.getItem("dwellTime") || "1000");
    const autoSave = localStorage.getItem("autoSave") !== "false";

    // Atualizar formulário
    const mouseSpeedInput = document.getElementById("mouseSpeed");
    const dwellTimeInput = document.getElementById("dwellTime");
    const autoSaveInput = document.getElementById("autoSave");

    if (mouseSpeedInput) mouseSpeedInput.value = mouseSpeed;
    if (dwellTimeInput) dwellTimeInput.value = dwellTime;
    if (autoSaveInput) autoSaveInput.checked = autoSave;

    // Configurar evento de submissão
    const form = document.getElementById("systemSettingsForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        saveSystemSettings();
      });
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

// Salvar configurações do sistema
function saveSystemSettings() {
  try {
    // Obter valores do formulário
    const mouseSpeed = document.getElementById("mouseSpeed").value;
    const dwellTime = document.getElementById("dwellTime").value;
    const autoSave = document.getElementById("autoSave").checked;

    // Salvar no localStorage
    localStorage.setItem("mouseSpeed", mouseSpeed);
    localStorage.setItem("dwellTime", dwellTime);
    localStorage.setItem("autoSave", autoSave);

    // Notificar usuário
    alert("Configurações salvas com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    alert("Erro ao salvar configurações. Por favor, tente novamente.");
  }
}

// Configurar eventos
function setupEvents() {
  // Adicionar tecla no formulário de prancha
  const addKeyBtn = document.getElementById("addKeyBtn");
  if (addKeyBtn) {
    addKeyBtn.addEventListener("click", function () {
      addKeyToForm();
    });
  }

  // Evento para remover teclas
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("remove-key-btn") ||
      e.target.parentElement.classList.contains("remove-key-btn")
    ) {
      const button = e.target.classList.contains("remove-key-btn")
        ? e.target
        : e.target.parentElement;

      const keyRow = button.closest(".key-row");
      if (keyRow) {
        keyRow.remove();
        updateKeyIndices();
      }
    }
  });
}

// Adicionar tecla ao formulário
function addKeyToForm() {
  const keysContainer = document.getElementById("keysContainer");
  if (!keysContainer) return;

  const keyCount = keysContainer.querySelectorAll(".key-row").length;

  // Limitar a 15 teclas
  if (keyCount >= 15) {
    alert("Você atingiu o limite máximo de 15 teclas por prancha.");
    return;
  }

  const keyRow = document.createElement("div");
  keyRow.className = "row mb-3 key-row";
  keyRow.innerHTML = `
        <div class="col-md-1">
            <label class="form-label">${keyCount + 1}</label>
        </div>
        <div class="col-md-3">
            <input type="text" class="form-control key-text" placeholder="Texto da tecla" required>
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control key-icon" placeholder="Ícone" required>
        </div>
        <div class="col-md-3">
            <select class="form-select key-category">
                <option value="grey">Cinza</option>
                <option value="yellow">Amarelo</option>
                <option value="green">Verde</option>
                <option value="pink">Rosa</option>
            </select>
        </div>
        <div class="col-md-3">
            <button type="button" class="btn btn-sm btn-outline-danger remove-key-btn">
                <i class="bi bi-trash"></i> Remover
            </button>
        </div>
    `;

  keysContainer.appendChild(keyRow);
}

// Atualizar índices das teclas
function updateKeyIndices() {
  const keyRows = document.querySelectorAll(".key-row");
  keyRows.forEach((row, index) => {
    const label = row.querySelector("label");
    if (label) label.textContent = index + 1;
  });
}

// Salvar perfil
function saveProfile() {
  try {
    // Obter valores do formulário
    const profileNameInput = document.getElementById("profileName");
    const profileDescriptionInput =
      document.getElementById("profileDescription");

    if (!profileNameInput || !profileDescriptionInput) return;

    const profileName = profileNameInput.value;
    const profileDescription = profileDescriptionInput.value;

    // Validar nome do perfil
    if (!profileName.trim()) {
      alert("O nome do perfil é obrigatório.");
      return;
    }

    // Obter perfis existentes
    const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");

    // Criar novo perfil
    const newProfile = {
      id: generateId(),
      name: profileName.trim(),
      description: profileDescription.trim(),
      createdAt: new Date().toISOString(),
    };

    // Adicionar à lista
    profiles.push(newProfile);

    // Salvar no localStorage
    localStorage.setItem("userProfiles", JSON.stringify(profiles));

    // Fechar modal e atualizar lista
    const modalElement = document.getElementById("addProfileModal");
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    // Limpar formulário
    const form = document.getElementById("addProfileForm");
    if (form) form.reset();

    // Recarregar perfis
    loadProfiles();

    // Notificar usuário
    alert("Perfil criado com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    alert("Erro ao salvar perfil. Por favor, tente novamente.");
  }
}

// Salvar prancha
function saveBoard() {
  try {
    // Obter valores do formulário
    const boardNameInput = document.getElementById("boardName");
    if (!boardNameInput) return;

    const boardName = boardNameInput.value;
    const keyRows = document.querySelectorAll(".key-row");

    // Validar nome da prancha
    if (!boardName.trim()) {
      alert("O nome da prancha é obrigatório.");
      return;
    }

    // Verificar se há pelo menos uma tecla
    if (keyRows.length === 0) {
      alert("Adicione pelo menos uma tecla à prancha.");
      return;
    }

    // Coletar dados das teclas
    const keys = [];
    let isValid = true;

    keyRows.forEach((row) => {
      const text = row.querySelector(".key-text").value;
      const icon = row.querySelector(".key-icon").value;
      const category = row.querySelector(".key-category").value;

      if (!text.trim() || !icon.trim()) {
        isValid = false;
        return;
      }

      keys.push({
        text: text.trim(),
        icon: icon.trim(),
        category: category,
      });
    });

    // Validar teclas
    if (!isValid) {
      alert("Todas as teclas devem ter texto e ícone.");
      return;
    }

    // Obter pranchas existentes
    const boards = JSON.parse(
      localStorage.getItem("communicationBoards") || "[]"
    );

    // Criar nova prancha
    const newBoard = {
      id: generateId(),
      name: boardName.trim(),
      keys: keys,
      createdAt: new Date().toISOString(),
    };

    // Adicionar à lista
    boards.push(newBoard);

    // Salvar no localStorage
    localStorage.setItem("communicationBoards", JSON.stringify(boards));

    // Fechar modal e atualizar lista
    const modalElement = document.getElementById("addBoardModal");
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    // Limpar formulário
    const form = document.getElementById("addBoardForm");
    if (form) form.reset();

    const keysContainer = document.getElementById("keysContainer");
    if (keysContainer) keysContainer.innerHTML = "";

    // Recarregar pranchas
    loadBoards();

    // Notificar usuário
    alert("Prancha criada com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar prancha:", error);
    alert("Erro ao salvar prancha. Por favor, tente novamente.");
  }
}

// Editar perfil
function editProfile(profileId) {
  try {
    // Obter perfil para edição
    if (profileId === "default") {
      // Editar nome do perfil padrão (Usuário 1)
      const currentName =
        localStorage.getItem("defaultProfileName") || "Usuário 1";
      const newName = prompt(
        "Digite o novo nome para o perfil padrão:",
        currentName
      );

      if (newName && newName.trim()) {
        localStorage.setItem("defaultProfileName", newName.trim());
        alert("Nome do perfil padrão atualizado com sucesso.");
        loadProfiles();
      }
    } else {
      // Obter perfis existentes
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");
      const profile = profiles.find((p) => p.id === profileId);

      if (profile) {
        // Exibir formulário com dados do perfil
        const newName = prompt(
          "Digite o novo nome para o perfil:",
          profile.name
        );
        const newDescription = prompt(
          "Digite a nova descrição para o perfil:",
          profile.description || ""
        );

        if (newName && newName.trim()) {
          // Atualizar perfil
          profile.name = newName.trim();
          profile.description = newDescription.trim();
          profile.updatedAt = new Date().toISOString();

          // Salvar alterações
          localStorage.setItem("userProfiles", JSON.stringify(profiles));

          // Recarregar perfis
          loadProfiles();

          // Notificar usuário
          alert("Perfil atualizado com sucesso.");
        }
      } else {
        alert("Perfil não encontrado.");
      }
    }
  } catch (error) {
    console.error("Erro ao editar perfil:", error);
    alert("Erro ao editar perfil. Por favor, tente novamente.");
  }
}

// Excluir perfil
function deleteProfile(profileId) {
  try {
    if (confirm("Tem certeza que deseja excluir este perfil?")) {
      // Obter perfis existentes
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");

      // Filtrar perfil a ser excluído
      const updatedProfiles = profiles.filter(
        (profile) => profile.id !== profileId
      );

      // Salvar perfis atualizados
      localStorage.setItem("userProfiles", JSON.stringify(updatedProfiles));

      // Recarregar perfis
      loadProfiles();

      // Notificar usuário
      alert("Perfil excluído com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao excluir perfil:", error);
    alert("Erro ao excluir perfil. Por favor, tente novamente.");
  }
}

// Editar prancha
function editBoard(boardId) {
  try {
    if (boardId === "default") {
      alert(
        "A edição da prancha padrão estará disponível na próxima versão. Por enquanto, você pode duplicá-la e modificar a cópia."
      );
      return;
    }

    // Obter pranchas existentes
    const boards = JSON.parse(
      localStorage.getItem("communicationBoards") || "[]"
    );
    const board = boards.find((b) => b.id === boardId);

    if (board) {
      // Por enquanto, mostrar uma mensagem
      alert(
        "A funcionalidade de edição de pranchas estará disponível na próxima versão."
      );
    } else {
      alert("Prancha não encontrada.");
    }
  } catch (error) {
    console.error("Erro ao editar prancha:", error);
    alert("Erro ao editar prancha. Por favor, tente novamente.");
  }
}

// Duplicar prancha
function duplicateBoard(boardId) {
  try {
    // Obter prancha original
    let originalBoard;

    if (boardId === "default") {
      // Duplicar prancha padrão
      originalBoard = {
        name: "Prancha Padrão",
        keys: [
          { text: "O QUE", icon: "❓", category: "grey" },
          { text: "EU", icon: "👤", category: "yellow" },
          { text: "QUERO", icon: "🎯", category: "green" },
          { text: "COMER", icon: "🍽️", category: "green" },
          { text: "NÃO ME SINTO BEM", icon: "😔", category: "pink" },
          { text: "ONDE", icon: "🏠", category: "grey" },
          { text: "VOCÊ", icon: "👆", category: "yellow" },
          { text: "PROCURAR", icon: "🔍", category: "green" },
          { text: "BEBER", icon: "🥤", category: "green" },
          { text: "NÃO ENTENDI", icon: "❓", category: "pink" },
          { text: "QUAL", icon: "⭕", category: "grey" },
          { text: "NÓS", icon: "👥", category: "yellow" },
          { text: "TOMAR BANHO", icon: "🛁", category: "green" },
          { text: "ESTAR", icon: "🧍", category: "green" },
          { text: "PRECISO IR AO BANHEIRO", icon: "🚽", category: "pink" },
        ],
      };
    } else {
      // Obter pranchas existentes
      const boards = JSON.parse(
        localStorage.getItem("communicationBoards") || "[]"
      );
      originalBoard = boards.find((board) => board.id === boardId);

      if (!originalBoard) {
        alert("Prancha não encontrada.");
        return;
      }
    }

    // Criar cópia da prancha
    const newBoard = {
      id: generateId(),
      name: `Cópia de ${originalBoard.name}`,
      keys: [...originalBoard.keys],
      createdAt: new Date().toISOString(),
    };

    // Obter pranchas existentes
    const boards = JSON.parse(
      localStorage.getItem("communicationBoards") || "[]"
    );

    // Adicionar nova prancha
    boards.push(newBoard);

    // Salvar pranchas atualizadas
    localStorage.setItem("communicationBoards", JSON.stringify(boards));

    // Recarregar pranchas
    loadBoards();

    // Notificar usuário
    alert("Prancha duplicada com sucesso.");
  } catch (error) {
    console.error("Erro ao duplicar prancha:", error);
    alert("Erro ao duplicar prancha. Por favor, tente novamente.");
  }
}

// Excluir prancha
function deleteBoard(boardId) {
  try {
    if (confirm("Tem certeza que deseja excluir esta prancha?")) {
      // Obter pranchas existentes
      const boards = JSON.parse(
        localStorage.getItem("communicationBoards") || "[]"
      );

      // Filtrar prancha a ser excluída
      const updatedBoards = boards.filter((board) => board.id !== boardId);

      // Salvar pranchas atualizadas
      localStorage.setItem(
        "communicationBoards",
        JSON.stringify(updatedBoards)
      );

      // Recarregar pranchas
      loadBoards();

      // Notificar usuário
      alert("Prancha excluída com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao excluir prancha:", error);
    alert("Erro ao excluir prancha. Por favor, tente novamente.");
  }
}

// Gerar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
