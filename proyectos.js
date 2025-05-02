let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radianes]
let trainingData = [];
let isTrained = false;
let previousTouchX = 0;
let canvas;

async function setup() {
  // Create canvas with responsive dimensions (80% of the smaller dimension for better fit)
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  canvas = createCanvas(canvasSize, canvasSize);
  // Position canvas below the project description (assuming description is ~100px tall)
  canvas.position((windowWidth - width) / 2, 150); // Adjusted Y-position to avoid overlap

  // Load or train model
  if (localStorage.getItem('mi-modelo')) {
    console.log("Loading model from localStorage");
    model = await tf.loadLayersModel('localstorage://mi-modelo');
    isTrained = true;
  } else {
    console.log("Training model...");
    await trainModel();
  }

  // Add arrow key event listeners for web
  window.addEventListener('keydown', handleKeyPress);
}

async function trainModel() {
  model = tf.sequential();
  model.add(tf.layers.dense({units: 64, activation: 'relu', inputShape: [1]}));
  model.add(tf.layers.dense({units: 32, activation: 'relu'}));
  model.add(tf.layersexperts: dense({units: 3}));
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });

  // Generate training data (reduced dataset size for faster training)
  for (let i = 0; i < 1000; i++) { // Reduced from 2000 to speed up
    let deg = random(0, 360);
    let rad = deg * PI / 180;
    trainingData.push({
      input: deg / 360,
      output: [sin(rad), cos(rad), rad]
    });
  }

  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));

  // Train model with fewer epochs for faster loading
  await model.fit(xs, ys, {
    epochs: 150, // Reduced from 300
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });

  xs.dispose();
  ys.dispose();
  isTrained = true;

  // Save model
  await model.save('localstorage://mi-modelo');
  console.log('Model saved to localStorage');
}

function draw() {
  background(255);

  // Responsive text size
  let textScale = width / 400; // Scale text based on canvas width
  textSize(16 * textScale);
  textAlign(LEFT);
  
  // Display instructions and angle (positioned to avoid overlap)
  text(`Angle (degrees): ${angleInput.toFixed(2)}`, 10 * textScale, 20 * textScale);
  text('Use arrows or swipe to change angle', 10 * textScale, 40 * textScale);

  if (isTrained) {
    // Predict
    let inputTensor = tf.tensor2d([[angleInput / 360]]);
    let outputTensor = model.predict(inputTensor);
    prediction = outputTensor.dataSync();
    inputTensor.dispose();
    outputTensor.dispose();

    // Display results at the bottom
    text(`Sine: ${prediction[0].toFixed(4)}`, 10 * textScale, height - 60 * textScale);
    text(`Cosine: ${prediction[1].toFixed(4)}`, 10 * textScale, height - 40 * textScale);
    text(`Radians: ${(prediction[2]).toFixed(4)}`, 10 * textScale, height - 20 * textScale);

    // Draw graph
    translate(width / 2, height / 2);
    scale(1, -1);

    // Axes
    stroke(0);
    line(-width * 0.25, 0, width * 0.25, 0); // X-axis
    line(0, -height * 0.25, 0, height * 0.25); // Y-axis

    // Unit circle
    noFill();
    ellipse(0, 0, width * 0.5, width * 0.5);

    // Point on circle
    let x = prediction[1] * (width * 0.25); // cos * radius
    let y = prediction[0] * (width * 0.25); // sin * radius
    fill(255, 0, 0);
    ellipse(x, y, 10 * textScale, 10 * textScale);

    // Line from origin to point
    stroke(255, 0, 0);
    line(0, 0, x, y);
  } else {
    text('Training model...', 10 * textScale, height - 80 * textScale);
  }
}

// Handle arrow key input
function handleKeyPress(event) {
  if (event.key === 'ArrowLeft') {
    angleInput -= 1; // Decrease angle
  } else if (event.key === 'ArrowRight') {
    angleInput += 1; // Increase angle
  }
  angleInput = constrain(angleInput, 0, 360); // Keep within bounds
}

// Handle touch input
function touchMoved() {
  let deltaX = mouseX - previousTouchX;
  angleInput += deltaX * 0.1; // Smooth movement
  angleInput = constrain(angleInput, 0, 360);
  previousTouchX = mouseX;
  return false; // Prevent scrolling
}

// Resize canvas on window resize
function windowResized() {
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  resizeCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150); // Recenter, keep below description
}
