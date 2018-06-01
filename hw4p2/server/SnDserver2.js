// globals
var http = require('http');
var static = require('node-static');
var fs = require('fs');  // file access module
var sqlite3 = require("sqlite3").verbose();  // use sqlite

var fileServer = new static.Server('./public');
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

function error400(response, url){
	response.writeHead(400, {"Content-Type": "text/html"});
	response.write("<h1>400 Bad Request</h1>");
	response.write("<p>Invalid query: <code>" + url.join("?") + "</code>. Queries should be of the form <code>http://server162.site:51262/query?numList=IDNUMBER1+IDNUMBER2+IDNUMBER3+...+IDNUMBERn</code>, where IDNUMBERx is an integer between 0 and 988.</p>");
	response.end();
}

// handler
function handler(request, response) {
	var url = request.url.split('/');

	var query_present = false;

	// determine if 'query?' is in the url
	var match_query = url.filter(function(word,index){
	    if(word.match(/query\?/g)){
	    	query_present = true;
	        return true;
	    }else{
	    	query_present = false;
	        return false;
	    }
	});

	if (query_present) {
		var query = url[url.length - 1];
		// determine if 'num=' is in the query
		var num_keyword = query.split('?').filter(function(word,index){
		    if(word.match(/numList=/g)){
		        return true;
		    }else{
		        return false;
		    }
		});

		if(num_keyword.length > 1 || num_keyword.length === 0){ // found multiple num keywords

			error400(response, url);
		}
		else{ // found only one num keyword

			var ids = num_keyword[0].split("=")[1].split("+");
			ids = ids.map(Number);
			var cmd = 'SELECT fileName AS src, width, height FROM photoTags WHERE idNum IN (';

			for (var i = ids.length - 1; i >= 0; i--) {

				if(!isNaN(ids[i])){
					
					cmd += ids[i];

					if (i > 0) {
						cmd += ',';
					}
				}
				else{
					error400(response, url);
					break;
				}
			}
			cmd += ')';

			db.all(cmd, dbArrayCallback);

			function dbArrayCallback(err, arrayData){
				if(err){
					console.log("An error occurred while querying the database:", err, "\n");
				}
				else{
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(JSON.stringify(arrayData));
					response.end();
				}
			}

		}

	}
	else{

		request.addListener('end', function(){
			fileServer.serve(request, response, function (e, res) {
	            if (e && (e.status === 404)) { // If the file wasn't found
	                fileServer.serveFile('/not-found.html', 404, {}, request, response);
	            }
       		});
		}).resume();

	}
};

var server = http.createServer(handler);

server.listen("51262");
