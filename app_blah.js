const grid = document.querySelector('.grid');
const width = 14;
const height = 14;
const noteClasses = ['note1', 'note2', 'note3', 'note4', 'note5'];
const explClasses = ['expl1', 'expl2', 'expl3', 'expl4', 'expl5'];
const neighbourClasses = ['x-angry', 'v-angry', 'angry'];
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
        this._cssClass = cssClass;
    }

    gridIndex() {
        return this.yCoord * width + this.xCoord;
    }

    get cssClass() {
        return this._cssClass;
    }
}

class Neighbour extends Entity {
    constructor(xCoord, yCoord, health) {
        super(xCoord, yCoord, null);
        this.health = health;
    }

    get cssClass() {
        return neighbourClasses[this.health - 1];
    }
}

class Note extends Entity {
    constructor(xCoord, yCoord) {
        const cssClass = noteClasses[Math.floor(Math.random() * noteClasses.length)];
        super(xCoord, yCoord, cssClass);
    }
}

class Expletive extends Entity {
    constructor(xCoord, yCoord) {
        const cssClass = explClasses[Math.floor(Math.random() * explClasses.length)];
        super(xCoord, yCoord, cssClass);
    }
}

class Horn extends Entity {
    constructor(xCoord, yCoord, health) {
        super(xCoord, yCoord, null);
        this.health = health;
        this.lastHitTime = 0;
    }

    get cssClass() {
        if (Date.now() - this.lastHitTime > 500) {
            return 'horn';
        } else { 
            return 'dead-horn';
        }
    }
}

const horn = new Horn(7, height - 1, 3);
const notes = [];
const expletives = [];
const neighbours = [];

for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 10; x++) {
        const distance = Math.abs(x - 4.5) + y;
        let health = 3;
        if (distance > 5) {
            health = 1;
        } else if (distance > 3) {
            health = 2;
        }   

        const neighbour = new Neighbour(x, y, health);
        neighbours.push(neighbour);
    }
}

spaces[horn.gridIndex()].classList.add('horn');

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
        notes.push(new Note(horn.xCoord, height - 1));
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
                expletives.push(new Expletive(shooter.xCoord, shooter.yCoord + 1)); 
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
            if(hitNeighbour.health === 0) {
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