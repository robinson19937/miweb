let model;
let angleInput = 0;
let prediction = [0, 0, 0];
let trainingData = [];
let isTrained = false;

function setup() {
  createCanvas(600, 400);

  // Crear el modelo
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3 }));
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });

  // Inicializar entrenamiento o carga
  initModel();
}

async function initModel() {
  try {
    // Intentar cargar desde localStorage
    model = await tf.loadLayersModel('localstorage://modelo-trigonometrico');
    isTrained = true;
    console.log('✅ Modelo cargado desde localStorage');
  } catch (error) {
    console.log('⚠️ Modelo no encontrado, entrenando uno nuevo...');
    generateTrainingData();
    await trainModel();
    await model.save('localstorage://modelo-trigonometrico');
    console.log('💾 Modelo guardado en localStorage');
    isTrained = true;
  }
}

function generateTrainingData() {
  for (let i = 0; i < 500; i++) {  // Reducido a 500 datos para pruebas
    let deg = random(0, 360);
    let rad = deg * PI / 180;
    trainingData.push({
      input: deg / 360,
      output: [sin(rad), cos(rad), rad]
    });
  }
}

async function trainModel() {
  try {
    console.log('Entrenamiento iniciado...');
    const xs = tf.tensor2d(trainingData.map(d => [d.input]));
    const ys = tf.tensor2d(trainingData.map(d => d.output));

    await model.fit(xs, ys, {
      epochs: 100,  // Reducido a 100 épocas para pruebas
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {  // Imprimir cada 10 épocas
            console.log(`Época ${epoch}: pérdida = ${logs.loss.toFixed(5)}`);
          }
        }
      }
    });

    xs.dispose();
    ys.dispose();
    console.log('Entrenamiento terminado');
  } catch (error) {
    console.error("❌ Error durante el entrenamiento:", error);
  }
}

function draw() {
  background(255);
  textSize(16);
  textAlign(LEFT);
  text(`Ángulo (grados): ${angleInput.toFixed(2)}`, 20, 30);
  text('Presiona flechas izquierda/derecha para cambiar el ángulo', 20, 50);

  if (isTrained) {
    let inputTensor = tf.tensor2d([[angleInput / 360]]);
    let outputTensor = model.predict(inputTensor);
    prediction = outputTensor.dataSync();
    inputTensor.dispose();
    outputTensor.dispose();

    text(`Seno: ${prediction[0].toFixed(4)}`, 20, 80);
    text(`Coseno: ${prediction[1].toFixed(4)}`, 20, 100);
    text(`Radianes: ${prediction[2].toFixed(4)}`, 20, 120);

    translate(width / 2, height / 2);
    scale(1, -1);

    stroke(0);
    line(-200, 0, 200, 0);
    line(0, -150, 0, 150);

    noFill();
    ellipse(0, 0, 200, 200);

    let x = prediction[1] * 100;
    let y = prediction[0] * 100;
    fill(255, 0, 0);
    ellipse(x, y, 10, 10);

    stroke(255, 0, 0);
    line(0, 0, x, y);
  } else {
    text('Entrenando o cargando modelo...', 20, 80);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    angleInput = max(0, angleInput - 5);
  } else if (keyCode === RIGHT_ARROW) {
    angleInput = min(360, angleInput + 5);
  }
}
