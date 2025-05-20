let boardSize = 480;
let tileSize = boardSize / 8;
let selected = null;
let boardState = [];
let isWhiteBottom = true;

const unicodePieces = {
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
};

function setup() {
  let canvas = createCanvas(boardSize, boardSize);
  canvas.parent("board-canvas");
  noLoop();
  fetchBoard();
}

function draw() {
  drawBoard();
  drawPieces();
}

function drawBoard() {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let file = isWhiteBottom ? x : 7 - x;
      let rank = isWhiteBottom ? y : 7 - y;
      if ((x + y) % 2 === 0) fill(240);
      else fill(100);
      rect(file * tileSize, rank * tileSize, tileSize, tileSize);

      if (selected && selected.x === x && selected.y === y) {
        fill(255, 255, 0, 100);
        rect(file * tileSize, rank * tileSize, tileSize, tileSize);
      }
    }
  }
}

function drawPieces() {
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let piece = boardState[y][x];
      if (piece !== ".") {
        fill(piece === piece.toUpperCase() ? 0 : 255);
        let file = isWhiteBottom ? x : 7 - x;
        let rank = isWhiteBottom ? y : 7 - y;
        text(unicodePieces[piece], file * tileSize + tileSize / 2, rank * tileSize + tileSize / 2);
      }
    }
  }
}

function mousePressed() {
  const x = floor(mouseX / tileSize);
  const y = floor(mouseY / tileSize);
  const file = isWhiteBottom ? x : 7 - x;
  const rank = isWhiteBottom ? y : 7 - y;

  if (selected) {
    const from = toSquare(selected.x, selected.y);
    const to = toSquare(x, y);
    const move = from + to;

    fetch("/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: move })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchBoard();
        } else {
          console.log("Movimiento ilegal");
        }
        selected = null;
      });
  } else {
    selected = { x, y };
    redraw();
  }
}

function toSquare(x, y) {
  const files = isWhiteBottom ? "abcdefgh" : "hgfedcba";
  const ranks = isWhiteBottom ? "87654321" : "12345678";
  return files[x] + ranks[y];
}

function fenToMatrix(fen) {
  const rows = fen.split(" ")[0].split("/");
  return rows.map(row => {
    return [...row].flatMap(c => (isNaN(c) ? [c] : Array(+c).fill(".")));
  });
}

function fetchBoard() {
  fetch("/restart", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      const fen = data.fen || "";
      boardState = fenToMatrix(fen);
      redraw();
    });
}

function chooseColor(color) {
  isWhiteBottom = color === "white";
  fetch('/choose_color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color })
  }).then(() => {
    restartGame();
  });
}

function restartGame() {
  fetchBoard();
}
