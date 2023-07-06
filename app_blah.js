const grid = document.querySelector('.grid');
const width = 14;
const height = 14;
let direction = 1;
let lastNeighbourUpdate = Date.now();
let lastEnemyShot = Date.now();
let neighboursId;

for (let i = 0; i < 196; i++) {
    const square = document.createElement('div');
    grid.appendChild(square);
}

const spaces = Array.from(document.querySelectorAll('.grid div'));

class Entity {
    constructor(xCoord, yCoord, cssClass) {
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.cssClass = cssClass;
    }

    gridIndex() {
        return this.yCoord * width + this.xCoord;
    }
}

class Neighbour extends Entity {
    constructor(xCoord, yCoord, cssClass, health) {
        super(xCoord, yCoord, cssClass);
        this.health = health;
    }
}

class Note extends Entity {
    constructor(xCoord, yCoord, cssClass) {
        super(xCoord, yCoord, cssClass);
    }
}

class Expletive extends Entity {
    constructor(xCoord, yCoord, cssClass) {
        super(xCoord, yCoord, cssClass);
    }
}

class Horn extends Entity {
    constructor(xCoord, yCoord, cssClass, health) {
        super(xCoord, yCoord, cssClass);
        this.health = health;
    }
}

const horn = new Horn(7, height - 1, 'horn', 3);
const notes = [];
const expletives = [];
const neighbours = [];

for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 10; x++) {
        const neighbour = new Neighbour(x, y, 'angry', 1);
        neighbours.push(neighbour);
    }
}

spaces[horn.gridIndex()].classList.add('horn');


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
let spaceBarHit = false;

document.addEventListener("keydown", e => {
    keyStates[e.key] = true;
    if (e.key === ' ') {
        spaceBarHit = true;
    }
});

document.addEventListener("keyup", e => keyStates[e.key] = false);


function moveHorn(direction) {
    spaces[horn.gridIndex()].classList.remove('horn');
    horn.xCoord += direction;
    if (horn.xCoord < 0) horn.xCoord = 0;
    if (horn.xCoord > width - 1) horn.xCoord = width - 1;
    spaces[horn.gridIndex()].classList.add('horn');
}


function updateBoard() {
    const now = Date.now();
    
    removeElements();

    if (keyStates['ArrowRight']) {
        moveHorn(1);
    }
    if (keyStates['ArrowLeft']) {
        moveHorn(-1);
    }

    if (spaceBarHit) {
        notes.push(new Note(horn.xCoord, height - 1, 'note1'));
    }
    spaceBarHit = false;

    updateNotes();
    updateExpls();
    checkForHits();

    if (now - lastEnemyShot > 900 || Math.random() < 0.1) {
        lastEnemyShot = now;
        const shooters = getFrontNeighbours();
        if (shooters.length > 0) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            if (shooter.yCoord < height - 2) {
                expletives.push(new Expletive(shooter.xCoord, shooter.yCoord + 1, 'expl1')); 
            }
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
    if (horn.health <= 0 || neighbours.some(n => n.yCoord === height - 1)) {
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
        if (expl.gridIndex() === horn.gridIndex()) {
            horn.health --;
            console.log('damaged!', horn.health);
            expletives.splice(expletives.indexOf(expl), 1);
        } else if (expl.yCoord > height - 1) {
            expletives.splice(expletives.indexOf(expl), 1);    
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
}

function moveNeighbours() {
    const leftEdge = neighbours.some(n => n.xCoord === 0);
    const rightEdge = neighbours.some(n => n.xCoord === width - 1);

    if (rightEdge && direction > 0) {
        direction = -1;
        for (const neighbour of neighbours) {
            neighbour.yCoord++;
            neighbour.xCoord++;
        }
    }

    if (leftEdge && direction < 0) {
        direction = 1;
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