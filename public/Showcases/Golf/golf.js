//------------------------ settings ------------------------
const canvasRes = 1;
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
function update(){
    drawRects();

    requestAnimationFrame(update);
}
update();
////////////////////////// logic //////////////////////////