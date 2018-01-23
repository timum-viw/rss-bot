require('dotenv').config()
const superagent = require('superagent')
const TOKEN = process.env.TELEGRAM_TOKEN
const moment = require('moment')

let Feed = require('./feed')
const feed = new Feed(process.env.FEED_URL)

feed.get(10).then((res) => {
	let entries = res.filter((entry) => {
		return new Date(entry.pubDate) > moment().subtract(1, 'hours')
	})
	let msgs = feed.format(entries)

	for(let msg of msgs) {
		superagent.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
		.send({
			chat_id: process.env.CHANNEL,
			text: msg,
			parse_mode: 'Markdown'
		})
		.then()
		console.log(msg)
	}
})