function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
let colors = [
  { name: "Red", color: "#FF6B6B" },
  { name: "Orange", color: "#FFA66B" },
  { name: "Yellow", color: "#FFD66B" },
  { name: "Green", color: "#6BD69A" },
  { name: "Blue", color: "#6BCBFF" },
  { name: "Purple", color: "#B96BFF" },
  { name: "Pink", color: "#FF6BCE" },
  { name: "Brown", color: "#C69C6D" },
  { name: "Black", color: "#3D3D3D" },
  { name: "Grey", color: "#9E9E9E" },
  { name: "White", color: "#FFFFFF" }
];

let circleData = [];
let selectedColorName = "";
let selectedColor = "";
let circleRadius;
let highlightedIndex = -1;
let state = 'start';
let backArrowHovered = false;

let synth = window.speechSynthesis;
let voices = [];
let selectedVoice = null;

let draggingText = null;
let textPositions = [];
let dragOffset = { x: 0, y: 0 };

let feedback = { show: false, correct: false, startTime: 0, duration: 500 };

// ------------------- SETUP -------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  setupCircles();
  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupCircles();
  resetMatchingGame();
  redraw();
}

function populateVoices() {
  voices = synth.getVoices();
  selectedVoice =
    voices.find(v => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('female')) ||
    voices.find(v => v.lang.startsWith('en-US')) ||
    voices[0];
}

function setupCircles() {
  circleData = [];
  const total = colors.length;
  const topRowCount = Math.ceil(total / 2);
  const bottomRowCount = total - topRowCount;
  const spacingTop = width / (topRowCount + 1);
  const spacingBottom = width / (bottomRowCount + 1);
  const rowYTop = height / 2 - height * 0.15;
  const rowYBottom = height / 2 + height * 0.15;

  circleRadius = min(width, height) * 0.12;

  for (let i = 0; i < topRowCount; i++) {
    const x = spacingTop * (i + 1);
    circleData.push({ x: x, y: rowYTop, r: circleRadius, color: colors[i].color, name: colors[i].name, matched: false });
  }
  for (let i = 0; i < bottomRowCount; i++) {
    const index = i + topRowCount;
    const x = spacingBottom * (i + 1);
    circleData.push({ x: x, y: rowYBottom, r: circleRadius, color: colors[index].color, name: colors[index].name, matched: false });
  }
}

// ------------------- DRAW -------------------
function draw() {
  background(255);
  if (state === 'start') drawStartScreen();
  else if (state === 'modeSelect') drawModeSelectScreen();
  else if (state === 'playColors') drawPlayColorsScreen();
  else if (state === 'matchColors') drawMatchColorsScreen();

  if (feedback.show && millis() - feedback.startTime < feedback.duration) {
    push();
    textAlign(CENTER, CENTER);
    textSize(min(width, height) * 0.2);
    fill(feedback.correct ? '#00FF00' : '#FF0000');
    text(feedback.correct ? '✓' : '✗', width / 2, height / 2);
    pop();
  } else {
    feedback.show = false;
  }
}

// ------------------- SCREENS -------------------
function drawStartScreen() {
  background(252, 243, 247);
  drawPastelBackgroundPattern();
  setGradient(width/2 - width*0.35, height/3 - height*0.12, width*0.7, height*0.18, color('#FFB3BA'), color('#BAE1FF'), 'Y');
  textFont('Comic Sans MS');
  fill(100, 40, 70, 200);
  textSize(min(width, height) * 0.09);
  drawingContext.shadowColor = 'rgba(255, 182, 193, 0.35)';
  drawingContext.shadowBlur = 15;
  text("Luca's Colours!", width / 2, height / 3);
  drawingContext.shadowBlur = 0;
  drawPastelButton(width / 2 - width*0.13, height / 2, width*0.26, height*0.13, "Start", '#FFB3BA', '#FFDFD3');
}

function drawModeSelectScreen() {
  background(245, 252, 250);
  drawPastelBackgroundPattern();
  textFont('Comic Sans MS');
  fill(120, 90, 110, 220);
  textSize(min(width, height) * 0.06);
  drawingContext.shadowColor = 'rgba(179, 223, 255, 0.5)';
  drawingContext.shadowBlur = 12;
  text("Select Mode", width / 2, height / 4);
  drawingContext.shadowBlur = 0;
  drawPastelButton(width / 2 - width*0.12, height / 2 - height*0.08, width*0.24, height*0.08, "Colour Mode", '#BAE1FF', '#D0E8FF');
  drawPastelButton(width / 2 - width*0.12, height / 2 + height*0.05, width*0.24, height*0.08, "Matching Mode", '#FFDAC1', '#FFE8D6');
  drawBackArrow(20, 20);
}

// ------------------- BUTTONS / BACK ARROW -------------------
function drawPastelButton(x, y, w, h, label, baseColor, highlightColor) {
  push();
  noStroke();
  drawingContext.shadowColor = 'rgba(0,0,0,0.05)';
  drawingContext.shadowBlur = 8;
  setGradient(x, y, w, h, baseColor, highlightColor, 'Y');
  rect(x, y, w, h, 25);
  drawingContext.shadowBlur = 0;
  pop();
  fill('#5A3E4A');
  textSize(w / 10);
  textFont('Comic Sans MS');
  text(label, x + w / 2, y + h / 2);
}

function drawBackArrow(x, y) {
  push();
  backArrowHovered = (mouseX > x - 5 && mouseX < x + 45 && mouseY > y - 5 && mouseY < y + 35);
  let scaleFactor = backArrowHovered ? 1.2 : 1;
  let centerX = x + 20;
  let centerY = y + 15;
  translate(centerX, centerY);
  scale(scaleFactor);
  translate(-centerX, -centerY);
  stroke('#A18C8F'); strokeWeight(5); fill('#F4E7E9'); rect(x - 5, y - 5, 50, 40, 10);
  noStroke(); fill('#7A5D6E'); const arrowWidth = 20; const arrowHeight = 20;
  beginShape();
  vertex(centerX + arrowWidth / 2, centerY - arrowHeight / 2);
  vertex(centerX - arrowWidth / 4, centerY);
  vertex(centerX + arrowWidth / 2, centerY + arrowHeight / 2);
  vertex(centerX + arrowWidth / 2, centerY + arrowHeight / 4);
  vertex(centerX + arrowWidth / 4, centerY);
  vertex(centerX + arrowWidth / 2, centerY - arrowHeight / 4);
  endShape(CLOSE);
  pop();
}

// ------------------- PATTERNS / GRADIENTS -------------------
function drawPastelBackgroundPattern() {
  noStroke();
  let pastelColors = ['#FFB3BA', '#FFDAC1', '#FFFFBA', '#BAFFC9', '#BAE1FF'];
  let step = min(width, height) * 0.06;
  for (let i = 0; i < width; i += step) {
    for (let j = 0; j < height; j += step) {
      fill(random(pastelColors) + '88');
      ellipse(i + step / 2, j + step / 2, step * 0.7);
    }
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
  if (axis === 'Y') {
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(color(c1), color(c2), inter);
      stroke(c); line(x, i, x + w, i);
    }
  } else {
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(color(c1), color(c2), inter);
      stroke(c); line(i, y, i, y + h);
    }
  }
}

function darkerPastelShade(col, factor) {
  let c = color(col);
  return color(red(c) * factor, green(c) * factor, blue(c) * factor, alpha(c));
}
// ------------------- COLOR MODE -------------------
function drawPastelGradient() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color('#FFF5F7'), color('#E3F6F5'), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawPlayColorsScreen() {
  drawPastelGradient();
  highlightedIndex = -1;

  for (let i = 0; i < circleData.length; i++) {
    let c = circleData[i];
    if (dist(mouseX, mouseY, c.x, c.y) < c.r + 10) highlightedIndex = i;
  }

  for (let i = 0; i < circleData.length; i++) {
    let c = circleData[i];
    let r = (i === highlightedIndex) ? c.r * 1.3 : c.r;
    fill(c.color);
    strokeWeight(5);
    stroke(darkerPastelShade(c.color, 0.7));
    ellipse(c.x, c.y, r * 2);

    noStroke();
    textSize(i === highlightedIndex ? circleRadius * 0.6 : circleRadius * 0.45);
    strokeWeight(3);
    stroke(darkerPastelShade(c.color, 0.5));
    fill(c.name === "White" ? "#BBBBBB" : c.color);
    text(c.name, c.x, c.y + r + circleRadius * 0.35);
    noStroke();
  }

  if (selectedColorName !== "") {
    fill(selectedColor);
    stroke(darkerPastelShade(selectedColor, 0.5));
    strokeWeight(4);
    textSize(circleRadius * 0.9);
    text(selectedColorName, width / 2, height - circleRadius);
    noStroke();
  }

  drawBackArrow(20, 20);
}

// ------------------- MATCHING MODE -------------------
function drawMatchColorsScreen() {
  drawPastelGradient();

  // circles
  for (let i = 0; i < circleData.length; i++) {
    let c = circleData[i];
    fill(c.color);
    strokeWeight(4);
    stroke(darkerPastelShade(c.color, 0.6));
    ellipse(c.x, c.y, c.r * 2);
  }

  // draggable text boxes
  for (let i = 0; i < textPositions.length; i++) {
    let t = textPositions[i];
    let matchingCircle = circleData.find(c => c.name === t.name);

    textFont('Comic Sans MS');
    textSize(circleRadius * 0.45);

    fill(matchingCircle.color);
    strokeWeight(4);
    stroke(darkerPastelShade(matchingCircle.color, 0.6));
    rect(t.x - circleRadius * 0.9, t.y - circleRadius * 0.4, circleRadius * 1.8, circleRadius * 0.8, 12);

    fill(t.name === "White" ? "#BBBBBB" : "#5A3E4A");
    noStroke();
    text(t.name, t.x, t.y);
  }

  drawBackArrow(20, 20);
}

// ------------------- MOUSE EVENTS -------------------
function mousePressed() {
  if (state === 'start') {
    if (mouseX > width/2-width*0.13 && mouseX < width/2+width*0.13 && mouseY > height/2 && mouseY < height/2+height*0.13) {
      state='modeSelect'; redraw();
    }
  } else if (state === 'modeSelect') {
    if (mouseX > width/2-width*0.12 && mouseX < width/2+width*0.12) {
      if (mouseY > height/2-height*0.08 && mouseY < height/2+0.0) { state='playColors'; selectedColorName=''; selectedColor=''; redraw(); }
      else if (mouseY > height/2+height*0.05 && mouseY < height/2+height*0.13) { state='matchColors'; resetMatchingGame(); redraw(); }
    }
    if (mouseX > 15 && mouseX < 65 && mouseY > 15 && mouseY < 55) { state='start'; redraw(); }
  } else if (state === 'playColors') {
    for (let i = 0; i < circleData.length; i++) {
      let c = circleData[i];
      if (dist(mouseX, mouseY, c.x, c.y) < c.r) {
        selectedColorName = c.name;
        selectedColor = c.color;
        playVoice(selectedColorName);
        redraw(); break;
      }
    }
    if (mouseX > 15 && mouseX < 65 && mouseY > 15 && mouseY < 55) { state='modeSelect'; selectedColorName=''; selectedColor=''; redraw(); }
  } else if (state === 'matchColors') {
    for (let i = textPositions.length-1; i >= 0; i--) {
      let t = textPositions[i];
      if (dist(mouseX, mouseY, t.x, t.y) < circleRadius * 0.57) { draggingText = t; dragOffset.x = mouseX-t.x; dragOffset.y = mouseY-t.y; break; }
    }
    if (mouseX > 15 && mouseX < 65 && mouseY > 15 && mouseY < 55) { state='modeSelect'; redraw(); }
  }
}

function mouseDragged() {
  if (state === 'matchColors' && draggingText) {
    draggingText.x = mouseX - dragOffset.x;
    draggingText.y = mouseY - dragOffset.y;
    redraw();
  }
}

function mouseReleased() {
  if (state === 'matchColors' && draggingText) {
    let matched = false;
    for (let i = 0; i < circleData.length; i++) {
      let c = circleData[i];
      if (!c.matched && dist(draggingText.x, draggingText.y, c.x, c.y) < c.r) {
        if (draggingText.name === c.name) {
          c.matched = true;
          matched = true;
          showFeedback(true);
        } else {
          showFeedback(false);
          draggingText.x = draggingText.origX;
          draggingText.y = draggingText.origY;
        }
        break;
      }
    }
    if (!matched) {
      draggingText.x = draggingText.origX;
      draggingText.y = draggingText.origY;
    }
    draggingText = null;
    redraw();
  }
}

// ------------------- MATCHING RESET -------------------
function resetMatchingGame() {
  setupCircles();
  textPositions = [];
  let shuffled = shuffle(colors);
  let startY = height - circleRadius * 1.2;
  let spacing = circleRadius * 1.4;
  let offsetX = (width - (shuffled.length-1) * spacing) / 2;

  for (let i = 0; i < shuffled.length; i++) {
    let x = offsetX + i * spacing;
    textPositions.push({ name: shuffled[i].name, color: shuffled[i].color, x: x, y: startY, origX: x, origY: startY, locked: false });
  }
}

// ------------------- TTS -------------------
function playVoice(text) {
  if (synth.speaking) synth.cancel();
  let utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 1;
  synth.speak(utterance);
}

// ------------------- FEEDBACK -------------------
function showFeedback(correct) {
  feedback.show = true;
  feedback.correct = correct;
  feedback.startTime = millis();
}
