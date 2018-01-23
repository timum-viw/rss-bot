const superagent = require('superagent')

class Feed {
	constructor(url) {
		this.feedUrl = url;
	}

	get(numEntries) {
		let url = `https://query.yahooapis.com/v1/public/yql?q=select * from rss where url="${this.feedUrl}" limit ${numEntries}&format=json&callback=`
		return superagent.get(url).then((res) => {
			return res.body.query.results.item
		})
	}

	format(results) {
		return results.map((entry) => {
			return `*${entry.title}*
${entry.description}
_vom ${new Date(entry.pubDate).toLocaleString()}_
`
		})
	}
}

module.exports = Feed