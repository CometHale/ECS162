var http = require('http');
var static = require('node-static');

var fileServer = new static.Server('./public');

function handler(request, response) {
	request.addListener('end', function(){
		fileServer.serve(request, response);
	}).resume();

	request.addListener('error', function(){
		console.log("There was an error.");
	});
};

var server = http.createServer(handler);

server.listen("51262");