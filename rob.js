let boardSize = 480;
let tileSize = boardSize / 8;
let selected = null;
let board = [];
let pieceSymbols = {
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
};

function setup() {
  let canvas = createCanvas(boardSize, boardSize);
  canvas.parent("board-canvas");
  loadPositionFromFEN();
}

function draw() {
  background(255);
  drawBoard();
  drawPieces();
}

function drawBoard() {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 0) fill(240);
      else fill(100);
      rect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (selected && selected.x === x && selected.y === y) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        rect(x * tileSize, y * tileSize, tileSize, tileSize);
        noStroke();
      }
    }
  }
}

function drawPieces() {
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let piece = board[y][x];
      if (piece !== "") {
        fill(piece === piece.toUpperCase() ? 0 : 255);
        text(pieceSymbols[piece], x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      }
    }
  }
}

function mousePressed() {
  let x = floor(mouseX / tileSize);
  let y = floor(mouseY / tileSize);

  if (x < 0 || x > 7 || y < 0 || y > 7) return;

  if (!selected) {
    if (board[y][x] !== "") {
      selected = { x, y };
    }
  } else {
    let move = {
      from: { x: selected.x, y: selected.y },
      to: { x, y }
    };

    const moveUCI = toUCI(move);
    fetch("/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: moveUCI })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadPositionFromFEN(data.fen);
      } else {
        alert("Movimiento ilegal");
      }
    });
    selected = null;
  }
}

function chooseColor(color) {
  fetch('/choose_color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color })
  }).then(() => console.log("Color elegido:", color));
}

function restartGame() {
  fetch('/restart', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      loadPositionFromFEN(data.fen);
    });
}

function toUCI(move) {
  const files = "abcdefgh";
  const ranks = "87654321";
  return files[move.from.x] + ranks[move.from.y] + files[move.to.x] + ranks[move.to.y];
}

function loadPositionFromFEN(fenStr = null) {
  if (fenStr) {
    board = parseFEN(fenStr);
    redraw();
    return;
  }

  fetch("/restart", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      board = parseFEN(data.fen);
      redraw();
    });
}

function parseFEN(fen) {
  let rows = fen.split(" ")[0].split("/");
  let result = [];

  for (let row of rows) {
    let parsedRow = [];
    for (let ch of row) {
      if (!isNaN(ch)) {
        for (let i = 0; i < parseInt(ch); i++) parsedRow.push("");
      } else {
        parsedRow.push(ch);
      }
    }
    result.push(parsedRow);
  }
  return result;
}
