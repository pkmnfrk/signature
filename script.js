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
    
    canvasCtx.putImageData(pixels, 0, 0); // possible improvement: return a new canvas?
}

// This just kind of scribles on the canvas for a bit
// TODO: refactor the line drawing into an external method
function addRandomSignature() {
    var a, b;
    a = randomCoordinate();
    
    for(var i = 0; i < 100; i++) {
        b = randomCoordinate();
        
        canvasCtx.beginPath();       // yes, this is kind of slow and dumb
        canvasCtx.moveTo(a.x, a.y);  // but, I am simulating a bunch of touches
        canvasCtx.lineTo(b.x, b.y);  // so I will use the same algorithm
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();
        
        a = b;
        
    }
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
    
    var denormal = exportAsImage(canvas);
    
    normalizeCanvas(canvas);
    
    var normal = exportAsImage(canvas);
    
    window.open(denormal.png);
    window.open(denormal.gif);
    window.open(normal.png);
    window.open(normal.gif);
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

function btnRandom(e) {
    canvas.width = canvas.width;
    
    addRandomSignature();
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