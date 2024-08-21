import AssetManager from "./asset_manager.js";

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    constructor(pos) {
        this.pos = pos;
    }
}

const assetManager = new AssetManager();
const MAP_VIEW_SIZE = 15;
let tileMap;
let player = new Player(new Vector(10,10));
let map = document.getElementById('map');
let mapTranslateY = document.getElementById('translate-y');
let mapTranslateX = document.getElementById('translate-x');
let input = {forward:'w',back:'s',left:'a',right:'d'};

// Testing
let coords = document.getElementById('coords');

for (let i = 0; i < (MAP_VIEW_SIZE + 2) ** 2; i++) {
    map.innerHTML += '<div class="tile"></div>'
}

document.addEventListener('keydown', function(e) {
    switch (e.key.toLowerCase()) {
        case input.forward:
            translateMap('forward');
            player.pos.y--;
            break;
        case input.back:
            translateMap('back');
            player.pos.y++;
            break;
        case input.left:
            translateMap('left');
            player.pos.x--;
            break;
        case input.right:
            translateMap('right');
            player.pos.x++;
            break;
    }

    drawMap();
    coords.innerText = player.pos.x + " " + player.pos.y;
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

function drawMap() {
    for (let i = 0; i < (MAP_VIEW_SIZE + 2); i++) {
        for (let j = 0; j < (MAP_VIEW_SIZE + 2); j++) {
            let x = i + (player.pos.x - 8);
            let y = j + (player.pos.y - 8);
            if (x < 0 || y < 0) {
                continue;
            }
            let tileDiv = map.children[matrixToArray(x,y)];
            switch (tileMap[x][y]) {
                case 0:
                    tileDiv.classList.remove('grass', 'stone');
                    break;
                case 1:
                    tileDiv.classList.add('grass');
                    tileDiv.classList.remove('stone');
                    break;
                case 2:
                    tileDiv.classList.add('stone');
                    tileDiv.classList.remove('grass');
            }
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

function assetManagerCallback() {
    tileMap = assetManager.get('map');
    tileMap = tileMap.split("\n");
    for (let i = 0; i < tileMap.length; i++) {
        tileMap[i] = tileMap[i].split(",");
        for (let j = 0; j < tileMap[i].length; j++) {
            tileMap[i][j] = parseInt(tileMap[i][j]);
        }
    }
}

function arrayToMatrix(arr) {
    let x = (arr % (MAP_VIEW_SIZE + 2));
    let y = Math.floor(y / ((MAP_VIEW_SIZE + 2)));
    return new Vector(x, y);
}

function matrixToArray(x, y) {
    return (x + (y * (MAP_VIEW_SIZE + 2)));
}

assetManager.loadFile('assets/map.csv', 'map', assetManagerCallback);