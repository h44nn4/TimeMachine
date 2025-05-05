let currentState = 'landing';
let thoughts = [];
let lastSpawn = 0;
let thoughtRate = 100; // changeable
let startTime;
let spawnDuration = 20000; // changeable
let thoughtList = [
  "what if","I’m hungry", "breathe", 
  "what time is it", "am I doing this right?", "this is boring", "focus", "let go", "did I lock the door?",
  "my leg itches", "why did I say that", "okay but seriously now", "this feels weird", "how long has it been?", "should I be thinking this?",
  "stop thinking", "I can’t stop thinking", "think of nothing", "I forgot to reply",
  "what’s the point of this?", "maybe I’m doing okay", "where even is my phone",
  "inhale... exhale...", "this isn’t working", "I think I’m floating",
  "be here now", "nothing matters", "don’t move", "just observe",
  "I wonder what they meant when they said that thing", "tea sounds good",
  "why is that stuck in my head?", "let it pass"
];
let fadeAcceleration = 0.01;
let breatheShown = false;
let bgDefault, bgHover, ThoughtsBg;
let buttonDefault, buttonHover;
let buttonX, buttonY, buttonWidth, buttonHeight;
let isHoveringButton = false;
let blendAmount = 0; 
let transitionSpeed = 0.05; // changeable
let headerX;
let headerSpeed = 2; 
let breatheBg1, breatheBg2, breatheImage1, breatheImage2;
let breatheBlend = 0; 
let breatheBlendDirection = 1; 
let breatheFadeIn = 0;
let breatheStartTime;
let breathingScale = 1;
let breatheImageBlend = 0; 
let breatheImageBlendDirection = 1;
let cycleDuration = 5000; // grow + hold + shrink + hold
let growDuration = 1800;  // 
let holdDuration = 500;   // changeable
let shrinkDuration = 2200; // 

function hexToRgb(hex) {
  let bigint = parseInt(hex.substring(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b];
}


function preload() {
  bgDefault = loadImage('landingBg.jpeg');
  bgHover = loadImage('landingBg2.jpeg');
  buttonDefault = loadImage('Acknowledge1.png');
  buttonHover = loadImage('Acknowledge2.png');
  ThoughtsBg = loadImage('ThoughtsBg.jpeg');
  
  breatheBg1 = loadImage('breatheBg1.jpeg'); 
  breatheBg2 = loadImage('breatheBg2.jpeg');
  breatheImage1 = loadImage('breathe1.png');
  breatheImage2 = loadImage('breathe2.png');
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  startTime = millis();

  buttonWidth = 557; 
  buttonHeight = 155;
  buttonX = width/2 - buttonWidth/2;
  buttonY = height/2 - buttonHeight/2;

  for (let i = 0; i < 120; i++) {
    thoughts.push(new Thought());
  }

  headerX = width;
}


function draw() {
  clear();

  if (currentState === 'landing') {
    drawLanding();
  } else if (currentState === 'thoughts') {
    drawThoughts();
  }


  if (breatheShown) {
    drawBreatheScene();
  }
}


function drawLanding() {
  clear();

  blendAmount = lerp(blendAmount, isHoveringButton ? 1 : 0, transitionSpeed);

  tint(255, 255 * (1 - blendAmount));
  image(bgDefault, 0, 0, width, height);
  
  tint(255, 255 * blendAmount);
  image(bgHover, 0, 0, width, height);
  
  noTint();

  let growFactor = lerp(1, 1.05, blendAmount); // changeable
  let currentButtonWidth = buttonWidth * growFactor;
  let currentButtonHeight = buttonHeight * growFactor;
  let currentButtonX = width / 2 - currentButtonWidth / 2;
  let currentButtonY = height / 2 - currentButtonHeight / 2;

  if (isHoveringButton) {
    image(buttonHover, currentButtonX, currentButtonY, currentButtonWidth, currentButtonHeight);
  } else {
    image(buttonDefault, currentButtonX, currentButtonY, currentButtonWidth, currentButtonHeight);
  }

  textAlign(LEFT, CENTER); 
  textSize(24);
  
  if (isHoveringButton) {
    fill('#727376'); 
  } else {
    fill('#C2BEBC'); 
  }
  
  let scrollSpeed = 1.2; // changeable
  let headerText = 'click to acknowledge your thoughts    click to acknowledge your thoughts    ';
  let xOffset = (millis() * scrollSpeed * 0.1) % textWidth(headerText); // moving offset
  

  for (let x = -xOffset; x < width + width; x += textWidth(headerText)) {
    text(headerText, x, height - 40);
  }

  for (let x = -xOffset; x < width + width; x += textWidth(headerText)) {
    text(headerText, x, 40);
  }

  let r1 = 194, g1 = 190, b1 = 188; 
  let r2 = 114, g2 = 115, b2 = 118; 

  let r = lerp(r1, r2, blendAmount);
  let g = lerp(g1, g2, blendAmount);
  let b = lerp(b1, b2, blendAmount);

  fill(r, g, b);
}


function mouseMoved() {
  let growFactor = lerp(1, 1.05, blendAmount);
  let currentButtonWidth = buttonWidth * growFactor;
  let currentButtonHeight = buttonHeight * growFactor;
  let currentButtonX = width / 2 - currentButtonWidth / 2;
  let currentButtonY = height / 2 - currentButtonHeight / 2;

  if (mouseX > currentButtonX && mouseX < currentButtonX + currentButtonWidth &&
      mouseY > currentButtonY && mouseY < currentButtonY + currentButtonHeight) {
    isHoveringButton = true;
  } else {
    isHoveringButton = false;
  }
}


function mousePressed() {
  if (currentState === 'landing') {
    currentState = 'thoughts';
    startTime = millis(); 
  } else if (currentState === 'thoughts') {
    for (let i = 0; i < thoughts.length; i++) {
      thoughts[i].checkClick(mouseX, mouseY);
    }
  }
}


function drawThoughts() {
  clear();

  image(ThoughtsBg, 0, 0, width, height);

  for (let i = thoughts.length - 1; i >= 0; i--) {
    thoughts[i].update();
    thoughts[i].display();

    if (thoughts[i].isFaded()) {
      thoughts.splice(i, 1);
    }
  }

  let timePassed = millis() - startTime;

  if (timePassed < spawnDuration && millis() - lastSpawn > thoughtRate) {
    thoughts.push(new Thought());
    lastSpawn = millis();

    fadeAcceleration += 0.001;
    thoughtRate = min(thoughtRate + 15, 500); 
  }

  if (timePassed > spawnDuration + 2000 && thoughts.length <= 3 && !breatheShown) {
    breatheStartTime = millis(); 
    breatheShown = true;
  }

}

function drawBreatheScene() {

  let elapsed = millis() % cycleDuration;

  if (elapsed < growDuration) {
    let progress = elapsed / growDuration;
    breathingScale = lerp(1, 1.04, progress);
  } else if (elapsed < growDuration + holdDuration) {
    breathingScale = 1.04;
  } else if (elapsed < growDuration + holdDuration + shrinkDuration) {
    let progress = (elapsed - growDuration - holdDuration) / shrinkDuration;
    breathingScale = lerp(1.04, 1, progress);
  } else {
    breathingScale = 1;
  }

  if (breatheFadeIn < 255) {
    breatheFadeIn += 2; // changeable
  }

  let breathingSpeed = 0.006; // changeable
  breatheBlend += breathingSpeed * breatheBlendDirection;
  if (breatheBlend >= 1 || breatheBlend <= 0) {
    breatheBlendDirection *= -1;
    breatheBlend = constrain(breatheBlend, 0, 1);
  }

  breatheImageBlend = breatheBlend;

  tint(255, 255 * (1 - breatheBlend) * (breatheFadeIn/255));
  image(breatheBg1, 0, 0, width, height);

  tint(255, 255 * breatheBlend * (breatheFadeIn/255));
  image(breatheBg2, 0, 0, width, height);

  noTint();

  let t = millis() / 1000;
  breathingScale = 1 + 0.04 * sin(t * 1.1); // changeable

  push();
  translate(width/2, height/2);
  scale(breathingScale);
  imageMode(CENTER);

  tint(255, (1 - breatheImageBlend) * breatheFadeIn);
  image(breatheImage1, 0, 0);

  tint(255, breatheImageBlend * breatheFadeIn);
  image(breatheImage2, 0, 0);

  pop();

}


class Thought {
  constructor(content, isFinal = false) {
    this.isFinal = isFinal;
  
  if (this.isFinal) {
    this.x = width / 2;
    this.y = height / 2;
    this.size = 80; // changeable
  } else {
    this.x = random(width * 0.1, width * 0.9);
    this.y = random(height * 0.1, height * 0.9);
    this.size = random(18, 42);
  }

  this.content = content || random(thoughtList);
  this.opacity = 255;
  this.fadeSpeed = random(0.2, 0.6);
  this.acknowledged = false;
  this.originalSize = this.size;
  
  }

  isHovered(mx, my) { 
    let d = dist(mx, my, this.x, this.y);
    return d < this.size * 1.5;
  }

  update() {
    if (this.isFinal) {
      let t = millis() / 1000;
  this.size = 80 + 1.5 * sin(t);
  this.opacity = 180 + 75 * sin(t); // changeable
    }

    if (this.acknowledged) {
      this.opacity -= this.fadeSpeed * 10;
    } else {
      this.opacity -= this.fadeSpeed + fadeAcceleration;
    }

     if (this.isHovered(mouseX, mouseY)) {
      this.size = lerp(this.size, this.originalSize * 1.05, 0.1); // changeable
    } else {
      this.size = lerp(this.size, this.originalSize, 0.1);
    }
  }

  display() {
    push();
    
  let baseColor;
  if (this.isHovered(mouseX, mouseY)) {
    baseColor = hexToRgb('#727376'); 
  } else {
    baseColor = hexToRgb('#c2bebc'); 
  }
  
  fill(baseColor[0], baseColor[1], baseColor[2], this.opacity);

  textSize(this.size);
  textAlign(CENTER, CENTER);
  text(this.content, this.x, this.y);

  pop();
  }

  isFaded() {
    return this.opacity <= 0 && !this.isFinal;
  }

  checkClick(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    if (d < this.size * 1.5) {
      this.acknowledged = true;
    }
  }

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}