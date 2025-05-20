let boardSize = 480;
let tileSize = boardSize / 8;
let selected = null; // coordenadas de la pieza seleccionada

// Representación del tablero
let pieces = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖']
];

function setup() {
  let canvas = createCanvas(boardSize, boardSize);
  canvas.parent("board-canvas");
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.8);
  noLoop();
  drawBoard();
}

function drawBoard() {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // Casillas
      if ((x + y) % 2 === 0) {
        fill(240);
      } else {
        fill(100);
      }
      rect(x * tileSize, y * tileSize, tileSize, tileSize);

      // Resaltar si está seleccionada
      if (selected && selected.x === x && selected.y === y) {
        fill(255, 255, 0, 120);
        rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }

      // Piezas
      let piece = pieces[y][x];
      if (piece !== '') {
        fill(0); // color negro para las piezas Unicode
        text(piece, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      }
    }
  }
}

function mousePressed() {
  let x = Math.floor(mouseX / tileSize);
  let y = Math.floor(mouseY / tileSize);

  if (x < 0 || x >= 8 || y < 0 || y >= 8) return;

  let clickedPiece = pieces[y][x];

  if (selected) {
    // Mover pieza seleccionada
    let from = selected;
    let to = { x, y };

    // Ejecutar movimiento
    pieces[to.y][to.x] = pieces[from.y][from.x];
    pieces[from.y][from.x] = '';

    selected = null;
    redraw();
  } else if (clickedPiece !== '') {
    // Seleccionar pieza
    selected = { x, y };
    redraw();
  }
}

function chooseColor(color) {
  fetch('/choose_color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color: color })
  }).then(() => {
    console.log("Color elegido:", color);
  });
}

function restartGame() {
  fetch('/restart', { method: 'POST' })
    .then(() => {
      console.log("Juego reiniciado");
      selected = null;
      pieces = [
        ['♜','♞','♝','♛','♚','♝','♞','♜'],
        ['♟','♟','♟','♟','♟','♟','♟','♟'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['♙','♙','♙','♙','♙','♙','♙','♙'],
        ['♖','♘','♗','♕','♔','♗','♘','♖']
      ];
      redraw();
    });
}
