const Constants = require('../shared/constants');
const Game = require('./game');
const Player = require('./player');

class Lobby {
  
  constructor() {
    this.sockets = {};
    this.players = {};
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;
    this.players[socket.id] = new Player(socket.id, username);
  }

  countSockets(){
    var count = 0;
    Object.keys(this.sockets).forEach(playerID => {
      count ++;
    });
    return count;
  }

  logPlayers(){
    console.log(this.players);
  }

  logSockets(){
    console.log(this.sockets);
  }

  sendWaitingMessage(socketId){
    this.sockets[socketId].emit(Constants.MSG_TYPES.WAITING_MESSAGE);
  }

  startGame(){
    Game.
  }

}

module.exports = Lobby;
