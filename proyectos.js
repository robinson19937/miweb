let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radianes]
let trainingData = [];
let isTrained = false;
let previousTouchX = 0;
let canvas;
let smoothedAngle = 0; // For smoothing touch input

async function setup() {
  // Create canvas with responsive dimensions
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150);

  console.log("Starting setup...");

  try {
    if (localStorage.getItem('mi-modelo')) {
      console.log("Loading model from localStorage...");
      model = await tf.loadLayersModel('localstorage://mi-modelo');
      console.log("Model loaded successfully!");
      isTrained = true;
    } else {
      console.log("Training new model...");
      await trainModel();
    }
  } catch (error) {
    console.error("Error loading or training model:", error);
    isTrained = false;
  }

  // Add arrow key event listeners
  window.addEventListener('keydown', handleKeyPress);
}

async function trainModel() {
  console.log("Creating model...");
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [1] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3 }));
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });

  console.log("Generating training data...");
  for (let i = 0; i = 500; i++) {
    let deg = random(0, 360);
    let rad = deg * PI / 180;
    trainingData.push({
      input: deg / 360,
      output: [sin(rad), cos(rad), rad]
    });
  }

  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));

  console.log("Training model...");
  try {
    await model.fit(xs, ys, {
      epochs: 100,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });
    console.log("Training completed!");
  } catch (error) {
    console.error("Training error:", error);
  }

  xs.dispose();
  ys.dispose();
  isTrained = true;

  console.log("Saving model to localStorage...");
  try {
    await model.save('localstorage://mi-modelo');
    console.log("Model saved successfully!");
  } catch (error) {
    console.error("Error saving model:", error);
  }
}

function draw() {
  background(255);

  // Smooth angle for touch input
  smoothedAngle = lerp(smoothedAngle, angleInput, 0.1); // Smooth transition

  // Responsive text size
  let textScale = width / 400;
  textSize(16 * textScale);
  textAlign(LEFT);

  // Display UI
  text(`Angle (degrees): ${smoothedAngle.toFixed(2)}`, 10 * textScale, 20 * textScale);
  text('Use arrows or swipe to change angle', 10 * textScale, 40 * textScale);

  if (isTrained && model) {
    try {
      // Predict using smoothed angle
      let inputTensor = tf.tensor2d([[smoothedAngle / 360]]);
      let outputTensor = model.predict(inputTensor);
      prediction = outputTensor.dataSync();
      inputTensor.dispose();
      outputTensor.dispose();

      // Display results
      text(`Sine: ${prediction[0].toFixed(4)}`, 10 * textScale, height - 60 * textScale);
      text(`Cosine: ${prediction[1].toFixed(4)}`, 10 * textScale, height - 40 * textScale);
      text(`Radians: ${prediction[2].toFixed(4)}`, 10 * textScale, height - 20 * textScale);

      // Draw graph
      translate(width / 2, height / 2);
      scale(1, -1);

      // Axes
      stroke(0);
      line(-width * 0.25, 0, width * 0.25, 0);
      line(0, -height * 0.25, 0, height * 0.25);

      // Unit circle
      noFill();
      ellipse(0, 0, width * 0.5, width * 0.5);

      // Point on circle (using sine and cosine from prediction)
      let x = prediction[1] * (width * 0.25); // Cosine * radius
      let y = prediction[0] * (width * 0.25); // Sine * radius
      fill(255, 0, 0);
      ellipse(x, y, 10 * textScale, 10 * textScale);

      // Line from origin to point
      stroke(255, 0, 0);
      line(0, 0, x, y);
    } catch (error) {
      console.error("Prediction error:", error);
    }
  } else {
    text('Loading or training model...', 10 * textScale, height - 80 * textScale);
  }
}

function handleKeyPress(event) {
  if (event.key === 'ArrowLeft') {
    angleInput -= 2; // Increased for more noticeable movement
  } else if (event.key === 'ArrowRight') {
    angleInput += 2;
  }
  angleInput = constrain(angleInput, 0, 360);
}

function touchMoved() {
  let deltaX = mouseX - previousTouchX;
  angleInput += deltaX * 0.5; // Adjusted sensitivity for smoother movement
  angleInput = constrain(angleInput, 0, 360);
  previousTouchX = mouseX;
  return false;
}

function windowResized() {
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  resizeCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150);
}
