/* jshint jquery: true, browser: true, devel: true */

function exportAsImage(canvas) {
    var ret = {};
    ret.png = canvas.toDataURL("image/png");
    ret.gif = canvas.toDataURL("image/gif");
    
    return ret;
}

function normalizeCanvas(canvas) {
    var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    for(var i = 0; i < pixels.width * pixels.height * 4; i+=4)
    {
        if(pixels.data[i+3] !== 0) {
            pixels.data[i] = 0;
            pixels.data[i + 1] = 0;
            pixels.data[i + 2] = 0;
            pixels.data[i + 3] = 255;
        }
    }
    
    canvasCtx.putImageData(pixels, 0, 0);
}

function btnClear(e) {
    e.preventDefault();
    
    var res = window.confirm("Are you sure you want to clear your signature?");
    
    if(res) {
        canvas.width = canvas.width;
    }
}

function btnFinish(e) {
    e.preventDefault();
    
    var denormal = exportAsImage(canvas);
    
    normalizeCanvas(canvas);
    
    var normal = exportAsImage(canvas);
    
    window.open(denormal.png);
    window.open(denormal.gif);
    window.open(normal.png);
    window.open(normal.gif);
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getTouchPos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top
    };
}

function canvasMouseMove(e) {
    if(!mouseDown) return;
    
    var coords = getMousePos(canvas, e);
    
    canvasCtx.beginPath();
    canvasCtx.moveTo(lastCoord.x, lastCoord.y);
    canvasCtx.lineTo(coords.x, coords.y);
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
    
    lastCoord = coords;
}

function canvasMouseDown(e) {
    mouseDown = true;
    lastCoord = getMousePos(canvas, e);
}

function bodyMouseUp(e) {
    mouseDown = false;
    lastCoord = null;
}

function canvasTouchMove(e) {
    e.preventDefault();
    if(!mouseDown) return;
    
    var coords = getTouchPos(canvas, e);
    
    canvasCtx.beginPath();
    canvasCtx.moveTo(lastCoord.x, lastCoord.y);
    canvasCtx.lineTo(coords.x, coords.y);
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
    
    lastCoord = coords;
}

function canvasTouchDown(e) {
    mouseDown = true;
    lastCoord = getTouchPos(canvas, e);
}

function bodyTouchUp(e) {
    mouseDown = false;
    lastCoord = null;
}

function randomCoordinate() {
    return {x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height) };
}

function addRandomSignature() {
    var a, b;
    a = randomCoordinate();
    
    for(var i = 0; i < 100; i++) {
        b = randomCoordinate();
        
        canvasCtx.beginPath();
        canvasCtx.moveTo(a.x, a.y);
        canvasCtx.lineTo(b.x, b.y);
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();
        
        a = b;
        
    }
}

function btnRandom(e) {
    canvas.width = canvas.width;
    
    addRandomSignature();
}

var canvas = $("#signature")[0];
var canvasCtx = canvas.getContext("2d");
var mouseDown = false;
var lastCoord = null;


$("#finish").click(btnFinish);
$("#clear").click(btnClear);
$("#random").click(btnRandom);

$(canvas).mousemove(canvasMouseMove).mousedown(canvasMouseDown);
$("body").mouseup(bodyMouseUp);


//$(canvas).on('touchmove', canvasTouchMove).on('touchdown', canvasTouchDown);
//$("body").on('touchup', bodyTouchUp);

canvas.addEventListener('touchmove', canvasTouchMove, true);
canvas.addEventListener('touchstart', canvasTouchDown, true);
document.body.addEventListener('touchcancel', bodyTouchUp, true);


//document.body.addEventListener('touchmove', function(event) {
//  event.preventDefault();
//}, false); 