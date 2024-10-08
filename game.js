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
let player = new Player(new Vector(4,4));
let map = document.getElementById('map');
let mapTranslateY = document.getElementById('translate-y');
let mapTranslateX = document.getElementById('translate-x');
let input = {forward:'w',back:'s',left:'a',right:'d'};
let immovableTiles = [2, 3];

// Testing
let coords = document.getElementById('coords');

for (let i = 0; i < (MAP_VIEW_SIZE + 2) ** 2; i++) {
    map.innerHTML += '<div class="tile"></div>'
}

document.addEventListener('keydown', function(e) {
    switch (e.key.toLowerCase()) {
        case input.forward:
            if (!tileIsMovable(player.pos.x, player.pos.y - 1)) {
                break;
            }
            translateMap('forward');
            player.pos.y--;
            break;
        case input.back:
            if (!tileIsMovable(player.pos.x, player.pos.y + 1)) {
                break;
            }
            translateMap('back');
            player.pos.y++;
            break;
        case input.left:
            if (!tileIsMovable(player.pos.x - 1, player.pos.y)) {
                break;
            }
            translateMap('left');
            player.pos.x--;
            break;
        case input.right:
            if (!tileIsMovable(player.pos.x + 1, player.pos.y)) {
                break;
            }
            translateMap('right');
            player.pos.x++;
            break;
    }
    drawMap();
    coords.innerText = player.pos.x + " " + player.pos.y; // Testing
});

function translateMap(direction) {
    const speed = `0.13s`;
    switch(direction) {
        case 'forward':
            mapTranslateY.style.animation = `none`
            void mapTranslateY.offsetWidth;
            mapTranslateY.style.animation = `move-down ` + speed;
            break;
        case 'back':
            mapTranslateY.style.animation = `none`
            void mapTranslateY.offsetWidth;
            mapTranslateY.style.animation = `move-up ` + speed;
            break;
        case 'left':
            mapTranslateX.style.animation = `none`
            void mapTranslateX.offsetWidth;
            mapTranslateX.style.animation = `move-right ` + speed;
            break;
        case 'right':
            mapTranslateX.style.animation = `none`
            void mapTranslateX.offsetWidth;
            mapTranslateX.style.animation = `move-left ` + speed;
            break;
    }
}

function drawMap() {
    for (let i = 0; i < (MAP_VIEW_SIZE + 2); i++) {
        for (let j = 0; j < (MAP_VIEW_SIZE + 2); j++) {
            let x = i + (player.pos.x - 8);
            let y = j + (player.pos.y - 8);

            let div = map.children[matrixToArray(i,j)];
            if (div === undefined || div === null) {
                console.log("Div. x: " + x + " y: " + y + " i: " + i + " j: " + j);
                continue;
            }

            let classList = div.classList;
            if (classList === undefined || classList === null) {
                console.log("classlist. x: " + x + " y: " + y + " i: " + i + " j: " + j);
                continue;
            }

            if (x < 0 || y < 0) {
                classList.remove('grass', 'stone');
                continue;
            }

            if (x > tileMap[0].length - 1 || y > tileMap[0].length - 1) {
                classList.remove('grass', 'stone');
                continue;
            }

            switch (tileMap[x][y]) {
                case 0:
                    classList.remove('grass', 'stone');
                    break;
                case 1:
                    classList.add('grass');
                    classList.remove('stone');
                    break;
                case 2:
                    classList.add('stone');
                    classList.remove('grass');
            }
        }
    }
}

function tileIsMovable(x, y) {
    if (immovableTiles.includes(tileMap[x][y])) {
        return false;
    }
    return true;
}

function assetManagerCallback() {
    tileMap = assetManager.get('map');
    tileMap = tileMap.split("\n");
    for (let i = 0; i < tileMap.length; i++) {
        tileMap[i] = tileMap[i].split(",");
        for (let j = 0; j < tileMap[i].length; j++) {
            tileMap[i][j] = parseInt(tileMap[i][j]);
        }
    }
    drawMap();
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