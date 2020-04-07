const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const Lobby = require('./lobby');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.JOIN_LOBBY, joinLobby);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.PLAY_HAND, playHand);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const lobby = new Lobby();
const game = new Game();

// When user clicks join button
function joinLobby(username, socketId){
  
  lobby.addPlayer(this, username);
  
  // Start game if 2nd player joined or send waiting message to 1st player
  const numPlayers = lobby.countSockets();
  if(numPlayers === 2){
    let players = lobby.getPlayers();
    let sockets = lobby.getSockets();
    game.startGame(sockets, players);
  }
    else lobby.sendWaitingMessage(socketId);

}

// Hand that user has played. Will either compare hands or tell user we're waiting on opponent
function playHand(hand, socketId){

  // do more validation here later
  game.updateHand(hand, socketId)

  let opponentHasPlayed = game.hasOpponentPlayed(socketId);

  if(opponentHasPlayed) game.compareHands();
    else game.sendWaitingMessage(socketId);
}


function joinGame(){

}

function handleInput(dir) {
  game.handleInput(this, dir);
}

function onDisconnect() {
  game.removePlayer(this);
}
