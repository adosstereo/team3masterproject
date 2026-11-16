
let gameTitle = "placeholder name";

// Colors
let cream, sky, navy, yellow, pink, blue, white;

// Navigation
let screen = "home";
let showHelp = false;

// Home buttons
let gamesButton, shopButton, exitButton, helpButton, homeButton;

// Shop
let stars = 10;
let message = "Welcome to the Star Shop!";
let equipped = -1;
let currentPage = 0;
let starImg = null;

let items = [
  { name: "Animals", price: 3, file: "animals.jpg", owned: false, img: null },
  { name: "Night Sky", price: 3, file: "nightSky.jpg", owned: false, img: null },
  { name: "Space", price: 3, file: "space.png", owned: false, img: null },
  { name: "Dinosaurs", price: 3, file: "dino.png", owned: false, img: null },
  { name: "Car", price: 3, file: "car.jpg", owned: false, img: null },
  { name: "Rainbow", price: 3, file: "rainbow.jpg", owned: false, img: null },
  { name: "Planes", price: 3, file: "planes.jpg", owned: false, img: null },
  { name: "Whimsical", price: 3, file: "whimsical.jpg", owned: false, img: null }
];

const UI_WIDTH = 800;
const UI_HEIGHT = 600;
const barHeight = 70;

// Shop animations
let buttonSizes = Array(8).fill(1);
let shopHomeButtonSize = 1;
let pageButtonSize = 1;

let flyingStars = [];
let purchaseAnimation = false;
let purchasingItem = -1;
let purchaseTimer = 0;
let celebrationTimer = 0;

// Prevent clicking through screens
let pressedScreen = "";
let pressedHelp = false;


// ======================================
// SETUP
// ======================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  cream = color("#F1FADF");
  sky = color("#2BD9EE");
  navy = color("#17375E");
  yellow = color("#FFD43B");
  pink = color("#F26BAA");
  blue = color("#3D8BFF");
  white = color(255);

  textFont("Arial");

  gamesButton = makeButton(400, 340, 280, 100, "Games", sky, 36, "play");
  exitButton = makeButton(110, 535, 170, 64, "Exit", white, 26, "none");
  shopButton = makeButton(690, 535, 170, 64, "Shop", white, 26, "star");
  helpButton = makeButton(740, 35, 60, 46, "?", yellow, 26, "none");
  homeButton = makeButton(90, 35, 130, 46, "Home", white, 22, "none");

  loadShopSave();
  loadShopImages();
}


// ======================================
// LOAD IMAGES
// ======================================

function loadShopImages() {
  loadImage(
    "assets/star.png",
    img => starImg = img,
    err => console.error("Failed to load star.png", err)
  );

  for (let item of items) {
    loadImage(
      "assets/" + item.file,
      img => item.img = img,
      err => console.error("Failed to load " + item.file, err)
    );
  }
}


// ======================================
// RESPONSIVE CANVAS
// ======================================

function getUIScale() {
  return min(width / UI_WIDTH, height / UI_HEIGHT);
}

function getUIOffset() {
  let s = getUIScale();

  return {
    x: (width - UI_WIDTH * s) / 2,
    y: (height - UI_HEIGHT * s) / 2
  };
}

function getMouseUI() {
  let s = getUIScale();
  let offset = getUIOffset();

  return {
    x: (mouseX - offset.x) / s,
    y: (mouseY - offset.y) / s
  };
}

function insideButton(x, y, w, h) {
  let m = getMouseUI();

  return (
    m.x >= x &&
    m.x <= x + w &&
    m.y >= y &&
    m.y <= y + h
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// ======================================
// MAIN DRAW
// ======================================

function draw() {
  drawMainBackground();

  let s = getUIScale();
  let offset = getUIOffset();

  push();
  translate(offset.x, offset.y);
  scale(s);

  if (screen === "home") {
    drawHome();
  } else if (screen === "games") {
    drawComingSoon("Games");
  } else if (screen === "shop") {
    drawShop();
  } else if (screen === "exit") {
    drawExit();
  }

  if (showHelp) {
    drawHelp();
  }

  pop();

  updateCursor();
}


// ======================================
// BACKGROUND
// ======================================

function drawMainBackground() {
  background(cream);

  if (
    equipped >= 0 &&
    equipped < items.length &&
    items[equipped].img
  ) {
    drawBackgroundCover(items[equipped].img);
  }
}

function drawBackgroundCover(img) {
  if (!img) return;

  let s = max(width / img.width, height / img.height);

  let w = img.width * s;
  let h = img.height * s;

  imageMode(CORNER);

  image(
    img,
    (width - w) / 2,
    (height - h) / 2,
    w,
    h
  );
}


// ======================================
// HOME PAGE
// ======================================

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


// ======================================
// TOP BAR
// ======================================

function drawTopBar(showHomeButton) {
  noStroke();
  fill(sky);
  rectMode(CORNER);
  rect(0, 0, UI_WIDTH, barHeight);

  stroke(navy);
  strokeWeight(3);
  line(0, barHeight, UI_WIDTH, barHeight);

  if (showHomeButton) {
    drawButton(homeButton);
  }

  drawButton(helpButton);
}


// ======================================
// HOME SHAPES
// ======================================

function drawShapes(x, y) {
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


// ======================================
// HOME BUTTONS
// ======================================

function makeButton(x, y, w, h, label, buttonColor, textSizeValue, icon) {
  return {
    x, y, w, h,
    label,
    buttonColor,
    textSizeValue,
    icon,
    scale: 1
  };
}

function isOver(button) {
  let m = getMouseUI();

  return (
    m.x > button.x - button.w / 2 &&
    m.x < button.x + button.w / 2 &&
    m.y > button.y - button.h / 2 &&
    m.y < button.y + button.h / 2
  );
}

function drawButton(button) {
  let mouseOver = isOver(button) && !showHelp;

  let targetSize = mouseOver ? 1.08 : 1;

  button.scale += (targetSize - button.scale) * 0.2;

  let press = mouseOver && mouseIsPressed ? 4 : 0;

  push();
  translate(button.x, button.y);
  scale(button.scale);
  rectMode(CENTER);

  noStroke();
  fill(navy);
  rect(0, 5, button.w, button.h, 16);

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

  for (let i = 0; i < 10; i++) {
    let angle = -HALF_PI + i * PI / 5;
    let radius = i % 2 === 0 ? outerRadius : innerRadius;

    vertex(
      x + cos(angle) * radius,
      y + sin(angle) * radius
    );
  }

  endShape(CLOSE);
}


// ======================================
// HELP POPUP
// ======================================

function drawHelp() {
  push();

  noStroke();
  fill(23, 55, 94, 150);
  rectMode(CORNER);
  rect(0, 0, UI_WIDTH, UI_HEIGHT);

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
    text(
      "Tap Games to play.\nTap Shop to spend your stars.",
      400, 295
    );
  } else if (screen === "shop") {
    text(
      "Buy wallpapers using stars.\nEquip a wallpaper to use it.",
      400, 295
    );
  } else {
    text("Tap Home to go back.", 400, 295);
  }

  textSize(18);
  text("Tap anywhere to close", 400, 390);

  pop();
}


// ======================================
// SHOP PAGE
// ======================================

function drawShop() {
  rectMode(CORNER);
  imageMode(CORNER);
  textAlign(CENTER, CENTER);

  // Top bar
  noStroke();
  fill(115, 214, 231);
  rect(0, 0, UI_WIDTH, 55);

  // Home button
  let homeHover = insideButton(12, 10, 95, 35);

  shopHomeButtonSize = lerp(
    shopHomeButtonSize,
    homeHover && !purchaseAnimation ? 1.1 : 1,
    0.2
  );

  drawAnimatedButton(
    59.5, 27.5,
    95, 35,
    shopHomeButtonSize,
    color(255),
    "Home",
    17
  );

  // Stars balance
  fill(255);
  stroke(45, 70, 105);
  strokeWeight(2);
  rect(640, 10, 145, 35, 12);

  if (starImg) {
    image(starImg, 650, 15, 25, 25);
  } else {
    fill(yellow);
    stroke(navy);
    drawStar(662, 27, 6, 12);
  }

  noStroke();
  fill(45, 70, 105);
  textSize(18);
  textStyle(BOLD);
  text("Stars: " + stars, 727, 27);

  // Shop title
  fill(255);
  stroke(45, 70, 105);
  strokeWeight(2);
  rect(300, 70, 200, 60, 15);

  noStroke();
  fill(45, 70, 105);
  textSize(36);
  textStyle(BOLD);
  text("SHOP", 400, 100);

  // Wallpaper cards
  let startIndex = currentPage * 4;
  let endIndex = min(startIndex + 4, items.length);

  for (let i = startIndex; i < endIndex; i++) {
    let position = i - startIndex;
    let x = 27.5 + position * 195;
    let y = 150;

    // Card
    fill(255);
    stroke(45, 70, 105);
    strokeWeight(2);
    rect(x, y, 175, 310, 15);

    // Wallpaper preview
    drawWallpaperPreview(
      items[i].img,
      x + 15,
      y + 15,
      145,
      155
    );

    // Name
    noStroke();
    fill(45, 70, 105);
    textSize(18);
    textStyle(BOLD);
    text(items[i].name, x + 87.5, y + 190);

    // Price
    if (starImg) {
      image(starImg, x + 38, y + 208, 25, 25);
    } else {
      fill(yellow);
      stroke(navy);
      drawStar(x + 50, y + 220, 6, 12);
    }

    noStroke();
    fill(45, 70, 105);
    textSize(17);
    text(items[i].price + " Stars", x + 105, y + 220);

    // Button hover
    let hovered = insideButton(x + 20, y + 245, 135, 45);

    buttonSizes[i] = lerp(
      buttonSizes[i],
      hovered && !purchaseAnimation ? 1.12 : 1,
      0.2
    );

    let buttonColor;
    let buttonText;

    if (equipped === i) {
      buttonColor = color(130, 200, 140);
      buttonText = "Equipped";
    } else if (items[i].owned) {
      buttonColor = color(115, 160, 255);
      buttonText = "Equip";
    } else {
      buttonColor = color(160, 225, 100);
      buttonText = "Buy";
    }

    if (purchaseAnimation && purchasingItem === i) {
      buttonColor = color(255, 205, 90);
      buttonText = "Buying...";
    }

    if (celebrationTimer > 0 && purchasingItem === i) {
      buttonColor = color(255, 225, 100);
    }

    drawAnimatedButton(
      x + 87.5,
      y + 267.5,
      135,
      45,
      buttonSizes[i],
      buttonColor,
      buttonText,
      17
    );
  }

  // Message bubble
  fill(255);
  stroke(45, 70, 105);
  strokeWeight(2);
  rect(190, 490, 420, 65, 15);

  noStroke();
  fill(45, 70, 105);
  textSize(20);
  textStyle(BOLD);
  text(message, 400, 522);

  // More / Previous
  let pageX = 650;
  let pageHover = insideButton(pageX, 535, 140, 45);

  pageButtonSize = lerp(
    pageButtonSize,
    pageHover && !purchaseAnimation ? 1.1 : 1,
    0.2
  );

  let pageText = currentPage === 0
    ? "More →"
    : "← Previous";

  drawAnimatedButton(
    pageX + 70,
    557.5,
    140,
    45,
    pageButtonSize,
    color(115, 214, 231),
    pageText,
    17
  );

  noStroke();
  fill(45, 70, 105);
  textSize(16);
  textStyle(BOLD);
  text("Page " + (currentPage + 1) + " / 2", 400, 575);

  // Animations
  updateFlyingStars();

  if (purchaseAnimation) {
    purchaseTimer++;

    if (purchaseTimer >= 65) {
      finishPurchase();
    }
  }

  if (celebrationTimer > 0) {
    celebrationTimer--;
  }
}


// ======================================
// WALLPAPER PREVIEWS
// ======================================

function drawWallpaperPreview(img, x, y, w, h) {
  rectMode(CORNER);
  imageMode(CORNER);

  if (!img) {
    noStroke();
    fill(230);
    rect(x, y, w, h, 8);

    fill(100);
    textSize(15);
    textStyle(NORMAL);
    text("Loading...", x + w / 2, y + h / 2);
    return;
  }

  let s = min(w / img.width, h / img.height);

  let drawW = img.width * s;
  let drawH = img.height * s;

  noStroke();
  fill(245);
  rect(x, y, w, h, 6);

  image(
    img,
    x + (w - drawW) / 2,
    y + (h - drawH) / 2,
    drawW,
    drawH
  );
}


// ======================================
// SHOP ANIMATED BUTTONS
// ======================================

function drawAnimatedButton(
  cx, cy, w, h, size, buttonColor, label, fontSize
) {
  push();

  translate(cx, cy);
  rectMode(CORNER);

  let sw = w * size;
  let sh = h * size;

  noStroke();
  fill(45, 70, 105, 45);
  rect(-sw / 2 + 2, -sh / 2 + 4, sw, sh, 12);

  fill(buttonColor);
  stroke(45, 70, 105);
  strokeWeight(2);
  rect(-sw / 2, -sh / 2, sw, sh, 12);

  noStroke();
  fill(45, 70, 105);
  textAlign(CENTER, CENTER);
  textSize(fontSize * size);
  textStyle(BOLD);
  text(label, 0, 0);

  pop();
}


// ======================================
// PURCHASE ANIMATION
// ======================================

function startPurchase(i) {
  if (purchaseAnimation) return;
  if (items[i].owned) return;
  if (stars < items[i].price) return;

  purchaseAnimation = true;
  purchasingItem = i;
  purchaseTimer = 0;
  flyingStars = [];

  let position = i - currentPage * 4;

  let targetX = 27.5 + position * 195 + 87.5;
  let targetY = 417.5;

  for (let j = 0; j < items[i].price; j++) {
    flyingStars.push({
      startX: 662,
      startY: 27,
      targetX,
      targetY,
      delay: j * 10,
      size: 35
    });
  }

  message = "Purchasing " + items[i].name + "...";
}

function updateFlyingStars() {
  for (let s of flyingStars) {
    if (purchaseTimer < s.delay) continue;

    let t = constrain(
      (purchaseTimer - s.delay) / 40,
      0,
      1
    );

    let smoothT = t * t * (3 - 2 * t);

    let x = lerp(s.startX, s.targetX, smoothT);
    let y = lerp(s.startY, s.targetY, smoothT);

    y -= sin(t * PI) * 90;

    let size = lerp(s.size, 12, smoothT);

    if (t < 1) {
      if (starImg) {
        image(
          starImg,
          x - size / 2,
          y - size / 2,
          size,
          size
        );
      } else {
        noStroke();
        fill(255, 220, 0);
        ellipse(x, y, size, size);
      }
    }
  }
}

function finishPurchase() {
  let i = purchasingItem;

  if (i < 0 || i >= items.length) {
    purchaseAnimation = false;
    return;
  }

  if (!items[i].owned && stars >= items[i].price) {
    stars -= items[i].price;
    items[i].owned = true;
    equipped = i;

    message = "Purchased " + items[i].name + "!";
    celebrationTimer = 25;

    saveShop();
  }

  purchaseAnimation = false;
  flyingStars = [];
}


// ======================================
// SHOP INTERACTIONS
// ======================================

function handleShopClick() {
  if (purchaseAnimation) return;

  // Return to Home
  if (insideButton(12, 10, 95, 35)) {
    screen = "home";
    return;
  }

  // More / Previous
  if (insideButton(650, 535, 140, 45)) {
    currentPage = currentPage === 0 ? 1 : 0;

    message = currentPage === 0
      ? "Welcome to the Star Shop!"
      : "More wallpapers!";

    return;
  }

  // Wallpaper buttons
  let startIndex = currentPage * 4;
  let endIndex = min(startIndex + 4, items.length);

  for (let i = startIndex; i < endIndex; i++) {
    let position = i - startIndex;
    let x = 27.5 + position * 195;

    if (insideButton(x + 20, 395, 135, 45)) {
      if (equipped === i) {
        message = "Already equipped!";
      } else if (items[i].owned) {
        equipped = i;
        message = "Equipped " + items[i].name + "!";
        saveShop();
      } else if (stars >= items[i].price) {
        startPurchase(i);
      } else {
        message = "Not enough stars!";
      }

      return;
    }
  }
}


// ======================================
// MOUSE CONTROLS
// ======================================

function mousePressed() {
  pressedScreen = screen;
  pressedHelp = showHelp;
}

function mouseReleased() {
  // Close help popup
  if (pressedHelp) {
    showHelp = false;
    return;
  }

  if (showHelp) return;

  // Avoid clicks carrying over between pages
  if (pressedScreen !== screen) return;

  if (screen === "home") {
    if (isOver(gamesButton)) {
      screen = "games";

    } else if (isOver(shopButton)) {
      screen = "shop";
      message = "Welcome to the Star Shop!";

    } else if (isOver(exitButton)) {
      screen = "exit";

    } else if (isOver(helpButton)) {
      showHelp = true;
    }

  } else if (screen === "shop") {
    handleShopClick();

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


// ======================================
// CURSOR
// ======================================

function updateCursor() {
  if (showHelp || screen === "exit") {
    cursor(ARROW);
    return;
  }

  let overButton = false;

  if (screen === "home") {
    overButton =
      isOver(gamesButton) ||
      isOver(shopButton) ||
      isOver(exitButton) ||
      isOver(helpButton);

  } else if (screen === "shop") {
    overButton =
      insideButton(12, 10, 95, 35) ||
      insideButton(650, 535, 140, 45);

    let startIndex = currentPage * 4;
    let endIndex = min(startIndex + 4, items.length);

    for (let i = startIndex; i < endIndex; i++) {
      let position = i - startIndex;
      let x = 27.5 + position * 195;

      if (insideButton(x + 20, 395, 135, 45)) {
        overButton = true;
      }
    }

  } else {
    overButton =
      isOver(homeButton) ||
      isOver(helpButton);
  }

  cursor(overButton ? HAND : ARROW);
}


// ======================================
// SAVE / LOAD PROGRESS
// ======================================

function saveShop() {
  try {
    localStorage.setItem(
      "shopSave",
      JSON.stringify({
        stars: stars,
        equipped: equipped,
        owned: items.map(item => item.owned)
      })
    );
  } catch (error) {
    console.error("Save error:", error);
  }
}

function loadShopSave() {
  try {
    let saved = localStorage.getItem("shopSave");

    if (saved) {
      let data = JSON.parse(saved);

      stars = data.stars ?? 10;
      equipped = data.equipped ?? -1;

      if (Array.isArray(data.owned)) {
        for (let i = 0; i < items.length; i++) {
          items[i].owned = data.owned[i] ?? false;
        }
      }
    }
  } catch (error) {
    console.error("Save loading error:", error);
  }

  if (
    equipped < 0 ||
    equipped >= items.length ||
    !items[equipped].owned
  ) {
    equipped = -1;
  }
}
