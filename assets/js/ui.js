// assets/js/ui.js
// UI handling: DOM ko update karna based on game state.

const UI = (function () {
  function getCells() {
    return Array.from(document.querySelectorAll(".cell"));
  }

  function getStatusEl() {
    return document.getElementById("status");
  }

  function render(state) {
    const cells = getCells();
    const statusEl = getStatusEl();
    const boardEl = document.getElementById("board");


    // update board (X / O / empty)
    cells.forEach((cell, index) => {
      const value = state.board[index];

      cell.textContent = value;
      cell.classList.toggle("x", value === "X");
      cell.classList.toggle("o", value === "O");
      cell.classList.remove("win"); // clear old win highlight
    });

    // highlight winning line if any
    if (state.winningLine) {
      state.winningLine.forEach((i) => {
        cells[i].classList.add("win");
      });
      statusEl.setAttribute("data-state", "win");
    } else if (state.isOver) {
      statusEl.setAttribute("data-state", "tie");
    } else {
      statusEl.setAttribute("data-state", "playing");
    }

        // board over / playing state (for disabling hover)
    if (state.isOver) {
      boardEl.classList.add("over");
    } else {
      boardEl.classList.remove("over");
      boardEl.classList.remove("shake");  // clear old shake if any
    }


    // update status text
    if (state.winner) {
      statusEl.innerHTML = `🎉 Player <strong>${state.winner}</strong> wins!`;
    } else if (state.isOver) {
      statusEl.textContent = "🤝 It's a tie.";
    } else {
      statusEl.innerHTML = `Player <strong>${state.currentPlayer}</strong>, your turn`;
    }
  }

  // expose only render function
  return {
    render,
  };
})();
