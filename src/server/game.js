const { DECK } = require('../shared/deck');
const Constants = require('../shared/constants');
const Player = require('./player');
const applyCollisions = require('./collisions');

class Game {
  
    constructor() {
        this.sockets = {};
        this.players = {};
        this.round = 0;
        this.deck = this.shuffle(DECK);
        this.board1 = [];
        this.board2 = [];
        this.board3 = [];
        this.board4 = [];
        this.board5 = [];

        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;
        //setInterval(this.update.bind(this), 1000 / 60);
    }

    startGame(sockets, players){
        this.sockets = sockets;
        this.players = players;
        this.round = 1;
        this.dealHands(this.deck);
        this.board1 = this.dealBoard(this.deck)
        this.board2 = this.dealBoard(this.deck)
        this.board3 = this.dealBoard(this.deck)
        this.board4 = this.dealBoard(this.deck)
        this.board5 = this.dealBoard(this.deck)

        this.emitHands();
        //this.emitOpponentUsername();
    }

    shuffle(array) {
        let counter = array.length;
        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);
            counter--;
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }

    dealHands(deck){
        Object.keys(this.players).forEach(player => {
            let hand = [];
            let count = 0;
            while(count < 10){
                let card = deck.shift();
                hand.push(card);
                count ++;
            }
            this.players[player].hand = hand;
        })
    }

    dealBoard(deck){
        let board = [];
        let count = 0;
        while(count < 5){
            let card = deck.shift();
            board.push(card);
            count ++;
        }
        return board;
    }

    emitHands(){

        let opponentUsername = '';

        Object.keys(this.sockets).forEach(sid => {
            
            Object.keys(this.players).forEach(pid => {
                if(sid != pid) opponentUsername = this.players[pid].username 
            });
            
            const socket = this.sockets[sid];
            const player = this.players[sid];

            socket.emit(Constants.MSG_TYPES.SEND_HAND, player.hand, opponentUsername);
        });
    }

  // emitOpponentUsername(){
  //   Object.keys(this.sockets).forEach(playerID => {

  //     const socket = this.sockets[playerID];  
      
  //     Object.keys(this.players).forEach(playerID => {
  //       if(playerID != this.players[playerID]) 
  //     })

  //     socket.emit(Constants.MSG_TYPES.SEND_HAND, player.hand);
  //   });
  // }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, username, x, y);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove = [];
    this.bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this.bullets = this.bullets.filter(bullet => !bulletsToRemove.includes(bullet));

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullet = player.update(dt);
      if (newBullet) {
        this.bullets.push(newBullet);
      }
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBullets = applyCollisions(Object.values(this.players), this.bullets);
    destroyedBullets.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBullets.includes(bullet));

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
