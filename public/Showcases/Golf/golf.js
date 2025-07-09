//------------------------ settings ------------------------
const canvasRes = 1;
const gravPull = 1;
const drag = .97;
const golfBallRadius = 10;
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

////////////////////////// creat mode //////////////////////////
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

window.addEventListener('mousedown', (event) => {
    if(!devMode || event.target !== canvas){return;}

    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    const r = new Rectangle();
    r.setA(mouseX, mouseY);
    r.setB(mouseX, mouseY);
    rects.push(r);

    mouseDown = true;
});
window.addEventListener('mouseout', (event)=>{
    if(mouseDown){
        mouseDown = false;
        rects.pop();
    }
});
window.addEventListener('mouseup', (event) => {
    if(!devMode || event.target !== canvas || !mouseDown){return;}
    mouseDown = false;

    rectsI++;
});

window.addEventListener('mousemove', (event) => {mousePos(event);})

function mousePos(e){
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 10, 0, 2*Math.PI);
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.stroke();

    if(mouseDown && devMode){
        creatingRect(e);   
    }
}

function creatingRect(event){
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    rects[rectsI].setB(mouseX, mouseY);
}

function drawRects(){
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

////////////////////////// creat mode //////////////////////////

////////////////////////// logic //////////////////////////

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

    golfBall.moved = true;
}

function normalizedVector(V){
    const length = Math.sqrt(V.x * V.x + V.y * V.y);
    return length === 0 ? {x: 0, y: 0} : {x: V.x / length, y: V.y / length};
}

function calculateColisions(A, B){
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
        console.log("collisionX: " + closest.x + ", collisionY: " + closest.y + ", t: " + closest.distance + ", ballAY: " + A.y + ", ballBY: " + B.y);
        reflect(closest.x, closest.y, closest.distance, closest.c, closest.d);
        //calculateColisions({x: golfBall.x, y: golfBall.y}, {x: golfBall.x + golfBall.velocityX, y: golfBall.y + golfBall.velocityY});
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

function physics(){
    //gravity
    golfBall.addGravity();

    golfBall.velocityX *= drag;
    golfBall.velocityY *= drag;

    golfBall.moved = false;
    //calculate collisions
    golfBall.frameT = 0;
    calculateColisions({x: golfBall.x, y: golfBall.y}, {x: (golfBall.x + golfBall.velocityX), y: (golfBall.y + golfBall.velocityY)});

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

function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRects();
    physics();

    requestAnimationFrame(update);
}
calculateLines();
update();
////////////////////////// logic //////////////////////////