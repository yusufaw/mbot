var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var logs = require('./routes/logs');

const LogService = require('./service/LogService');
const CommandService = require('./service/CommandService');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/logs', logs);

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

const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')

const bot = new Telegraf(process.env.MBOT_TOKEN)
const telegram = new Telegram(process.env.MBOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there!'))
bot.command('respon', (ctx) => {
  var regex = /\[(.*?)\](?:| )\[(.*?)\]/
  const found = ctx.message.text.match(regex);
  if(found && found.length > 2) {
    const cmd = {
      'added_at': new Date(),
      'chat_id': ctx.message.chat.id,
      'message_key': found[1],
      'message_response': found[2]
    }
    if(found[2].length > 0) {
      CommandService.addCommand(cmd)
      .then(result => {
          return ctx.reply('mantap! jal ngetiko ' + found[1])
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
          array.push('\n- [' + item.message_key +']')
        })
        var response = 'Respon sek tak simpen:' + array.toString()
        return ctx.reply(response.replace(/,/g, ''))
      })
      .catch(err => {
        console.err(err)
      });
})
bot.on('text', ctx => {
      CommandService.listCommand(ctx.message.chat.id)
      .then(result => {
        const res = result.filter(function(x){return ctx.message.text.includes(x.message_key)})[0]
        if (res) {
          if(res.message_response.constructor === Array) {
            return ctx.reply(res.message_response[Math.floor(Math.random() * res.message_response.length) ])
          } else {
            return ctx.reply(res.message_response)
          }
        }
      })
      .catch(err => {
        console.err(err)
      });
})
bot.launch()

module.exports = app;
