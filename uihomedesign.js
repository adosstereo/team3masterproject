let gameTitle = "placeholder name";

let cream, sky, navy, yellow, pink, blue, white;

let screen = "home";
let showHelp = false;

let gamesButton, shopButton, exitButton, helpButton, homeButton;

let barHeight = 70;

function setup() {
  createCanvas(800, 600);

  cream = color("#F1FADF");
  sky = color("#2BD9EE");
  navy = color("#17375E");
  yellow = color("#FFD43B");
  pink = color("#F26BAA");
  blue = color("#3D8BFF");
  white = color(255);

  //x and y are the center of each button
  gamesButton = makeButton(400, 340, 280, 100, "Games", sky, 36, "play");
  exitButton = makeButton(110, 535, 170, 64, "Exit", white, 26, "none");
  shopButton = makeButton(690, 535, 170, 64, "Shop", white, 26, "star");
  helpButton = makeButton(740, 35, 60, 46, "?", yellow, 26, "none");
  homeButton = makeButton(90, 35, 130, 46, "Home", white, 22, "none");
}

function draw() {
  background(cream);

  if (screen === "home") {
    drawHome();
  } else if (screen === "games") {
    drawComingSoon("Games");
  } else if (screen === "shop") {
    drawComingSoon("Star shop");
  } else if (screen === "exit") {
    drawExit();
  }

  if (showHelp) {
    drawHelp();
  }

  updateCursor();
}

function drawHome() {
  drawTopBar(false);

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

//temp page until the games and shop are ready
function drawComingSoon(pageName) {
  drawTopBar(true);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(44);
  text(pageName, 400, 260);

  textStyle(NORMAL);
  textSize(24);
  text("Coming soon. Tap Home to go back.", 400, 320);
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

function drawHelp() {
  push();

  //dim the page behind the box
  noStroke();
  fill(23, 55, 94, 150);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(white);
  stroke(navy);
  strokeWeight(3);
  rect(400, 300, 480, 270, 24);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(32);
  text("How it works", 400, 215);

  textStyle(NORMAL);
  textSize(24);
  textLeading(36);

  if (screen === "home") {
    text("Tap Games to play.\nTap Shop to spend your stars.", 400, 295);
  } else {
    text("Tap Home to go back.", 400, 295);
  }

  textSize(18);
  text("Tap anywhere to close", 400, 390);

  pop();
}

function drawTopBar(showHomeButton) {
  noStroke();
  fill(sky);
  rect(0, 0, width, barHeight);

  stroke(navy);
  strokeWeight(3);
  line(0, barHeight, width, barHeight);

  if (showHomeButton) {
    drawButton(homeButton);
  }

  drawButton(helpButton);
}

function drawShapes(x, y) {
  //moves each shape up and down at a different time
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
  beginShape();
  vertex(x + 50, y + 20 + triangleMove);
  vertex(x + 90, y + 20 + triangleMove);
  vertex(x + 70, y - 20 + triangleMove);
  endShape(CLOSE);
}

//keeps each button's information together
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
  let mouseOver = isOver(button);

  //makes the button bigger when the mouse is over it
  let targetSize = 1;

  if (mouseOver) {
    targetSize = 1.08;
  }

  button.scale = button.scale + (targetSize - button.scale) * 0.2;

  //pushes the button down while clicking
  let press = 0;

  if (mouseOver && mouseIsPressed) {
    press = 4;
  }

  push();
  translate(button.x, button.y);
  scale(button.scale);
  rectMode(CENTER);

  //button shadow
  noStroke();
  fill(navy);
  rect(0, 5, button.w, button.h, 16);

  //button face
  stroke(navy);
  strokeWeight(3);
  fill(button.buttonColor);
  rect(0, press, button.w, button.h, 16);

  let textX = 0;
  let iconX = -button.w / 2 + button.h * 0.55;

  if (button.icon === "play") {
    fill(white);
    stroke(navy);
    strokeWeight(3);

    beginShape();
    vertex(iconX - 12, press - 16);
    vertex(iconX - 12, press + 16);
    vertex(iconX + 16, press);
    endShape(CLOSE);

    textX = button.h * 0.25;

  } else if (button.icon === "star") {
    fill(yellow);
    stroke(navy);
    strokeWeight(2);
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

  for (let i = 0; i < 10; i = i + 1) {
    let angle = -HALF_PI + i * PI / 5;
    let radius = innerRadius;

    //Alternate between the outer and inner points
    if (i % 2 === 0) {
      radius = outerRadius;
    }

    vertex(x + cos(angle) * radius, y + sin(angle) * radius);
  }

  endShape(CLOSE);
}

//check if the mouse is inside the button
function isOver(button) {
  return mouseX > button.x - button.w / 2 &&
         mouseX < button.x + button.w / 2 &&
         mouseY > button.y - button.h / 2 &&
         mouseY < button.y + button.h / 2;
}

function updateCursor() {
  let overButton = false;

  if (showHelp === false && screen !== "exit") {
    if (screen === "home") {
      if (
        isOver(gamesButton) ||
        isOver(shopButton) ||
        isOver(exitButton) ||
        isOver(helpButton)
      ) {
        overButton = true;
      }
    } else {
      if (isOver(homeButton) || isOver(helpButton)) {
        overButton = true;
      }
    }
  }

  if (overButton) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function mouseReleased() {
  //close help before checking the buttons
  if (showHelp) {
    showHelp = false;
    return;
  }

  if (screen === "home") {
    if (isOver(gamesButton)) {
      screen = "games";
    } else if (isOver(shopButton)) {
      screen = "shop";
    } else if (isOver(exitButton)) {
      screen = "exit";
    } else if (isOver(helpButton)) {
      showHelp = true;
    }

  } else if (screen === "exit") {
    screen = "home";

  } else {
    if (isOver(homeButton)) {
      screen = "home";
    } else if (isOver(helpButton)) {
      showHelp = true;
    }
  }
}