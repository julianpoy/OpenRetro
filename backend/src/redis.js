const Client = require('ioredis');
const { default: Redlock } = require("redlock");

const client = new Client(process.env.REDIS_URI || 'redis://redis');

const redlock = new Redlock(
  [client],
  {
    // The expected clock drift; for more details see:
    // http://redis.io/topics/distlock
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500, // time in ms
  }
);

const json = {
  get: async (key, path) => {
    return JSON.parse(await client.call('JSON.GET', key, path));
  },
  set: async (key, path, value) => {
    return client.call('JSON.SET', key, path, JSON.stringify(value));
  },
};

module.exports = {
  client,
  redlock,
  json,
};
