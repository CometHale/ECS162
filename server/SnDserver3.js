// globals
var http = require('http');
var static = require('node-static');
var fs = require('fs');  // file access module
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var auto = require("./makeTagTable");
const PORT = process.env.PORT || 5000

var fileServer = new static.Server('./public');
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);


// Initial setup of tagTable
var tagTable = {};   // global
auto.makeTagTable(tagTableCallback);
function tagTableCallback(data) {
   tagTable = data;
}


function error400(response, url){
	response.writeHead(400, {"Content-Type": "text/html"});
	response.write("<h1>400 Bad Request</h1>");
	response.write("<p>Invalid query: <code>" + url.join("?") + "</code>. Queries should be in one of the following forms:</p>");
	// response.write("<p><code>http://server162.site:51262/query?numList=IDNUMBER1+IDNUMBER2+IDNUMBER3+...+IDNUMBERn</code>, where IDNUMBERx is an integer between 0 and 988.</p>");
	response.write("<p><code>http://server162.site:51262/query?keyList=TAG1+TAG2+TAG3+...</code></p>");
	response.write("<p><code>http://server162.site:51262/action?type=[delete,add]&photo_id=IDNUMBER&tag=TAG</code>, where IDNUMBER is an integer between 0 and 988.</p>");
	response.end();
}

function error500(response){
	response.writeHead(500, {"Content-Type": "text/html"});
	response.write("<h1>500 Internal Server Error</h1>");
	response.end();

}

function check_for_keyword(rgx, url){
	var present = false;

	var match_query = url.filter(function(word,index){
	    if(word.match(rgx)){
	    	present = true;
	        return true;
	    }else{
	    	present = false;
	        return false;
	    }
	});

	return present;
}

// borrowed from: https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


function action_update_db(action_type, photo_id, tag, response){

	var select_cmd = 'SELECT * FROM photoTags WHERE idNum=' + photo_id;

	function select_callback(err, arrayData){

		if (err) {
			console.log("Action query select error:",err);
			error500(response);
	    } 
	    else {
			var tags = arrayData[0].tags.split(',');
			var new_tags = "";
			var update_cmd = 'UPDATE photoTags SET ';
			var index = tags.indexOf(tag);

			if(action_type === "delete"){
				if (index !== -1) {
					tags.splice(index, 1);
					new_tags = tags.join();
				}
				else{
					error400(response, url);
				}
			}
			else{ // add 
				tags.push(tag);
				tags = tags.filter(onlyUnique);
				new_tags = tags.join();
			}

			update_cmd += 'tags = "' + new_tags + '" WHERE idNum = ' + photo_id + ';';

			function dbCallback(err){
				if(err){
					console.log("Action query update error:",err);
					error500(response);
				}
				else{
					// update tag table every time a tag is added or deleted
					auto.makeTagTable(tagTableCallback);
					function tagTableCallback(data) {
					   tagTable = data;
					}
					response.writeHead(200, {"Content-Type": "text/html"});
					response.end();
				}
			}

			db.run(update_cmd, dbCallback);


	    }
	}

	db.all(select_cmd, select_callback);

}

function handle_query(url, request, response){
	var query = url[url.length - 1];

	// determine if 'numList=' is in the query
	var num_keyword = query.split('?').filter(function(word,index){
	    if(word.match(/numList=/g)){
	        return true;
	    }else{
	        return false;
	    }
	});

	//determing if 'keyList=' is in the query
	var key_keyword = query.split('?').filter(function(word,index){
	    if(word.match(/keyList=/g)){
	        return true;
	    }else{
	        return false;
	    }
	});

	var autocomplete_keyword = query.split('?').filter(function(word,index){
	    if(word.match(/autocomplete=/g)){
	        return true;
	    }else{
	        return false;
	    }
	});


	if(
		num_keyword.length > 1 ||
		key_keyword.length > 1 ||
		autocomplete_keyword.length > 1 ||
		(num_keyword.length === 0 && key_keyword.length === 0 && autocomplete_keyword.length === 0)
	  )
	{ // found multiple num keywords

		error400(response, url);
	}
	else{ // found only one num keywordAPIrequestObject = {

		var ids = []
		var tags = []
		var cmd = '';

		if (num_keyword.length == 1) {
			ids = num_keyword[0].split("=")[1].split("+");
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

		}

		if(key_keyword.length == 1){
			tags = key_keyword[0].split("=")[1];
			tags = decodeURIComponent(tags).split("+");
			var cmd = 'SELECT * FROM photoTags WHERE ';

			for (var i = tags.length - 1; i >= 0; i--) {
				var tag = tags[i];
				var valid = /^[a-z ]+$/.test(tag);

				if (valid) {
					cmd += '(landmark = "' + tags[i] +  '" OR tags LIKE "%'+ tags[i] +'%")';

					if (i > 0) {
						cmd += ' AND ';
					}
				}

			}
		}
		
		if (autocomplete_keyword.length == 1) {
			var letters = autocomplete_keyword[0].split("=")[1];
			tags = tagTable[letters];

			if (tags !== undefined) {
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write(JSON.stringify(tags));
				response.end();
			}
			else{
				error400(response, url);
			}

		}

		if (num_keyword.length == 1 || key_keyword.length == 1) {
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
}

function handle_action(url, request, response){
	var action = url[url.length - 1].split('?')[1].split('&');
	var type_present = check_for_keyword(/type/g, url);
	var photo_id_present = check_for_keyword(/photo_id/g, url);
	var tag_present = check_for_keyword(/tag/g, url);

	if (!type_present || !photo_id_present || !tag_present) {
		error400(response, url);
	}
	console.log(action);
	var action_type = action[0].split('=')[1];
	var photo_id = action[1].split('=')[1];
	var tag = action[2].split('=')[1];
	tag = decodeURIComponent(tag);
	console.log(action_type);
	console.log(photo_id);
	console.log(tag);

	if(action_type === "delete" || action_type === "add"){
		
		action_update_db(action_type, photo_id, tag, response);

	}
	else {
		error400(response, url);
	}
}

// handler
function handler(request, response) {
	var url = request.url.split('/');
	var query_present = false;
	var action_present = false;

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

	// determine if '?action' is in the url
	var match_query = url.filter(function(word,index){
	    if(word.match(/action\?/g)){
	    	action_present = true;
	        return true;
	    }else{
	    	action_present = false;
	        return false;
	    }
	});


	if (query_present) {
		handle_query(url, request, response);
	}

	if(action_present){
		handle_action(url, request, response);
	}

	if(!query_present && !action_present)
	{

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

server.listen(PORT);
