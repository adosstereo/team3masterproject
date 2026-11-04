let cookiePlayButton, cookieTutorialButton, cookieAchievementsButton;
let cookieBackButton, cookieAgainButton, cookieGamesButton;

let cookiePoints = [];
let cookieProgress = 0;
let cookieRounds = 0;

// the home page also uses this when closing the lil help thing in the top right
let cookieTracing = false;

let cookieGold, cookieTrail;

function setupCookieGame() {
  cookieGold = color("#EDBE64");
  cookieTrail = color("#398451");

  cookiePlayButton = makeButton(
    400, 260, 280, 85, "Play", sky, 34, "play"
  );

  cookieTutorialButton = makeButton(
    400, 370, 280, 75, "Tutorial", yellow, 29, "none"
  );

  cookieAchievementsButton = makeButton(
    400, 475, 280, 75, "Achievements", pink, 27, "none"
  );

  cookieBackButton = makeButton(
    400, 545, 230, 60, "Back to menu", white, 24, "none"
  );

  cookieAgainButton = makeButton(
    270, 520, 200, 65, "Again", green, 28, "none"
  );

  cookieGamesButton = makeButton(
    530, 520, 200, 65, "Games", pink, 28, "none"
  );

  makeCookiePath();
}

function makeCookiePath() {
  // these the corners of the star starting at the top
  // the last point connects back to the start
  let corners = [
    { x: 400, y: 220 },
    { x: 428, y: 290 },
    { x: 505, y: 296 },
    { x: 446, y: 345 },
    { x: 465, y: 419 },
    { x: 400, y: 378 },
    { x: 335, y: 419 },
    { x: 354, y: 345 },
    { x: 295, y: 296 },
    { x: 372, y: 290 },
    { x: 400, y: 220 }
  ];

  cookiePoints = [];

  // adds five dots along each side
  for (let i = 0; i < 10; i++) {
    let start = corners[i];
    let end = corners[i + 1];

    for (let dot = 0; dot < 5; dot++) {
      cookiePoints.push({
        x: start.x + (end.x - start.x) * dot / 5,
        y: start.y + (end.y - start.y) * dot / 5
      });
    }
  }

  cookiePoints.push({ x: 400, y: 220 });
}

function drawCookieScreens() {
  drawTopBar("Cookie Trace", true);

  if (screen === "cookieMenu") {
    drawCookieMenu();
  } else if (screen === "cookieTutorial") {
    drawCookieTutorial();
  } else if (screen === "cookieAchievements") {
    drawCookieAchievements();
  } else if (screen === "cookiePlay") {
    drawCookieGame();
  } else if (screen === "cookieFinish") {
    drawCookieFinish();
  }
}

function cookieText(words, y, size) {
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(size);
  text(words, 400, y);
}

function drawCookieMenu() {
  cookieText("let's trace a cookie!", 155, 34);

  drawButton(cookiePlayButton);
  drawButton(cookieTutorialButton);
  drawButton(cookieAchievementsButton);
}

function drawCookieTutorial() {
  cookieText("follow the dotted star", 125, 32);
  cookieText("hold down and follow the green dot.", 170, 22);

  // moves the tutorial marker every 6 frames
  let demoProgress = floor(frameCount / 6);
  demoProgress = demoProgress % cookiePoints.length;

  drawCookieShape(demoProgress);

  cookieText("If you move away, return to the green dot.", 495, 20);

  drawButton(cookieBackButton);
}

function startCookieGame() {
  cookieProgress = 0;
  cookieTracing = false;
  screen = "cookiePlay";
}

function drawCookieGame() {
  //checks the next dot you need to reach
  let nextDot = cookiePoints[cookieProgress];

  if (mouseIsPressed && showHelp === false) {
    let distance = dist(
      pointerX, pointerY, nextDot.x, nextDot.y
    );

    if (distance < 18) {
      cookieProgress++;
    }
  }

  //finishes once you reach all the dots
  if (cookieProgress === cookiePoints.length) {
    cookieRounds++;
    screen = "cookieFinish";

    if (note) {
      note.freq(660);
      note.amp(0.15, 0.02);
      note.amp(0, 0.4, 0.1);
    }

    drawCookieFinish();
    return;
  }

  cookieText("Trace the star", 125, 32);
  cookieText("Hold down and follow the green dot.", 170, 22);

  drawCookieShape(cookieProgress);

  let percent = floor(
    cookieProgress / cookiePoints.length * 100
  );

  cookieText(percent + "% complete", 505, 26);
  cookieText("Take your time. Your progress stays here.", 550, 20);
}

function drawCookieShape(progress) {
  // draws the cookie
  fill(cookieGold);
  stroke(navy);
  strokeWeight(3);
  circle(400, 330, 290);

  // little crumbs on the cookie
  noStroke();
  fill("#C58B3E");
  circle(290, 305, 7);
  circle(305, 390, 6);
  circle(500, 285, 6);
  circle(510, 375, 8);

  // dots around the star
  fill(navy);

  for (let i = 0; i < cookiePoints.length; i++) {
    circle(cookiePoints[i].x, cookiePoints[i].y, 5);
  }

  //connects the finished dots with a green line
  stroke(cookieTrail);
  strokeWeight(7);

  for (let i = 1; i < progress; i++) {
    line(
      cookiePoints[i - 1].x,
      cookiePoints[i - 1].y,
      cookiePoints[i].x,
      cookiePoints[i].y
    );
  }

  // shows which dot to go to next
  let nextDot = cookiePoints[progress];

  fill(cookieTrail);
  stroke(white);
  strokeWeight(3);
  circle(nextDot.x, nextDot.y, 23);
}

function drawCookieFinish() {
  cookieText("Great job!", 165, 46);

  fill(yellow);
  stroke(navy);
  strokeWeight(3);
  drawStar(400, 315, 38, 85);

  cookieText("You traced the whole cookie!", 435, 26);

  drawButton(cookieAgainButton);
  drawButton(cookieGamesButton);
}

function drawCookieAchievements() {
  cookieText("Achievements", 135, 36);

  drawCookieBadge("First Cookie", 1, 235);
  drawCookieBadge("Cookie Helper", 3, 335);
  drawCookieBadge("Cookie Star", 5, 435);

  drawButton(cookieBackButton);
}

function drawCookieBadge(title, needed, y) {
  if (cookieRounds >= needed) {
    fill(yellow);
  } else {
    fill(white);
  }

  //rounded box for the achievement
  stroke(navy);
  strokeWeight(3);
  rect(130, y - 40, 540, 80, 18);

  cookieText(title, y - 14, 25);

  if (cookieRounds >= needed) {
    cookieText("Earned!", y + 18, 19);
  } else {
    cookieText("Complete " + needed + " round(s) to earn", y + 18, 19);
  }
}

function cookieGameClick() {
  if (screen === "cookieMenu") {
    if (isOver(cookiePlayButton)) {
      startCookieGame();
    } else if (isOver(cookieTutorialButton)) {
      screen = "cookieTutorial";
    } else if (isOver(cookieAchievementsButton)) {
      screen = "cookieAchievements";
    }
  } else if (
    screen === "cookieTutorial" ||
    screen === "cookieAchievements"
  ) {
    if (isOver(cookieBackButton)) {
      screen = "cookieMenu";
    }
  } else if (screen === "cookieFinish") {
    if (isOver(cookieAgainButton)) {
      startCookieGame();
    } else if (isOver(cookieGamesButton)) {
      screen = "games";
    }
  }
}