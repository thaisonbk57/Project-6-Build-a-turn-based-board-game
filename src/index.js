// get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// set player
// 1: player 01 moves
// 2: player 01 moves
// 3: no one moves
let flag = 1;
// width of the canvas
const boardWidth = canvas.width;
// this value can be changed to create a [N x N] matrix
const boardSize = 11;
// size of each cell on the board
const tileWidth = boardWidth / boardSize;

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
};

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
};

// load DOMStrings (classes and IDs)

const DOMStrings = {
  canvas: "#canvas",
  player1DetailBox: ".detailBox--player1",
  player2DetailBox: ".detailBox--player2",
  player1LifePoint: "#player1_lifePoint",
  player2LifePoint: "#player2_lifePoint",
  player1Weapon: "#player1_weapon",
  player2Weapon: "#player2_weapon",
  player1Damage: "#player1_damage",
  player2Damage: "#player2_damage",
  player1ShieldState: "#player1_shield_state",
  player2ShieldState: "#player2_shield_state",
  rulesBox: ".rulesBox",
  msgBox: "#message-box",
  currentPlayer: "#playerInturn",
  optionBtn: ".choice",
  attackBtn: "#btn-attack",
  defenseBtn: "#btn-defense",
  newgameBtn: "button.btn--newgame",
  rulesBtn: "button.btn--rules"
};

const turnIntoCoord = function(x) {
  /*
  convert an Integer into [lat, long]

  INPUT:  integer, boardSize (N x N)

  OUTPUT: [lat, long]
  */

  //lat = index of ROW
  //long = index of COLUMN
  let long, lat;
  long = parseInt(x % boardSize);
  lat = Math.floor(x / boardSize);

  return [lat, long];
};

const distance = function(posA, posB) {
  /*
  calculate the distance between Point A[Ax, Ay] and Point B[Bx, By]
  using the formula: d = sqrt((x1-x2)^2 + (y1-y2)^2)
  */
  let distance = Math.sqrt(
    Math.pow(posA[0] - posB[0], 2) + Math.pow(posA[1] - posB[1], 2)
  );

  return distance;
};

const calcPath = function(currPos, target) {
  /* 
  INPUT: A[x, y]   &   B[x1, y1]
  OUTPUT: an array of points that the player would pass through, if he go from A to B
  */
  let d, cX, cY, tX, tY, path;

  d = distance(currPos, target);

  cX = currPos[0];
  cY = currPos[1];

  tX = target[0];
  tY = target[1];

  // if user clicks on the same line (horizontally || vertically)
  if (cX == tX || cY == tY) {
    path = [];

    // direction means backwards || forwards || up || down
    //  1 : forwards || down
    // -1 : backwards || up
    let direction = cY < tY || cX < tX ? 1 : -1;

    if (cX == tX) {
      //moving horizontally
      let moveY = cY;
      for (let i = 0; i < d; i++) {
        moveY += direction;
        path.push([cX, moveY]);
      }
    } else if (cY == tY) {
      //moving vertically
      let moveX = cX;
      for (let i = 0; i < d; i++) {
        moveX += direction;
        path.push([moveX, cY]);
      }
    }
  }

  return path;
};

const validatePath = function(path) {
  /* 
  function that check, if the moving path is possible from the current position.

  INPUT: [x, y] & path [[x1, y1], [x2, y2],...]

  OUTPUT: true / false
  */
  // if path is not undefined.
  if (path) {
    let d = path.length;
    // 1st condition is: maximal 3 cells
    if (d <= 3) {
      // loop through path with   for ... of ...
      for (let i of path) {
        // if there exists an obstacle || a player in the path, then return false immediately.
        if (
          objectsData[i[0]][i[1]] == 1 ||
          [1, 2].indexOf(playersData[i[0]][i[1]]) != -1
        ) {
          return false;
        }
      }
      return true;
    }
  } else {
    return false;
  }
};

const calcValidAreaToMove = function(playerPos) {
  /* depends on current position of player, the function will calculate all valid points on map that the player can move to in his turn, both horizontally and vertically

  // INPUT: player's current position [x, y]
  // OUTPUT: valid area that the player can move to in his turn.
              [[x1, y1]. [x2, y2],...]

  */

  let X = playerPos[0];
  let Y = playerPos[1];

  // max. 3 tiles each turn.
  let stepsMax = 3;

  // max. Area inside the board that Player can move (invalid points inclusive. Ex: a obstacle point)
  let movingArea = [];

  for (let i = -1 * stepsMax; i <= stepsMax; i++) {
    // all possible points on the same row
    if (0 <= Y + i && Y + i < boardSize && i != 0) {
      // points must be inside the board.
      let point = [X, Y + i];

      // path from the player to this point
      let path = calcPath(playerPos, point);

      // if the path is valid
      if (validatePath(path)) {
        movingArea.push(point);
      }
    }

    // all possible points in the same column
    if (0 <= X + i && X + i < boardSize && i != 0) {
      let point = [X + i, Y];

      // path from the player to this point
      let path = calcPath(playerPos, point);

      // if the path is valid
      if (validatePath(path)) {
        movingArea.push(point);
      }
    }
  }

  return movingArea;
};

const onWeapon = function(currPlayer) {
  /*
  the function check if the player is standing on a weapon.
  
  INPUT: current player position.
  OUTPUT: true / false
  */
  let weapons = [4, 5, 6, 7, 8]; // IDs of weapons on the board.

  let playerX = currPlayer.position[0];
  let playerY = currPlayer.position[1];

  return weapons.indexOf(objectsData[playerX][playerY]) != -1;
};

let player1, player2, weapon1, weapon2, weapon3, weapon4, weapon0;

// Super-class of Players
const Player = function() {};

Player.prototype = {
  constructor: Player,
  lifePoint: 100,
  shieldState: false,
  moveTo: function(target) {
    // INPUT: a point [x, y] on board that player clicked on
    // calculate the path to that point
    let path = calcPath(this.position, target);

    // if the path is valid.
    if (validatePath(path)) {
      // return a Promise. The state of Promise will turn into fullfilled if the path is done.
      return new Promise((resolve, reject) => {
        // during the movement set flag = 3, so that other player can't move
        flag = 3;

        // 1. one player click, then the click event will be deactivated to prevent clicking from other player.
        $(DOMStrings.canvas).off("click");

        // pathLength to move
        let pathLength = path.length;

        // 0.3s for a step
        const timer = 250;

        // total time to finish the path
        const timedone = timer * (pathLength + 1);

        // only if pathLength !== 0, then update the status of players and map. Otherwise, do nothing but updating the shield status
        if (pathLength != 0) {
          // temporary position index
          let tempPositionIndex = 0;

          // the player will move step by step with setInterval()
          let move = setInterval(() => {
            // temporary X and Y of current player.
            let tempX, tempY;

            tempX = path[tempPositionIndex][0];
            tempY = path[tempPositionIndex][1];

            // 1. update the value of PlayerID on the playersData
            playersData[tempX][tempY] = this.ID;

            // 2. reset the old position to 0.
            playersData[this.position[0]][this.position[1]] = 0;

            // 3. update this.position after each step
            this.position = [tempX, tempY];

            // 4. when 1 step finished, we must check if the player is tanding on a weapon
            if (onWeapon(this)) {
              this.swapWeapon();
            }

            // 5. if player finish the path, then stop the setInterval()
            if (tempPositionIndex == path.length - 1) {
              clearInterval(move);
            } else {
              // if not finished the path, then move to the next point in path
              tempPositionIndex++;
            }
            console.log("is moving.");
          }, timer);
        }

        // Set the state of Promise to fullfilled after  timedone.
        setTimeout(() => {
          resolve();
          console.log("moving done.");
        }, timedone);
      });
    }
  },

  swapWeapon: function() {
    // current coordinations of player
    let posX = this.position[0];
    let posY = this.position[1];

    let new__WeaponID = objectsData[posX][posY];

    // put down the old weapon on the map  objectsData.
    objectsData[posX][posY] = this.weapon.ID;

    // pick up the new weapon based on the weapon ID
    switch (new__WeaponID) {
      case 4:
        this.weapon = new Weapon1();
        break;
      case 5:
        this.weapon = new Weapon2();
        break;
      case 6:
        this.weapon = new Weapon3();
        break;
      case 7:
        this.weapon = new Weapon4();
        break;
      default:
        this.weapon = new Weapon0();
    }
  },

  fight: function(enemy) {
    // damage caused by enemy
    let getInjured;

    if (this.shieldState == true && enemy.shieldState == false) {
      getInjured = Math.floor(enemy.weapon.damage / 2);
    } else if (enemy.shieldState == true) {
      getInjured = 0;
    } else if (this.shieldState == false && enemy.shieldState == false) {
      getInjured = enemy.weapon.damage;
    }

    // update the lifePoint
    this.lifePoint -= getInjured;
    console.log("fight");
  },

  updateShieldState: function() {
    // choose to updateShieldState or attack

    // 1. show the board of options
    $(DOMStrings.msgBox).addClass("message-box--active");

    // 2. display the name of current player inside the message box
    $(DOMStrings.currentPlayer).text(`Next turn, ${this.name} chooses to ...`);

    console.log("shield.");
  }
};

// sub-class Player1
const Player1 = function() {
  this.name = "TOM";
  this.ID = 1;
};
Player1.prototype = Object.create(Player.prototype);
Player1.prototype.constructor = Player1;

// sub-class Player2
const Player2 = function() {
  this.name = "JERRY";
  this.ID = 2;
};
Player2.prototype = Object.create(Player.prototype);
Player2.prototype.constructor = Player2;

/*
create Weapon constructor
*/

const Weapon = function() {};

Weapon.prototype = {
  constructor: Weapon
};

const Weapon1 = function() {
  Weapon.call(this);
  this.name = "Weapon 1";
  this.ID = 4;
  this.damage = Math.floor(Math.random() * 6 + 8);
};

const Weapon2 = function() {
  Weapon.call(this);
  this.name = "Weapon 2";
  this.ID = 5;
  this.damage = Math.floor(Math.random() * 6 + 8);
};

const Weapon3 = function() {
  Weapon.call(this);
  this.name = "Weapon 3";
  this.ID = 6;
  this.damage = Math.floor(Math.random() * 6 + 8);
};

const Weapon4 = function() {
  Weapon.call(this);
  this.name = "Weapon 4";
  this.ID = 7;
  this.damage = Math.floor(Math.random() * 6 + 8);
};

const Weapon0 = function() {
  Weapon.call(this);
  this.name = "Default Weapon";
  this.ID = 8;
  this.damage = 10;
};

/*
create players and weapons function, which will be called later in the main.js/create() function
*/

const createPlayers = function() {
  player1 = new Player1();
  player2 = new Player2();
};

const createWeapons = function() {
  weapon0 = new Weapon0();
  weapon1 = new Weapon1();
  weapon2 = new Weapon2();
  weapon3 = new Weapon3();
  weapon4 = new Weapon4();
};

const tile_padding = 6;

// size of file images
const icon_real_size = 64;

// size of icon that appear on the board
const icon_drawn_size = tileWidth - 2 * tile_padding;

const drawGrid = function() {
  //draw the background.
  ctx.fillStyle = "#805006";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // using for loop to draw the grid
  for (let i = 1; i < boardSize; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "#A46400";
    //draw verticle lines of the board.
    ctx.moveTo(tileWidth * i, 0);
    ctx.lineTo(tileWidth * i, boardWidth);

    //draw the horizontal lines of the board.
    ctx.moveTo(0, tileWidth * i);
    ctx.lineTo(boardWidth, tileWidth * i);
    ctx.stroke();
  }

  // add black spots at crossing points of 2 line
  for (let i = 1; i < boardSize; i++) {
    for (let j = 1; j < boardSize; j++) {
      ctx.fillStyle = "black";
      ctx.fillRect(tileWidth * j - 1.2, tileWidth * i - 1.2, 2.5, 2.5);
      ctx.fill();
    }
  }
};

const drawObstacle = function(x, y) {
  /*
    draw an obstacle at [x, y] on the board.
    */
  let obstacle;
  obstacle = imgs.obstacle;
  x = x * tileWidth + 2 * tile_padding;
  y = y * tileWidth + tile_padding;

  ctx.drawImage(
    obstacle,
    0,
    0,
    icon_real_size,
    icon_real_size,
    y,
    x,
    icon_drawn_size,
    icon_drawn_size
  );
};

const drawWeapon = function(ID, x, y) {
  /*
    4: weapon 1
    5: weapon 2
    6: weapon 3
    7: weapon 4
    8: weapon 0 (default)
    */
  let weapon;
  x = x * tileWidth + tile_padding;
  y = y * tileWidth + tile_padding;
  switch (ID) {
    case 4:
      weapon = imgs.weapon1;
      break;
    case 5:
      weapon = imgs.weapon2;
      break;
    case 6:
      weapon = imgs.weapon3;
      break;
    case 7:
      weapon = imgs.weapon4;
      break;
    case 8:
      weapon = imgs.weapon0;
  }

  ctx.drawImage(
    weapon,
    0,
    0,
    icon_real_size,
    icon_real_size,
    y,
    x,
    icon_drawn_size,
    icon_drawn_size
  );
};

const drawPlayer = function(player) {
  /*
    1: player 1
    2: player 2
    */
  let playerImg;

  if (player.ID == 1) {
    playerImg = imgs.player1;
  } else if (player.ID == 2) {
    playerImg = imgs.player2;
  }

  let x = player.position[0] * tileWidth + 2 * tile_padding - 2.5;
  let y = player.position[1] * tileWidth + tile_padding;

  ctx.drawImage(
    playerImg,
    0,
    0,
    icon_real_size,
    icon_real_size,
    y,
    x,
    icon_drawn_size,
    icon_drawn_size
  );
};

const drawPossibleMoves = function(playerPos) {
  /*highlight all valid tiles that player can go to in his turn.*/

  // array of all valid points based on Player's current position
  let validPoints = calcValidAreaToMove(playerPos);

  // loop through the array and for each point, we draw a rectangle
  validPoints.forEach(curr => {
    let y = curr[0] * tileWidth + 4.5;
    let x = curr[1] * tileWidth + 4.5;
    ctx.strokeStyle = "#258391";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, tileWidth - 9, tileWidth - 9);
  });
};

$(document).ready(function() {
  const init = function() {
    // 0. set the flag
    flag = Math.floor(Math.random() * 2 + 1);

    // 1. create 2D-Array
    initMatrix();

    // 2. create the players and weapons.
    createWeapons();
    createPlayers();

    // 3. set random positions
    setRandomPosition();

    // 4. active the click event on canvas
    clickToMove();

    // 5. focus on a player that starts the game (by default)
    focusPlayer(flag);

    // 6. create the html content for the message box
    let msgBox_content =
      '<h2 id="playerInturn"></h2> <button class="btn choice attack" id="btn-attack">ATTACK</button> <button class="btn choice defense" id="btn-defense">DEFENSE</button>';

    $(DOMStrings.msgBox).html(msgBox_content);

    // 7. hide the message-box
    $(DOMStrings.msgBox).removeClass("message-box--active");
  };

  function setRandomPosition() {
    /*  
        The function set the random postions on the map from 00 - 99 and then will initially set up the objectsData matrix and playersData matrix as following:

        // in objectsData matrix
        0 - walkables
        1: obstacles
        4: weapon 1
        5: weapon 2
        6: weapon 3
        7: weapon 4
        8: weapon 0

        // in playersData matrix
        1: player 1
        2: player 2
        */
    let randomPositions, obstacles, weapons, players;
    randomPositions = [];
    players = [];

    // loop until we have 16 random numbers
    while (randomPositions.length != 16) {
      let i = Math.floor(Math.random() * Math.pow(boardSize, 2));
      //if (randomPositions.indexOf(i) == -1) {
      randomPositions.push(i);
      //}

      //positions of obstacles and weapon can be the same. If this happens, the weapon will be overwitten by the obstacle, and can not be collected by Players.
    }

    // 12 of 16 are position for obstacles
    obstacles = randomPositions.slice(0, 12);

    // 4 of 16 are positions for weapon
    weapons = randomPositions.slice(12);

    // random position for2 Players
    while (players.length != 2) {
      // get a random number
      let i = Math.floor(Math.random() * Math.pow(boardSize, 2));

      // if the number is unique
      if (players.indexOf(i) == -1 && randomPositions.indexOf(i) == -1) {
        players.push(i);
      }

      //if we have 2 posision, we need to make sure the distance between them != 1 at the beginning of game.
      if (players.length == 2) {
        //posA, posB in format [Ax,Ay]  && [Bx,By]
        let posA = turnIntoCoord(players[0]);
        let posB = turnIntoCoord(players[1]);

        // if distance == 1, then they pop out the 2nd position and re-loop the while loop to get a new position.
        if (distance(posA, posB) == 1) {
          players.pop();
        }
      }
    }

    // now we have all the positions of things on the map but in the Integer format.
    // We want to convert all the position to format [long, lat]
    // Apply map() function for Array and using the turnIntoCoord() function to achieve that.

    obstacles = obstacles.map(curr => (curr = turnIntoCoord(curr)));
    weapons = weapons.map(curr => (curr = turnIntoCoord(curr)));
    players = players.map(curr => (curr = turnIntoCoord(curr)));

    // Now, we have 3 arrays  obstacles, weapons, players. We need to initiate the objectsData matrix by using forEach();

    // weapons are represented by numbers from 4 to 7
    weapons.forEach((curr, index) => {
      objectsData[curr[0]][curr[1]] = index + 4;
    });

    // players are represented on the board playersData by 1 || 2
    players.forEach((curr, index) => {
      playersData[curr[0]][curr[1]] = index + 1;
    });

    // Obstacles are representedby 1
    obstacles.forEach(curr => {
      objectsData[curr[0]][curr[1]] = 1;
    });

    // 4. assign default weapon to both players.
    player1.weapon = weapon0;
    player2.weapon = weapon0;

    // 5. assign position for players
    player1.position = players[0];
    player2.position = players[1];
  }

  const renderScene = function() {
    drawGrid();

    // 2. Loop through the objectsData matrix and playersData matrix to position draw corresponding things on map
    let tileType = 0;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        tileType = objectsData[i][j];

        // where in the matrix the number 1
        if (tileType == 1) {
          drawObstacle(i, j);

          // if there is a Player01 at the coordination
        } else if (player1.position[0] == i && player1.position[1] == j) {
          drawPlayer(player1);

          // if there is a Player02 at the coordination
        } else if (player2.position[0] == i && player2.position[1] == j) {
          drawPlayer(player2);

          // if value from 4 - 8, then draw weapons.
        } else if ([4, 5, 6, 7, 8].indexOf(tileType) != -1) {
          drawWeapon(tileType, i, j);
        } else {
        }
      }
    }
  };

  const renderPlayerDetails = function() {
    // Update player's detail in the detailBox (both sides of the canvas)
    let p1_health,
      p2_health,
      p1_weapon,
      p2_weapon,
      p1_shield_state,
      p2_shield_state;

    p1_health = player1.lifePoint < 0 ? 0 : player1.lifePoint;
    p1_weapon = player1.weapon;
    p1_shield_state = player1.shieldState == false ? "ATTACK" : "DEFENSE";

    p2_health = player2.lifePoint < 0 ? 0 : player2.lifePoint;
    p2_weapon = player2.weapon;
    p2_shield_state = player2.shieldState == false ? "ATTACK" : "DEFENSE";

    $(DOMStrings.player1LifePoint).text(p1_health);
    $(DOMStrings.player1ShieldState).text(p1_shield_state);
    $(DOMStrings.player1Damage).text(p1_weapon.damage);

    $(DOMStrings.player2LifePoint).text(p2_health);
    $(DOMStrings.player2ShieldState).text(p2_shield_state);
    $(DOMStrings.player2Damage).text(p2_weapon.damage);

    switch (p1_weapon.ID) {
      case 4:
        $(DOMStrings.player1Weapon).attr("src", "img/weapons/w1-big.png");
        break;
      case 5:
        $(DOMStrings.player1Weapon).attr("src", "img/weapons/w2-big.png");
        break;
      case 6:
        $(DOMStrings.player1Weapon).attr("src", "img/weapons/w3-big.png");
        break;
      case 7:
        $(DOMStrings.player1Weapon).attr("src", "img/weapons/w4-big.png");
        break;
      default:
        $(DOMStrings.player1Weapon).attr("src", "img/weapons/w0-big.png");
    }

    switch (p2_weapon.ID) {
      case 4:
        $(DOMStrings.player2Weapon).attr("src", "img/weapons/w1-big.png");
        break;
      case 5:
        $(DOMStrings.player2Weapon).attr("src", "img/weapons/w2-big.png");
        break;
      case 6:
        $(DOMStrings.player2Weapon).attr("src", "img/weapons/w3-big.png");
        break;
      case 7:
        $(DOMStrings.player2Weapon).attr("src", "img/weapons/w4-big.png");
        break;
      default:
        $(DOMStrings.player2Weapon).attr("src", "img/weapons/w0-big.png");
    }
  };

  const beginFight = function(player1, player2) {
    /*
        use to check if a fight can begin.
        */
    console.log("is checking fight.");
    // if 2 players stand next to each other. Then call the beginFight method of each player.
    if (distance(player1.position, player2.position) == 1) {
      player1.fight(player2);
      player2.fight(player1);
    }

    return new Promise((resolve, reject) => {
      // return promise to make sure the fight is finished, before we check if the game is over.
      resolve();
    });
  };

  const gameover = function() {
    // set the condition to end the game.
    let p1_blood = player1.lifePoint;
    let p2_blood = player2.lifePoint;

    // the game ends if one of 2 players are dead or both
    if (p1_blood <= 0 || p2_blood <= 0) {
      let msg;

      // if both players die at the same time.
      if (p1_blood <= 0 && p2_blood <= 0) {
        msg = `<h3>Draw</h3><h2>GAME OVER</h2>`;
      } else if (p2_blood > 0) {
        msg = `<h3> ${player2.name} won.</h3><h2>GAME OVER</h2>`;
      } else {
        msg = `<h3> ${player1.name} won.</h3><h2>GAME OVER</h2>`;
      }

      // display the message to message-box
      $(DOMStrings.msgBox).html(msg);
      // add class active to the msg-box
      $(DOMStrings.msgBox).addClass("message-box--active");
    } else {
      // if the game is not end. Then return a Promise and let player update shield.
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  };

  const update = function() {
    /*
        this function will be called with setInterval() to make sure the board always be up-to-date
        */
    renderScene();
    renderPlayerDetails();

    // draw possible moves of current player
    if (flag == 1) {
      drawPossibleMoves(player1.position);
    } else if (flag == 2) {
      drawPossibleMoves(player2.position);
    }
  };

  const clickToMove = function() {
    // move the current player with click event
    $(DOMStrings.canvas).on("click", function(e) {
      let currentPlayer;

      // 1. grap the current player.
      let players = [player1, player2];

      //console.log(e.pageX, e.pageY);
      //console.log($(this).offset().left, $(this).offset().top);

      // 2. calculate the clicked point on the map
      let x = Math.floor((e.pageX - $(this).offset().left) / tileWidth);
      let y = Math.floor((e.pageY - $(this).offset().top) / tileWidth);

      let target = [y, x];

      console.log(flag);
      // 3. move the player based on the flag value
      if (flag == 1) {
        currentPlayer = players[0];
      } else if (flag == 2) {
        currentPlayer = players[1];
      } else {
        currentPlayer = null;
      }

      // 4. we use Asynchronous Promise.
      // move -> check fight -> check game over -> update shield.
      currentPlayer
        .moveTo(target)
        .then(() => {
          return beginFight(player1, player2);
        })
        .then(() => {
          return gameover();
        })
        .then(() => {
          currentPlayer.updateShieldState();
        });

      // 5. if click on attack button then shieldState = false, else true
      // we must unbind the "click" event first to avoid double-binding
      $(DOMStrings.optionBtn)
        .unbind("click")
        .on("click", e => {
          // 1. which button was clicked on?
          let btn = e.target;

          if (btn.id == "btn-attack") {
            currentPlayer.shieldState = false;
          } else if (btn.id == "btn-defense") {
            currentPlayer.shieldState = true;
          }

          // 2. hide the message-box
          $(DOMStrings.msgBox).removeClass("message-box--active");

          // 3. in the moveTo() method of Player(), we set flag = 3. After choosing defense || attack, set the flag to currentPlayer.ID
          flag = currentPlayer.ID;

          // 4. swap the player
          flag == 1 ? (flag = 2) : (flag = 1);

          // 5. focus on the next Player
          focusPlayer(flag);

          // 6. re-active click event for the canvas
          clickToMove();
        });
    });
  };

  const focusPlayer = function(flag) {
    if (flag == 1) {
      $(DOMStrings.player2DetailBox).removeClass("active");
      $(DOMStrings.player1DetailBox).addClass("active");
    } else if (flag == 2) {
      $(DOMStrings.player1DetailBox).removeClass("active");
      $(DOMStrings.player2DetailBox).addClass("active");
    }
  };

  // RULES button
  $(DOMStrings.rulesBtn)
    .unbind("click")
    .on("click", function(e) {
      e.preventDefault();
      $(DOMStrings.rulesBox).toggleClass("rules-active");
    });

  // NEW GAME button
  $(DOMStrings.newgameBtn)
    .unbind("click")
    .on("click", function(e) {
      // initiate the game
      init();

      //update the UI with speed of 60 frames per Second
      setInterval(update, 1000 / 60);

      // random damage of weapon each 3s
      // setInterval(createWeapons, 3000);

      // hide the RULES box if it's on display.
      $(DOMStrings.rulesBox).removeClass("rules-active");
    });

  drawGrid();
});
