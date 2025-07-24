//------------------------ settings ------------------------
const canvasRes = 1;
const gravPull = .5;
const drag = .99;
const bounceDrag = .7;
const golfBallRadius = 10;
const maxStrokePower = 100;
const strokePowerDivider = 10;
const minYVelocity = 2;
const snapGroundDis = 5;
//------------------------ settings ------------------------

let devMode = false;
function toggleDevMode(){
    setTimeout(()=>{
        devMode = !devMode;
        console.log('devMode status:' + devMode);
    })
}


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

canvas.width = 256 * canvasRes;
canvas.height = 108 * canvasRes;

let rect = canvas.getBoundingClientRect();
function resizeCanvas(){
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    canvas.width = Math.floor(window.innerWidth * canvasRes);
    canvas.height = Math.floor(window.innerHeight * canvasRes);

    pixels = new Array(canvas.width * canvas.height).fill(false);
    rect = canvas.getBoundingClientRect();
}

//y * canvas.width + x;
let pixels = new Array(canvas.width * canvas.height).fill(false);

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

////////////////////////// create mode //////////////////////////
class Rectangle{
    constructor(ax,ay,bx,by, color){
        this.ax = ax || 0;
        this.ay = ay || 0;
        this.bx = bx || 0;
        this.by = by || 0;
        this.color = color || "green";
    }

    setA(x, y){
        this.ax = x;
        this.ay = y;
    }

    setB(x, y){
        this.bx = x;
        this.by = y;
    }
}

let rectsI = 0;
let rects = [];
let mouseDown = false;
let mouseDownPoint = {x: 0,y: 0};

window.addEventListener('mousedown', (event) => {
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    
    mouseDownPoint = {x: mouseX,y: mouseY};
    mouseDown = true;

    if(!devMode || event.target !== canvas){stroke();return;}

    const r = new Rectangle();
    r.setA(mouseX, mouseY);
    r.setB(mouseX, mouseY);
    rects.push(r);
});
window.addEventListener('mouseout', (event)=>{
    if(mouseDown){
        mouseDown = false;
        if(devMode){
            rects.pop();
        }

    }
});
window.addEventListener('mouseup', (event) => {
    mouseDown = false;
    if(!devMode || event.target !== canvas || !mouseDown){return;}

    rectsI++;
});

window.addEventListener('mousemove', (event) => {mousePos(event);})

let mouseX = 0;
let mouseY = 0;

function mousePos(e){
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if(mouseDown && devMode){
        creatingRect(e);   
    }
}

function creatingRect(event){
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    rects[rectsI].setB(mouseX, mouseY);
}

function renderMisc(){
    for(i = 0; i < rects.length; i++){
        if(isNaN(rects[i].bx) || isNaN(rects[i].by)) continue;

        let r = rects[i];

        ctx.beginPath();
        ctx.rect(r.ax, r.ay, r.bx - r.ax, r.by - r.ay);
        ctx.fillStyle= r.color;
        ctx.fill();
    }
}

function loadRects(){
    //walls
    //top
    r = new Rectangle(0, 0, canvas.width, 15, 'black');
    rects.push(r);
    rectsI++;
    //left
    r = new Rectangle(canvas.width, 0, canvas.width - 15, canvas.height, 'black');
    rects.push(r);
    rectsI++;
    //bottom
    r = new Rectangle(canvas.width, canvas.height, 0, canvas.height - 15, 'black');
    rects.push(r);
    rectsI++;
    //right
    r = new Rectangle(0, canvas.width, 15, 0, 'black');
    rects.push(r);
    rectsI++;
}
loadRects();

////////////////////////// create mode //////////////////////////

////////////////////////// logic //////////////////////////
function stroke(){
    //console.log("mouseX: " + mouseX + "; mouseY: " + mouseY + " || mouseDownPointX: " + mouseDownPoint.x + "; mouseDownPointY: " + mouseDownPoint.y + " || mouseDown: " + mouseDown);

    let strokeVector = {x: mouseX - mouseDownPoint.x, y: mouseY - mouseDownPoint.y};
    let length = Math.sqrt(strokeVector.x * strokeVector.x + strokeVector.y * strokeVector.y)
    strokeVector.x /= length;
    strokeVector.y /= length;

    strokeVector.x *= -1;
    strokeVector.y *= -1;

    length /= strokePowerDivider;
    if(length > maxStrokePower){
        length = maxStrokePower;
    }

    strokeVector.x *= length;
    strokeVector.y *= length;

    ctx.beginPath();
    ctx.moveTo(golfBall.x, golfBall.y);
    ctx.lineTo(golfBall.x + strokeVector.x, golfBall.y + strokeVector.y);
    ctx.stroke();

    if(mouseDown){
        requestAnimationFrame(stroke);
    }else{
        golfBall.velocityX = strokeVector.x;
        golfBall.velocityY = strokeVector.y;
    }
}

//line array for calculating collision
let lines = [];
function calculateLines(){
    //foreach rect
    for(let i = 0; i < rects.length; i++){
        let r = rects[i];

        // Top edge
        lines.push({ x1: r.ax, y1: r.ay, x2: r.bx, y2: r.ay });

        // Right edge
        lines.push({ x1: r.bx, y1: r.ay, x2: r.bx, y2: r.by });

        // Bottom edge
        lines.push({ x1: r.bx, y1: r.by, x2: r.ax, y2: r.by });

        // Left edge
        lines.push({ x1: r.ax, y1: r.by, x2: r.ax, y2: r.ay });
    }
}

function getIntersection(A, B, C, D) {
    const r_dx = B.x - A.x;
    const r_dy = B.y - A.y;
    const s_dx = D.x - C.x;
    const s_dy = D.y - C.y;

    const r_cross_s = r_dx * s_dy - r_dy * s_dx;
    if (r_cross_s === 0) return null; // parallel

    const t = ((C.x - A.x) * s_dy - (C.y - A.y) * s_dx) / r_cross_s;
    const u = ((C.x - A.x) * r_dy - (C.y - A.y) * r_dx) / r_cross_s;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {

        return { ///change to reflect call
            x: A.x + r_dx * t,
            y: A.y + r_dy * t,
            distance: t
        };
    }

    return null;
}

function reflect(hx, hy, t, C, D){
    let vx = golfBall.velocityX;
    let vy = golfBall.velocityY;

    golfBall.frameT += t;
    if(golfBall.frameT >= 1){return};


    let dx = D.x - C.x;
    let dy = D.y - C.y;

    //wall normal
    let nx = -dy;
    let ny = dx;
    // Normalize normal
    let len = Math.sqrt(nx * nx + ny * ny);
    nx /= len;
    ny /= len;

    let dot = vx * nx + vy * ny;

    golfBall.velocityX = vx - 2 * dot * nx;
    golfBall.velocityY = vy - 2 * dot * ny;
    golfBall.x = hx + golfBall.velocityX * (1 - golfBall.frameT);
    golfBall.y = hy + golfBall.velocityY * (1 - golfBall.frameT);

    golfBall.velocityX *= bounceDrag;
    golfBall.velocityY *= bounceDrag;
    
    golfBall.moved = true;
}

function normalizedVector(V){
    const length = Math.sqrt(V.x * V.x + V.y * V.y);
    return length === 0 ? {x: 0, y: 0} : {x: V.x / length, y: V.y / length};
}

function calculateColisions(A, B, checkGround){
    let closest = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const velBall = {x: B.x - A.x, y: B.y - A.y};
        const nVelBall = normalizedVector(velBall);

        const C = { x: line.x1 - nVelBall.x * golfBallRadius, y: line.y1 - nVelBall.y * golfBallRadius};
        const D = { x: line.x2 - nVelBall.x * golfBallRadius, y: line.y2 - nVelBall.y * golfBallRadius};


        const hit = getIntersection(A, B, C, D);
        if (hit) {
            if (!closest || hit.distance < closest.distance) {
                closest = {
                    x: hit.x,
                    y: hit.y,
                    distance: hit.distance,
                    line: line,
                    c: C,
                    d: D
                };
            }
        }
    }



    if(closest !== null){
        if(checkGround && Math.abs(golfBall.velocityY) <= minYVelocity){

            golfBall.y = closest.y - 1;
            golfBall.velocityY = 0;
            golfBall.velocityX *= drag * drag * drag;

            console.log("snap to ground");
            grounded = true;
            return;
        }
        if(checkGround){return;};
        

        reflect(closest.x, closest.y, closest.distance, closest.c, closest.d);

        if(golfBall.frameT >= 1){return};
        calculateColisions({x: closest.x, y: closest.y}, {x:golfBall.x, y: golfBall.y}, false);
    }
}


class GolfBall{
    constructor(x,y,velocityX, velocityY){
        this.x = x;
        this.y = y;
        this.velocityX = velocityX || 0;
        this.velocityY = velocityY || 0;
        this.frameT = 0;
        this.moved = false;
    }

    addGravity(){
        this.velocityY = this.velocityY + gravPull;
    }
}
let golfBall = new GolfBall(canvas.width * .10, canvas.height * .50);
let grounded = false;

function physics(){

    golfBall.addGravity();


    golfBall.velocityX *= drag;
    golfBall.velocityY *= drag;

    golfBall.moved = false;

    //calculate collisions
    grounded = false;
    golfBall.frameT = 0;
    calculateColisions({x: golfBall.x, y: golfBall.y - golfBallRadius}, {x: (golfBall.x), y: (golfBall.y + snapGroundDis)}, true);
    if(!grounded){
        calculateColisions({x: golfBall.x, y: golfBall.y}, {x: (golfBall.x + golfBall.velocityX), y: (golfBall.y + golfBall.velocityY)}, false);
    }else{
        calculateColisions({x: golfBall.x, y: golfBall.y}, {x: (golfBall.x + golfBall.velocityX), y: (golfBall.y)}, false);
    }

    //add velocity if it didnt reflect
    if(!golfBall.moved){
        golfBall.x += golfBall.velocityX;
        golfBall.y += golfBall.velocityY;
    }


    //drawing
    ctx.beginPath();
    ctx.arc(golfBall.x, golfBall.y, golfBallRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'gray';
    ctx.fill();
}

const flagBaseWidth = 40;
const flagBaseHeight = 5;
const flagPoleHeight = 60;
const flagPoleWidth = 6;
const flagWidth = 30;
const flagHeight = 20;

class flagpole{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    render(){
        //base
        ctx.beginPath();
        ctx.rect(this.x - flagBaseWidth/2, this.y, flagBaseWidth, flagBaseHeight);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.stroke();

        //pole
        ctx.beginPath();
        ctx.rect(this.x - flagPoleWidth/2, this.y, flagPoleWidth, - flagPoleHeight);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();

        //flag
        ctx.beginPath();
        ctx.moveTo(this.x - 3, this.y - flagPoleHeight);
        ctx.lineTo(this.x - 3 - flagWidth, this.y - flagPoleHeight + flagHeight/2);
        ctx.lineTo(this.x - 3, this.y - flagPoleHeight + flagHeight);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    }
}

function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMisc();
    flag.render();
    physics();

    requestAnimationFrame(update);
}
let flag = new flagpole(250, 250);
calculateLines();
update();
////////////////////////// logic //////////////////////////