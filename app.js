const grid = document.querySelector('.grid')
const horn = document.querySelector('.horn')
let currentHornIndex = 162
let width = 12

for (let i = 0; i < 168; i++) {
    const square = document.createElement('div');
    grid.appendChild(square);  
}

const spaces = Array.from(document.querySelectorAll('.grid div'))

const neighbours = [
    0,1,2,3,4,5,6,7,8,9,
    12,13,14,15,16,17,18,19,20,21,
    24,25,26,27,28,29,30,31,32,33,
    36,37,38,39,40,41,42,43,44,45,
    48,49,50,51,52,53,54,55,56,57
]

function draw() {
    for(i in neighbours) {
      spaces[neighbours[i]].classList.add('neighbour'); 
    }
}

draw()

spaces[currentHornIndex].classList.add('horn')

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