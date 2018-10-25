// global variables
var fs = require('fs');  // file access module

var imgList = [];

// code run on startup
loadImageList();

// just for testing, you can cut this out
console.log(imgList[354]);


function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}

