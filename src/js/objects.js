let player1, player2, weapon1, weapon2, weapon3, weapon4, weapon0;


// Super-class of Players
const Player = function() {}

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
                    tempPositionIndex = 0;

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
                    console.log("moving done.")
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
        };
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

        console.log("shield.")
    }
}


// sub-class Player1
const Player1 = function() {
    this.name = "TOM";
    this.ID = 1;
}
Player1.prototype = Object.create(Player.prototype);
Player1.prototype.constructor = Player1;


// sub-class Player2
const Player2 = function() {
    this.name = "JERRY";
    this.ID = 2;
}
Player2.prototype = Object.create(Player.prototype);
Player2.prototype.constructor = Player2;








/*
create Weapon constructor
*/

const Weapon = function() {}

Weapon.prototype = {
    constructor: Weapon
}

const Weapon1 = function() {
    Weapon.call(this);
    this.name = "Weapon 1";
    this.ID = 4;
    this.damage = Math.floor(Math.random() * 6 + 8);
}

const Weapon2 = function() {
    Weapon.call(this);
    this.name = "Weapon 2";
    this.ID = 5;
    this.damage = Math.floor(Math.random() * 6 + 8);
}

const Weapon3 = function() {
    Weapon.call(this);
    this.name = "Weapon 3";
    this.ID = 6;
    this.damage = Math.floor(Math.random() * 6 + 8);
}

const Weapon4 = function() {
    Weapon.call(this);
    this.name = "Weapon 4";
    this.ID = 7;
    this.damage = Math.floor(Math.random() * 6 + 8);
}

const Weapon0 = function() {
    Weapon.call(this);
    this.name = "Default Weapon";
    this.ID = 8;
    this.damage = 10;
}



/*
create players and weapons function, which will be called later in the main.js/create() function
*/

const createPlayers = function() {
    player1 = new Player1();
    player2 = new Player2();
}

const createWeapons = function() {
    weapon0 = new Weapon0();
    weapon1 = new Weapon1();
    weapon2 = new Weapon2();
    weapon3 = new Weapon3();
    weapon4 = new Weapon4();
}