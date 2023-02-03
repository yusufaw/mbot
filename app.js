const express = require('express');
var path = require('path');
const { Telegraf } = require('telegraf')
require('dotenv').config();

var index = require('./routes/index');

const CommandService = require('./service/CommandService');
const bot = new Telegraf(process.env.MBOT_TOKEN)

var app = express();

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there!'))
bot.command('respon', (ctx) => {
  var regex = /\[(.*)\](?:| )\[((.|\n)*)\]/
  const found = ctx.message.text.match(regex);
  if (found && found.length > 2) {
    const cmd = {
      'added_at': new Date(),
      'chat_id': ctx.message.chat.id,
      'message_key': found[1],
      'message_response': found[2]
    }
    if (found[2].length > 0) {
      CommandService.updateCommand(cmd)
        .then(result => {
          if (!result) {
            return CommandService.addCommand(cmd)
              .then(result => {
                return ctx.reply('mantap! jal ngetiko ' + found[1])
              })
              .catch(err => {
                console.log(err);
                return ctx.reply('lagi error bos!')
              })
          } else {
            return ctx.reply('mantap! jal ngetiko ' + found[1])
          }
        })
        .catch(err => {
          console.log(err);
          return ctx.reply('lagi error bos!')
        })
    } else {
      CommandService.removeCommand(cmd)
        .then(result => {
          return ctx.reply('respon "' + found[1] + '" wis tak busak! ')
        })
        .catch(err => {
          console.log(err);
          return ctx.reply('lagi error bos!')
        })
    }
  } else {
    return ctx.reply('mbok sing bener, ngene lho\n\n/respon [pagi] [pagi juga!]')
  }
})
bot.command('list', (ctx) => {
  var array = []
  CommandService.listCommand(ctx.message.chat.id)
    .then(result => {
      result.forEach(function(item) {
        array.push('\n- [' + item.message_key + ']')
      })
      var response = 'Respon sek tak simpen:' + array.toString()
      return ctx.reply(response.replace(/,/g, ''))
    })
    .catch(err => {
      console.err(err)
    });
})
bot.command('about', (ctx) => {
  ctx.reply('https://github.com/yusufaw/mbot')
})
bot.on('text', ctx => {
  CommandService.listCommand(ctx.message.chat.id)
    .then(result => {
      const res = result.filter(function(x) {
        return ctx.message.text.toUpperCase().includes(x.message_key.toUpperCase())
      })
      const resRandom = res[Math.floor(Math.random() * res.length)]
      if (resRandom) {
        return ctx.reply(resRandom.message_response[Math.floor(Math.random() * resRandom.message_response.length)])
      }
    })
    .catch(err => {
      console.err(err)
    });
})
bot.launch()

module.exports = app;
