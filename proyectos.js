let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radianes]
let trainingData = [];
let isTrained = false;
let previousTouchX = 0;  // Variable para almacenar la posición anterior del toque
let canvas;

function setup() {
  // Ajustar el tamaño del canvas según el tamaño de la ventana
  canvas = createCanvas(windowWidth * 0.9, windowHeight * 0.7);  // 90% de ancho y 70% de alto
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);  // Centrar el canvas

  // Si ya hay un modelo guardado en localStorage, lo cargamos
  if (localStorage.getItem('mi-modelo')) {
    console.log("Modelo cargado desde localStorage");
    model = await tf.loadLayersModel('localstorage://mi-modelo');
    isTrained = true;
  } else {
    // Si no hay un modelo guardado, creamos uno nuevo
    console.log("Entrenando modelo...");
    model = tf.sequential();
    model.add(tf.layers.dense({units: 64, activation: 'relu', inputShape: [1]})); // Aumento de unidades
    model.add(tf.layers.dense({units: 32, activation: 'relu'})); // Capa adicional
    model.add(tf.layers.dense({units: 3})); // Salidas: seno, coseno, radianes
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    // Generar datos de entrenamiento
    for (let i = 0; i < 2000; i++) { // Aumento la cantidad de datos de entrenamiento
      let deg = random(0, 360);
      let rad = deg * PI / 180;
      trainingData.push({
        input: deg / 360, // Normalizamos el ángulo (0 a 1)
        output: [sin(rad), cos(rad), rad]
      });
    }

    // Entrenar el modelo
    trainModel();
  }
}

async function trainModel() {
  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));
  
  await model.fit(xs, ys, {
    epochs: 300, // Aumento el número de épocas
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Época ${epoch}: pérdida = ${logs.loss}`);
      }
    }
  });
  
  xs.dispose();
  ys.dispose();
  isTrained = true;

  // Guardar el modelo entrenado en localStorage
  await model.save('localstorage://mi-modelo');
}

function draw() {
  background(255);
  
  // Interfaz de entrada
  textSize(width * 0.04); // Ajustamos el tamaño del texto en relación al tamaño del canvas
  textAlign(LEFT);
  text(`Ángulo (grados): ${angleInput.toFixed(2)}`, 20, 30);
  text('Desliza el dedo para cambiar el ángulo', 20, 50);
  
  if (isTrained) {
    // Hacer predicción (normalizamos el ángulo a [0, 1])
    let inputTensor = tf.tensor2d([[angleInput / 360]]);
    let outputTensor = model.predict(inputTensor);
    prediction = outputTensor.dataSync();
    inputTensor.dispose();
    outputTensor.dispose();
    
    // Mostrar resultados
    text(`Seno: ${prediction[0].toFixed(4)}`, 20, height - 80);
    text(`Coseno: ${prediction[1].toFixed(4)}`, 20, height - 60);
    text(`Radianes: ${(prediction[2] * (2 * PI)).toFixed(4)}`, 20, height - 40); // Corregir el valor de los radianes
    
    // Dibujar gráfica
    translate(width / 2, height / 2);
    scale(1, -1); // Invertir eje Y para que sea más intuitivo
    
    // Ejes
    stroke(0);
    line(-width * 0.25, 0, width * 0.25, 0); // Eje X
    line(0, -height * 0.25, 0, height * 0.25); // Eje Y
    
    // Círculo unitario
    noFill();
    ellipse(0, 0, width * 0.5, width * 0.5); // Usamos el 50% del ancho
    
    // Punto en el círculo (usando predicción)
    let x = prediction[1] * (width * 0.25); // cos * radio
    let y = prediction[0] * (width * 0.25); // sin * radio
    fill(255, 0, 0);
    ellipse(x, y, 10, 10);
    
    // Línea desde el origen al punto
    stroke(255, 0, 0);
    line(0, 0, x, y);
  } else {
    text('Entrenando modelo...', 20, height - 100);
  }
}

// Evento táctil para cambiar el ángulo
function touchMoved() {
  // Obtener la diferencia entre la posición actual y la anterior
  let deltaX = mouseX - previousTouchX;
  
  // Ajustar el valor del ángulo según el movimiento táctil
  angleInput += deltaX * 0.1; // El 0.1 es un factor para suavizar el movimiento
  
  // Limitar el ángulo entre 0 y 360 grados
  angleInput = constrain(angleInput, 0, 360);
  
  // Actualizar la posición anterior del toque
  previousTouchX = mouseX;
  
  return false;  // Para evitar que la página haga scroll
}

// Aseguramos que el canvas se ajuste al redimensionar la ventana
function windowResized() {
  resizeCanvas(windowWidth * 0.9, windowHeight * 0.7);  // Re-ajustamos el tamaño del canvas
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);  // Recentramos el canvas
}

