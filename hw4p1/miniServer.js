// "Hello world" server

// like include
var http  = require('http');

// like a callback
function handler (request, response) {
    var url = request.url;
    url = url.replace("/","");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<h1>Hello!</h1>");
    response.write("<p>You asked for <code>" + url + "</code></p>");
    response.end();
}


var server = http.createServer(handler);

// fill in YOUR port number!
server.listen("51262");

