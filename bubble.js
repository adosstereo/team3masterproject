let playButton, tutorialButton, achievementsButton;
let backButton, againButton, gamesMenuButton;

let score = 0;
let goal = 5;

// 0 is left 1 is right
let activeBubble = 1;

let leftX = 280;
let rightX = 520;
let bubbleY = 330;
let bubbleSize = 110;

let cueStart = 0;
let beatLength = 1600;
let glowTime = 1200;

let popping = false;
let popStart = 0;

let message = "Tap the glowing bubble!";
let note;

// these get reset when the page gets refreshed
let totalPops = 0;
let roundsFinished = 0;

function setupBubbleGame() {
  playButton = makeButton(
    400, 260, 280, 85, "Play", sky, 34, "play"
  );

  tutorialButton = makeButton(
    400, 370, 280, 75, "Tutorial", yellow, 29, "none"
  );

  achievementsButton = makeButton(
    400, 475, 280, 75, "Achievements", pink, 27, "none"
  );

  backButton = makeButton(
    400, 535, 230, 60, "Back to menu", white, 24, "none"
  );

  againButton = makeButton(
    270, 520, 200, 65, "Again", green, 28, "none"
  );

  gamesMenuButton = makeButton(
    530, 520, 200, 65, "Games", pink, 28, "none"
  );
}

function drawBubbleScreens() {
  drawTopBar("Bubble Rhythm", true);

  if (screen === "bubbleMenu") {
    drawBubbleMenu();
  } else if (screen === "bubbleTutorial") {
    drawBubbleTutorial();
  } else if (screen === "bubbleAchievements") {
    drawBubbleAchievements();
  } else if (screen === "bubblePlay") {
    drawBubbleGame();
  } else if (screen === "bubbleFinish") {
    drawBubbleFinish();
  }
}

function drawBubbleMenu() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("ready to pop some bubbles?", 400, 155);

  drawButton(playButton);
  drawButton(tutorialButton);
  drawButton(achievementsButton);
}

function drawBubbleTutorial() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(36);
  text("How to play", 400, 135);

  textStyle(NORMAL);
  textSize(23);
  text("Tap the bubble while its yellow ring is glowing.", 400, 200);

  // turns the ring on and off so you can see when to tap
  let glowing = (millis() - cueStart) % beatLength < glowTime;

  drawBubble(leftX, bubbleY, false);
  drawBubble(rightX, bubbleY, glowing);

  if (glowing) {
    noStroke();
    fill(navy);
    textStyle(BOLD);
    textSize(26);
    text("TAP", rightX, bubbleY);
  }

  noStroke();
  fill(navy);
  textStyle(NORMAL);
  textSize(22);
  text("Pop 5 bubbles to complete a round.", 400, 435);
  text("Missed one? The same bubble will glow again.", 400, 470);

  drawButton(backButton);
}

function drawBubbleAchievements() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(36);
  text("Achievements", 400, 135);

  drawAchievement(
    "First Pop", "Pop your first bubble", 235, totalPops >= 1
  );

  drawAchievement(
    "First Round", "Complete one round", 335, roundsFinished >= 1
  );

  drawAchievement(
    "Bubble Star", "Complete three rounds", 435, roundsFinished >= 3
  );

  textStyle(NORMAL);
  textSize(16);

  drawButton(backButton);
}

function drawAchievement(title, description, y, unlocked) {
  stroke(navy);
  strokeWeight(3);

  if (unlocked) {
    fill(yellow);
  } else {
    fill(white);
  }

  // rounded box for each achievement
  rect(130, y - 40, 540, 80, 18);

  noStroke();
  fill(navy);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(24);
  text(title, 155, y - 13);

  textStyle(NORMAL);
  textSize(18);
  text(description, 155, y + 17);

  textAlign(RIGHT, CENTER);
  textStyle(BOLD);
  textSize(20);

  if (unlocked) {
    text("Earned!", 645, y);
  } else {
    text("Locked", 645, y);
  }

  textAlign(CENTER, CENTER);
}

function startBubbleGame() {
  score = 0;
  activeBubble = 1;
  popping = false;
  cueStart = millis();
  message = "Tap the glowing bubble!";
  screen = "bubblePlay";
}

function drawBubbleGame() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text("Tap the next glowing bubble", 400, 155);

  let glowing = (millis() - cueStart) % beatLength < glowTime;

  // hides the bubble after you pop it
  if (popping === false || activeBubble !== 0) {
    drawBubble(
      leftX,
      bubbleY,
      glowing && activeBubble === 0 && popping === false
    );
  }

  if (popping === false || activeBubble !== 1) {
    drawBubble(
      rightX,
      bubbleY,
      glowing && activeBubble === 1 && popping === false
    );
  }

  if (popping) {
    drawBubblePop();

    // gives the pop animation a moment to finish
    if (showHelp === false && millis() - popStart > 450) {
      popping = false;

      if (score >= goal) {
        roundsFinished++;
        screen = "bubbleFinish";
      } else {
        if (activeBubble === 0) {
          activeBubble = 1;
        } else {
          activeBubble = 0;
        }

        cueStart = millis();
        message = "Tap the glowing bubble!";
      }
    }
  }

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text(score + " / " + goal, 400, 465);

  textStyle(NORMAL);
  textSize(23);
  text(message, 400, 520);
}

function drawBubble(x, y, glowing) {
  // yellow circle behind the bubble makes the ring
  if (glowing) {
    noStroke();
    fill(yellow);
    circle(x, y, bubbleSize + 26);
  }

  fill(sky);
  stroke(navy);
  strokeWeight(3);
  circle(x, y, bubbleSize);

  // little shine on the bubble
  noStroke();
  fill(white);
  circle(x - 25, y - 25, 18);
}

function drawBubblePop() {
  let x = rightX;

  if (activeBubble === 0) {
    x = leftX;
  }

  // makes the ring grow when the bubble pops
  let ringSize = bubbleSize + (millis() - popStart) * 0.15;
  ringSize = min(ringSize, 180);

  noFill();
  stroke(yellow);
  strokeWeight(6);
  circle(x, bubbleY, ringSize);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);
  text("POP!", x, bubbleY);
}

function checkBubbleTap() {
  if (popping) {
    return;
  }

  let targetX = rightX;

  if (activeBubble === 0) {
    targetX = leftX;
  }

  let glowing = (millis() - cueStart) % beatLength < glowTime;

  let touchingBubble =
    dist(pointerX, pointerY, targetX, bubbleY) < bubbleSize / 2;

  if (touchingBubble && glowing) {
    score++;
    totalPops++;

    popping = true;
    popStart = millis();
    message = "Nice job!";

    if (note) {
      note.freq(300 + score * 70);
      note.amp(0.15, 0.02);
      note.amp(0, 0.2, 0.08);
    }
  } else {
    // missed it, so show the same bubble again
    cueStart = millis();
    message = "Try the bubble with the yellow ring!";
  }
}

function drawBubbleFinish() {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(46);
  text("Great job!", 400, 165);

  fill(yellow);
  stroke(navy);
  strokeWeight(3);
  drawStar(400, 315, 38, 85);

  noStroke();
  fill(navy);
  textStyle(NORMAL);
  textSize(26);
  text("Round complete!", 400, 435);

  drawButton(againButton);
  drawButton(gamesMenuButton);
}

function bubbleGameClick() {
  if (screen === "bubbleMenu") {
    if (isOver(playButton)) {
      startBubbleGame();
    } else if (isOver(tutorialButton)) {
      cueStart = millis();
      screen = "bubbleTutorial";
    } else if (isOver(achievementsButton)) {
      screen = "bubbleAchievements";
    }
  } else if (
    screen === "bubbleTutorial" ||
    screen === "bubbleAchievements"
  ) {
    if (isOver(backButton)) {
      screen = "bubbleMenu";
    }
  } else if (screen === "bubblePlay") {
    if (
      pointerX >= 0 && pointerX <= 800 &&
      pointerY > barHeight && pointerY <= 600
    ) {
      checkBubbleTap();
    }
  } else if (screen === "bubbleFinish") {
    if (isOver(againButton)) {
      startBubbleGame();
    } else if (isOver(gamesMenuButton)) {
      screen = "games";
    }
  }
}