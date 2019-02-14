var ip2loc = require('./ip2location.js');

ip2loc('/Users/Alexander/Documents/Entwicklung/ip2location/IP2Location/DB8.BIN')
	.then((db) => {
		return db.get_all('8.8.8.8');
	})
	.then(result => {
		console.log(JSON.stringify(result))
		console.log('--------------------------------------------------------------');
	});