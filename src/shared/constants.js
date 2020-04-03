module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_LOBBY: 'join_lobby',
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    GAME_OVER: 'dead',
    WAITING_MESSAGE: 'waiting_message',
    SEND_HAND: 'send_hand',
    PLAY_HAND: 'play_hand',
    HAND_WAITING_MESSAGE: 'hand_waiting_message'
  },
});