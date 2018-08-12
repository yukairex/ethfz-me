"use strict";

var Grid = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.owner = obj.owner;
        this.coinRate = obj.coinRate;
        this.lastUpdatePowerTimestamp = obj.lastUpdatePowerTimestamp;
        this.power = obj.power;
        this.powerRate = obj.powerRate;  // power growth cityLevel eveny minutes
    } else {
        this.id = 0;
        this.owner = "";
        this.coinRate = 0;
        this.lastUpdatePowerTimestamp = 0;
        this.power = 0;
        this.powerRate = 0;
    }
};

Grid.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var warState = {
    "register": 0,
    "running": 1,
    "complete": 2
}

var GridContract = function () {
    LocalContractStorage.defineProperty(this, "owner");
    // map size
    LocalContractStorage.defineProperty(this, "width");
    LocalContractStorage.defineProperty(this, "height");
    LocalContractStorage.defineProperty(this, "balance", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    // map info for (a,b) => a*width+b  (0<=a<=n-1, 0<=b<=n-1)
    LocalContractStorage.defineMapProperty(this, "mapGridInfo");
    LocalContractStorage.defineMapProperty(this, "mapUserGameId");
    // for coin
    LocalContractStorage.defineMapProperty(this, "mapUserCoin");
    LocalContractStorage.defineMapProperty(this, "mapUserLastCoinUpdateTimestamp");
    LocalContractStorage.defineMapProperty(this, "mapUserCoinRate");
    // for battle
    LocalContractStorage.defineMapProperty(this, "mapUserGridNumber"); // 0 then you fail
    LocalContractStorage.defineMapProperty(this, "mapUserLastOperateTimestamp");  // 1 minutes 1 operation

    // => init
    LocalContractStorage.defineProperty(this, "maxPlayerNumber");
    LocalContractStorage.defineProperty(this, "currentPlayerNumber");
    LocalContractStorage.defineProperty(this, "currentGameId");
    LocalContractStorage.defineProperty(this, "currentGameState");

    // => run

    // => end

    // => stats
};

GridContract.prototype = {
    init: function () {
        this.owner = Blockchain.transaction.from;
        this.balance = new BigNumber(0);
        this.currentGameId = 0;
        this.currentGameState = warState.complete;

        // for debug
        this.debugStep();
    },
    getOwner: function() {
        return this.owner;
    },
    debugStep: function() {
        this.createNewGame(10,10,5);
    },
    // create grid map
    createNewGame: function (width, height, maxPlayer) {
        width = parseInt(width);
        height = parseInt(height);
        maxPlayer = parseInt(maxPlayer);
        this.currentGameId += 1;
        this.maxPlayerNumber = parseInt(maxPlayer);
        this.currentPlayerNumber = 0;
        this.width = parseInt(width);
        this.height = parseInt(height);
        // random all the grid
        for (var i = 0; i < height; i++)
            for (var j = 0; j < width; j++) {
                var dice = Math.floor(Math.random() * 100) % 10;
                if (i == j || i + j == width) {
                    dice = Math.floor(Math.random() * 100) % 100;
                }
                var grid = new Grid();
                grid.id = i*parseInt(width)+j;
                grid.owner = 0;
                grid.coinRate = dice;
                grid.lastUpdatePowerTimestamp = 0;
                grid.power = 0;
                grid.powerRate = 0;
                this.mapGridInfo.set(i*parseInt(width)+j, grid);
            }
    },

    getGameStats: function() {
        var gameStats = new Object();
        gameStats.currentGameId = this.currentGameId;
        gameStats.currentGameState = this.currentGameState;
        gameStats.owner = this.owner;
        gameStats.width = this.width;
        gameStats.height = this.height;
        gameStats.grid = this.mapGridInfo.get(0);
        return gameStats;
    },
    getMyStats: function() {
        var myStats = new Object();
        var actor = Blockchain.transaction.from;
        myStats.gameId = this.mapUserGameId.get(actor);
        myStats.coin = this._getUserCoin(actor);
        myStats.coinRate = this.mapUserCoinRate.get(actor);
        myStats.lastCoinUpdateTimestamp = this.mapUserLastCoinUpdateTimestamp.get(actor);
        myStats.gridNumber = this.mapUserGridNumber.get(actor);
        return myStats;
    },

    _userJoinGame: function (userAddress) {
        return this.mapUserGameId.get(userAddress) == this.currentGameId;
    },

    _getCurrentTimestampInSeconds: function () {
        return Math.floor(new Date().getTime() / 1000);
    },
    getGridInfo: function (gridId) {
        gridId = parseInt(gridId);
        return this._getGridInfo(gridId);
    },
    _getGridInfo: function (gridId) {
        gridId = parseInt(gridId);
        if (gridId < 0) {
            throw new Error("getGridInfo. invalid gridId");
        }
        if (gridId >= this.height * this.width) {
            throw new Error("getGridInfo. invalid gridId")
        }
        var newGrid = new Object();
        var grid = this.mapGridInfo.get(gridId);
        newGrid.id = grid.id;
        newGrid.owner = grid.owner;
        newGrid.coinRate = grid.coinRate;
        var passSeconds = this._getCurrentTimestampInSeconds() - grid.lastUpdatePowerTimestamp;
        var passMinutes = Math.floor(passSeconds / 60);
        newGrid.power = grid.power + grid.powerRate * passMinutes;
        newGrid.lastUpdatePowerTimestamp = grid.lastUpdatePowerTimestamp + passMinutes * 60;
        newGrid.powerRate = grid.powerRate;
        return newGrid;
    },

    getAllGridInfo: function () {
        var result = [];
        for (var i = 0; i < this.width * this.height; i++) {
            result.push(this._getGridInfo(i));
        }
        return result;
    },

// join && lottery
    joinGame: function () {
        var actor = Blockchain.transaction.from;
        if (this._userJoinGame(actor)) {
            throw new Error("User Already Joined");
        }
        if (this.currentPlayerNumber >= this.maxPlayerNumber) {
            throw new Error("Quota Overflow, please visit next game.");
        }
        // try join game
        var diceSuccess = false;
        for (var i = 0; i < 10; i++) {
            var dice = Math.floor(Math.random() * (this.width * this.height));
            var y = Math.floor(dice / this.width);
            var x = dice % this.width;
            var grid = this.mapGridInfo.get(dice);
            if (grid.owner != 0) {
                continue;
            } else {
                // update grid
                var newGrid = new Grid();
                newGrid.id = dice;
                newGrid.owner = actor;
                newGrid.coinRate = grid.coinRate;
                newGrid.lastUpdatePowerTimestamp = this._getCurrentTimestampInSeconds();
                newGrid.powerRate = 1;
                newGrid.power = 0;

                this.mapGridInfo.set(dice, newGrid);

                // update game stats
                this.currentPlayerNumber += 1;
                this.mapUserGameId.set(actor, this.currentGameId);
                this.mapUserGridNumber.set(actor, 1);

                // update coin
                this.mapUserCoin.set(actor, 0);
                this.mapUserLastCoinUpdateTimestamp.set(actor, this._getCurrentTimestampInSeconds());
                this.mapUserCoinRate.set(actor, grid.coinRate);
                diceSuccess = true;
                break;
            }
        }
        if (!diceSuccess) {
            throw new Error("dice failed");
        }
    },

// power
    _updateGridPower: function (gridId) {
        gridId = parseInt(gridId);
        if (gridId < 0) {
            throw new Error("updateGridPower. invalid gridId " + gridId);
        }
        if (gridId >= this.height * this.width) {
            throw new Error("updateGridPower. invalid gridId " + gridId);
        }
        var grid = this.mapGridInfo.get(gridId);
        if (grid.owner != 0) {
            var newGrid = new Grid();
            var passSeconds = this._getCurrentTimestampInSeconds() - grid.lastUpdatePowerTimestamp;
            var passMinutes = Math.floor(passSeconds / 60);
            newGrid.id = gridId;
            newGrid.owner = grid.owner;
            newGrid.coinRate = grid.coinRate;
            newGrid.lastUpdatePowerTimestamp = grid.lastUpdatePowerTimestamp + passMinutes * 60;
            newGrid.power = grid.power + grid.powerRate * passMinutes;
            newGrid.powerRate = grid.powerRate;
            this.mapGridInfo.set(gridId, newGrid);
        }
    },

// point
    _updateUserCoin: function (userAddress) {
        if (_userJoinGame(userAddress)) {
            throw new Error("use not joined the game");
        }
        var passSeconds = this._getCurrentTimestampInSeconds() - this.mapUserLastCoinUpdateTimestamp.get(userAddress);
        var passMinutes = Math.floor(passSeconds / 60);
        this.mapUserCoin.set(userAddress, this.mapUserCoin.get(userAddress) + this.mapUserCoinRate.get(userAddress) * passMinutes);
        this.mapUserLastCoinUpdateTimestamp.set(userAddress, this.mapUserLastCoinUpdateTimestamp.get(userAddress) + passMinutes * 60);
    },

    _getUserCoin: function (userAddress) {
        var passSeconds = this._getCurrentTimestampInSeconds() - this.mapUserLastCoinUpdateTimestamp.get(userAddress);
        var passMinutes = Math.floor(passSeconds / 60);
        return this.mapUserCoin.get(userAddress) + this.mapUserCoinRate.get(userAddress) * passMinutes;
    },

    attackGrid: function (ax, ay, bx, by, power) {
        ax = parseInt(ax);
        ay = parseInt(ay);
        bx = parseInt(bx);
        by = parseInt(by);
        power = parseInt(power);
        if (ax < 0 || ax >= this.width || bx < 0 || bx >= this.width || ay < 0 || ay >= this.height || by < 0 || by >= this.height) {
            throw new Error("coordinate overflow")
        }
        this._updateGridPower(ay * parseInt(this.width) + ax);
        this._updateGridPower(by * parseInt(this.width) + bx);
        var aGrid = this.mapGridInfo.get(ay * parseInt(this.width) + ax);
        var bGrid = this.mapGridInfo.get(by * parseInt(this.width) + bx);
        var attacker = Blockchain.transaction.from;
        var defender = bGrid.owner;
        this._updateUserCoin(attacker);
        if (defender != 0) {
            this._updateUserCoin(defender);
        }

        // param verify
        if (aGrid.owner != attacker) {
            throw new Error("invalid attacker location");
        }
        if (bGrid.owner == attacker) {
            throw new Error("invalid attack target. Can not attack your own grid.");
        }
        var dis = Math.abs(ax - ay) + Math.abs(bx - by);
        if (dis >= 5) {
            throw new Error("attack target too far.");
        }
        if (dis <= 0) {
            throw new Error("dis is 0")
        }
        if (aGrid.power < power) {
            throw new Error("attack power larger than grid power");
        }
        if (power <= dis) {
            throw new Error("power is not gt than distance");
        }

        if (this._getCurrentTimestampInSeconds() < this.mapUserLastOperateTimestamp.get(attacker) + 60) {
            throw new Error("operate limit exceeded");
        }

        // attack
        var newGrid = new Grid();
        newGrid.id = aGrid.id;
        newGrid.owner = aGrid.owner;
        newGrid.coinRate = aGrid.coinRate;
        newGrid.lastUpdatePowerTimestamp = aGrid.lastUpdatePowerTimestamp;
        newGrid.power = parseInt(aGrid.power) - power;
        newGrid.powerRate = aGrid.powerRate;
        this.mapGridInfo.set(ay*parseInt(this.width)+ax, newGrid);
        var attackPower = power - dis;
        if (bGrid.owner == 0) {
            var newGrid = new Grid();
            newGrid.id = bGrid.id;
            newGrid.owner = attacker;
            newGrid.coinRate = bGrid.coinRate;
            newGrid.lastUpdatePowerTimestamp = this._getCurrentTimestampInSeconds();
            newGrid.power = bGrid.power;
            newGrid.powerRate = bGrid.powerRate;
            this.mapGridInfo.set(by * parseInt(this.width) + bx, newGrid);
            this.mapUserGridNumber.set(attacker, this.mapUserGridNumber.get(attacker) + 1);
            this.mapUserCoinRate.set(attacker, this.mapUserCoinRate.get(attacker) + newGrid.coinRate);
        } else {
            // grid is owned by another guy
            if (attackPower <= bGrid.power) {
                var newGrid = new Grid();
                newGrid.id = bGrid.id;
                newGrid.owner = bGrid.owner;
                newGrid.coinRate = bGrid.coinRate;
                newGrid.lastUpdatePowerTimestamp = bGrid.lastUpdatePowerTimestamp;
                newGrid.power = bGrid.power - attackPower;
                newGrid.powerRate = bGrid.powerRate;
                newGrid.power = bGrid.power;
                this.mapGridInfo.set(by*this.width+bx, newGrid);
            } else {
                var newGrid = new Grid();
                newGrid.id = bGrid.id;
                newGrid.owner = attacker;
                newGrid.coinRate = bGrid.coinRate;
                newGrid.lastUpdatePowerTimestamp = this._getCurrentTimestampInSeconds();
                newGrid.power = attackPower - bGrid.power;
                newGrid.powerRate = bGrid.powerRate;
                this.mapGridInfo.set(by * this.width + bx, newGrid);
                this.mapUserGridNumber.set(attacker, this.mapUserGridNumber.get(attacker) + 1);
                this.mapUserGridNumber.set(defender, this.mapUserGridNumber.get(defender) + 1);
                if (this.mapUserGridNumber.get(defender) == 0) {
                    this.currentPlayerNumber -= 1;
                    this.mapUserCoin.set(defender, 0);
                    this.mapUserCoinRate.set(defender, 0);
                }
            }
        }
        this.mapUserLastOperateTimestamp.set(attacker, this._getCurrentTimestampInSeconds());
    },

    updateGridPowerRate: function (ax, ay) {
        ax = parseInt(ax);
        ay = parseInt(ay);
        var actor = Blockchain.transaction.from;
        if (ax < 0 || ax >= this.width || ay < 0 || ay >= this.height) {
            throw new Error("updateGridPowerRate. invalid coordinate");
        }
        var grid = this.mapGridInfo.get(ay * this.width + ax);
        if (grid.owner != actor) {
            throw new Error("updateGridPowerRate. not owner")
        }
        if (grid.powerRate > 10) {
            throw new Error("already highest level");
        }
        var buildFee = (grid.powerRate + 1) * 1000;
        this._updateUserCoin(actor);
        if (this.mapUserCoin.get(actor) < buildFee) {
            throw new Error("No enough buildFee");
        }
        this.mapUserCoin.set(actor, this.mapUserCoin.get(actor) - buildFee);
        this._updateGridPower(ay * this.width + ax);
    },
    withdrawAmount: function(nasAmount) {
        //only contract owner can withdraw
        if (this.owner != Blockchain.transaction.from) {
            throw new Error("only owner can withdraw");
        }
        nasAmount = new BigNumber(nasAmount);
        Blockchain.transfer(this.owner, nasAmount);
    }
};

module.exports = GridContract;


