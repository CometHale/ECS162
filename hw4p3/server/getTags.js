var APIrequest = require('request');
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var sizeOf = require('image-size');
var url = require('url');
var http = require('http');

var imgList = [];
var api_url = 'https://vision.googleapis.com/v1/images:annotate?key=[KEY]';

var data = fs.readFileSync('photoList.json');
if (! data) {
    console.log("cannot read photoList.json");
} else {
    listObj = JSON.parse(data);
    imgList = listObj.photoURLs;
}

var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);
var callbackCount = 0;
var pic_id = 0;

// for (var i = imgList.length - 1; i >= 0; i--) {

// 	var name = imgList[i];
// 	var imgServerURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
//     var imgURL = imgServerURL+name;
	
// 	APIrequestObject["requests"] = {
// 	      "image": {
// 	        "source": {"imageUri": imgURL}
// 	        },
// 	      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
// 	    }
	
// }	
var APIrequestObject = make_request_object(pic_id, imgList);
getTags(imgList,pic_id,APIrequestObject);

function make_request_object(id, imgList){
	var name = imgList[id];
	var imgServerURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
    var imgURL = imgServerURL+name;
	
	return APIrequestObject = {
		  "requests": [
		    {
		      "image": {
		        "source": {"imageUri": imgURL}
		        },
		      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
		    }
		  ]
		}

}
// Get the tags for one image, then call cbFun
function getTags(imgList, imgID, APIrequestObject) {
	APIrequest(
		{
			url:api_url,
			method:"POST",
			headers:{"content-type": "application/json"},
			json:APIrequestObject,
		},
		function tagsCallback(err, APIresponse, body){
			if ((err) || (APIresponse.statusCode != 200))
			{
				console.log("Got API error");
				console.log(body);
		    } 
		   	else
		   	{
				APIresponseJSON = body.responses[0];
				// for (var i = APIresponseJSON.length - 1; i >= 0; i--) {
					// APIresponseJSON = APIresponseJSON[i];
					tags = "";
					landmark = "";

					if(APIresponseJSON !== undefined){
						if('labelAnnotations' in APIresponseJSON){
							for (var j = 0; j < APIresponseJSON.labelAnnotations.length; j++) {
								
								if (j === 6) { break;}
								if(j > 0){ tags += ",";}
								tags += APIresponseJSON.labelAnnotations[j].description;
							}
						}

						if ('landmarkAnnotations' in APIresponseJSON) {
							landmark = APIresponseJSON.landmarkAnnotations[0].description;
						}

						imgList[imgID] = {
							'idNum':imgID,
							'landmark':landmark,
							'tags':tags
						}

						callbackCount += 1;
						pic_id += 1;
						
						if (callbackCount == imgList.length) {
							callbackCount = 0;
							dbInserts();
						}

						APIrequestObject = make_request_object(pic_id, imgList);

						if (callbackCount % 400 === 0) {
							setTimeout(getTags, 60000, imgList, pic_id, APIrequestObject);
						}
						else{
							getTags(imgList,pic_id, APIrequestObject);
						}



					}

				// }
				
		    }

		}
	);

}

function dbCallback(){

	callbackCount += 1;
	
	if (callbackCount == imgList.length) {
		dumpDB();
		db.close();
	}

}

function dbInserts(){

	for (var i = imgList.length - 1; i >= 0; i--) {
		var cmd = 'UPDATE photoTags SET ';
		cmd += 'landmark = "' + imgList[i].landmark + '",';
		cmd += 'tags = "' + imgList[i].tags + '"';
		cmd += "WHERE idNum = " + imgList[i].idNum;
	    cmd += ';';

	   db.run(cmd, dbCallback);
	}

}

function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
  function dataCallback( err, data ) {
  	console.log(err);
	console.log(data); 
  }
}
