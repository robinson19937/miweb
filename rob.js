let boardSize = 480;
let tileSize = boardSize / 8;
let selected = null;

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
  textSize(tileSize * 0.7);
  drawBoard();
}

function drawBoard() {
  background(255);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      fill((x + y) % 2 === 0 ? 240 : 100);
      rect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (selected && selected.x === x && selected.y === y) {
        fill(255, 255, 0, 150);  // casilla seleccionada
        rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }

      let piece = pieces[y][x];
      if (piece) {
        fill(piece === piece.toUpperCase() ? 0 : 0);  // color de texto (negro)
        text(piece, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      }
    }
  }
}

function mousePressed() {
  let x = Math.floor(mouseX / tileSize);
  let y = Math.floor(mouseY / tileSize);

  if (x < 0 || x > 7 || y < 0 || y > 7) return;

  if (selected) {
    // Mover la pieza
    pieces[y][x] = pieces[selected.y][selected.x];
    pieces[selected.y][selected.x] = '';
    selected = null;
  } else if (pieces[y][x] !== '') {
    selected = { x, y };
  }

  drawBoard();
}

function chooseColor(color) {
  fetch('/choose_color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color })
  }).then(() => console.log("Color elegido:", color));
}

function restartGame() {
  fetch('/restart', {
    method: 'POST'
  }).then(() => {
    console.log("Juego reiniciado");
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
    selected = null;
    drawBoard();
  });
}
