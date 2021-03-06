/* jshint jquery: true, browser: true, devel: true */

/* helper functions for manipulating the canvas */

// export the canvas as a data URL
function exportAsImage(canvas) {
    
    // we use GIF here because, for this case, it is consistently smaller than PNG
    // (and we're under very tight space constraints)
    //if you really want PNG, switch these lines
    
    //return canvas.toDataURL("image/png");
    return canvas.toDataURL("image/gif");
    
}

// this eliminates grey pixels by forcing them to pure black
// TODO: improve by trimming pixels that are lighter than a certain value
function normalizeCanvas(canvas) {
    var canvasCtx = canvas.getContext("2d");
    var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    for(var i = 0; i < pixels.width * pixels.height * 4; i+=4)
    {
        if(pixels.data[i+3] !== 0) {   //we assume that any non-transparent pixel must be black
            pixels.data[i] = 0;        // R
            pixels.data[i + 1] = 0;    // G
            pixels.data[i + 2] = 0;    // B
            pixels.data[i + 3] = 255;  // A
        }
    }
    
    canvasCtx.putImageData(pixels, 0, 0);
}

// returns a scaled version of the canvas
function scaleCanvas(canv, scale) {
    var newCanvas = document.createElement("canvas");
    newCanvas.width = canv.width * scale;
    newCanvas.height = canv.height * scale;
    
    var ctx = newCanvas.getContext("2d");
    
    ctx.scale(scale, scale);
    ctx.drawImage(canv, 0, 0);
    
    return newCanvas;
}

// returns a duplicate of the canvas
function duplicateCanvas(canvas) {
    var newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    
    var newCtx = newCanvas.getContext("2d");
    
    newCtx.drawImage(canvas, 0, 0);
    return newCanvas;
    
}

// This just kind of scribles on the canvas for a bit
function addRandomSignature() {
    var a, b;
    a = randomCoordinate();
    
    for(var i = 0; i < 100; i++) {
        b = randomCoordinate();
        
        // yes, we could optimize this by drawing all the lines at once
        // but, that's not the point
        
        drawLine(canvasCtx, a, b);
        
        a = b;
        
    }
}

// draws a line on the canvas
function drawLine(canvasCtx, a, b) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(a.x, a.y);
    canvasCtx.lineTo(b.x, b.y);
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
}

/* UI helper functions */

// returns the X/Y coordinates of a click
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// returns the X/Y coordinates of a touch
function getTouchPos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top
    };
}

// returns a random coordinate on the canvas. Used to scribble
function randomCoordinate() {
    return {x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height) };
}

/* event handlers for the UI elements */

function btnClear(e) {
    e.preventDefault();
    
    var res = window.confirm("Are you sure you want to clear your signature?");
    
    if(res) {
        canvas.width = canvas.width;
    }
}

function btnFinish(e) {
    e.preventDefault();
    
    // first we shrink the canvas
    var toBeSaved = scaleCanvas(canvas, 0.75);
    
    // then we force all pixels to black or transparent
    //normalizeCanvas(toBeSaved);
    
    // then we generate our URL
    var image = exportAsImage(toBeSaved);
    
    // for debugging purposes
    alert(image.length);
    
    // also for debugging purposes
    window.open(image);
}


function btnRandom(e) {
    canvas.width = canvas.width;
    
    addRandomSignature();
}

function canvasMouseMove(e) {
    if(!mouseDown) return;
    
    var coords = getMousePos(canvas, e);
    
    drawLine(canvasCtx, lastCoord, coords);
    
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
    
    drawLine(canvasCtx, lastCoord, coords);
    
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


// grab a reference to our canvas and its 2D context
var canvas = $("#signature")[0];
var canvasCtx = canvas.getContext("2d");

// track mouse/touch movement
var mouseDown = false;
var lastCoord = null;


// hook up our UI handlers
$("#finish").click(btnFinish);
$("#clear").click(btnClear);
$("#random").click(btnRandom);

$(canvas).mousemove(canvasMouseMove).mousedown(canvasMouseDown);
$("body").mouseup(bodyMouseUp);

// jQuery isn't really adding anything to touch events, so lets do it the old fashioned way
canvas.addEventListener('touchmove', canvasTouchMove, true);
canvas.addEventListener('touchstart', canvasTouchDown, true);
document.body.addEventListener('touchcancel', bodyTouchUp, true);

// try and prevent scrolling (doesn't seem to work, however)
document.body.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, false); 