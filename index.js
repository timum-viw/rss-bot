require('dotenv').config()
const superagent = require('superagent')
const TOKEN = process.env.TELEGRAM_TOKEN
const TelegramBot = require('node-telegram-bot-api')
const options = {
	webHook: {
		port: process.env.PORT
	}
}

const bot = new TelegramBot(TOKEN, options)

bot.setWebHook(`${process.env.APP_URL}/bot${TOKEN}`)

const commands = {
	start(params) {
		sendMessage(`Send me your location or the name of a place you want to know about.`)
	},

	help(params) {
		sendMessage(`If you send me your current location, I'll see if I can find any data on air pollution in your area. You can also send me the name of a place or an address that you are interested in and I'll see if I can find any data for you. Data comes from https://openaq.org/, a great platform for open air quality data. Recommended levels taken from WHO guideline http://www.who.int/.`)
	}
}

function processCommand(entity) {
	let cmd = message.text.substr(entity.offset + 1, entity.length - 1)
	let params = message.text.substr(entity.offset + entity.length + 1)
	try {
		commands[cmd](params)
	} catch (error) {
		console.error(error)
		sendMessage(`I didn't quite get that. Could you rephrase?`)
	}
}

function sendMessage(msg, options) {
	options = {
		parse_mode: 'Markdown',
		...options,
	}
	bot.sendMessage(message.chat.id, msg, options)
}

function getFeed(numEntries) {
	let url = process.env.FEED_URL
	url = `https://query.yahooapis.com/v1/public/yql?q=select * from rss where url="${url}" limit ${numEntries}&format=json&callback=`
	return superagent.get(url).then((res) => {
		return res.body.query.results.item
	})
}

function sendFeed(results) {
	let msgs = results.map((entry) => {
		return `*${entry.title}*
${entry.description}
_vom ${new Date(entry.pubDate).toLocaleString()}_
`
	})
	for(let msg of msgs) sendMessage(msg)
}

function sendAnswer() {
	getFeed(10).then((res) => {
		sendFeed(res)
	}, (err) => {
		console.log(err)
		sendMessage(`My data dealer seems to have problems. Please try again later.`)
	})
}

let message;
bot.on('text', function onMessage(msg) {
	message = msg;
	if(message.entities && (cmds = message.entities.filter((e) => e.type === 'bot_command')).length > 0) {
		cmds.map((entity) => processCommand(entity))
	} else {
		sendAnswer()
	}
});