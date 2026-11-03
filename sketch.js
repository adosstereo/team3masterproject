var w;
var h;
var s;
var page;
var pPage;
var mouse;
let UIe = [];
let Arr = [];
let BaseArr = [];
const BaseWidth = 800;
const BaseHeight = 600;
const rectAng = 12;
function setup() {
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
    createCanvas(800, 600);
    mouse = false;
    background(225);
    //function gameMenuSetup() {
    //mouse = false;
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
    for (var i = 0; i < h*w; i+=4) {
        BaseArr.push(pixels[i]);

    }
    stroke(0, 0, 0);
    resizeCanvas(w, h);
    updateCanvasArray();
}
function buttons(a) {
    var b = 1;
    var c = 0;
    var d = 0;
    var c1 = 0;
    if (a) {
        b = 0;
        c = 1;
    }
    else if (mouse) {
        b = 0;
        d = 1;
    }
    c1+=c;
    //console.log("c1: " + c1);
    fill(b*0 + c1 - d*50, b*0 - d*50, b*255 - d*50);
    rect(200*s, 100*s, 200*s, 100*s, 12*s);
    c1+=c;
    //console.log("c1: " + c1);
    fill(b*0 + c1 - d*50, b*127 - d*50, b*255 - d*50);
    rect(300*s, 300*s, 200*s, 100*s, 12*s);
    c1+=c;
    //console.log("c1: " + c1);
    fill(b*127 + c1 - d*50, b*0 - d*50, b*255 - d*50);
    rect(100*s, 300*s, 200*s, 100*s, 12*s);
}
function draw() {
    if (pPage !== page) {
        //copy and paste setup code here
        switch (page) {
            case "gameMenu":
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
        case "gameMenu":
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
}
function mouseDown() {
    //mouse = true;
}
function mouseClicked() {
    mouse = true;
    var a = Arr[mouseX+(mouseY*w)];
    switch (page) {
        case "gameMenu":
            switch (a) {
                case 1:
                    page = "homePage";
                    console.log("home");
                    break;
                case 2:
                    page = "openHelp";
                    console.log("help");
                    break;
                case 3:
                    page = "shapePage";
                    console.log("game 1");
                    break;
                case 4:
                    page = "ninjaPage";
                    console.log("game 2");
                    break;
                case 5:
                    page = "cookiePage";
                    console.log("game 3");
                    break;
                case 6:
                    page = "bubblePage";
                    console.log("game 4");
                    break;
                default:
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
    for (var i = 0; i < h*w; i+=4) {
        Arr.push(pixels[i]);
    }
    stroke(0, 0, 0);
    console.log("scalar: " + s);
}