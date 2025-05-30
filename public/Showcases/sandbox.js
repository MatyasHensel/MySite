const canvas = document.getElementById('fluidCanvas');
const ctx = canvas.getContext('2d');

const canvasBorder = document.getElementById('canvasBorder');

let canvasResolution = 100;

canvas.width = canvasResolution;
canvas.height = canvasResolution;

function resizeCanvas(){
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    var canvasSupposedSize = 0;

    canvasSupposedSize = Math.min(windowWidth, windowHeight);

    canvas.style.width = canvasSupposedSize + "px";
    canvas.style.height = canvasSupposedSize + "px";
    canvasBorder.style.width = canvasSupposedSize - 5 + "px";
    canvasBorder.style.height = canvasSupposedSize - 10 + "px";
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

//---------------------------
//sandbox logic and rendering
//---------------------------


let pixels = new Uint8Array(canvasResolution * canvasResolution).fill(0);

//empty pixel = 0; color rgb[87,87,87]
//water index = 1; color rgb[44,33,252]
//sand index =  2; color rgb[252,218,88]
//wood index = 3; color rgb[109,71,21]
//fire index = 4; color rgb[245, 13, 10];
const fireDisapationChance = 0.1;
const fireSlowdown = .7; //how often is fire skipped in simulation, up to 1(never simulated)
const fireWoodCombustionChance = 1;
//smoke index = 5; color rgb[29, 29, 29];
const smokeSpawnChance = .3;
//wood_burning index = 6; color[245, 96, 17];
const burningWoodDisapationChance = .005;
const burningWoodFireCreation = .05;
const burningWoodFireSpreadChance = .1;
//steam index = 7; color rgb[139, 144, 252]
const steamSlowdown = .5;
const steamCondensationChance = .02;


let mouseChosenElement = 2; //do buttons for each element later

let brushSize = 1;

const body = document.getElementById("body");

const sandButton = document.getElementById("sandButton");
const waterButton = document.getElementById("waterButton");
const woodButton = document.getElementById("woodButton");
const fireButton = document.getElementById('fireButton');

waterButton.style.backgroundColor = 'rgb(44,33,252)';
sandButton.style.backgroundColor = 'rgb(252,218,88)';
woodButton.style.backgroundColor = 'rgb(109,71,21)';
fireButton.style.backgroundColor = 'rgb(245, 13, 10)';

sandButton.addEventListener('click', () => {mouseChosenElement = 2; brushSize = 1; markButton(2);});
waterButton.addEventListener('click', () => {mouseChosenElement = 1; brushSize = 1; markButton(1);});
woodButton.addEventListener('click', () => {mouseChosenElement = 3; brushSize = 2; markButton(3);});
fireButton.addEventListener('click', () => {mouseChosenElement = 4; brushSize = 2; markButton(4);});

function markButton(element){
    if(element === 1){
        body.style.backgroundColor = "rgb(44,33,252)";
        return;
    }
    else if(element === 2){
        body.style.backgroundColor = "rgb(252,218,88)";
        return;
    }
    else if(element === 3){
        body.style.backgroundColor = "rgb(109,71,21)";
        return;
    }
    else if(element === 4){
        body.style.backgroundColor = "rgb(245, 13, 10)";
        return;
    }
}

let mousePressed = false;

let mouseMoveEvent = null;

canvas.addEventListener('mousedown', (e) => {mousePressed = true; mouseMoveEvent = e; fill();});

document.addEventListener('mouseup', () => {mousePressed = false;});


canvas.addEventListener('mousemove', (e) => {if(mousePressed == true){mouseMoveEvent = e;}});

function fill(){
    let e = mouseMoveEvent;
    const cellSize = canvas.width / canvasResolution;

    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cellX = Math.floor(mouseX / cellSize);
    const cellY = Math.floor(mouseY/ cellSize);

    let mousePositionIndex = cellY * canvasResolution + cellX;

    pixels[mousePositionIndex] = mouseChosenElement;

    if(brushSize === 2){
        if(cellX + 1 < canvasResolution){
            pixels[mousePositionIndex + 1] = mouseChosenElement;
        }
        if(cellX - 1 >= 0){
            pixels[mousePositionIndex - 1] = mouseChosenElement;
        }
        pixels[mousePositionIndex - canvasResolution] = mouseChosenElement;
        pixels[mousePositionIndex + canvasResolution] = mouseChosenElement;
    }

    if(mousePressed){
        requestAnimationFrame(fill);
    }
}

const COLOR_TABLE = [
    [255, 255, 255],    // 0 empty
    [44, 33, 252],      // 1 water
    [252, 218, 88],     // 2 sand
    [109, 71, 21],      // 3 earth
    [245, 13, 10],      // 4 fire
    [29, 29, 29],       // 5 smoke
    [245, 96, 17],      // 6 burning wood
    [139, 144, 252]     // 7 steam
];

const imgData = ctx.createImageData(canvasResolution, canvasResolution);

function render(){
    for(let i = 0; i < (canvasResolution * canvasResolution) * 4; i += 4){
        const [r, g, b] = COLOR_TABLE[pixels[i / 4]]

        imgData.data[i] = r;
        imgData.data[i + 1] = g;
        imgData.data[i + 2] = b;
        imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
}

//table for behaviors
const behavior = {
    0: () => {}, // empty
    1: (x, y) => {
        // water

        const sideToCheck = Math.random() < 0.5 ? -1:1;

        if(pixels[(y + 1) * canvasResolution + x] === 0 && y + 1 < canvasResolution){
            pixels[(y + 1) * canvasResolution + x] = 1;
            pixels[y * canvasResolution + x] = 0;
        }else{
            if(pixels[(y + 1) * canvasResolution + x + sideToCheck] === 0){
                if (x + sideToCheck < 0 || x + sideToCheck >= canvasResolution) return;
                pixels[(y + 1) * canvasResolution + x + sideToCheck] = 1;
                pixels[y * canvasResolution + x] = 0;
            }else if(pixels[(y + 1) * canvasResolution + x - sideToCheck] === 0){
                if (x - sideToCheck < 0 || x - sideToCheck >= canvasResolution) return;
                pixels[(y + 1) * canvasResolution + x - sideToCheck] = 1;
                pixels[y * canvasResolution + x] = 0;
            }else if(pixels[y * canvasResolution + x + sideToCheck] === 0){
                if (x + sideToCheck < 0 || x + sideToCheck >= canvasResolution) return;
                pixels[y * canvasResolution + x + sideToCheck] = 1;
                pixels[y * canvasResolution + x] = 0;
            }else if(y * canvasResolution + x - sideToCheck === 0){
                if (pixels[x - sideToCheck < 0 || x - sideToCheck] >= canvasResolution) return;
                pixels[y * canvasResolution + x - sideToCheck] = 1;
                pixels[y * canvasResolution + x] = 0;
            }
        }
        return;
    },
    2: (x, y) => {
        // sand

        const sideToCheck = Math.random() < 0.5 ? -1:1;

        const under = (y + 1) * canvasResolution + x;
        const current = y * canvasResolution + x;

        if(pixels[under] === 0 || pixels[under] === 1 && y + 1 < canvasResolution){
            if(pixels[under] === 1){
                pixels[current] = 1;
                pixels[under] = 2;
            }else{
                pixels[current] = 0;
                pixels[under] = 2;
            }
        }else{
            if(pixels[under + sideToCheck] === 0 || pixels[under + sideToCheck] === 0){
                if (x + sideToCheck < 0 || x + sideToCheck >= canvasResolution) return;

                if(pixels[under + sideToCheck] === 1){
                    pixels[current] = 1;
                    pixels[under + sideToCheck] = 2;
                }else{
                    pixels[current] = 0;
                    pixels[under + sideToCheck] = 2;
                }

            }else if(pixels[under - sideToCheck] === 0 || pixels[under - sideToCheck] === 1){
                if (x - sideToCheck < 0 || x - sideToCheck >= canvasResolution) return;

                if(pixels[under - sideToCheck] === 1){
                    pixels[current] = 1;
                    pixels[under - sideToCheck] = 2;
                }else{
                    pixels[current] = 0;
                    pixels[under - sideToCheck] = 2;
                }
            }
        }
    },
    3: (x, y) => {
        //wood

        return;
    },
    4: (x,y) => {
        //fire

        const currentPixel = y * canvasResolution + x;
        const above = (y - 1) * canvasResolution + x;
        const aboveRight = (y - 1) * canvasResolution + x + 1;
        const aboveLeft = (y - 1) * canvasResolution + x - 1;
        const right = y * canvasResolution + x + 1;
        const left = y * canvasResolution + x - 1;
        const below = (y + 1) * canvasResolution + x;
        const belowLeft = (y + 1) * canvasResolution + x - 1;
        const belowRight = (y + 1) * canvasResolution + x + 1;

        if(pixels[above] === 1 || pixels[right] === 1 || pixels[left] === 1 || pixels[below] === 1){
            pixels[currentPixel] = 0;//generate steam on the correct pixel
        }

        if(pixels[above] === 1){
            pixels[above] = 7;
        }
        if(pixels[right] === 1){
            pixels[right] = 7;
        }
        if(pixels[below] === 1){
            pixels[below] = 7;
        }
        if(pixels[left] === 1){
            pixels[left] = 7;
        }

        if(Math.random() < fireSlowdown){
            return;
        } 

        if(pixels[above] === 3 && Math.random() < fireWoodCombustionChance){
            pixels[above] = 6;
        }
        if(pixels[right] === 3 && Math.random() < fireWoodCombustionChance){
            pixels[right] = 6;
        }
        if(pixels[below] === 3 && Math.random() < fireWoodCombustionChance){
            pixels[below] = 6;
        }
        if(pixels[left] === 3 && Math.random() < fireWoodCombustionChance){
            pixels[left] = 6;
        }

        if(pixels[above] === 0 && Math.random() > 0.5){
            pixels[currentPixel] = 0;
            pixels[above] = 4;
            return;
        }

        //if surounded by fire return
        if(pixels[above] === 4 && pixels[right] === 4 && pixels[left] === 4){
            return;
        }else{
            if(Math.random() < fireDisapationChance){
                pixels[currentPixel] = Math.random() < smokeSpawnChance ? 5 : 0;
                return;
            }

            let moveRight = false;

            if(pixels[right] === 0 && pixels[left] === 0){
                moveRight = Math.floor(Math.random() < 0.5);

                pixels[currentPixel] = 0;

                if(moveRight && x + 1 < canvasResolution){
                    pixels[right] = 4;
                }else if(x - 1 >= 0){
                    pixels[left] = 4;
                }
                return;
            }else if(pixels[right] === 0 && pixels[left] !== 0 && x + 1 < canvasResolution){
                pixels[currentPixel] = 0;
                pixels[right] = 4;
                return;
            }else if(pixels[right] !== 0 && pixels[left] === 0 && x - 1 >= 0){
                pixels[currentPixel] = 0;
                pixels[left] = 4;
                return;
            }else{
                return;
            }
        }
    },
    5: (x, y) => {
        //smoke

        const currentPixel = y * canvasResolution + x;
        const above = (y - 1) * canvasResolution + x;
        const right = y * canvasResolution + x + 1;
        const left = y * canvasResolution + x - 1;

        if(Math.random() < fireSlowdown){
            return;
        } 

        if(pixels[above] === 0 && Math.random() > 0.5){
            pixels[currentPixel] = 0;
            pixels[above] = 5;
            return;
        }

        //if surounded by fire return
        if(pixels[above] === 5 && pixels[right] === 5 && pixels[left] === 5){
            return;
        }else{
            if(Math.random() < fireDisapationChance){
                pixels[currentPixel] = Math.random() > smokeSpawnChance ? /*smoke*/ 0 : 0;//---------------------------------------------------------------------------------smoke
                return;
            }

            let moveRight = false;

            if(pixels[right] === 0 && pixels[left] === 0){
                moveRight = Math.floor(Math.random() < 0.5);

                pixels[currentPixel] = 0;

                if(moveRight && x + 1 < canvasResolution){
                    pixels[right] = 5;
                }else if(x - 1 >= 0){
                    pixels[left] = 5;
                }
                return;
            }else if(pixels[right] === 0 && pixels[left] !== 0 && x + 1 < canvasResolution){
                pixels[currentPixel] = 0;
                pixels[right] = 5;
                return;
            }else if(pixels[right] !== 0 && pixels[left] === 0 && x - 1 >= 0){
                pixels[currentPixel] = 0;
                pixels[left] = 5;
                return;
            }else{
                return;
            }
        }
    },
    6: (x, y) => {
        //burning wood

        const currentPixel = y * canvasResolution + x;
        const above = (y - 1) * canvasResolution + x;
        const right = y * canvasResolution + x + 1;
        const left = y * canvasResolution + x - 1;
        const below = (y + 1) * canvasResolution + x;

        if(pixels[above] === 1 || pixels[right] === 1 || pixels[left] === 1 || pixels[below] === 1){
            pixels[currentPixel] = 0;//generate steam on the correct pixel
        }

        if(pixels[above] === 3 || pixels[above] === 6 && pixels[right] === 3 || pixels[right] === 6 && pixels[below] === 3 || pixels[below] === 6 && pixels[left] === 3 || pixels[left] === 6){
            pixels[currentPixel] = 3;
        }

        if(Math.random() < burningWoodDisapationChance){
            pixels[currentPixel] = 0;
        }

        if(Math.random() < burningWoodFireSpreadChance && pixels[above] ===3){
            pixels[above] = 6;
        }
        if(Math.random() < burningWoodFireSpreadChance && pixels[right] ===3){
            pixels[right] = 6;
        }
        if(Math.random() < burningWoodFireSpreadChance && pixels[below] ===3){
            pixels[below] = 6;
        }if(Math.random() < burningWoodFireSpreadChance && pixels[left] ===3){
            pixels[left] = 6;
        }

        if(Math.random() < burningWoodFireSpreadChance && pixels[above] ===0){
            pixels[above] = 4;
        }
        if(Math.random() < burningWoodFireSpreadChance && pixels[right] ===0){
            pixels[right] = 4;
        }
        if(Math.random() < burningWoodFireSpreadChance && pixels[below] ===0){
            pixels[below] = 4;
        }if(Math.random() < burningWoodFireSpreadChance && pixels[left] ===0){
            pixels[left] = 4;
        }
    },
    7: (x,y) => {
        //steam

        const currentPixel = y * canvasResolution + x;
        const above = (y - 1) * canvasResolution + x;
        const right = y * canvasResolution + x + 1;
        const left = y * canvasResolution + x - 1;

        if(Math.random() < steamSlowdown){
            return;
        }

        if(Math.random() < steamCondensationChance){
            pixels[currentPixel] = 1;
        }

        if(pixels[above] === 0 && Math.random() > .5){
            pixels[currentPixel] = 0;
            pixels[above] = 7;
            
            return;
        }else if(Math.random() < 0.5){
            let moveRight = Math.random() < 0.5 ? true:false;

            pixels[currentPixel] = 0;

            if(moveRight && x + 1 < canvasResolution && pixels[right] === 0){
                pixels[right] = 7;
            }else if(!moveRight && x >= 0 && pixels[left] === 0){
                pixels[left] = 7;
            }
        }
    }
};

function simulateFrame(){
    //might have problems with double frame pixel execution later
    for(let x = 0; x < canvasResolution; x++){
        for(let y = canvasResolution - 1; y >= 0; y--){
            const cell = pixels[(y) * canvasResolution + x];

            if (typeof behavior[cell] === 'function') {
                behavior[cell](x, y);
            }
        }
    }
}

function update(){
    simulateFrame();
    render();

    requestAnimationFrame(update);
}

update();