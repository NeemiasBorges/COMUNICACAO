let currentPhraseItems = [];
let phraseMode = true;
let manualMode = false;
let trackingActive = true;
let trackingInterval = null;

document.addEventListener("DOMContentLoaded", function () {
  checkCalibration();
  loadBoards();
  setupKeyboardEvents();
  setupPhraseControls();
  setupManualModeToggle();
  setupBackspaceFunction();
  startTracking();
  initializePhraseMode();
});

function initializePhraseMode() {
  phraseMode = true;
  const phraseContainer = document.getElementById("currentPhrase");
  if (phraseContainer) {
    phraseContainer.classList.remove("d-none");
  }
  document.getElementById("currentMessage").textContent =
    "Selecione uma opção com os olhos - Pressione ESPAÇO para modo manual - BACKSPACE para apagar última palavra";
}

function setupBackspaceFunction() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      removeLastWord();
    }
  });
}

function removeLastWord() {
  if (currentPhraseItems.length > 0) {
    currentPhraseItems.pop();
    updatePhraseDisplay();
    updateMainPhraseDisplay();

    if (currentPhraseItems.length === 0) {
      hidePhraseDisplayArea();
    }

    document.getElementById("currentMessage").textContent =
      "Última palavra removida";

    setTimeout(() => {
      document.getElementById("currentMessage").textContent =
        "Selecione uma opção com os olhos - Pressione ESPAÇO para modo manual - BACKSPACE para apagar última palavra";
    }, 2000);
  }
}

function setupManualModeToggle() {
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      e.preventDefault();
      toggleManualMode();
    }
    if (e.key === "F1") {
      e.preventDefault();
      togglePhraseMode();
    }
  });
}

function toggleManualMode() {
  manualMode = !manualMode;
  const modeIndicator = document.getElementById("modeIndicator");
  const webcamOverlay = document.getElementById("webcamManualOverlay");
  const trackingStatus = document.getElementById("trackingStatus");

  if (manualMode) {
    trackingActive = false;
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }

    webcamOverlay.style.display = "flex";
    modeIndicator.textContent = "Modo: Manual";
    modeIndicator.className = "badge bg-warning me-2";
    trackingStatus.textContent = "Manual";
    trackingStatus.className = "badge bg-warning";

    document.getElementById("currentMessage").textContent =
      "Modo manual ativo - Clique nas teclas para selecionar - BACKSPACE para apagar última palavra";
  } else {
    // Reiniciar câmera ao voltar para modo ocular
    restartCamera();

    trackingActive = true;
    startTracking();

    webcamOverlay.style.display = "none";
    modeIndicator.textContent = "Modo: Ocular";
    modeIndicator.className = "badge bg-primary me-2";
    trackingStatus.textContent = "Ativo";
    trackingStatus.className = "badge bg-success";

    document.getElementById("currentMessage").textContent =
      "Modo ocular ativo - Câmera reiniciada - Olhe para as teclas para selecionar - BACKSPACE para apagar última palavra";
  }
}

function restartCamera() {
  const webcamImage = document.getElementById("webcamImage");
  const trackingStatus = document.getElementById("trackingStatus");

  try {
    trackingStatus.textContent = "Reiniciando...";
    trackingStatus.className = "badge bg-warning";

    const currentSrc = webcamImage.src;
    const baseUrl = currentSrc.split("?")[0];

    const timestamp = new Date().getTime();
    const newSrc = `${baseUrl}?t=${timestamp}`;

    webcamImage.onload = function () {
      trackingStatus.textContent = "Ativo";
      trackingStatus.className = "badge bg-success";
      console.log("Câmera reiniciada com sucesso");
    };

    webcamImage.onerror = function () {
      trackingStatus.textContent = "Erro na Câmera";
      trackingStatus.className = "badge bg-danger";
      console.error("Erro ao reiniciar câmera");

      setTimeout(() => {
        restartCamera();
      }, 2000);
    };

    webcamImage.src = newSrc;
  } catch (error) {
    console.error("Erro ao reiniciar câmera:", error);
    trackingStatus.textContent = "Erro";
    trackingStatus.className = "badge bg-danger";
  }
}

function forceRestartCamera() {
  const webcamImage = document.getElementById("webcamImage");

  webcamImage.src = "";

  setTimeout(() => {
    webcamImage.src = "{{ url_for('video_feed') }}";
  }, 500);
}

function checkCalibration() {
  const calibrationDone = localStorage.getItem("calibrationDone");

  if (!calibrationDone) {
    document.getElementById("messageDisplay").innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Calibração não realizada. Por favor, <a href="/calibration" class="alert-link">calibre o sistema</a> para uma melhor experiência.
            </div>
        `;
  }
}

function loadBoards() {
  try {
    const savedBoards = localStorage.getItem("communicationBoards");

    if (savedBoards) {
      const boards = JSON.parse(savedBoards);
      const boardSelector = document.getElementById("boardSelector");

      while (boardSelector.options.length > 1) {
        boardSelector.remove(1);
      }

      boards.forEach((board) => {
        const option = document.createElement("option");
        option.value = board.id;
        option.textContent = board.name;
        boardSelector.appendChild(option);
      });

      boardSelector.addEventListener("change", function () {
        loadSelectedBoard(this.value);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar pranchas:", error);
  }
}

function loadSelectedBoard(boardId) {
  if (boardId !== "default") {
    try {
      const savedBoards = JSON.parse(
        localStorage.getItem("communicationBoards") || "[]"
      );
      const selectedBoard = savedBoards.find((board) => board.id === boardId);

      if (selectedBoard) {
        const boardContainer = document.getElementById("communicationBoard");
        boardContainer.innerHTML = "";

        selectedBoard.keys.forEach((key) => {
          const keyElement = document.createElement("div");
          keyElement.className = `keyboard-key category-${key.category}`;
          keyElement.dataset.message = key.text;

          keyElement.innerHTML = `
                        <div class="keyboard-icon">${key.icon}</div>
                        <div class="keyboard-text">${key.text}</div>
                    `;

          boardContainer.appendChild(keyElement);
        });

        setupKeyboardEvents();
      }
    } catch (error) {
      console.error("Erro ao carregar prancha personalizada:", error);
    }
  }
}

function setupKeyboardEvents() {
  const keys = document.querySelectorAll(".keyboard-key");

  keys.forEach((key) => {
    key.addEventListener("click", function (e) {
      e.preventDefault();
      const message = this.dataset.message;
      console.log("Tecla clicada:", message);
      selectKey(this, message);
    });
  });
}

function setupPhraseControls() {
  const clearPhraseBtn = document.getElementById("clearPhraseBtn");
  if (clearPhraseBtn) {
    clearPhraseBtn.addEventListener("click", function () {
      clearPhrase();
    });
  }

  const savePhraseBtn = document.getElementById("savePhraseBtn");
  if (savePhraseBtn) {
    savePhraseBtn.addEventListener("click", function () {
      saveCompletePhrase();
    });
  }
}

function togglePhraseMode() {
  phraseMode = !phraseMode;

  const phraseContainer = document.getElementById("currentPhrase");
  if (phraseContainer) {
    if (phraseMode) {
      phraseContainer.classList.remove("d-none");
      document.getElementById("currentMessage").textContent =
        "Modo de frase ATIVADO. Selecione palavras para formar uma frase.";
    } else {
      phraseContainer.classList.add("d-none");
      clearPhrase();
      document.getElementById("currentMessage").textContent =
        "Modo de frase DESATIVADO";
    }
  }
}

function clearPhrase() {
  currentPhraseItems = [];
  updatePhraseDisplay();
  updateMainPhraseDisplay();
  hidePhraseDisplayArea();
}

function showPhraseDisplayArea() {
  const phraseDisplayArea = document.getElementById("phraseDisplayArea");
  if (phraseDisplayArea) {
    phraseDisplayArea.style.display = "block";
  }
}

function hidePhraseDisplayArea() {
  const phraseDisplayArea = document.getElementById("phraseDisplayArea");
  if (phraseDisplayArea) {
    phraseDisplayArea.style.display = "none";
  }
}

function updatePhraseDisplay() {
  const phraseContent = document.querySelector(
    "#currentPhrase .phrase-content"
  );
  if (!phraseContent) return;

  if (currentPhraseItems.length === 0) {
    phraseContent.innerHTML = '<em class="text-muted">Frase vazia</em>';
    return;
  }

  phraseContent.innerHTML = "";

  currentPhraseItems.forEach((item, index) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = `phrase-item category-${item.category} me-1 p-1 rounded`;
    wordSpan.textContent = item.message;
    wordSpan.style.display = "inline-block";
    wordSpan.style.backgroundColor = "#007bff";
    wordSpan.style.color = "white";
    wordSpan.style.padding = "3px 8px";
    wordSpan.style.marginRight = "5px";
    wordSpan.style.borderRadius = "3px";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-sm btn-link text-white p-0 ms-1";
    removeBtn.innerHTML = "&times;";
    removeBtn.style.fontSize = "12px";
    removeBtn.style.position = "relative";
    removeBtn.style.top = "-2px";
    removeBtn.dataset.index = index;
    removeBtn.addEventListener("click", function () {
      removeWordFromPhrase(parseInt(this.dataset.index));
    });

    wordSpan.appendChild(removeBtn);
    phraseContent.appendChild(wordSpan);
  });
}

function updateMainPhraseDisplay() {
  const phraseDisplay = document.getElementById("phraseDisplay");
  if (!phraseDisplay) return;

  if (currentPhraseItems.length === 0) {
    phraseDisplay.innerHTML =
      '<em class="text-muted">Nenhuma palavra selecionada</em>';
    return;
  }

  phraseDisplay.innerHTML = "";
  currentPhraseItems.forEach((item) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "phrase-word";
    wordSpan.textContent = item.message;
    phraseDisplay.appendChild(wordSpan);
  });
}

function removeWordFromPhrase(index) {
  if (index >= 0 && index < currentPhraseItems.length) {
    currentPhraseItems.splice(index, 1);
    updatePhraseDisplay();
    updateMainPhraseDisplay();

    if (currentPhraseItems.length === 0) {
      hidePhraseDisplayArea();
    }
  }
}

function saveCompletePhrase() {
  if (currentPhraseItems.length === 0) {
    alert("A frase está vazia. Adicione palavras antes de salvar.");
    return;
  }

  const completeMessage = currentPhraseItems
    .map((item) => item.message)
    .join(" ");

  const phraseData = {
    timestamp: new Date().toISOString(),
    completePhrase: completeMessage,
    words: currentPhraseItems,
    wordCount: currentPhraseItems.length,
    profile: localStorage.getItem("currentProfile") || "Usuario 1",
  };

  savePhraseToDatabase(phraseData);
  logCommunication(completeMessage, "phrase");

  clearPhrase();

  alert("Frase salva com sucesso!");
}

function selectKey(keyElement, message) {
  console.log("selectKey chamada com:", message);

  document.querySelectorAll(".keyboard-key.active").forEach((key) => {
    key.classList.remove("active");
  });

  keyElement.classList.add("active");

  currentPhraseItems.push({
    message: message,
    category: keyElement.classList[1]
      ? keyElement.classList[1].replace("category-", "")
      : "default",
  });

  console.log("currentPhraseItems:", currentPhraseItems);

  showPhraseDisplayArea();
  updatePhraseDisplay();
  updateMainPhraseDisplay();

  document.getElementById(
    "currentMessage"
  ).textContent = `Adicionado "${message}" à frase`;

  logCommunication(
    message,
    keyElement.classList[1]
      ? keyElement.classList[1].replace("category-", "")
      : "default"
  );

  setTimeout(() => {
    keyElement.classList.remove("active");
  }, 1500);
}

function logCommunication(message, category) {
  try {
    const communicationData = {
      timestamp: new Date().toISOString(),
      message: message,
      category: category,
      profile: localStorage.getItem("currentProfile") || "Usuario 1",
      mode: manualMode ? "manual" : "ocular",
    };

    saveCommunicationToDatabase(communicationData);

    const history = JSON.parse(
      localStorage.getItem("communicationHistory") || "[]"
    );

    history.push(communicationData);
    localStorage.setItem("communicationHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}

function saveCommunicationToDatabase(data) {
  fetch("/save_communication", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => console.log("Comunicação salva no banco:", result))
    .catch((error) => console.error("Erro ao salvar comunicação:", error));
}

function savePhraseToDatabase(data) {
  fetch("/save_phrase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => console.log("Frase salva no banco:", result))
    .catch((error) => console.error("Erro ao salvar frase:", error));
}

function startTracking() {
  if (!trackingActive || manualMode) return;

  if (trackingInterval) {
    clearInterval(trackingInterval);
  }

  let dwellTimeoutId = null;
  let lastElement = null;
  let dwellTime = 2000; // 2 segundos

  async function updateMousePosition() {
    if (!trackingActive || manualMode) return;

    try {
      const response = await fetch("/get_mouse_position");
      const data = await response.json();

      if (data.status === "success") {
        document.getElementById("coordinates").textContent = `X: ${Math.round(
          data.x
        )}, Y: ${Math.round(data.y)}`;

        const element = document.elementFromPoint(data.x, data.y);

        if (
          element &&
          (element.classList.contains("keyboard-key") ||
            element.parentElement.classList.contains("keyboard-key"))
        ) {
          const keyElement = element.classList.contains("keyboard-key")
            ? element
            : element.parentElement;

          if (lastElement !== keyElement) {
            if (dwellTimeoutId) {
              clearTimeout(dwellTimeoutId);
            }

            lastElement = keyElement;
            console.log(
              "Iniciando dwell timer para:",
              keyElement.dataset.message
            );

            dwellTimeoutId = setTimeout(() => {
              const message = keyElement.dataset.message;
              console.log("Dwell timer executado para:", message);
              selectKey(keyElement, message);
            }, dwellTime);
          }
        } else {
          if (dwellTimeoutId) {
            clearTimeout(dwellTimeoutId);
            dwellTimeoutId = null;
          }
          lastElement = null;
        }
      } else if (
        data.status === "error" &&
        data.message === "Calibration not complete"
      ) {
        document.getElementById("trackingStatus").textContent = "Não Calibrado";
        document.getElementById("trackingStatus").className =
          "badge bg-warning";
      }
    } catch (error) {
      console.error("Erro de rastreamento:", error);
      document.getElementById("trackingStatus").textContent = "Erro";
      document.getElementById("trackingStatus").className = "badge bg-danger";
    }
  }

  trackingInterval = setInterval(updateMousePosition, 100);
}

function setCalibrationDone() {
  localStorage.setItem("calibrationDone", "true");
}

function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}
