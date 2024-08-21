let game = document.getElementById('game');
let map = document.getElementById('map');

for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
        map.innerHTML += '<div class="tile"></div>'
    }
}