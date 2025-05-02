let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radians]
let trainingData = [];
let isTrained = false;

function setup() {
  createCanvas(600, 400);
  
  // Crear el modelo
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

async function trainModel() {
  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));
  
  await model.fit(xs, ys, {
    epochs: 300, // Aumento el número de épocas
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(Época ${epoch}: pérdida = ${logs.loss});
      }
    }
  });
  
  xs.dispose();
  ys.dispose();
  isTrained = true;
}

function draw() {
  background(255);
  
  // Interfaz de entrada
  textSize(16);
  textAlign(LEFT);
  text(Ángulo (grados): ${angleInput.toFixed(2)}, 20, 30);
  text('Presiona flechas izquierda/derecha para cambiar el ángulo', 20, 50);
  
  if (isTrained) {
    // Hacer predicción (normalizamos el ángulo a [0, 1])
    let inputTensor = tf.tensor2d([[angleInput / 360]]);
    let outputTensor = model.predict(inputTensor);
    prediction = outputTensor.dataSync();
    inputTensor.dispose();
    outputTensor.dispose();
    
    // Mostrar resultados
    text(Seno: ${prediction[0].toFixed(4)}, 20, 80);
    text(Coseno: ${prediction[1].toFixed(4)}, 20, 100);
    text(Radianes: ${(prediction[2] * (2 * PI)).toFixed(4)}, 20, 120); // Corregir el valor de los radianes
    
    // Dibujar gráfica
    translate(width / 2, height / 2);
    scale(1, -1); // Invertir eje Y para que sea más intuitivo
    
    // Ejes
    stroke(0);
    line(-200, 0, 200, 0); // Eje X
    line(0, -150, 0, 150); // Eje Y
    
    // Círculo unitario
    noFill();
    ellipse(0, 0, 200, 200);
    
    // Punto en el círculo (usando predicción)
    let x = prediction[1] * 100; // cos * radio
    let y = prediction[0] * 100; // sin * radio
    fill(255, 0, 0);
    ellipse(x, y, 10, 10);
    
    // Línea desde el origen al punto
    stroke(255, 0, 0);
    line(0, 0, x, y);
  } else {
    text('Entrenando modelo...', 20, 80);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    angleInput = max(0, angleInput - 5);
  } else if (keyCode === RIGHT_ARROW) {
    angleInput = min(360, angleInput + 5);
  }
}
