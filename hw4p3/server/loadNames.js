var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var sizeOf = require('image-size');
var url = require('url');
var http = require('http');

var imgList = [];

var data = fs.readFileSync('6whs.json');
if (! data) {
    console.log("cannot read 6whs.json");
} else {
    listObj = JSON.parse(data);
    imgList = listObj.photoURLs;
}

var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);
var callbackCount = 0;

for (var i = imgList.length - 1; i >= 0; i--) {
	var img_url = imgList[i];
	var img_name = img_url.split("/")[6];
	// var options = url.parse(img_url);
	getSize(i, img_name, imgList, sizeCallback);
}

function sizeCallback(imgID, imgName, imgList, width, height){
	
	imgList[imgID] = {'url' : imgList[imgID], 'name': imgName, 
			'width':width, 'height': height};

	callbackCount += 1;

	if (callbackCount == imgList.length) {
		callbackCount = 0;
		dbInserts();
	}
}

// Get size of one image, then call cbFun
function getSize(ind, name, imgList, cbFun) {
	var imgServerURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
    var imgURL = imgServerURL+name;
    var options = url.parse(imgURL);

    // call http get 
    http.get(options, function (response) {
	var chunks = [];
	response.on('data', function (chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var buffer = Buffer.concat(chunks);
	    dimensions = sizeOf(buffer);
	    cbFun(ind, name, imgList, dimensions.width, dimensions.height);
	})
    })
}

function dbCallback(){

	callbackCount += 1;
	if (callbackCount == imgList.length) {
		db.close();
	}
}

function dbInserts(){

	for (var i = imgList.length - 1; i >= 0; i--) {
		var cmd = 'INSERT OR REPLACE INTO photoTags VALUES (';
		cmd += i+ ',';
		cmd += '"' + imgList[i].name + '"' + ',';
	    cmd += imgList[i].width + ',';
	    cmd += imgList[i].height + ',';
	    cmd += '""' + ',';
	    cmd += '""';
	    cmd += ')';

	   db.run(cmd, dbCallback);
	}

}

function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
  function dataCallback( err, data ) {
	console.log(data) 
  }
}
