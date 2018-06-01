
// Called when the user pushes the "submit" button 
function photoByNumber() {

	var num = document.getElementById("num").value;
	num = num.trim();
	var photoNum = Number(num);
	if (photoNum != NaN) {
		var photoURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
		var url = "query?num=" + photoNum;
		var oReq = new XMLHttpRequest();

		oReq.open("GET", url);

		oReq.addEventListener("load", reqListener);

		oReq.send();

		function reqListener(){
			if (this.status === 200) {
				photoURL = photoURL + this.responseText;
				var display = document.getElementById("photoImg");
				display.src = photoURL;
			}
			else{
				alert("Invalid Query! Queries should consist only of a number between 0 and 988.");
			}

		}

		
	}
}



