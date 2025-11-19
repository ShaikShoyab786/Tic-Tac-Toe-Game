// assets/js/game.js
// Pure game logic: board, turns, win/tie detection + AI best move.

const Game = (function () {
  const EMPTY = "";
  const WIN_PATTERNS = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  // create a fresh game state
  function create(startPlayer = "X") {
    return {
      board: Array(9).fill(EMPTY),
      currentPlayer: startPlayer, // "X" or "O"
      winner: null,              // "X" / "O" / null
      isOver: false,             // true when win or tie
      winningLine: null,         // [a,b,c] if someone wins
      moveCount: 0,              // how many moves played
    };
  }

  // check winner for state (used in normal game)
  function checkWinner(state) {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      const v = state.board[a];

      if (v && v === state.board[b] && v === state.board[c]) {
        state.winner = v;
        state.isOver = true;
        state.winningLine = pattern;
        return;
      }
    }

    // no winner and all 9 moves played → tie
    if (state.moveCount === 9) {
      state.isOver = true;
    }
  }

  // apply one move: player clicks a cell
  function play(state, index) {
    if (state.isOver || state.board[index] !== EMPTY) {
      return state;
    }

    state.board[index] = state.currentPlayer;
    state.moveCount++;

    checkWinner(state);

    if (!state.isOver) {
      state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
    }

    return state;
  }

  // reset the existing state object (so references stay same)
  function reset(state, startPlayer = "X") {
    const fresh = create(startPlayer);
    Object.assign(state, fresh);
    return state;
  }

  // ---------- AI (Minimax) helpers ----------

  // check winner for a plain board array (no state)
  function getWinnerForBoard(board) {
    for (const [a, b, c] of WIN_PATTERNS) {
      const v = board[a];
      if (v && v === board[b] && v === board[c]) {
        return v; // "X" or "O"
      }
    }
    if (board.every((cell) => cell !== EMPTY)) {
      return "tie";
    }
    return null; // still ongoing
  }

  function minimax(board, isMaximizing, aiPlayer) {
    const winner = getWinnerForBoard(board);
    const humanPlayer = aiPlayer === "X" ? "O" : "X";

    // base cases
    if (winner === aiPlayer) return 10;
    if (winner === humanPlayer) return -10;
    if (winner === "tie") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
          board[i] = aiPlayer;
          const score = minimax(board, false, aiPlayer);
          board[i] = EMPTY;
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
          board[i] = humanPlayer;
          const score = minimax(board, true, aiPlayer);
          board[i] = EMPTY;
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  }

  // returns best index for AI to play
  function bestMove(state, aiPlayer = "O") {
    if (state.isOver) return null;

    const board = [...state.board]; // copy
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === EMPTY) {
        board[i] = aiPlayer;
        const score = minimax(board, false, aiPlayer);
        board[i] = EMPTY;

        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // public API
  return {
    create,
    play,
    reset,
    bestMove,
  };
})();
