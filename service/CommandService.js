'use strict';

const CommandModel = require('../model/CommandModel');
const mongoose = require('../lib/db');

const CommandService = () => {
  const addCommand = data => {
    return new Promise((resolve, reject) => {
      let dt = new CommandModel(data);
      dt.save()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  const updateCommand = data => {
    return new Promise((resolve, reject) => {
      CommandModel.findOneAndUpdate({
          message_key: data.message_key
        }, {
          $push: {
            message_response: data.message_response
          }
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  const removeCommand = data => {
    return new Promise((resolve, reject) => {
      CommandModel.findOneAndRemove({
          message_key: data.message_key
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  const listCommand = (chat_id) => {
    return new Promise((resolve, reject) => {
      CommandModel.find({
          chat_id: chat_id
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  return {
    addCommand: addCommand,
    updateCommand: updateCommand,
    removeCommand: removeCommand,
    listCommand: listCommand
  }
};

module.exports = CommandService();
