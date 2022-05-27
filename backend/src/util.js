const isValidRoomCode = roomCode => {
  const containsIllegalChar = (/[^A-Z0-9]/).test(roomCode);
  
  return !containsIllegalChar && roomCode.length === ROOM_CODE_LENGTH;
}

module.exports = {
  isValidRoomCode,
};
