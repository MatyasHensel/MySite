// --------------- Settings ---------------
const initialStarVel = .1;
const starVelDivision = 1000;
const smallestGravAtractionRange = 1;
const gravSlowdown = .5;
const softening = 5;

const canvasBackgroundColor = '#1C1C1C';
// --------------- Settings ---------------
const starCount = 3;


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//resize the cavas display and resolution
function resizeCanvas(){
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas()

//listen for resizing event and set resolution and canvas size aproprietly
window.addEventListener('resize', resizeCanvas);

function drawCircle(x, y, radius, r, g, b){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
}


//------------------------------------------------ physics stuff ------------------------------------------------

class Vector2 {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(VToAdd){
        this.x += VToAdd.x;
        this.y += VToAdd.y;
    }

    subtract(VToSubtract){
        this.x = this.x - VToSubtract.x;
        this.y = this.y - VToSubtract.y;
    }
    subtracted(VToSubtract){
        return new Vector2(this.x - VToSubtract.x, this.y - VToSubtract.y)
    }

    normalize(){
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        if(length === 0) return;

        this.x = this.x / length;
        this.y = this.y / length;
    }

    multiply(multiplicand){
        this.x *= multiplicand;
        this.y *= multiplicand;
    }

    divide(dividor){
        this.x /= dividor;
        this.y /= dividor;
    }

    length(){
        let length = Math.sqrt(this.x * this.x + this.y * this.y);

        if(length < smallestGravAtractionRange){
            length = smallestGravAtractionRange;
        }

        return length;
    }
}

//generate a star in start state
function starGen(){
    return{
        position: new Vector2((Math.random() * (window.innerWidth * 0.6)) + (window.innerWidth * 0.2), (Math.random() * (window.innerHeight * 0.6)) + (window.innerHeight * 0.2)),
        velocity: new Vector2((Math.random() - 0.5) * 2 * initialStarVel, (Math.random() - 0.5) * 2 * initialStarVel),
        mass: 1,
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    }
};

//array holding all details of a star
const starArray = [];

//create apropriate num of stars
function createStars(){
    starArray.length = 0;
    for(let i = 0; i < starCount; i++){
        starArray.push(starGen());

        let suffix = '';
        if(i === 0) suffix = 'A';
        if(i === 1) suffix = 'B';
        if(i === 2) suffix = 'C';

        document.getElementById(`starContainer${suffix}`).style.backgroundColor = `rgb(${starArray[i].r},${starArray[i].g},${starArray[i].b})`;
    }
}

// the center of mass shouldnt change so i can find it out only once
let commonCenter = new Vector2(0, 0);
let totalMass = 1;

function computeCenterOfMass(){
    let centerXHolder = 0;
    let centerYHolder = 0;
    totalMass = 0;

    for(let i = 0; i < starArray.length; i++){
        let star = starArray[i];

        totalMass += star.mass;
        centerXHolder += star.position.x;
        centerYHolder += star.position.y;
    }

    if(totalMass == 0) return;

    commonCenter = new Vector2(centerXHolder / 3, centerYHolder / 3);

    return;
}

function simulateFrame(){
    computeCenterOfMass();
    setStarMasses();

    for(let i = 0; i < starCount; i++){
        let starA = starArray[i];

        for(let j = 0; j < starCount; j++){
            if(i == j) continue;

            let starB = starArray[j];

            let AtoB = starB.position.subtracted(starA.position);
            const length = Math.sqrt(AtoB.x ** 2 + AtoB.y ** 2 + softening ** 2);
            AtoB.normalize();

            AtoB.multiply(gravSlowdown * starB.mass);
            AtoB.divide(starA.mass);
            //AtoB.divide(totalMass);

            AtoB.divide(length);

            starA.velocity.add(AtoB);
        }

        starA.position.add(starA.velocity);
    }
}

function centerCanvas(){
    let perfectCenter = new Vector2(canvas.width / 2, canvas.height / 2);

    let moveByVector = perfectCenter.subtracted(commonCenter);
    moveByVector.x += window.innerWidth * 0.1;

    moveByVector.divide(6000);
    commonCenter.add(moveByVector);

    for(let i = 0; i < starArray.length; i++){
        let star = starArray[i];

        star.position.add(moveByVector);
    }
}


function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    simulateFrame();
    //centerCanvas();

    if(starArray.length != 0){
        for(let i = 0; i < starArray.length; i++){
            const star = starArray[i];
            drawCircle(star.position.x, star.position.y, star.mass * 3 + 10, star.r, star.g, star.b);
        }
    }

    requestAnimationFrame(update);
}

function setStarMasses(){
    starArray[0].velocity.divide((Number(sliderA.value)) / starArray[0].mass);
    starArray[0].mass = Number(sliderA.value);

    starArray[1].velocity.divide((Number(sliderB.value)) / starArray[1].mass);
    starArray[1].mass = Number(sliderB.value);

    starArray[2].velocity.divide((Number(sliderC.value)) / starArray[2].mass);
    starArray[2].mass = Number(sliderC.value);
}

function resetSim(){
    starArray.length = 0;
    createStars();
    setStarMasses();
}


const starMenuWeightA = document.getElementById('starMenuWeightA');
const starMenuWeightB = document.getElementById('starMenuWeightB');
const starMenuWeightC = document.getElementById('starMenuWeightC');

let weightOriginalTextA = 'string';
let weightOriginalTextB = 'string';
let weightOriginalTextC = 'string';
window.addEventListener('DOMContentLoaded', () => {
    weightOriginalTextA = starMenuWeightA.innerText;
    weightOriginalTextB = starMenuWeightB.innerText;
    weightOriginalTextC = starMenuWeightC.innerText;

    starMenuWeightA.innerText = weightOriginalTextA + String(Number(sliderA.value));
    starMenuWeightB.innerText = weightOriginalTextB + String(Number(sliderB.value));
    starMenuWeightC.innerText = weightOriginalTextC + String(Number(sliderC.value));
});


const sliderA = document.getElementById('sliderA');
const sliderB = document.getElementById('sliderB');
const sliderC = document.getElementById('sliderC');

sliderA.addEventListener('input', () =>{
    starMenuWeightA.innerText = weightOriginalTextA + String(Number(sliderA.value));
});
sliderB.addEventListener('input', () =>{
    starMenuWeightB.innerText = weightOriginalTextB + String(Number(sliderB.value));
});
sliderC.addEventListener('input', () =>{
    starMenuWeightC.innerText = weightOriginalTextC + String(Number(sliderC.value));
});

const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', resetSim);


createStars();
computeCenterOfMass();
update();


/*testing
ctx.beginPath();
ctx.moveTo(window.innerWidth, window.innerHeight);
ctx.lineTo(0,0);
ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.stroke();



            //just for debuging
            drawCircle(commonCenter.x, commonCenter.y, 5, 255, 0, 0);

            const velocityIndicatorLength = 50;
            ctx.beginPath();
            ctx.moveTo(star.position.x, star.position.y);
            ctx.lineTo(star.position.x + (star.velocity.x * velocityIndicatorLength), star.position.y + (star.velocity.y * velocityIndicatorLength))
            ctx.strokeStyle = "rgb(255, 255, 255)";
            ctx.stroke();
*/