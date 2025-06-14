//------------------------ settings ------------------------
const canvasRes = 1;
const zoom = 1; // canvas width and length should be divided //(canvas.width * canvasRes) / zoom;
//------------------------ settings ------------------------

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

canvas.width = 256 * canvasRes;
canvas.height = 108 * canvasRes;

function resizeCanvas(){
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    canvas.width = Math.floor(window.innerWidth * canvasRes);
    canvas.height = Math.floor(window.innerHeight * canvasRes);


    //////////////////////// TESTING ////////////////////////
        ctx.beginPath();
        ctx.moveTo(canvas.width, canvas.height);
        ctx.lineTo(0,0);
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, 0);
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.stroke();
    //////////////////////// TESTING ////////////////////////

    
    pixels = new Array(canvas.width * canvas.height).fill(false);
}

//y * canvas.width + x;
let pixels = new Array(canvas.width * canvas.height).fill(false);

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

////////////////////////// logic //////////////////////////

window.addEventListener('mousemove', (event) => {mousePos(event);})

function mousePos(e){
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleX = mouseX / window.innerWidth;
    const scaleY = mouseY / window.innerHeight;

    let mouseRealRatioX = Math.floor((canvas.width * canvasRes) / zoom);
}

