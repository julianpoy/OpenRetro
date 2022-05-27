const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URI || 'redis://redis'
});

client.on('error', (err) => console.log('Redis Client Error', err));

const connectionPromise = client.connect();

const setRoom = async (room) => {
  await connectionPromise;
  await client.json.set(`room:${room.code}`, '.', room);
};

const getRoom = async (roomCode) => {
  await connectionPromise;
  const room = await client.json.get(`room:${roomCode}`, '.');
  return room;
};

module.exports = {
  _client: client,
  getRoom,
  setRoom,
};
