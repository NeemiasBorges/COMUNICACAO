// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  // Carregar histórico de comunicação
  loadCommunicationHistory();

  // Configurar eventos de filtro
  setupFilterEvents();

  // Configurar botões de ação
  setupActionButtons();
});

// Carregar histórico de comunicação
function loadCommunicationHistory() {
  try {
    // Obter histórico do localStorage
    const history = JSON.parse(
      localStorage.getItem("communicationHistory") || "[]"
    );

    // Referência ao container do histórico
    const historyContainer = document.getElementById("historyContainer");
    const emptyHistory = document.getElementById("emptyHistory");

    // Verificar se há entradas no histórico
    if (history.length > 0) {
      // Ocultar mensagem de histórico vazio
      emptyHistory.style.display = "none";

      // Limpar conteúdo atual
      historyContainer.innerHTML = "";

      // Ordenar histórico do mais recente para o mais antigo
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Agrupar por data
      const groupedHistory = groupHistoryByDate(history);

      // Renderizar histórico agrupado
      renderGroupedHistory(groupedHistory, historyContainer);
    } else {
      // Exibir mensagem de histórico vazio
      emptyHistory.style.display = "block";
      historyContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
  }
}

// Agrupar histórico por data
function groupHistoryByDate(history) {
  const grouped = {};

  history.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateKey = date.toLocaleDateString("pt-BR");

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(entry);
  });

  return grouped;
}

// Renderizar histórico agrupado
function renderGroupedHistory(groupedHistory, container) {
  // Para cada data no histórico
  Object.keys(groupedHistory).forEach((date) => {
    // Criar cabeçalho da data
    const dateHeader = document.createElement("div");
    dateHeader.className = "date-header";
    dateHeader.innerHTML = `
            <h5 class="mb-3 mt-4">${formatDateHeader(date)}</h5>
        `;
    container.appendChild(dateHeader);

    // Renderizar entradas dessa data
    groupedHistory[date].forEach((entry) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
                <div class="d-flex align-items-center mb-1">
                    <span class="history-category ${
                      entry.category
                    }">${getCategoryName(entry.category)}</span>
                    <span class="history-time ms-2">${formatTime(
                      entry.timestamp
                    )} • ${entry.profile}</span>
                </div>
                <div class="history-message">${entry.message}</div>
            `;
      container.appendChild(historyItem);
    });
  });
}

// Formatação de data para cabeçalho
function formatDateHeader(dateStr) {
  const today = new Date().toLocaleDateString("pt-BR");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("pt-BR");

  if (dateStr === today) {
    return "Hoje";
  } else if (dateStr === yesterdayStr) {
    return "Ontem";
  } else {
    return dateStr;
  }
}

// Formatação de hora
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Obter nome da categoria
function getCategoryName(category) {
  const categories = {
    grey: "Questão",
    yellow: "Pessoa",
    green: "Ação",
    pink: "Necessidade",
    phrase: "Frase Completa",
  };

  return categories[category] || category;
}

// Configurar eventos de filtro
function setupFilterEvents() {
  const userFilter = document.getElementById("userFilter");
  const dateFilter = document.getElementById("dateFilter");

  // Carregar perfis de usuário para o filtro
  loadProfilesForFilter();

  // Evento de mudança no filtro de usuário
  userFilter.addEventListener("change", applyFilters);

  // Evento de mudança no filtro de data
  dateFilter.addEventListener("change", applyFilters);
}

// Carregar perfis para o filtro
function loadProfilesForFilter() {
  try {
    // Carregar perfis do localStorage
    const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");
    const userFilter = document.getElementById("userFilter");

    // Adicionar cada perfil como opção
    profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.name;
      option.textContent = profile.name;
      userFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar perfis para filtro:", error);
  }
}

// Aplicar filtros ao histórico
function applyFilters() {
  try {
    // Obter valores dos filtros
    const userFilter = document.getElementById("userFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    // Obter histórico completo
    let history = JSON.parse(
      localStorage.getItem("communicationHistory") || "[]"
    );

    // Filtrar por usuário
    if (userFilter !== "all") {
      history = history.filter((entry) => entry.profile === userFilter);
    }

    // Filtrar por data
    if (dateFilter !== "all") {
      const now = new Date();
      let compareDate;

      switch (dateFilter) {
        case "today":
          compareDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "yesterday":
          compareDate = new Date(now.setDate(now.getDate() - 1));
          compareDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          compareDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          compareDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      history = history.filter(
        (entry) => new Date(entry.timestamp) >= compareDate
      );
    }

    // Referência ao container do histórico
    const historyContainer = document.getElementById("historyContainer");
    const emptyHistory = document.getElementById("emptyHistory");

    // Verificar se há entradas no histórico filtrado
    if (history.length > 0) {
      // Ocultar mensagem de histórico vazio
      emptyHistory.style.display = "none";

      // Limpar conteúdo atual
      historyContainer.innerHTML = "";

      // Ordenar histórico do mais recente para o mais antigo
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Agrupar por data
      const groupedHistory = groupHistoryByDate(history);

      // Renderizar histórico agrupado
      renderGroupedHistory(groupedHistory, historyContainer);
    } else {
      // Exibir mensagem de histórico vazio
      emptyHistory.style.display = "block";
      historyContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Erro ao aplicar filtros:", error);
  }
}

// Configurar botões de ação
function setupActionButtons() {
  // Botão para limpar histórico
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      if (
        confirm(
          "Tem certeza que deseja limpar todo o histórico de comunicação?"
        )
      ) {
        clearCommunicationHistory();
      }
    });
  }

  // Botão para exportar histórico
  const exportHistoryBtn = document.getElementById("exportHistoryBtn");
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", exportCommunicationHistory);
  }
}

// Limpar histórico de comunicação
function clearCommunicationHistory() {
  try {
    // Limpar histórico no localStorage
    localStorage.removeItem("communicationHistory");

    // Atualizar exibição
    loadCommunicationHistory();

    // Notificar usuário
    alert("Histórico de comunicação limpo com sucesso.");
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    alert("Erro ao limpar histórico. Por favor, tente novamente.");
  }
}

// Exportar histórico de comunicação
function exportCommunicationHistory() {
  try {
    // Obter histórico do localStorage
    const history = JSON.parse(
      localStorage.getItem("communicationHistory") || "[]"
    );

    // Verificar se há histórico para exportar
    if (history.length === 0) {
      alert("Não há histórico para exportar.");
      return;
    }

    // Converter para CSV
    let csv = "Data,Hora,Usuário,Mensagem,Categoria\n";

    history.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString("pt-BR");
      const timeStr = date.toLocaleTimeString("pt-BR");

      // Escapar aspas em campos de texto
      const message = entry.message.replace(/"/g, '""');
      const profile = entry.profile.replace(/"/g, '""');

      csv += `${dateStr},${timeStr},"${profile}","${message}","${getCategoryName(
        entry.category
      )}"\n`;
    });

    // Criar blob e link para download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    // Configurar link para download
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `historico_comunicacao_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    // Adicionar ao documento, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao exportar histórico:", error);
    alert("Erro ao exportar histórico. Por favor, tente novamente.");
  }
}
