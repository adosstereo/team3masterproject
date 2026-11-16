// cookie game
// uses the same home page functions and 800 x 600 coordinates

let cookieInk = "#17375E";
let cookieGold = "#EDBE64";
let cookieTrail = "#398451";

let cookiePalette = [
  "#8EE1EA", "#FFD97B", "#F6A6C6",
  "#B8A5ED", "#A5DFA5", "#99BCF5"
];

let cookieShapes = [
  "circle", "triangle", "square",
  "star", "heart", "flower"
];

let cookieNames = [
  "Circle", "Triangle", "Square",
  "Star", "Heart", "Flower"
];

let cookieKey = "fmsCookieTraceV2";

let cookieSaved = {
  stars: [0, 0, 0, 0, 0, 0],
  rounds: 0,
  clean: 0,
  sound: true
};

let cookieSelected = 0;
let cookiePath = [];
let cookieProgress = 0;
let cookieCracks = 0;

let cookieTracing = false;
let cookieOutside = false;
let cookieArmed = false;
let cookiePrevious = null;

let cookieButtons = [];
let cookieCrumbs = [];
let cookiePops = [];

let cookieLastFrame = 0;
let cookieFinishAt = 0;
let cookieFlashAt = -9999;
let cookieLastTick = 0;
let cookieDemoAt = 0;
let cookieMenuBounce = -9999;

let cookieAudio;
let cookieEarned = 0;

// saves stars and awards in this browser
function cookieSave() {
  try {
    localStorage.setItem(
      cookieKey,
      JSON.stringify(cookieSaved)
    );
  } catch (error) {
    // still playable if saving is blocked
  }
}

function setupCookieGame() {
  try {
    let data = JSON.parse(localStorage.getItem(cookieKey));

    if (data) {
      for (let i = 0; i < cookieShapes.length; i++) {
        let savedStar = 0;

        if (data.stars) {
          savedStar = Number(data.stars[i]) || 0;
        }

        cookieSaved.stars[i] = Math.max(
          0,
          Math.min(3, Math.floor(savedStar))
        );
      }

      cookieSaved.rounds = Math.max(
        0,
        Number(data.rounds) || 0
      );

      cookieSaved.clean = Math.max(
        0,
        Number(data.clean) || 0
      );

      cookieSaved.sound = data.sound !== false;
    }
  } catch (error) {
    // starts fresh if there isn't any saved progress
  }

  cookiePath = cookieMakePath(cookieShapes[cookieSelected]);
  cookieLastFrame = millis();
}

function cookieEnableAudio() {
  if (!cookieSaved.sound) {
    return;
  }

  try {
    let Context =
      window.AudioContext || window.webkitAudioContext;

    if (!cookieAudio && Context) {
      cookieAudio = new Context();
    }

    if (cookieAudio && cookieAudio.state === "suspended") {
      cookieAudio.resume().catch(function () {});
    }
  } catch (error) {
    // you can still play without sound
  }
}

// the oscillator makes a note and gain controls its volume
function cookieSound(kind) {
  if (
    !cookieSaved.sound ||
    !cookieAudio ||
    cookieAudio.state !== "running"
  ) {
    return;
  }

  let tune = [660];

  if (kind === "win") {
    tune = [523, 659, 784, 1047];
  } else if (kind === "crack") {
    tune = [110, 82];
  } else if (kind === "trace") {
    tune = [700 + cookieProgress * 2];
  }

  for (let i = 0; i < tune.length; i++) {
    let frequency = tune[i];
    let at = cookieAudio.currentTime + i * 0.09;

    let oscillator = cookieAudio.createOscillator();
    let gain = cookieAudio.createGain();

    let wave = "sine";
    let volume = 0.1;

    if (kind === "crack") {
      wave = "triangle";
    }

    if (kind === "trace") {
      volume = 0.025;
    }

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, at);

    gain.gain.setValueAtTime(0.001, at);

    gain.gain.exponentialRampToValueAtTime(
      volume,
      at + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      at + 0.17
    );

    oscillator.connect(gain);
    gain.connect(cookieAudio.destination);

    oscillator.start(at);
    oscillator.stop(at + 0.19);

    oscillator.onended = function () {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

function cookieWords(
  value,
  x,
  y,
  size = 22,
  col = cookieInk
) {
  noStroke();
  fill(col);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(size);
  text(value, x, y);
}

function cookieButton(
  id,
  label,
  x,
  y,
  w = 190,
  h = 52,
  col = "#FFFFFF"
) {
  cookieButtons.push({
    id: id,
    x: x,
    y: y,
    w: w,
    h: h
  });

  let hover =
    Math.abs(pointerX - x) < w / 2 &&
    Math.abs(pointerY - y) < h / 2;

  let buttonScale = 1;

  if (hover) {
    buttonScale = 1.035;
  }

  push();
  translate(x, y);
  scale(buttonScale);
  rectMode(CENTER);

  noStroke();
  fill("#D7B99C");
  rect(0, 5, w, h, 17);

  stroke(cookieInk);
  strokeWeight(2);
  fill(col);
  rect(0, 0, w, h, 17);

  cookieWords(label, 0, 0, Math.min(25, w / 6));

  pop();
}

function cookieStar(x, y, radius, col = "#FFD43B") {
  push();
  translate(x, y);

  stroke(cookieInk);
  strokeWeight(1.5);
  fill(col);

  beginShape();

  for (let i = 0; i < 10; i++) {
    let angle = -Math.PI / 2 + i * Math.PI / 5;
    let size = radius;

    if (i % 2 === 1) {
      size = radius * 0.46;
    }

    vertex(
      Math.cos(angle) * size,
      Math.sin(angle) * size
    );
  }

  endShape(CLOSE);
  pop();
}

// each shape is made from points close together
function cookieMakePath(shape) {
  let corners = [];

  if (shape === "triangle") {
    corners = [
      { x: 0, y: -112 },
      { x: 103, y: 83 },
      { x: -103, y: 83 }
    ];
  } else if (shape === "square") {
    corners = [
      { x: -84, y: -84 },
      { x: 84, y: -84 },
      { x: 84, y: 84 },
      { x: -84, y: 84 }
    ];
  } else if (shape === "star") {
    for (let i = 0; i < 10; i++) {
      let angle = -Math.PI / 2 + i * Math.PI / 5;
      let radius = 117;

      if (i % 2 === 1) {
        radius = 53;
      }

      corners.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
  } else {
    for (let i = 0; i < 120; i++) {
      let time = i / 120 * Math.PI * 2;
      let angle = time - Math.PI / 2;

      if (shape === "heart") {
        // these equations make the curved heart outline
        corners.push({
          x: 7 * Math.pow(Math.sin(time), 3) * 16,
          y: -(
            13 * Math.cos(time) -
            5 * Math.cos(2 * time) -
            2 * Math.cos(3 * time) -
            Math.cos(4 * time)
          ) * 7 - 9
        });
      } else {
        let radius = 106;

        if (shape === "flower") {
          radius = 91 + 20 * Math.cos(5 * time);
        }

        corners.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }
    }
  }

  let pointsList = [];

  // adds points between the corners
  for (let i = 0; i < corners.length; i++) {
    let startPoint = corners[i];
    let endPoint = corners[(i + 1) % corners.length];

    let distance = Math.hypot(
      endPoint.x - startPoint.x,
      endPoint.y - startPoint.y
    );

    let steps = Math.max(1, Math.ceil(distance / 5));

    for (let j = 0; j < steps; j++) {
      pointsList.push({
        x:
          400 + startPoint.x +
          (endPoint.x - startPoint.x) * j / steps,
        y:
          330 + startPoint.y +
          (endPoint.y - startPoint.y) * j / steps
      });
    }
  }

  pointsList.push({
    x: pointsList[0].x,
    y: pointsList[0].y
  });

  return pointsList;
}

function cookieOutline(
  points,
  until = points.length,
  closed = false
) {
  beginShape();

  for (let i = 0; i < until; i++) {
    vertex(points[i].x, points[i].y);
  }

  if (closed) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function cookieBackgroundScene() {
  let left = 0;
  let fullWidth = 800;

  if (typeof pageX === "number") {
    left = -pageX / pageScale;
  }

  if (typeof pageScale === "number") {
    fullWidth = width / pageScale;
  }

  noStroke();
  fill("#E5F5F5");
  rect(left, 70, fullWidth, 530);

  // bakery wallpaper
  for (let x = left + 20; x < left + fullWidth; x += 48) {
    fill("#D3E9E7");
    rect(x, 70, 18, 420);
  }

  fill("#F5DABC");
  rect(left, 485, fullWidth, 115);

  fill("#E5BD93");
  rect(left, 485, fullWidth, 7);

  for (let i = 0; i < 8; i++) {
    let x = 60 + i * 98;
    let y = 125 + Math.sin(millis() / 1800 + i) * 14;

    stroke(255, 255, 255, 170);
    strokeWeight(2);

    line(x - 4, y, x + 4, y);
    line(x, y - 4, x, y + 4);
  }
}

function drawCookieBase() {
  noStroke();
  fill(99, 61, 34, 24);
  ellipse(404, 492, 300, 28);

  // the bottom edge makes the cookie look thicker
  fill("#B97D37");
  circle(400, 339, 326);

  stroke("#98612E");
  strokeWeight(3);
  fill(cookieGold);
  circle(400, 330, 326);

  noFill();
  stroke("#FFE2A0");
  strokeWeight(4);
  circle(400, 327, 303);

  stroke("#D6A04C");
  strokeWeight(2);
  circle(400, 330, 289);

  // baked spots around the rim
  for (let i = 0; i < 34; i++) {
    let angle = i * 2.39996;
    let radius = 128 + (i % 4) * 6;

    let crumbColor = "#F9D58C";

    if (i % 3 !== 0) {
      crumbColor = "#CD9646";
    }

    noStroke();
    fill(crumbColor);

    ellipse(
      400 + Math.cos(angle) * radius,
      330 + Math.sin(angle) * radius,
      3 + i % 3,
      4 + i % 4
    );
  }
}

function cookieCutout(points, lift = 0, tilt = 0) {
  push();

  translate(400, 330 - lift);
  rotate(tilt);
  translate(-400, -330);

  push();
  translate(0, 5);
  fill("#BC823A");
  noStroke();
  cookieOutline(points, points.length, true);
  pop();

  fill("#FFE09A");
  stroke("#B47B35");
  strokeWeight(2);
  cookieOutline(points, points.length, true);

  noStroke();
  fill(255, 248, 211, 180);
  ellipse(379, 303, 12, 22);

  pop();
}

function cookieSmallCookie(
  shape,
  x,
  y,
  size,
  tilt = 0,
  lift = 0
) {
  push();

  translate(x, y);
  rotate(tilt);
  scale(size / 326);
  translate(-400, -330);

  drawCookieBase();

  let points = cookieMakePath(shape);

  fill("#AC7436");
  noStroke();
  cookieOutline(points, points.length, true);

  cookieCutout(points, lift);

  pop();
}

function cookieSprinkle(
  x,
  y,
  col = cookieGold,
  count = 16
) {
  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 30 + Math.random() * 130;

    cookieCrumbs.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      age: 0,
      life: 0.5 + Math.random() * 0.5,
      col: col,
      size: 3 + Math.random() * 5
    });
  }
}

function cookieEffects(dt) {
  for (let i = 0; i < cookieCrumbs.length; i++) {
    let piece = cookieCrumbs[i];

    piece.age += dt;
    piece.x += piece.vx * dt;
    piece.y += piece.vy * dt;
    piece.vy += 180 * dt;

    let c = color(piece.col);

    c.setAlpha(
      255 * Math.max(0, 1 - piece.age / piece.life)
    );

    noStroke();
    fill(c);
    circle(piece.x, piece.y, piece.size);
  }

  for (let i = cookieCrumbs.length - 1; i >= 0; i--) {
    if (cookieCrumbs[i].age >= cookieCrumbs[i].life) {
      cookieCrumbs.splice(i, 1);
    }
  }

  for (let i = 0; i < cookiePops.length; i++) {
    let piece = cookiePops[i];
    let age = (millis() - piece.at) / 600;

    noFill();
    stroke("#FFFFFF");
    strokeWeight(3 * (1 - age));
    circle(piece.x, piece.y, 25 + age * 60);
  }

  for (let i = cookiePops.length - 1; i >= 0; i--) {
    if (millis() - cookiePops[i].at >= 600) {
      cookiePops.splice(i, 1);
    }
  }
}

function cookieMenu() {
  let bounce = Math.max(
    0,
    1 - (millis() - cookieMenuBounce) / 650
  );

  noStroke();
  fill("#C2D8DA");
  ellipse(245, 479, 340, 42);

  fill("#FFFFFF");
  ellipse(245, 468, 340, 42);

  cookieSmallCookie(
    "circle",
    118,
    263 + Math.sin(millis() / 700) * 7,
    106,
    -0.14
  );

  cookieSmallCookie(
    "heart",
    346,
    267 + Math.sin(millis() / 800) * 9,
    110,
    0.15
  );

  cookieSmallCookie("flower", 350, 413, 92, 0.1);

  cookieSmallCookie(
    "star",
    228,
    369 - bounce * 22,
    204,
    -0.1,
    (Math.sin(millis() / 650) + 1) * 9 + bounce * 22
  );

  cookieButtons.push({
    id: "cookie",
    x: 228,
    y: 360,
    w: 200,
    h: 205
  });

  noStroke();
  fill(255, 255, 255, 215);
  rect(449, 170, 307, 352, 27);

  cookieButton(
    "play", "Play",
    602, 239, 250, 76,
    cookiePalette[0]
  );

  cookieButton(
    "tutorial", "Tutorial",
    602, 344, 250, 65,
    cookiePalette[1]
  );

  cookieButton(
    "badges", "Awards",
    602, 440, 250, 65,
    cookiePalette[2]
  );

  let soundLabel = "Sound off";

  if (cookieSaved.sound) {
    soundLabel = "Sound on";
  }

  cookieButton(
    "sound", soundLabel,
    692, 112, 128, 36
  );
}

function cookieChoices() {
  cookieWords("Pick a cookie", 400, 116, 30);

  // baking tray
  noStroke();
  fill("#A5C3CC");
  rect(50, 160, 700, 351, 26);

  fill("#D6E5E7");
  rect(59, 168, 682, 333, 20);

  for (let i = 0; i < cookieShapes.length; i++) {
    let shape = cookieShapes[i];
    let x = 170 + (i % 3) * 230;
    let y = 244 + Math.floor(i / 3) * 170;

    let hover =
      Math.hypot(pointerX - x, pointerY - y) < 65;

    let cookieSize = 125;
    let tilt = 0;

    if (hover) {
      cookieSize = 133;
      tilt = Math.sin(millis() / 220) * 0.025;
    }

    cookieSmallCookie(
      shape,
      x,
      y,
      cookieSize,
      tilt
    );

    cookieButtons.push({
      id: "shape" + i,
      x: x,
      y: y,
      w: 145,
      h: 145
    });

    for (let s = 0; s < 3; s++) {
      let starColor = "#B8C8D3";

      if (s < cookieSaved.stars[i]) {
        starColor = "#FFD43B";
      }

      cookieStar(
        x + (s - 1) * 24,
        y + 67,
        10,
        starColor
      );
    }
  }

  cookieButton("menu", "Back", 400, 552, 160, 45);
}

function startCookieGame(
  shape = cookieShapes[cookieSelected]
) {
  cookieSelected = Math.max(
    0,
    cookieShapes.indexOf(shape)
  );

  cookiePath = cookieMakePath(
    cookieShapes[cookieSelected]
  );

  cookieProgress = 0;
  cookieCracks = 0;

  cookieTracing = false;
  cookieOutside = false;
  cookieArmed = false;
  cookiePrevious = null;

  cookieCrumbs = [];
  cookiePops = [];

  cookieEarned = 0;
  cookieFlashAt = -9999;

  screen = "cookiePlay";
}

function cookieWin() {
  cookieTracing = false;
  cookiePrevious = null;
  cookieEarned = 1;

  if (cookieCracks === 0) {
    cookieEarned = 3;
  } else if (cookieCracks === 1) {
    cookieEarned = 2;
  }

  cookieSaved.stars[cookieSelected] = Math.max(
    cookieSaved.stars[cookieSelected],
    cookieEarned
  );

  cookieSaved.rounds++;

  if (cookieCracks === 0) {
    cookieSaved.clean++;
  }

  cookieSave();

  cookieFinishAt = millis();
  screen = "cookieFinish";

  cookieSound("win");

  for (let i = 0; i < 5; i++) {
    cookieSprinkle(
      260 + i * 70,
      280,
      cookiePalette[i],
      22
    );
  }
}

// checks points along the drag so quick movements still count
function cookieTraceInput() {
  let help =
    typeof showHelp !== "undefined" && showHelp;

  if (!mouseIsPressed || help) {
    cookieTracing = false;
    cookieOutside = false;
    cookiePrevious = null;
    cookieArmed = !help;
    return;
  }

  if (!cookieArmed) {
    return;
  }

  let current = {
    x: pointerX,
    y: pointerY
  };

  let next = cookiePath[cookieProgress];

  if (!next) {
    return;
  }

  if (!cookieTracing) {
    let distanceToDot = Math.hypot(
      current.x - next.x,
      current.y - next.y
    );

    if (distanceToDot > 23) {
      return;
    }

    cookieTracing = true;
    cookiePrevious = current;
  }

  let distance = Math.hypot(
    current.x - cookiePrevious.x,
    current.y - cookiePrevious.y
  );

  let steps = Math.max(1, Math.ceil(distance / 3));

  for (let s = 1; s <= steps; s++) {
    let x =
      cookiePrevious.x +
      (current.x - cookiePrevious.x) * s / steps;

    let y =
      cookiePrevious.y +
      (current.y - cookiePrevious.y) * s / steps;

    if (Math.hypot(x - 400, y - 330) > 163) {
      if (!cookieOutside) {
        cookieCracks++;
        cookieOutside = true;
        cookieFlashAt = millis();

        cookieSound("crack");
        cookieSprinkle(x, y, "#B77A3A", 20);

        if (cookieCracks >= 4) {
          cookieTracing = false;
          screen = "cookieFail";
          cookieSound("crack");
          return;
        }
      }

      continue;
    }

    // stops small movements at the edge adding extra cracks
    if (Math.hypot(x - 400, y - 330) < 153) {
      cookieOutside = false;
    }

    let advanced = false;

    // only the next part of the path counts
    while (
      cookieProgress < cookiePath.length &&
      Math.hypot(
        x - cookiePath[cookieProgress].x,
        y - cookiePath[cookieProgress].y
      ) < 18
    ) {
      cookieProgress++;
      advanced = true;
    }

    if (advanced && millis() - cookieLastTick > 85) {
      cookieSprinkle(x, y, "#FFF2BD", 2);
      cookieLastTick = millis();

      cookieSound("trace");
    }

    if (cookieProgress >= cookiePath.length) {
      cookieWin();
      return;
    }
  }

  cookiePrevious = current;
}

function cookieTraceDrawing(
  points,
  amount,
  showDot = true
) {
  noFill();
  stroke("#B17A34");
  strokeWeight(3);
  cookieOutline(points);

  noStroke();
  fill("#996A35");

  for (let i = 0; i < points.length; i += 3) {
    circle(points[i].x, points[i].y, 3);
  }

  if (amount > 1) {
    noFill();
    stroke(cookieTrail);
    strokeWeight(8);
    cookieOutline(points, amount);

    stroke("#BEEBB6");
    strokeWeight(2);
    cookieOutline(points, amount);
  }

  if (showDot && amount < points.length) {
    let point = points[amount];
    let pulse = 1 + Math.sin(millis() / 170) * 0.1;

    noStroke();
    fill(57, 132, 81, 40);
    circle(point.x, point.y, 37 * pulse);

    fill(cookieTrail);
    stroke("#FFFFFF");
    strokeWeight(3);
    circle(point.x, point.y, 21 * pulse);
  }
}

function cookieDrawCracks() {
  for (let i = 0; i < cookieCracks; i++) {
    push();

    translate(400, 330);
    rotate(-2.45 + i * 1.63);

    noFill();
    stroke("#8D572D");
    strokeWeight(3);

    beginShape();
    vertex(160, 0);
    vertex(143, 8);
    vertex(132, -4);
    vertex(117, 8);
    vertex(104, 2);
    endShape();

    strokeWeight(2);
    line(132, -4, 137, -18);

    pop();
  }
}

function cookieGame() {
  cookieTraceInput();

  if (screen !== "cookiePlay") {
    return;
  }

  cookieWords(
    cookieNames[cookieSelected],
    400, 111, 27
  );

  // dots show how many chances are left
  for (let i = 0; i < 4; i++) {
    let chanceColor = "#D5DCE0";

    if (i < 4 - cookieCracks) {
      chanceColor = "#E3AA55";
    }

    noStroke();
    fill(chanceColor);
    circle(655 + i * 26, 111, 17);
  }

  push();

  if (millis() - cookieFlashAt < 240) {
    translate(
      Math.sin((millis() - cookieFlashAt) * 0.1) * 3,
      0
    );
  }

  drawCookieBase();
  cookieTraceDrawing(cookiePath, cookieProgress);
  cookieDrawCracks();

  pop();

  let percent = Math.floor(
    cookieProgress / (cookiePath.length - 1) * 100
  );

  noStroke();
  fill("#E0C5A5");
  rect(235, 535, 330, 12, 6);

  fill(cookieTrail);

  rect(
    235,
    535,
    330 * Math.min(1, cookieProgress / cookiePath.length),
    12,
    6
  );

  cookieWords(percent + "%", 400, 572, 20);

  cookieButton("shapes", "Back", 110, 552, 130, 44);
}

function cookieTutorial() {
  cookieWords("Hold + trace", 400, 115, 30);

  let demo = cookieMakePath("circle");

  let phase =
    ((millis() - cookieDemoAt) % 5200) / 5200;

  let amount = Math.min(
    demo.length - 1,
    Math.floor(phase / 0.85 * demo.length)
  );

  drawCookieBase();
  cookieTraceDrawing(demo, amount);

  let point = demo[amount];

  noStroke();
  fill(23, 55, 94, 35);
  circle(point.x + 10, point.y + 14, 29);

  fill("#FFFFFF");
  stroke(cookieInk);
  strokeWeight(2);
  circle(point.x + 7, point.y + 9, 22);

  if (phase > 0.85) {
    fill("#FFE09A");
    stroke(cookieTrail);
    strokeWeight(3);
    cookieOutline(demo, demo.length, true);
  }

  cookieWords(
    "Stay inside · 4 cracks = retry",
    400, 515, 18
  );

  cookieButton("menu", "Back", 400, 557, 160, 43);
}

function cookieAwards() {
  cookieWords("Cookie collection", 400, 116, 30);

  let finishedShapes = 0;
  let perfectShapes = 0;

  for (let i = 0; i < cookieSaved.stars.length; i++) {
    if (cookieSaved.stars[i] > 0) {
      finishedShapes++;
    }

    if (cookieSaved.stars[i] === 3) {
      perfectShapes++;
    }
  }

  let items = [
    {
      name: "First bake",
      value: cookieSaved.rounds,
      goal: 1
    },
    {
      name: "Baker",
      value: cookieSaved.rounds,
      goal: 5
    },
    {
      name: "Cookie pro",
      value: cookieSaved.rounds,
      goal: 15
    },
    {
      name: "Clean cut",
      value: cookieSaved.clean,
      goal: 1
    },
    {
      name: "Full tray",
      value: finishedShapes,
      goal: 6
    },
    {
      name: "Golden batch",
      value: perfectShapes,
      goal: 6
    }
  ];

  for (let i = 0; i < items.length; i++) {
    let award = items[i];
    let x = 210 + i % 2 * 380;
    let y = 220 + Math.floor(i / 2) * 110;

    let done = award.value >= award.goal;

    let cardColor = "#FFFFFF";
    let starColor = "#D6DEE4";
    let statusColor = "#7A8C9C";

    let status =
      Math.min(award.goal, award.value) +
      " / " + award.goal;

    if (done) {
      cardColor = "#FFF0BF";
      starColor = "#FFD43B";
      statusColor = cookieTrail;
      status = "Earned";
    }

    noStroke();
    fill(cardColor);
    rect(x - 165, y - 43, 330, 91, 18);

    cookieStar(x - 119, y, 21, starColor);
    cookieWords(award.name, x + 12, y - 12, 22);

    cookieWords(
      status,
      x + 12,
      y + 19,
      16,
      statusColor
    );
  }

  cookieButton("menu", "Back", 400, 555, 160, 43);
}

function cookieResult(failed = false) {
  let title = "Sweet!";

  if (failed) {
    title = "Try again";
  }

  cookieWords(title, 400, 118, 37);

  if (failed) {
    push();
    translate(0, -15);

    drawCookieBase();
    cookieTraceDrawing(cookiePath, cookieProgress, false);
    cookieDrawCracks();

    pop();
  } else {
    let time = Math.min(
      1,
      (millis() - cookieFinishAt) / 950
    );

    push();
    translate(0, -25);

    drawCookieBase();

    fill("#B07B3C");
    noStroke();
    cookieOutline(cookiePath, cookiePath.length, true);

    cookieCutout(
      cookiePath,
      35 * time,
      -0.06 * Math.sin(time * Math.PI)
    );

    pop();

    for (let i = 0; i < 3; i++) {
      let age = Math.max(
        0,
        Math.min(
          1,
          (millis() - cookieFinishAt - i * 150) / 500
        )
      );

      let starColor = "#D6DCE0";

      if (i < cookieEarned) {
        starColor = "#FFD43B";
      }

      cookieStar(
        400 + (i - 1) * 60,
        480,
        22 + Math.sin(age * Math.PI) * 6,
        starColor
      );
    }
  }

  cookieButton(
    "retry", "Again",
    190, 550, 170, 53,
    cookiePalette[2]
  );

  cookieButton(
    "shapes", "Cookies",
    400, 550, 170, 53
  );

  let nextAction = "next";
  let nextLabel = "Next";

  if (failed) {
    nextAction = "menu";
    nextLabel = "Menu";
  }

  cookieButton(
    nextAction, nextLabel,
    610, 550, 170, 53,
    cookiePalette[0]
  );
}

// picks which screen to draw
function drawCookieScreens() {
  let now = millis();

  let dt = Math.min(
    0.05,
    Math.max(0, (now - cookieLastFrame) / 1000)
  );

  cookieLastFrame = now;
  cookieButtons = [];

  push();

  rectMode(CORNER);
  ellipseMode(CENTER);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  cookieBackgroundScene();

  if (screen === "cookieMenu") {
    cookieMenu();
  } else if (screen === "cookieShapes") {
    cookieChoices();
  } else if (screen === "cookieTutorial") {
    cookieTutorial();
  } else if (screen === "cookieAchievements") {
    cookieAwards();
  } else if (screen === "cookiePlay") {
    cookieGame();
  } else if (screen === "cookieFinish") {
    cookieResult();
  } else if (screen === "cookieFail") {
    cookieResult(true);
  }

  cookieEffects(dt);

  pop();

  drawTopBar("Cookie Trace", true);
}

function cookieGameClick() {
  if (typeof showHelp !== "undefined" && showHelp) {
    return;
  }

  cookieEnableAudio();

  let item = null;

  for (let i = cookieButtons.length - 1; i >= 0; i--) {
    let test = cookieButtons[i];

    if (
      Math.abs(pointerX - test.x) < test.w / 2 &&
      Math.abs(pointerY - test.y) < test.h / 2
    ) {
      item = test;
      break;
    }
  }

  if (!item) {
    return;
  }

  let id = item.id;

  if (id === "sound") {
    cookieSaved.sound = !cookieSaved.sound;
    cookieEnableAudio();
    cookieSave();
  } else if (id === "play" || id === "shapes") {
    screen = "cookieShapes";
  } else if (id === "menu") {
    screen = "cookieMenu";
  } else if (id === "tutorial") {
    cookieDemoAt = millis();
    screen = "cookieTutorial";
  } else if (id === "badges") {
    screen = "cookieAchievements";
  } else if (id.startsWith("shape")) {
    startCookieGame(
      cookieShapes[Number(id.slice(5))]
    );
  } else if (id === "retry") {
    startCookieGame();
  } else if (id === "next") {
    startCookieGame(
      cookieShapes[
        (cookieSelected + 1) % cookieShapes.length
      ]
    );
  } else if (id === "cookie") {
    cookieMenuBounce = millis();

    cookieSprinkle(228, 330, "#FFE4A6", 24);

    cookiePops.push({
      x: 228,
      y: 330,
      at: millis()
    });
  }

  if (id !== "sound" || cookieSaved.sound) {
    cookieSound("click");
  }
}

// stops tracing if you switch tabs
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    cookieTracing = false;
    cookiePrevious = null;
    cookieArmed = false;
  }
});