// =====================================================
//  HOME PAGE - fine motor skills game for kids (p5.js)
//  Layout from the storyboard:
//    blue top bar, help (?) top right,
//    title in the middle, big Games button,
//    Exit bottom left, Shop bottom right
// =====================================================

// Change this one line when you pick the real name
let GAME_TITLE = "Placeholder Name";

// ----- Colors (picked from the storyboard) -----
let CREAM, SKY, NAVY, YELLOW, GREEN, PINK, BLUE, WHITE;

// ----- Which screen is showing -----
// "home", "games", "shop", or "exit"
let screen = "home";
let showHelp = false;

// ----- Buttons -----
let gamesBtn, shopBtn, exitBtn, helpBtn, homeBtn;

// ----- Background bubbles -----
let bubbles = [];

const BAR_HEIGHT = 70; // height of the blue top bar

function setup() {
  createCanvas(800, 600); // width, height in pixels

  CREAM = color("#F1FADF");
  SKY = color("#2BD9EE");
  NAVY = color("#17375E");
  YELLOW = color("#FFD43B");
  GREEN = color("#8AE234");
  PINK = color("#F26BAA");
  BLUE = color("#3D8BFF");
  WHITE = color(255);

  // makeButton(x, y, width, height, label, color, textSize, icon)
  // x and y are the CENTER of the button
  gamesBtn = makeButton(width / 2, 340, 280, 100, "Games", SKY, 36, "play");
  exitBtn = makeButton(110, 535, 170, 64, "Exit", WHITE, 26, "none");
  shopBtn = makeButton(690, 535, 170, 64, "Shop", WHITE, 26, "star");
  helpBtn = makeButton(740, 35, 60, 46, "?", YELLOW, 26, "none");
  homeBtn = makeButton(90, 35, 130, 46, "Home", WHITE, 22, "none");

  // Make some bubbles that float up behind everything
  for (let i = 0; i < 14; i++) {
    bubbles.push({
      x: random(width),
      y: random(BAR_HEIGHT, height),
      r: random(12, 34), // radius
      speed: random(0.4, 1.2),
      offset: random(TWO_PI) // so each bubble wiggles differently
    });
  }
}

function draw() {
  background(CREAM);
  drawBubbles();

  if (screen === "home") {
    drawHome();
  } else if (screen === "games") {
    drawPlaceholder("Games"); // replace with your games menu later
  } else if (screen === "shop") {
    drawPlaceholder("Star shop"); // replace with your shop later
  } else if (screen === "exit") {
    drawExit();
  }

  if (showHelp) {
    drawHelp();
  }

  updateCursor();
}

// =====================================================
//  SCREENS
// =====================================================

function drawHome() {
  drawTopBar(false); // false = no Home button on the home page

  // Title
  noStroke();
  fill(NAVY);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text(GAME_TITLE, width / 2, 150);

  // Little toy shapes under the title (like the Shape Sorter game)
  drawToyShapes(width / 2, 220);

  // Buttons
  drawButton(gamesBtn);
  drawButton(exitBtn);
  drawButton(shopBtn);
}

// A simple stand-in screen so the buttons have somewhere to go
function drawPlaceholder(name) {
  drawTopBar(true);

  noStroke();
  fill(NAVY);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(44);
  text(name, width / 2, 260);

  textStyle(NORMAL);
  textSize(24);
  text("Coming soon. Tap Home to go back.", width / 2, 320);
}

function drawExit() {
  noStroke();
  fill(NAVY);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text("See you next time!", width / 2, height / 2 - 30);

  textStyle(NORMAL);
  textSize(24);
  text("Tap anywhere to come back", width / 2, height / 2 + 30);
}

function drawHelp() {
  push();
  // Dim the screen behind the help card
  noStroke();
  fill(23, 55, 94, 150);
  rect(0, 0, width, height);

  // Help card
  rectMode(CENTER);
  fill(WHITE);
  stroke(NAVY);
  strokeWeight(3);
  rect(width / 2, height / 2, 480, 270, 24);

  noStroke();
  fill(NAVY);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(32);
  text("How it works", width / 2, height / 2 - 85);

  textStyle(NORMAL);
  textSize(24);
  textLeading(36);
  if (screen === "home") {
    text("Tap Games to play.\nTap Shop to spend your stars.", width / 2, height / 2 - 5);
  } else {
    text("Tap Home to go back.", width / 2, height / 2 - 5);
  }

  textSize(18);
  text("Tap anywhere to close", width / 2, height / 2 + 90);
  pop();
}

// =====================================================
//  PIECES
// =====================================================

function drawTopBar(showHome) {
  noStroke();
  fill(SKY);
  rect(0, 0, width, BAR_HEIGHT);

  stroke(NAVY);
  strokeWeight(3);
  line(0, BAR_HEIGHT, width, BAR_HEIGHT);

  if (showHome) {
    drawButton(homeBtn); // Home always stays top left
  }
  drawButton(helpBtn); // Help always stays top right
}

function drawBubbles() {
  for (let b of bubbles) {
    // Float up and wiggle side to side
    b.y -= b.speed;
    b.x += sin(frameCount * 0.02 + b.offset) * 0.4;

    // When a bubble reaches the top bar, start it again at the bottom
    if (b.y + b.r < BAR_HEIGHT) {
      b.y = height + b.r;
      b.x = random(width);
    }

    // Bubble
    stroke(SKY);
    strokeWeight(2);
    fill(255, 255, 255, 120);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);

    // Shine
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.5, b.r * 0.5);
  }
}

function drawToyShapes(x, y) {
  // Each shape bobs up and down a little, at different times
  let bob1 = sin(frameCount * 0.05) * 5;
  let bob2 = sin(frameCount * 0.05 + 1) * 5;
  let bob3 = sin(frameCount * 0.05 + 2) * 5;

  stroke(NAVY);
  strokeWeight(3);

  fill(PINK);
  ellipse(x - 70, y + bob1, 40, 40);

  fill(BLUE);
  rectMode(CENTER);
  rect(x, y + bob2, 38, 38);
  rectMode(CORNER);

  fill(YELLOW);
  triangle(x + 50, y + 20 + bob3, x + 90, y + 20 + bob3, x + 70, y - 20 + bob3);
}

// =====================================================
//  BUTTONS
// =====================================================

function makeButton(x, y, w, h, label, col, size, icon) {
  return { x: x, y: y, w: w, h: h, label: label, col: col, size: size, icon: icon, scale: 1 };
}

function drawButton(b) {
  let over = isOver(b);

  // Grow a little when the mouse/finger is over it
  b.scale = lerp(b.scale, over ? 1.08 : 1, 0.2);

  // Sink down when pressed (like pushing a real toy button)
  let press = 0;
  if (over && mouseIsPressed) {
    press = 4;
  }

  push();
  translate(b.x, b.y);
  scale(b.scale);
  rectMode(CENTER);

  // Chunky shadow under the button
  noStroke();
  fill(NAVY);
  rect(0, 5, b.w, b.h, 16);

  // Button face
  stroke(NAVY);
  strokeWeight(3);
  fill(b.col);
  rect(0, press, b.w, b.h, 16);

  // Icon (optional) and label
  let textX = 0;
  let iconX = -b.w / 2 + b.h * 0.55;

  if (b.icon === "play") {
    fill(WHITE);
    stroke(NAVY);
    strokeWeight(3);
    triangle(iconX - 12, press - 16, iconX - 12, press + 16, iconX + 16, press);
    textX = b.h * 0.25;
  } else if (b.icon === "star") {
    fill(YELLOW);
    stroke(NAVY);
    strokeWeight(2);
    drawStar(iconX, press, 8, 18);
    textX = b.h * 0.25;
  }

  noStroke();
  fill(NAVY);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(b.size);
  text(b.label, textX, press);
  pop();
}

function drawStar(x, y, inner, outer) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    let angle = -HALF_PI + i * PI / 5;
    let r = (i % 2 === 0) ? outer : inner;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);
}

// Is the mouse (or finger) inside this button?
function isOver(b) {
  return mouseX > b.x - b.w / 2 && mouseX < b.x + b.w / 2 &&
         mouseY > b.y - b.h / 2 && mouseY < b.y + b.h / 2;
}

// Show a hand cursor over buttons
function updateCursor() {
  let buttons = [];
  if (showHelp || screen === "exit") {
    buttons = [];
  } else if (screen === "home") {
    buttons = [gamesBtn, shopBtn, exitBtn, helpBtn];
  } else {
    buttons = [homeBtn, helpBtn];
  }

  let overAny = false;
  for (let b of buttons) {
    if (isOver(b)) overAny = true;
  }
  cursor(overAny ? HAND : ARROW);
}

// =====================================================
//  TAPS / CLICKS
//  (mouseReleased also works with touch on tablets)
// =====================================================

function mouseReleased() {
  // Any tap closes the help card
  if (showHelp) {
    showHelp = false;
    return;
  }

  if (screen === "home") {
    if (isOver(gamesBtn)) screen = "games";
    else if (isOver(shopBtn)) screen = "shop";
    else if (isOver(exitBtn)) screen = "exit";
    else if (isOver(helpBtn)) showHelp = true;
  } else if (screen === "exit") {
    screen = "home";
  } else {
    if (isOver(homeBtn)) screen = "home";
    else if (isOver(helpBtn)) showHelp = true;
  }
}