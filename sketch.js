// Color palette
const COLORS = {
  dark: '#2C302E',
  red: '#C71F37',
  orange: '#F07C19',
  yellow: '#F4D35E',
  white: '#FFFFFF',
  green: '#588157',
  diyaClay: '#A0522D', // Earthy brown for diya base
  diyaClayHighlight: '#C18D5D', // Lighter tone for rim
  diyaFlameBright: '#FFC107', // Bright yellow for flame center
  diyaFlameOuter: '#FF8F00', // Orange for outer flame glow
  diyaGlow: '#FFEB3B', // Soft yellow for ambient glow
};

// Animation control variables
let animationProgress = 0; // Goes from 0 (start) to 1 (end)
let animationStarted = false;
const animationSpeed = 0.008; // Adjust for faster/slower bloom

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  textFont('Garamond');
}

function draw() {
  background(240);
  translate(width / 2, height / 2);

  if (animationStarted && animationProgress < 1) {
    animationProgress += animationSpeed;
    animationProgress = min(animationProgress, 1);
  }

  // --- Draw all layers based on the current animation progress ---

  // 1. Dark circular base
  let ease = pow(animationProgress, 2) / (pow(animationProgress, 2) + pow(1 - animationProgress, 2));
  const baseSize = map(ease, 0, 1, 0, 550);
  noStroke();
  fill(COLORS.dark);
  ellipse(0, 0, baseSize, baseSize);

  // 2. Outer layer of 16 petals
  let outerProgress = constrain(map(animationProgress, 0.6, 1.0, 0, 1), 0, 1);
  if (outerProgress > 0) {
    drawPetalLayer(16, [260, 240, 220, 200], 150, [COLORS.white, COLORS.yellow, COLORS.orange, COLORS.red], outerProgress);
  }

  // 3. Middle layer of 8 petals
  let middleProgress = constrain(map(animationProgress, 0.3, 0.8, 0, 1), 0, 1);
  if (middleProgress > 0) {
    drawPetalLayer(8, [220, 200, 180, 160], 80, [COLORS.white, COLORS.yellow, COLORS.orange, COLORS.red], middleProgress);
  }

  // 4. Inner star-like flower
  let innerProgress = constrain(map(animationProgress, 0.1, 0.6, 0, 1), 0, 1);
  if (innerProgress > 0) {
    drawPetalLayer(8, [150, 130, 110], 20, [COLORS.red, COLORS.orange, COLORS.yellow], innerProgress);
  }

  // 5. Central circle
  let centerProgress = constrain(map(animationProgress, 0.0, 0.2, 0, 1), 0, 1);
  if (centerProgress > 0) {
    stroke(COLORS.green);
    strokeWeight(6);
    fill(COLORS.white);
    ellipse(0, 0, 50 * centerProgress, 50 * centerProgress);
  }

  // 6. Diyas on the outer edge
  let diyaProgress = constrain(map(animationProgress, 0.9, 1.0, 0, 1), 0, 1);
  if (diyaProgress > 0) {
    drawDiyas(16, 280, diyaProgress);
  }

  // If animation is not started or has finished, show a message
  if (!animationStarted) {
    showMessage("Click to see the Pookalam bloom.");
  } else if (animationProgress >= 1) {
    showMessage("Click to bloom again.");
  }
}

function mousePressed() {
  if (animationProgress >= 1 || !animationStarted) {
    animationProgress = 0;
    animationStarted = true;
  }
}

/**
 * Draws a full layer of petals with animation.
 */
function drawPetalLayer(numPetals, peakRadii, baseRadius, colors, progress) {
  let ease = 1 - pow(1 - progress, 3);

  for (let i = 0; i < numPetals; i++) {
    push();
    rotate((360 / numPetals) * i);

    const currentPeakRadii = peakRadii.map(r => r * ease);
    const currentBaseRadius = baseRadius * ease;
    
    const angle = 20;
    noStroke();
    for (let j = 0; j < colors.length; j++) {
      fill(colors[j]);
      beginShape();
      vertex(0, 0);
      vertex(currentBaseRadius * cos(-angle), currentBaseRadius * sin(-angle));
      vertex(currentPeakRadii[j], 0);
      vertex(currentBaseRadius * cos(angle), currentBaseRadius * sin(angle));
      endShape(CLOSE);
    }
    pop();
  }
}

/**
 * Draws a circle of UPRIGHT diyas around the pookalam.
 */
function drawDiyas(numDiyas, radius, progress) {
  let ease = sin(progress * 90);

  for (let i = 0; i < numDiyas; i++) {
    push();
    let rotationAngle = (360 / numDiyas) * i;
    rotate(rotationAngle);
    translate(radius, 0);
    
    // Counteract the initial rotation so the diya draws upright
    rotate(-rotationAngle); 

    // Diya Base (more realistic shape)
    noStroke();
    fill(COLORS.diyaClay);
    beginShape();
    vertex(0, 0);
    bezierVertex(15 * ease, 5 * ease, 15 * ease, 15 * ease, 0, 20 * ease);
    bezierVertex(-15 * ease, 15 * ease, -15 * ease, 5 * ease, 0, 0);
    endShape(CLOSE);

    // Diya Rim/Top Edge
    fill(COLORS.diyaClayHighlight);
    ellipse(0, 0, 30 * ease, 10 * ease);

    // Diya Wick
    stroke(0);
    strokeWeight(1 * ease);
    line(0, 0, 0, -5 * ease);

    // Diya Flame (appears when base is formed)
    if (progress > 0.5) {
      let flickerStrength = noise(frameCount * 0.05 + i * 100) * 10;
      let flameHeight = 15 * ease + flickerStrength;
      let flameWidth = 6 * ease + flickerStrength * 0.5;
      
      noStroke();
      let glowColor = color(COLORS.diyaGlow);
      let glowAlpha = 100 * ease * (0.5 + flickerStrength / 20);
      glowColor.setAlpha(glowAlpha);
      fill(glowColor);
      ellipse(0, -flameHeight / 2, flameWidth * 2, flameHeight * 2);

      let outerFlameColor = color(COLORS.diyaFlameOuter);
      outerFlameColor.setAlpha(200 * ease);
      fill(outerFlameColor);
      ellipse(0, -flameHeight / 2, flameWidth, flameHeight);
      
      let innerFlameColor = color(COLORS.diyaFlameBright);
      innerFlameColor.setAlpha(255 * ease);
      fill(innerFlameColor);
      ellipse(0, -flameHeight / 2 - 3, flameWidth * 0.6, flameHeight * 0.6);
    }
    pop();
  }
}

/**
 * Displays a message in the center of the canvas.
 */
function showMessage(msg) {
  resetMatrix();
  fill(10, 10, 10, 180);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text(msg, width / 2, height / 2);
}