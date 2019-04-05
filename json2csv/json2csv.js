let converter = require('json-2-csv');
let json = require('./moocdata.json');

converter.json2csv(json, (err, csv) => {
	if (err) throw err;
	console.log(csv);
});
