const mongoose = require('../lib/db');

module.exports = mongoose.model('Command', {
  added_at: Date,
  chat_id: String,
  message_key: String,
  message_response: Array(String)
});
