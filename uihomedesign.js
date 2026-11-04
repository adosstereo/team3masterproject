let gameTitle = "Placeholder Name";

let cream, sky, navy, yellow, pink, blue, white, green;

let screen = "home";
let showHelp = false;
let barHeight = 70;

// makes everything fit the window
let pageScale = 1;
let pageX = 0;
let pageY = 0;
let pointerX = 0;
let pointerY = 0;

let gamesButton, shopButton, exitButton;
let homeButton, helpButton;
let shapeButton, vegetableButton, cookieButton, bubbleButton;

function setup() {
  createCanvas(windowWidth, windowHeight);

  cream = color("#F1FADF");
  sky = color("#2BD9EE");
  navy = color("#17375E");
  yellow = color("#FFD43B");
  pink = color("#F26BAA");
  blue = color("#3D8BFF");
  white = color("#FFFFFF");
  green = color("#A5DF57");

  gamesButton = makeButton(
    400, 340, 280, 100, "Games", sky, 36, "play"
  );

  exitButton = makeButton(
    110, 535, 170, 64, "Exit", white, 26, "none"
  );

  shopButton = makeButton(
    690, 535, 170, 64, "Shop", white, 26, "star"
  );

  homeButton = makeButton(
    90, 35, 130, 46, "Home", white, 22, "none"
  );

  helpButton = makeButton(
    740, 35, 60, 46, "?", yellow, 26, "none"
  );

  shapeButton = makeButton(
    220, 285, 320, 100, "Shape Sorter", white, 27, "none"
  );

  vegetableButton = makeButton(
    580, 285, 320, 100, "Vegetable Shinobi", white, 25, "none"
  );

  cookieButton = makeButton(
    220, 455, 320, 100, "Cookie Trace", pink, 27, "none"
  );

  bubbleButton = makeButton(
    580, 455, 320, 100, "Bubble Rhythm", sky, 27, "none"
  );

  // sets up both games
  setupBubbleGame();
  setupCookieGame();

  updatePageSize();
}

function draw() {
  background(cream);
  updatePointer();

  // keeps the page centered
  push();
  translate(pageX, pageY);
  scale(pageScale);

  if (screen === "home") {
    drawHome();
  } else if (screen === "games") {
    drawGames();
  } else if (screen === "shop") {
    drawShop();
  } else if (screen === "exit") {
    drawExit();
  } else if (isCookieScreen()) {
    drawCookieScreens();
  } else {
    drawBubbleScreens();
  }

  if (showHelp) {
    drawHelp();
  }

  pop();
}

function drawHome() {
  drawTopBar("", false);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text(gameTitle, 400, 150);

  drawShapes(400, 220);

  drawButton(gamesButton);
  drawButton(exitButton);
  drawButton(shopButton);
}

function drawGames() {
  drawTopBar("Games", true);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(36);
  text("Choose a game", 400, 155);

  drawButton(shapeButton);
  drawButton(vegetableButton);
  drawButton(cookieButton);
  drawButton(bubbleButton);

  noStroke();
  fill(navy);
  textStyle(NORMAL);
  textSize(19);
}

function drawShop() {
  drawTopBar("Star shop", true);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(40);

  textStyle(NORMAL);
  textSize(24);
  text("Tap Home to go back.", 400, 330);
}

function drawExit() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text("See you next time!", 400, 270);

  textStyle(NORMAL);
  textSize(24);
  text("Tap anywhere to come back", 400, 330);
}

function drawTopBar(title, showHomeButton) {
  // makes the top bar go across the screen
  let leftEdge = -pageX / pageScale;
  let fullWidth = width / pageScale;

  noStroke();

  if (screen === "home") {
    fill(sky);
  } else {
    fill(blue);
  }

  rect(leftEdge, 0, fullWidth, barHeight);

  stroke(navy);
  strokeWeight(3);
  line(
    leftEdge,
    barHeight,
    leftEdge + fullWidth,
    barHeight
  );

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text(title, 400, 35);

  if (showHomeButton) {
    drawButton(homeButton);
  }

  drawButton(helpButton);
}

function drawHelp() {
  push();

  // darkens the background when help is open
  noStroke();
  fill(23, 55, 94, 150);
  rect(
    -pageX / pageScale,
    0,
    width / pageScale,
    height / pageScale
  );

  // rounded help box
  fill(white);
  stroke(navy);
  strokeWeight(3);
  rect(110, 165, 580, 280, 24);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(32);
  text("How it works", 400, 215);

  textStyle(NORMAL);
  textSize(23);
  textLeading(35);

  if (screen === "home") {
    text(
      "Tap Games to choose a game.",
      400, 300
    );
  } else if (screen === "games") {
    text(
      "",
      400, 300
    );
  } else if (screen === "shop") {
    text(
      "soon.\nTap Home to go back.",
      400, 300
    );
  } else if (isCookieScreen()) {
    text(
      "Hold down and trace the dotted star.\nFollow the green marker.\nReturn to the marker if you slip off.",
      400, 300
    );
  } else {
    text(
      "Tap the bubble with the yellow ring.\nPop 5 bubbles to finish.\nMissing does not remove points.",
      400, 300
    );
  }

  textSize(18);
  text("Tap anywhere to close", 400, 405);

  pop();
}

function drawShapes(x, y) {
  // makes the shapes float up and down
  let circleMove = sin(frameCount * 0.05) * 5;
  let squareMove = sin(frameCount * 0.05 + 1) * 5;
  let triangleMove = sin(frameCount * 0.05 + 2) * 5;

  stroke(navy);
  strokeWeight(3);

  fill(pink);
  ellipse(x - 70, y + circleMove, 40, 40);

  fill(blue);
  rectMode(CENTER);
  rect(x, y + squareMove, 38, 38);
  rectMode(CORNER);

  fill(yellow);
  triangle(
    x + 50, y + 20 + triangleMove,
    x + 90, y + 20 + triangleMove,
    x + 70, y - 20 + triangleMove
  );
}

// keeps the button info together
function makeButton(x, y, w, h, label, buttonColor, textSizeValue, icon) {
  return {
    x: x,
    y: y,
    w: w,
    h: h,
    label: label,
    buttonColor: buttonColor,
    textSizeValue: textSizeValue,
    icon: icon,
    scale: 1
  };
}

function drawButton(button) {
  let hovering = isOver(button) && showHelp === false;
  let targetSize = 1;

  if (hovering) {
    targetSize = 1.06;
  }

  // makes the button a little bigger when you hover
  button.scale += (targetSize - button.scale) * 0.2;

  let press = 0;

  if (hovering && mouseIsPressed) {
    press = 4;
  }

  push();
  translate(button.x, button.y);
  scale(button.scale);
  rectMode(CENTER);

  // shadow behind the button
  noStroke();
  fill(navy);
  rect(0, 5, button.w, button.h, 20);

  // the 20 rounds the corners
  stroke(navy);
  strokeWeight(3);
  fill(button.buttonColor);
  rect(0, press, button.w, button.h, 20);

  let textX = 0;
  let iconX = -button.w / 2 + button.h * 0.55;

  if (button.icon === "play") {
    fill(white);

    triangle(
      iconX - 12, press - 16,
      iconX - 12, press + 16,
      iconX + 16, press
    );

    textX = button.h * 0.25;
  } else if (button.icon === "star") {
    fill(yellow);
    drawStar(iconX, press, 8, 18);
    textX = button.h * 0.25;
  }

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(button.textSizeValue);
  text(button.label, textX, press);

  pop();
}

function drawStar(x, y, innerRadius, outerRadius) {
  beginShape();

  for (let i = 0; i < 10; i++) {
    let angle = -HALF_PI + i * PI / 5;
    let radius = innerRadius;

    if (i % 2 === 0) {
      radius = outerRadius;
    }

    vertex(
      x + cos(angle) * radius,
      y + sin(angle) * radius
    );
  }

  endShape(CLOSE);
}

function isOver(button) {
  return pointerX > button.x - button.w / 2 &&
         pointerX < button.x + button.w / 2 &&
         pointerY > button.y - button.h / 2 &&
         pointerY < button.y + button.h / 2;
}

function isCookieScreen() {
  return screen === "cookieMenu" ||
         screen === "cookieTutorial" ||
         screen === "cookieAchievements" ||
         screen === "cookiePlay" ||
         screen === "cookieFinish";
}

function mousePressed() {
  updatePointer();
  // closes help without clicking anything behind it
  if (showHelp) {
    showHelp = false;
    cookieTracing = false;
    cueStart = millis();

    if (popping) {
      popStart = millis();
    }

    return false;
  }

  if (screen === "exit") {
    screen = "home";
    return false;
  }

  if (isOver(helpButton)) {
    showHelp = true;
    cookieTracing = false;
    return false;
  }

  if (screen !== "home" && isOver(homeButton)) {
    screen = "home";
    popping = false;
    cookieTracing = false;
    return false;
  }

  if (screen === "home") {
    if (isOver(gamesButton)) {
      screen = "games";
    } else if (isOver(shopButton)) {
      screen = "shop";
    } else if (isOver(exitButton)) {
      screen = "exit";
    }
  } else if (screen === "games") {
    if (isOver(bubbleButton)) {
      screen = "bubbleMenu";
    } else if (isOver(cookieButton)) {
      cookieTracing = false;
      screen = "cookieMenu";
    }
  } else if (isCookieScreen()) {
    cookieGameClick();
  } else {
    bubbleGameClick();
  }

  return false;
}

function mouseReleased() {
  cookieTracing = false;
}

// adjusts the mouse position to match the resized page
function updatePointer() {
  pointerX = (mouseX - pageX) / pageScale;
  pointerY = (mouseY - pageY) / pageScale;
}

function updatePageSize() {
  pageScale = min(width / 800, height / 600);

  pageX = (width - 800 * pageScale) / 2;
  pageY = 0;

  let leftEdge = -pageX / pageScale;
  let fullWidth = width / pageScale;
  let fullHeight = height / pageScale;

  // keeps these buttons near the edges
  homeButton.x = leftEdge + 90;
  helpButton.x = leftEdge + fullWidth - 60;

  exitButton.x = leftEdge + 110;
  shopButton.x = leftEdge + fullWidth - 110;

  exitButton.y = fullHeight - 65;
  shopButton.y = fullHeight - 65;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updatePageSize();
  cookieTracing = false;
}