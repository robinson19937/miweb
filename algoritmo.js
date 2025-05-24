let inputMin, inputMax, inputCantidad, button, resultadoDiv;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 204, 0);

  // Crear inputs y botón
  inputMin = createInput();
  inputMax = createInput();
  inputCantidad = createInput();
  button = createButton('Generate');

  // Centrar elementos de entrada
  let centerX = width / 2;
  let startY = height * 0.3;
  let spacing = 40;

  inputMin.position(centerX - 100, startY);
  inputMax.position(centerX - 100, startY + spacing);
  inputCantidad.position(centerX - 100, startY + spacing * 2);
  button.position(centerX - 100, startY + spacing * 3);

  // Ajustar tamaño de inputs
  inputMin.size(200);
  inputMax.size(200);
  inputCantidad.size(200);

  // Botón de acción
  button.mousePressed(generarNumeros);

  // Título
  textAlign(CENTER);
  textSize(windowWidth < 768 ? 40 : 80);
  fill('blue');
  text('Algoritmo 19937', width / 2, height * 0.1);

  // Descripción
  textSize(windowWidth < 768 ? 14 : 20);
  fill('black');
  textAlign(LEFT);
  text('The algorithm 19937, also known as the Mersenne Twister (MT19937), is a widely used pseudorandom number generator (PRNG).', centerX - 300, height * 0.2, 600);
  text('Created by Makoto Matsumoto and Takuji Nishimura in 1997, it’s known for its high performance and statistical reliability.', centerX - 300, height * 0.25, 600);

  // Resultado
  resultadoDiv = createElement('div');
  resultadoDiv.position(centerX - 100, startY + spacing * 4.5);
  resultadoDiv.style('font-size', windowWidth < 768 ? '16px' : '20px');
}

function generarNumeros() {
  const min = parseInt(inputMin.value());
  const max = parseInt(inputMax.value());
  const cantidad = parseInt(inputCantidad.value());

  const resultados = [];
  for (let i = 0; i < cantidad; i++) {
    let valor = floor(random(min, max + 1));
    resultados.push(valor);
  }
  resultadoDiv.html(resultados.join(', '));
}

function draw() {
  // Fondo solo en el área de las coordenadas
  noStroke();
  fill(255, 204, 0);
  rect(0, 0, 180, 30);

  // Mostrar coordenadas del mouse
  textSize(16);
  fill('blue');
  text(`x: ${mouseX}, y: ${mouseY}`, 10, 20);

  // Instrucciones de entrada
  textSize(windowWidth < 768 ? 14 : 16);
  fill('black');
  textAlign(LEFT);
  text("Enter the minimum number:", width / 2 - 300, inputMin.y + 15);
  text("Enter the maximum number:", width / 2 - 300, inputMax.y + 15);
  text("How many random numbers do you want to generate?", width / 2 - 300, inputCantidad.y + 15);
}
