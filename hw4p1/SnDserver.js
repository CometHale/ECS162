// globals
var http = require('http');
var static = require('node-static');
var fs = require('fs');  // file access module

var fileServer = new static.Server('./public');

var imgList = [];

// code run on startup
loadImageList();

function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}

function error400(response, url){
	response.writeHead(400, {"Content-Type": "text/html"});
	response.write("<h1>400 Bad Request</h1>");
	response.write("<p>Invalid query: <code>" + url.join("?") + "</code>. Queries should be of the form <code>http://server162.site:51262/query?num=IDNUMBER</code>, where IDNUMBER is an integer between 0 and 988.</p>");
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
		    if(word.match(/num=/g)){
		        return true;
		    }else{
		        return false;
		    }
		});

		if(num_keyword.length > 1 || num_keyword.length === 0){ // found multiple num keywords

			error400(response, url);
		}
		else{ // found only one num keyword
			var img_id = Number(num_keyword[0].split('=')[1]);

			if((typeof img_id) === "number" && !isNaN(img_id)){

				if (img_id >= 0 && img_id <= 988) {
					response.writeHead(200, {"Content-Type": "text/html"});
				    response.write(imgList[img_id]);
				    response.end();
				}
				else{
					error400(response, url);
				}

			}
			else{
				error400(response, url);
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
