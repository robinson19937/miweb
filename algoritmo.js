function setup() {
  // Crear los elementos del formulario
  createCanvas(1600, 1400);
   background(255, 204, 0);

  inputMin = createInput();
  inputMax = createInput();
  inputCantidad = createInput();
  button = createButton('Generar');

  // Posicionar los elementos (ajusta las posiciones según tu diseño)
  inputMin.position(650, 420);
  inputMax.position(650, 450);
  inputCantidad.position(650, 480);
  button.position(650, 510);

  // Asociar una función al botón
  button.mousePressed(generarNumeros);
  
  textSize(112);
  fill('blue');
  text('Algoritmo 19937', 256, 120);
 
 textSize(25);
  fill('black');
  text('The algorithm 19937, also known as the Mersenne Twister (specifically, MT19937), is a widely used                                                                                                        '      , 220, 220);
  
   text('  pseudorandom number generator (PRNG). Created by Makoto Matsumoto and Takuji Nishimura in                                                                                                               ', 210, 255);
  text(' 1997, it’s known for its high performance, large period, and statistical reliability.                                                                                                               ', 210, 290);
  
  
  
  
  
  
  
  
  // Crear un elemento para mostrar los resultados
  resultadoDiv = createElement('div');
  resultadoDiv.position(650, 610);
}

function generarNumeros() {
  // Obtener los valores de los inputs
  const min = parseInt(inputMin.value());
  const max = parseInt(inputMax.value());
  const cantidad = parseInt(inputCantidad.value());

  // Generar los números aleatorios y mostrarlos
  const resultados = [];
  for (let i = 0; i < cantidad; i++) {
    let valor = floor(random(min, max + 1));
    resultados.push(valor);
 
  }
  resultadoDiv.html(resultados.join(', '));

}

function draw() {
  // Redibujar un fondo claro solo en la zona de coordenadas
  noStroke();
  fill(255, 204, 0); // mismo color de fondo que el canvas
  rect(0, 0, 150, 30); // zona donde va el texto

  // Dibujar las coordenadas
  textSize(16);
  fill('blue');
  text(`x: ${mouseX}, y: ${mouseY}`, 10, 20);
  text(" Enter the minimum number: ", 400,425);
  text(" Enter the maximum number: ", 400,455);
  text(" How many random numbers do you want to generate? ", 250,485);
}
