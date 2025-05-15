const tileSize = 80; // Tamaño de cada casilla
let board = []; // Matriz para representar las piezas
let selected = null; // casilla seleccionada
let engine;

// Piezas en notación Unicode
const pieces = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟', // negras
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'  // blancas
};

function setup() {
  createCanvas(8 * tileSize, 8 * tileSize);
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.6);
  setupBoard();
  initStockfish();
}

function draw() {
  background(255);
  drawBoard();
  highlightSelected();
  drawPieces();
}

function drawBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let isLight = (row + col) % 2 === 0;
      fill(isLight ? '#f0d9b5' : '#b58863');
      rect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

function drawPieces() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let piece = board[row][col];
      if (piece !== '') {
        fill(isUpperCase(piece) ? 0 : 255); // blancas negras
        text(pieces[piece], col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
      }
    }
  }
}

function highlightSelected() {
  if (selected) {
    fill(255, 255, 0, 150); // Amarillo transparente
    rect(selected.col * tileSize, selected.row * tileSize, tileSize, tileSize);
  }
}

function setupBoard() {
  board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
}

function isUpperCase(char) {
  return char === char.toUpperCase();
}

function mousePressed() {
  const col = floor(mouseX / tileSize);
  const row = floor(mouseY / tileSize);

  if (col < 0 || col >= 8 || row < 0 || row >= 8) return; // fuera del tablero

  let clickedPiece = board[row][col];

  if (selected) {
    // Si ya hay una selección, intentamos mover la pieza
    const from = selected;
    const to = { row, col };
    movePiece(from, to);
    selected = null;
  } else if (clickedPiece !== '') {
    // Seleccionamos la pieza si hay algo en la casilla
    selected = { row, col };
  }
}

async function movePiece(from, to) {
  const piece = board[from.row][from.col];
  const moveStr =
    String.fromCharCode(97 + from.col) + (8 - from.row) +
    String.fromCharCode(97 + to.col) + (8 - to.row);
  
  const legalMoves = await getLegalMoves();
  
  if (legalMoves.includes(moveStr)) {
    board[to.row][to.col] = piece;
    board[from.row][from.col] = '';
    selected = null;
    makeAIMove(); // Hacer que la IA juegue después del movimiento del jugador
  } else {
    console.log('Movimiento no válido');
  }
}

function getLegalMoves() {
  const fenStr = boardToFEN();
  sendCmd('ucinewgame');
  sendCmd('position fen ' + fenStr);
  sendCmd('d');

  return new Promise((resolve) => {
    engine.onmessage = function(event) {
      const msg = event.data;
      if (msg.startsWith('legalmoves')) {
        const moves = msg.split(' ')[1].split(',');
        resolve(moves);
      }
    };
  });
}

function boardToFEN() {
  let fen = '';
  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      let piece = board[row][col];
      if (piece === '') {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += piece;
      }
    }
    if (empty > 0) fen += empty;
    if (row < 7) fen += '/';
  }
  fen += ' w - - 0 1';
  return fen;
}

function makeAIMove() {
  const fenStr = boardToFEN();
  sendCmd('ucinewgame');
  sendCmd('position fen ' + fenStr);
  sendCmd('go depth 3'); // Profundidad de la búsqueda de Stockfish

  engine.onmessage = function(event) {
    const msg = event.data;
    if (msg.startsWith('bestmove')) {
      const bestMove = msg.split(' ')[1];
      const fromCol = bestMove.charCodeAt(0) - 97; // e.g., 'e' -> 4
      const fromRow = 8 - parseInt(bestMove[1]); // '2' -> 6
      const toCol = bestMove.charCodeAt(2) - 97; // e.g., 'e' -> 4
      const toRow = 8 - parseInt(bestMove[3]); // '4' -> 4

      const piece = board[fromRow][fromCol];
      board[toRow][toCol] = piece;
      board[fromRow][fromCol] = '';
    }
  };
}

function initStockfish() {
  engine = new Worker('https://cdn.jsdelivr.net/gh/lichess-org/stockfish.wasm@v0.13.0/stockfish.js');
  engine.onmessage = (event) => {
    console.log('Stockfish:', event.data);
  };
}

function sendCmd(cmd) {
  engine.postMessage(cmd);
}
