const MAP_VIEW_SIZE = 15;
let map = document.getElementById('map');
let mapTranslateY = document.getElementById('translate-y');
let mapTranslateX = document.getElementById('translate-x');
let input = {forward:'w',back:'s',left:'a',right:'d'};

for (let i = 0; i < (MAP_VIEW_SIZE + 2); i++) {
    for (let j = 0; j < (MAP_VIEW_SIZE + 2); j++) {
        map.innerHTML += '<div class="tile"></div>'
    }
}

document.addEventListener('keydown', function(e) {
    switch (e.key.toLowerCase()) {
        case input.forward:
            translateMap('forward');
            break;
        case input.back:
            translateMap('back');
            break;
        case input.left:
            translateMap('left');
            break;
        case input.right:
            translateMap('right');
            break;

    }
});

function translateMap(direction) {
    switch(direction) {
        case 'forward':
            mapTranslateY.style.transform = `translateY(calc(100vh / ${MAP_VIEW_SIZE}))`;
            mapTranslateY.style.transition = `transform 0.13s`;
            break;
        case 'back':
            mapTranslateY.style.transform = `translateY(calc(-100vh / ${MAP_VIEW_SIZE}))`;
            mapTranslateY.style.transition = `transform 0.13s`;
            break;
        case 'left':
            mapTranslateX.style.transform = `translateX(calc(100vh / ${MAP_VIEW_SIZE}))`;
            mapTranslateX.style.transition = `transform 0.13s`;
            break;
        case 'right':
            mapTranslateX.style.transform = `translateX(calc(-100vh / ${MAP_VIEW_SIZE}))`;
            mapTranslateX.style.transition = `transform 0.13s`;
            break;
    }
}

function movePlayer(x, y) {
    for (let i = 0; i < (MAP_VIEW_SIZE + 2); i++) {
        for (let j = 0; j < (MAP_VIEW_SIZE + 2); j++) {

        }
    }
}

mapTranslateY.addEventListener('transitionend', function() {
    mapTranslateY.style.transform = 'translate(0, 0)';
    mapTranslateY.style.transition = 'transform 0s';
});

mapTranslateX.addEventListener('transitionend', function() {
    mapTranslateX.style.transform = 'translate(0, 0)';
    mapTranslateX.style.transition = 'transform 0s';
});

