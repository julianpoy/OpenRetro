const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp');
const Room = mongoose.model('Room', new Schema({ name: String }));

module.exports = {
  Rooms
};
