var w;
var h;
var s;
var page;
var pPage;
var subPage;
var pSubPage;
var mouse;
let UIe = [];
let Arr = [];
let BaseArr = [];
const BaseWidth = 800;
const BaseHeight = 600;
const rectAng = 12;

let cream, sky, navy, yellow, pink, blue, white;
let dirtBackground;

function setup() {
    pixelDensity(1);
    w = window.innerWidth;
    h = window.innerHeight;
    if (w/800.0 < h/600.0) {
        s = w/800.0;
        h = s*600;
    }
    else if (h/600.0 < w/800.0) {
        s = h/600.0;
        w = s*800;
    }
    cream = color("#F1FADF");
    sky = color("#2BD9EE");
    navy = color("#17375E");
    yellow = color("#FFD43B");
    pink = color("#F26BAA");
    blue = color("#3D8BFF");
    white = color("#FFFFFF");
    createCanvas(800, 600);
    mouse = false;
    background(225);
    //function gameMenuSetup() {
    //mouse = false;
    page = "gamePage";
    subPage = "";
    stroke(1, 0, 0);
    background(255, 255, 255);
    buttons(true);
    //for (var i = 0; i < h*w; i+=4) {
    //    BaseArr.push(pixels[i]);
    //
    //}
    //stroke(0, 0, 0);
    //resizeCanvas(w, h);
    //updateCanvasArray();
    //}
    loadPixels();
    for (var i = 0; i < h*w; i+=4) {
        BaseArr.push(pixels[i]);

    }
    stroke(0, 0, 0);
    resizeCanvas(w, h);
    updateCanvasArray();
}
function buttons(a) {
    //background
    fill(255, 255, 255);
    rect(0,0,w,h);
    fill(255, 255, 150);
    rect(0,0,w,150*s);
    //foreground
    var b = 1;
    var c = 0;
    var d = 0;
    var c1 = 0;
    console.log("is it???" + (!a) + subPage);
    if (a) {
        console.log("----------------");
        b = 0;
        c = 1;
    }
    else if (mouse) {
        b = 0;
        d = 1;
    }
    c1+=c;
    //console.log("c1: " + c1);
    //console.log("b: " + b);
    fill(((b*0) + c1) - (d*50), b*0 - d*50, b*255 - d*50);
    rect(50*s, 50*s, 100*s, 50*s, 12*s);
    c1+=c;
    //console.log("c1: " + c1);
    fill(((b*0) + c1) - (d*50), b*127 - d*50, b*255 - d*50);
    rect(700*s, 50*s, 50*s, 50*s, 12*s);
    c1+=c;
    //console.log("c1: " + c1);
    fill(((b*127) + c1) - (d*50), b*0 - d*50, b*255 - d*50);
    rect(200*s, 175*s, 150*s, 150*s, 12*s);
    c1+=c;
    fill(((b*127) + c1) - (d*50), b*0 - d*50, b*255 - d*50);
    rect(450*s, 175*s, 150*s, 150*s, 12*s);
    c1+=c;
    fill(((b*127) + c1) - (d*50), b*0 - d*50, b*255 - d*50);
    rect(200*s, 375*s, 150*s, 150*s, 12*s);
    c1+=c;
    fill(((b*127) + c1) - (d*50), b*0 - d*50, b*255 - d*50);
    rect(450*s, 375*s, 150*s, 150*s, 12*s);
    if (subPage == "helpSubPage") {
        c1+=c;
        fill ((b*255) + c1, (b*255) + c1, (b*50) + c1);
        rect (200*s, 100*s, 400*s, 400*s, 12*s);
    }
}
function draw() {
    if (pPage !== page || pSubPage !== subPage) {
        //copy and paste setup code here
        switch (page) {
            case "gamePage":
                mouse = false;
                stroke(1, 0, 0);
                background(255, 255, 255);
                buttons(true);
                for (var i = 0; i < h*w; i+=4) {
                   BaseArr.push(pixels[i]);
                
                }
                stroke(0, 0, 0);
                resizeCanvas(w, h);
                updateCanvasArray();
                break;
            case "shopPage":
                break;
            case "shapePage":
                break;
            case "ninjaPage":
                break;
            case "cookiePage":
                break;
            case "bubblePage":
                break;
            default:
                //home page
        }
    }
    //copy and paste draw code here
    switch (page) {
        case "gamePage":
            //console.log("Working...");
            buttons(false);
            break;
        case "shopPage":
            break;
        case "shapePage":
            break;
        case "ninjaPage":
            break;
        case "cookiePage":
            break;
        case "bubblePage":
            break;
        default:
            //home page
    }
    pPage = page;
    pSubPage = subPage;
}
function mouseClicked() {
    mouse = true;
    var a = Arr[Math.floor(mouseX+(Math.floor(mouseY)*Math.floor(w)))];
    console.log("page: " + page + " a: " + a + " Index: " + (mouseX+(mouseY*w)) + " and Arr: " + Arr);
    switch (page) {
        case "gamePage":
            switch (a) {
                case 1:
                    page = "homePage";
                    console.log("home");
                    break;
                case 2:
                    if (subPage != "helpSubPage") {
                    subPage = "helpSubPage";
                    console.log("gamehelp");
                    }
                    else {
                        subPage = "";
                        console.log("game");
                    }
                    break;
                case 3:
                    if (subPage == "helpSubPage") {
                        subPage = "";
                        break;
                    }
                    page = "shapePage";
                    console.log("game 1");
                    break;
                case 4:
                    if (subPage == "helpSubPage") {
                        subPage = "";
                        break;
                    }
                    page = "ninjaPage";
                    console.log("game 2");
                    break;
                case 5:
                    if (subPage == "helpSubPage") {
                        subPage = "";
                        break;
                    }
                    page = "cookiePage";
                    console.log("game 3");
                    break;
                case 6:
                    if (subPage == "helpSubPage") {
                        subPage = "";
                        break;
                    }
                    page = "bubblePage";
                    console.log("game 4");
                    break;
                case 7:
                    break;
                default:
                    subPage = "";
                    break;
            }
            break;
        case "shopPage":
            break;
        case "shapePage":
            break;
        case "ninjaPage":
            break;
        case "cookiePage":
            break;
        case "bubblePage":
            break;
        default:
            //home page
    }
    mouse = false;
}
function windowResized() {
    w = window.innerWidth;
    h = window.innerHeight;
    if (w/800.0 < h/600.0) {
        s = w/800.0;
        h = s*600;
    }
    else if (h/600.0 < w/800.0) {
        s = h/600.0;
        w = s*800;
    }
    resizeCanvas(w, h);
    updateCanvasArray();
}
function updateCanvasArray () {
    Arr = [];
    stroke(1, 0, 0);
    background(255, 255, 255);
    buttons(true);
    loadPixels();
    for (var i = 0; i < pixels.length; i+=4) {
        Arr.push(pixels[i]); 
    }
    stroke(0, 0, 0);
    console.log("scalar: " + s);
}