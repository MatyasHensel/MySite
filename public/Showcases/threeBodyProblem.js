// --------------- Settings ---------------
const initialStarVel = 2;
const starVelDivision = 1000;
const smallestGravAtractionRange = 5;
const gravSlowdown = .05;
// --------------- Settings ---------------
let starCount = 5;


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
    }
}

// the center of mass shouldnt change so i can find it out only once
let commonCenter = new Vector2(0, 0);

function computeCenterOfMass(){
    let centerXHolder = 0;
    let centerYHolder = 0;
    let totalMass = 0;

    for(let i = 0; i < starArray.length; i++){
        let star = starArray[i];

        totalMass += star.mass;
        centerXHolder += star.position.x * star.mass;
        centerYHolder += star.position.y * star.mass;
    }

    if(totalMass == 0) return;

    commonCenter = new Vector2(centerXHolder / totalMass, centerYHolder / totalMass);

    return;
}

function simulateFrame(){
    computeCenterOfMass();

    for(let i = 0; i < starCount; i++){
        let star = starArray[i];

        let vectorToCenter = commonCenter.subtracted(star.position);
        vectorToCenter.normalize();

        vectorToCenter.multiply(gravSlowdown);
        vectorToCenter.divide(star.mass);

        star.velocity.add(vectorToCenter);

        star.position.add(star.velocity);
    }
}


function centerCanvas(){
    let perfectCenter = new Vector2(canvas.width / 2, canvas.height / 2);

    let moveByVector = perfectCenter.subtracted(commonCenter);

    commonCenter.add(moveByVector);

    for(let i = 0; i < starArray.length; i++){
        let star = starArray[i];

        star.position.add(moveByVector);
    }
}


function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    simulateFrame();
    centerCanvas();

    if(starArray.length != 0){
        for(let i = 0; i < starArray.length; i++){
            const star = starArray[i];
            drawCircle(star.position.x, star.position.y, star.mass * 5, star.r, star.g, star.b);
        }
    }

    requestAnimationFrame(update);
}

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