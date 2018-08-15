// get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// width of the canvas
const boardWidth = canvas.width;
// this value can be changed to create a [N x N] matrix
const boardSize = 11;
// size of each cell on the board
const tileWidth = (boardWidth / boardSize);


// objectsData will track positions of obstacles and weapons. playersData track position of players.
let objectsData, playersData;


const initMatrix = function() {
    /*
    function uses for ... loop to create two 2D arrays.
    [
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0]
    ]
    */
    objectsData = [];
    playersData = [];

    for (let i = 0; i < boardSize; i++) {
        let subArr = [];
        for (let j = 0; j < boardSize; j++) {
            subArr.push(0);
        }
        objectsData.push(subArr);
    }

    // create players Matrix
    for (let i = 0; i < boardSize; i++) {
        let subArr = [];
        for (let j = 0; j < boardSize; j++) {
            subArr.push(0);
        }
        playersData.push(subArr);
    }
}



/*
// in the objectsData matrix
0 - walkables
1: obstacles
4: weapon 1
5: weapon 2
6: weapon 3
7: weapon 4
8: weapom 0 (default)

// in the playersData
1: player 01
2: player 02
*/

// load images from DOM
const imgs = {
    obstacle: document.getElementById("obstacle"),
    player1: document.getElementById("player1"),
    player2: document.getElementById("player2"),
    weapon1: document.getElementById("weapon1"),
    weapon2: document.getElementById("weapon2"),
    weapon3: document.getElementById("weapon3"),
    weapon4: document.getElementById("weapon4"),
    weapon0: document.getElementById("weapon0")
}


// load DOMStrings (classes and IDs)

const DOMStrings = {
    "canvas": "#canvas",
    "player1DetailBox": ".detailBox--player1",
    "player2DetailBox": ".detailBox--player2",
    "player1LifePoint": "#player1_lifePoint",
    "player2LifePoint": "#player2_lifePoint",
    "player1Weapon": "#player1_weapon",
    "player2Weapon": "#player2_weapon",
    "player1Damage": "#player1_damage",
    "player2Damage": "#player2_damage",
    "player1ShieldState": "#player1_shield_state",
    "player2ShieldState": "#player2_shield_state",
    "rulesBox": ".rulesBox",
    "msgBox": "#message-box",
    "currentPlayer": "#playerInturn",
    "optionBtn": ".choice",
    "attackBtn": "#btn-attack",
    "defenseBtn": "#btn-defense",
    "newgameBtn": "button.btn--newgame",
    "rulesBtn": "button.btn--rules"
}
