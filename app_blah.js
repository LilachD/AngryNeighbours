const grid = document.querySelector('.grid');
const horn = document.querySelector('.horn');
let currentHornX = 7;
let hornHealth = 3;
const width = 14;
const height = 14;
let direction = 1;
let goingRight = true;
let lastNeighbourUpdate = Date.now();
let neighboursId;

for (let i = 0; i < 196; i++) {
    const square = document.createElement('div');
    grid.appendChild(square);
}

const spaces = Array.from(document.querySelectorAll('.grid div'));

class Neighbour {
    constructor(xCoord, yCoord, cssClass, health) {
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.cssClass = cssClass;
        this.health = health;
    }

    gridIndex() {
        return this.yCoord * width + this.xCoord;
    }
}

class Note {
    constructor(xCoord, yCoord, cssClass) {
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.cssClass = cssClass;
    }

    gridIndex() {
        return this.yCoord * width + this.xCoord;
    }
}

class Expletive {
    constructor(xCoord, yCoord, cssClass) {
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.cssClass = cssClass;
    }

    gridIndex() {
        return this.yCoord * width + this.xCoord;
    }
}

const notes = [];
const expletives = [];
const neighbours = [];

for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 10; x++) {
        const neighbour = new Neighbour(x, y, 'angry', 1);
        neighbours.push(neighbour);
    }
}

function hornIndex() {
    return (height - 1) * width + currentHornX;
}

spaces[hornIndex()].classList.add('horn');


// const angry = [
//     0,1,2,3,4,5,6,7,8,9,
//     14,23,
//     28,29,34,35,36,37,
//     42,43,44,45,46,47,48,49,50,51,
//     56,57,58,59,60,61,62,63,64,65
// ]
// const vAngry = [15,16,21,22,30,31,34,35]
// const xAngry = [17,18,19,20,32,33]
// const bottomRow = [182,183,184,185,186,187,188,189,190,191,192,193,194,195]
// const neighbourClass = ['angry', 'v-angry', 'x-angry']


function drawElements() {
    for (const neighbour of neighbours) {
        spaces[neighbour.gridIndex()].classList.add(neighbour.cssClass);
    }
    for (const note of notes) {
        spaces[note.gridIndex()].classList.add(note.cssClass);
    }
    for (const expl of expletives) {
        spaces[expl.gridIndex()].classList.add(expl.cssClass);
    }
}

drawElements()

// Can we remove all neighbours from grid without iterating?
function removeElements() {
    for (const neighbour of neighbours) {
        spaces[neighbour.gridIndex()].classList.remove(neighbour.cssClass);
    }
    for (const note of notes) {
        spaces[note.gridIndex()].classList.remove(note.cssClass);
    }
    for (const expl of expletives) {
        spaces[expl.gridIndex()].classList.remove(expl.cssClass);
    }
}

let keyStates = {};

document.addEventListener("keydown", e => keyStates[e.key] = true);

document.addEventListener("keyup", e => keyStates[e.key] = false);


function moveHorn(direction) {
    spaces[hornIndex()].classList.remove('horn');
    currentHornX += direction;
    if (currentHornX < 0) currentHornX = 0;
    if (currentHornX > width - 1) currentHornX = width - 1;
    spaces[hornIndex()].classList.add('horn');
}


function updateBoard() {
    const now = Date.now();
    let spaceBarLastState = false;
    
    removeElements();

    if (keyStates['ArrowRight']) {
        moveHorn(1);
    }
    if (keyStates['ArrowLeft']) {
        moveHorn(-1);
    }

    if (keyStates[' '] && !spaceBarLastState) {
        notes.push(new Note(currentHornX, height - 1, 'note1'));
        keyStates[' '] = false;
        spaceBarLastState = true;
    } else if (keyStates[' '] && spaceBarLastState) {
        keyStates[' '] = false;
        spaceBarLastState = false;
    }
    
    // updateNeighbourGrid();

    updateNotes();
    updateExpls();
    checkForHits();

    const shooters = getFrontNeighbours();
    for (const shooter of shooters) {
        if (shooter.yCoord < height - 2 && Math.floor(Math.random() * shooters.length * 10) === shooter.xCoord) {
            expletives.push(new Expletive(shooter.xCoord, shooter.yCoord + 1, 'expl1')); 
        }
    }

    if (now - lastNeighbourUpdate > 300) {
        lastNeighbourUpdate = now;
        moveNeighbours();
        checkForHits();
    }

    drawElements();
        
    //Game-Over
    if (neighbours.length === 0) {
        console.log('WINNER');
        clearInterval(neighboursId);
    }
    if (hornHealth === 0 || neighbours.some(n => n.yCoord === height - 1)) {
        console.log('Game Over');
        // resultsDisplay.innerHTML = 'GAME OVER';
        clearInterval(neighboursId);
    }
}

function updateNotes() {
    for (const note of Array.from(notes)) {
        note.yCoord -= 1;
        if (note.yCoord < 0) {
            index = notes.indexOf(note);
            notes.splice(index, 1);    
        }
    }
}

function updateExpls() {
    for (const expl of Array.from(expletives)) {
        expl.yCoord += 1;
        if (expl.yCoord > height - 1) {
            index = expletives.indexOf(expl);
            expletives.splice(index, 1);    
        }
    }
}

// optimise?? create an array of grid indexes
function checkForHits() {
    for (const note of Array.from(notes)) {
        const hitNeighbour = neighbours.find(n => n.gridIndex() === note.gridIndex())
        if(hitNeighbour) {
            notes.splice(notes.indexOf(note), 1);
            hitNeighbour.health --;
            if(hitNeighbour.health == 0) {
                neighbours.splice(neighbours.indexOf(hitNeighbour), 1);
            }            
        }        
    }

    if (expletives.find(e => e.gridIndex() === hornIndex())) {
            // remove expl cssClass
            hornHealth --;
        }            
}

function moveNeighbours() {
    const leftEdge = neighbours.some(n => n.xCoord === 0);
    const rightEdge = neighbours.some(n => n.xCoord === width - 1);

    if (rightEdge && goingRight) {
        direction = -1;
        goingRight = false;
        for (const neighbour of neighbours) {
            neighbour.yCoord++;
            neighbour.xCoord++;
        }
    }

    if (leftEdge && !goingRight) {
        direction = 1;
        goingRight = true;
        for (const neighbour of neighbours) {
            neighbour.yCoord++;
            neighbour.xCoord--;
        }
    } 
    

    for (const neighbour of neighbours) {
        neighbour.xCoord += direction;
    }

}

function getFrontNeighbours() {
    const frontNeighbourByX = new Array(width).fill(null);

    for (const neighbour of neighbours) {
        const x = neighbour.xCoord;
        const frontNeighbour = frontNeighbourByX[x];
        if (frontNeighbour == null || neighbour.yCoord > frontNeighbour.yCoord) {
            frontNeighbourByX[x] = neighbour;
        }
    }

    return frontNeighbourByX.filter(n => n != null);
}




neighboursId = setInterval(updateBoard, 100)