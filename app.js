const grid = document.querySelector('.grid')
const horn = document.querySelector('.horn')
let currentHornIndex = 189
let width = 14
let direction = 1
let goingRight = true
let neighboursId

for (let i = 0; i < 196; i++) {
    const square = document.createElement('div');
    grid.appendChild(square);
}

const spaces = Array.from(document.querySelectorAll('.grid div'))

spaces[currentHornIndex].classList.add('horn')

const angry = [
    0,1,2,3,4,5,6,7,8,9,
    14,23,
    28,29,34,35,36,37,
    42,43,44,45,46,47,48,49,50,51,
    56,57,58,59,60,61,62,63,64,65
]
const vAngry = [15,16,21,22,30,31,34,35]
const xAngry = [17,18,19,20,32,33]
const bottomRow = [182,183,184,185,186,187,188,189,190,191,192,193,194,195]
const neighbourClass = ['angry', 'v-angry', 'x-angry']

//const neighbours = angry.concat(vAngry, xAngry).sort((a,b) => (a-b));

function drawElements() {
    for (let i = 0; i < angry.length; i++) {
      spaces[angry[i]].classList.add('angry'); 
    };
    for (let i = 0; i < vAngry.length; i++) {
        spaces[vAngry[i]].classList.add('v-angry');
    };
    for (let i = 0; i < xAngry.length; i++) {
        spaces[xAngry[i]].classList.add('x-angry');
    };
}

drawElements()

function removeElements() {
    for (let i = 0; i < angry.length; i++) {
        spaces[angry[i]].classList.remove('angry'); 
      };
      for (let i = 0; i < vAngry.length; i++) {
          spaces[vAngry[i]].classList.remove('v-angry');
      };
      for (let i = 0; i < xAngry.length; i++) {
          spaces[xAngry[i]].classList.remove('x-angry');
      };
}

function moveHorn(e) {
    spaces[currentHornIndex].classList.remove('horn');
    switch(e.key) {
        case 'ArrowLeft':
            if (currentHornIndex % width !== 0) currentHornIndex -=1;
            break;
        case 'ArrowRight':
            if (currentHornIndex % width < width -1) currentHornIndex +=1;
            break;
    };
    spaces[currentHornIndex].classList.add('horn');
}

document.addEventListener('keydown', moveHorn)

function moveNeighbours()  {
    const leftEdge = angry[0] % width === 0;
    const rightEdge = angry[angry.length-1] % width === (width - 1);
    removeElements();

    if (rightEdge && goingRight) {
        direction = -1;
        goingRight = false;
        for (let i = 0; i < angry.length; i++) {
            angry[i] += width + 1;
        };
        for (let i = 0; i < vAngry.length; i++) {
            vAngry[i] += width + 1;
        };
        for (let i = 0; i < xAngry.length; i++) {
            xAngry[i] += width + 1;
        }; 
    }

    if (leftEdge && !goingRight) {
        direction = 1;
        goingRight = true;
        for (let i = 0; i < angry.length; i++) {
            angry[i] += width - 1;
        };
        for (let i = 0; i < vAngry.length; i++) {
            vAngry[i] += width - 1;
        };
        for (let i = 0; i < xAngry.length; i++) {
            xAngry[i] += width - 1;
        };     
    }

    for (let i = 0; i < angry.length; i++) {
        angry[i] += direction;
    };
    for (let i = 0; i < vAngry.length; i++) {
        vAngry[i] += direction;
    };
    for (let i = 0; i < xAngry.length; i++) {
        xAngry[i] += direction;
    };

    drawElements()

    if (bottomRow.some(i => neighbourClass.some(c => spaces[i].classList.contains(c)))) {
        //resultsDisplay.innerHTML = 'GAME OVER';
        console.log('Game Over');
        clearInterval(neighboursId);
    }



}

neighboursId = setInterval(moveNeighbours, 200)