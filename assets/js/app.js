// assets/js/app.js
// Events, scores, AI, theme, sounds, etc.

(function () {
  // ---------- SCOREBOARD STATE ----------
  let scoreX = 0;
  let scoreO = 0;
  let scoreDraws = 0;

  // ---------- ELEMENT REFERENCES ----------
  const cells = Array.from(document.querySelectorAll(".cell"));
  const resetBtn = document.getElementById("resetBtn");
  const boardEl = document.getElementById("board");
  const firstPlayerToggle = document.getElementById("firstPlayerToggle");
  const vsComputerToggle = document.getElementById("vsComputerToggle");
  const themeToggle = document.getElementById("themeToggle");
  const clearBtn = document.getElementById("clearScores");
  const difficultySelect = document.getElementById("difficulty");


  // ---------- SOUND EFFECTS ----------
  const sounds = {
    click: new Audio("assets/sounds/click.mp3"),
    win: new Audio("assets/sounds/win.mp3"),
    draw: new Audio("assets/sounds/draw.mp3"),
  };

  function playSound(type) {
    const audio = sounds[type];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // ---------- SCOREBOARD HELPERS ----------
  function updateScoreboard() {
    const xEl = document.getElementById("scoreX");
    const oEl = document.getElementById("scoreO");
    const dEl = document.getElementById("scoreDraws");

    if (xEl) xEl.textContent = scoreX;
    if (oEl) oEl.textContent = scoreO;
    if (dEl) dEl.textContent = scoreDraws;
  }

  function loadScores() {
    scoreX = Number(localStorage.getItem("scoreX")) || 0;
    scoreO = Number(localStorage.getItem("scoreO")) || 0;
    scoreDraws = Number(localStorage.getItem("scoreDraws")) || 0;
    updateScoreboard();
  }

  function bumpScore(which) {
    let id = "";
    if (which === "X") id = "scoreX";
    else if (which === "O") id = "scoreO";
    else if (which === "D") id = "scoreDraws";
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("bump");
    void el.offsetWidth; // reflow
    el.classList.add("bump");
  }

  function saveScores() {
    localStorage.setItem("scoreX", scoreX);
    localStorage.setItem("scoreO", scoreO);
    localStorage.setItem("scoreDraws", scoreDraws);
  }

  // ---------- THEME HELPERS ----------
  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      if (themeToggle) themeToggle.checked = true;
    } else {
      document.body.classList.remove("light-theme");
      if (themeToggle) themeToggle.checked = false;
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem("ticTheme") || "dark";
    applyTheme(savedTheme);
  }

  // ---------- MODE HELPERS ----------
  function isVsComputer() {
    return vsComputerToggle && vsComputerToggle.checked;
  }

  function getStartPlayer() {
    // In vs computer mode, always start with X (human)
    if (isVsComputer()) return "X";
    // In 2-player mode, respect "Start with O" toggle
    if (firstPlayerToggle && firstPlayerToggle.checked) return "O";
    return "X";
  }

  // Disable first-player toggle when vs computer is ON (to avoid confusion)
  if (vsComputerToggle && firstPlayerToggle) {
    vsComputerToggle.addEventListener("change", () => {
      if (vsComputerToggle.checked) {
        firstPlayerToggle.disabled = true;
      } else {
        firstPlayerToggle.disabled = false;
      }
    });
  }

  // ---------- INITIAL LOAD ----------
  loadScores();
  loadTheme();

  const initialPlayer = getStartPlayer();
  const state = Game.create(initialPlayer);

  // first paint
  UI.render(state);

  // ---------- GAME END HANDLER ----------
  function handleGameEndIfNeeded() {
    if (!state.isOver) return;

    if (state.winner === "X") {
      scoreX++;
      playSound("win");
      bumpScore("X");
    } else if (state.winner === "O") {
      scoreO++;
      playSound("win");
      bumpScore("O");
    } else {
      scoreDraws++;
      playSound("draw");
      bumpScore("D");
    }

    saveScores();
    updateScoreboard();
  }

  // ---------- COMPUTER MOVE ----------
  function makeComputerMove() {
  if (!isVsComputer() || state.isOver) return;
  if (state.currentPlayer !== "O") return;

  let move;

  // EASY MODE = random valid move
  if (difficultySelect.value === "easy") {
    const validMoves = state.board
      .map((cell, idx) => (cell === "" ? idx : null))
      .filter((idx) => idx !== null);

    move = validMoves[Math.floor(Math.random() * validMoves.length)];

  } else {
    // HARD = Minimax
    move = Game.bestMove(state, "O");
  }

  // small delay for UX realism
  setTimeout(() => {
    Game.play(state, move);
    UI.render(state);
    handleGameEndIfNeeded();
  }, 350);
}

  // ---------- CELL CLICK HANDLERS ----------
  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      // if game already over → shake only
      if (state.isOver) {
        if (boardEl) {
          boardEl.classList.add("shake");
          setTimeout(() => boardEl.classList.remove("shake"), 200);
        }
        return;
      }

      const index = Number(cell.dataset.index);

      // ignore clicks on filled cells
      if (state.board[index] !== "") {
        return;
      }

      // In vs-computer mode, only allow X (human) to click
      if (isVsComputer() && state.currentPlayer !== "X") {
        return;
      }

      // human move
      playSound("click");
      Game.play(state, index);
      UI.render(state);
      handleGameEndIfNeeded();

      if (state.isOver) return;

      // if vs computer, let O (AI) respond
      if (isVsComputer()) {
        makeComputerMove();
      }
    });
  });

  // ---------- RESET GAME BUTTON ----------
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const startPlayer = getStartPlayer();
      Game.reset(state, startPlayer);
      UI.render(state);
      playSound("click");

      // In vs computer mode, human is always X, so AI never starts first
      // (If you ever want AI to start, we can extend here)
    });
  }

  // ---------- CLEAR SCORES BUTTON ----------
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      scoreX = 0;
      scoreO = 0;
      scoreDraws = 0;

      localStorage.removeItem("scoreX");
      localStorage.removeItem("scoreO");
      localStorage.removeItem("scoreDraws");

      updateScoreboard();
    });
  }

  // ---------- THEME TOGGLE LISTENER ----------
  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      const theme = themeToggle.checked ? "light" : "dark";
      applyTheme(theme);
      localStorage.setItem("ticTheme", theme);
    });
  }
})();
