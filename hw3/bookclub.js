
window.onload = function(){

	var header = document.getElementsByTagName('header')[0];
	var form_wrapper = document.getElementById("form-wrapper");
	var form = document.getElementById("form");
	var search_button = form_wrapper.getElementsByTagName("button")[0];
	var main = document.getElementsByTagName("main")[0];

	// create magnifying glass
	var magnifying_glass = document.createElement('button');
	magnifying_glass.id = "magnifying-glass";
	magnifying_glass.style.backgroundColor = "transparent";
	magnifying_glass.textContent = "search";
	magnifying_glass.setAttribute('class', "material-icons");
	magnifying_glass.style.color = "#4C78FB";
	magnifying_glass.style.display = "none";

	magnifying_glass.onclick = function(){
		main.append(form_wrapper);

		form.style.backgroundColor = "white";
		form.style.boxShadow = "1px 1px 15px #888888";
		form.style.display = "flex";
		form.style.marginTop = "2vh";
	};

	header.append(magnifying_glass);

	var viewport_width = document.documentElement.clientWidth;
	if(viewport_width <= 480 && search_button.getAttribute('class') === "tile-search"){
		onResize();
	}
}

function newRequest() {

	var title = document.getElementById("title").value;
	title = title.trim();
	title = title.replace(" ","+");

	var author = document.getElementById("author").value;
	author = author.trim();
	author = author.replace(" ","+");

	var isbn = document.getElementById("isbn").value;
	isbn = isbn.trim();
	isbn = isbn.replace("-","");


	var query = ["",title,author,isbn].join("+");
	if (query != "") {

		// remove old script
		var oldScript = document.getElementById("jsonpCall");
		if (oldScript != null) {
			document.body.removeChild(oldScript);
		}
		// make a new script element
		var script = document.createElement('script');

		// build up complicated request URL
		var beginning = "https://www.googleapis.com/books/v1/volumes?q="
		var callback = "&callback=handleResponse"

		script.src = beginning+query+callback	
		script.id = "jsonpCall";

		// put new script into DOM at bottom of body
		document.body.appendChild(script);	
		}

}	

function handleResponse(bookListObj) {
	var bookList = bookListObj.items;

	/* adjust html to tile view */
	toTileView();

	/* where to put the data on the Web page */ 
	var bookDisplay = document.getElementById("bookDisplay");
	var overlay = document.getElementById("overlay");

	var title = document.getElementById("title").value;
	title = title.trim();

	if(title === ""){
		title = "Title";
	}

	var author = document.getElementById("author").value;
	author = author.trim();

	if(author === ""){
		author = "Author";
	}

	var isbn = document.getElementById("isbn").value;
	isbn = isbn.trim();

	if(isbn === ""){
		isbn = "ISBN";
	}

	// the search didn't return any results
	if (bookList === undefined) {
		var failed_search = document.createElement("div");
		failed_search.id = "search-not-found";

		var title_html = document.createElement("p");
		title_html.setAttribute('class','not-found-text');
		title_html.textContent = title;

		var author_html = document.createElement("p");
		author_html.setAttribute('class','not-found-text');
		author_html.textContent = author;

		var isbn_html = document.createElement("p");
		isbn_html.setAttribute('class','not-found-text');
		isbn_html.textContent = isbn;
	
		var button = document.createElement('button');
		button.textContent = "OK";
		button.setAttribute('onclick', 'overlayOff()');

		failed_search.append(document.createTextNode("The book "), title_html, document.createTextNode(" by "), author_html,document.createTextNode(" or ISBN number "), isbn_html, document.createTextNode(" could not be found. Try another search."));
		failed_search.append(button);
		
		overlay.appendChild(failed_search);

		overlayOn();

	}
	else{ /* the search returned results */

		// create the close button
		var close_button = document.createElement("button");
		close_button.setAttribute('class', 'ui-button');
		close_button.setAttribute('onclick', 'overlayOff()');
		close_button.id = "success-close";
		close_button.textContent = "ⓧ";

		// create the found book tile and arrow buttons
		var success_search_navigation = document.createElement("div");
		success_search_navigation.id = "success-search-navigation";

		var success_search = document.createElement("div");
		success_search.id = "search-found";
		// success_search.setAttribute('value', title + "-" + isbn); // set the tile's value to the id of the first book result
		// displaying the first book result 

		var left_arrow_button = document.createElement("button");
		left_arrow_button.setAttribute('class', 'ui-button arrow');
		left_arrow_button.textContent = "←";
		left_arrow_button.style.visibility = "hidden"; // the first book result will be shown, so set this to 'none'
		left_arrow_button.setAttribute('value', '-1');

		left_arrow_button.onclick = function(){
			var prev_id = parseInt(left_arrow_button.getAttribute('value'));
			displayBookInformation(bookList, prev_id);

			// decrease the value attribute
			if (prev_id - 1 >= 0) {
				right_arrow_button.setAttribute('value', parseInt(right_arrow_button.getAttribute('value')) - 1);
				left_arrow_button.setAttribute('value', parseInt(left_arrow_button.getAttribute('value')) - 1)
				// right_arrow_button.style.display = "block";
				right_arrow_button.style.visibility = "visible";
			}
			else{
				// hide the left arrow button because we're at the first book
				// left_arrow_button.style.display = "none";
				left_arrow_button.style.visibility = "hidden";
				left_arrow_button.setAttribute('value', parseInt(left_arrow_button.getAttribute('value')) - 1)
				right_arrow_button.setAttribute('value', parseInt(right_arrow_button.getAttribute('value')) - 1);
				// right_arrow_button.setAttribute('value', '1'); // second book in the list
			}
		};

		var right_arrow_button = document.createElement("button");
		right_arrow_button.setAttribute('class', 'ui-button arrow');
		right_arrow_button.textContent = "→";
		right_arrow_button.setAttribute('value', '1'); // set the value to the id of the next book result


		right_arrow_button.onclick = function(){
			var next_id = parseInt(right_arrow_button.getAttribute('value'));
			displayBookInformation(bookList, next_id);

			// increase the value attribute
			if (next_id + 1 < bookList.length) {
				right_arrow_button.setAttribute('value', parseInt(right_arrow_button.getAttribute('value'))  + 1);
				left_arrow_button.setAttribute('value', parseInt(left_arrow_button.getAttribute('value')) + 1);
				// left_arrow_button.style.display = "block";
				left_arrow_button.style.visibility = "visible";
			}
			else{
				// hide the right arrow button because we're at the last book
				// right_arrow_button.style.display = "none";
				right_arrow_button.style.visibility = "hidden";
				right_arrow_button.setAttribute('value', parseInt(right_arrow_button.getAttribute('value'))  + 1);
				left_arrow_button.setAttribute('value', parseInt(left_arrow_button.getAttribute('value')) + 1);
				// left_arrow_button.setAttribute('value', bookList.length - 1); // second to last book
			}

		};

		success_search_navigation.appendChild(left_arrow_button);
		success_search_navigation.appendChild(success_search);
		success_search_navigation.appendChild(right_arrow_button);

		// create the keep button
		var keep_button = document.createElement("button");
		keep_button.id = "keep-button";
		keep_button.textContent = "Keep";

		// append the created elements in order of display
		overlay.appendChild(close_button);
		overlay.appendChild(success_search_navigation);
		overlay.appendChild(keep_button);

		displayBookInformation(bookList, 0); // display the first book

		overlayOn();
	}
		
}

function displayBookInformation(bookList, bookID){

	var book = bookList[bookID];
	var bookTile = document.getElementById('search-found');
	bookTile.setAttribute('value', bookID);

	while (bookTile.firstChild) {
	    bookTile.removeChild(bookTile.firstChild);
	}
	
	var title = book.volumeInfo.title;
	var authors = "";

	if ('authors' in book.volumeInfo) {

		if(book.volumeInfo.authors !== undefined){
			authors = book.volumeInfo.authors;
		}
	}
	var cover_link = null;
	var description = null;
	var coverImg  = null;

	if ('thumbnail' in book.volumeInfo.imageLinks) {
		cover_link = book.volumeInfo.imageLinks.thumbnail;
	}
	
	if(cover_link === null){
		coverImg = document.createElement("div");
		coverImg.textContent = "no image"
		coverImg.setAttribute('class', 'no-cover-image');
	}
	else{
		coverImg = document.createElement("img");
		coverImg.setAttribute('src', cover_link);
		coverImg.setAttribute('alt', title + ' cover image');
	}

	var title_description_box = document.createElement('div');
	title_description_box.setAttribute('class',"book-title-description" );

	var titlePgh = document.createElement("p");
	titlePgh.textContent = title;
	titlePgh.setAttribute('class', "book-title");
	
	var descriptionPgh = document.createElement("p");
	descriptionPgh.textContent = "";
	descriptionPgh.setAttribute('class', "book-description");

	if('description' in book.volumeInfo ){
		if(book.volumeInfo.description !== undefined){
			descriptionPgh.textContent = book.volumeInfo.description.split(" ").slice(0,30).join(" ");
		}
		
	}

	var authorPgh = document.createElement("p");
	authorPgh.setAttribute("class", "book-authors");
	authorPgh.append(authors);

	title_description_box.append(titlePgh, authorPgh, descriptionPgh);

	bookTile.append(coverImg, title_description_box);

	var keep_button = document.getElementById('keep-button');

	keep_button.onclick = function(){
		var book_display = document.getElementById('bookDisplay');

		// var book_tile_wrapper = document.createElement("div");
		// book_tile_wrapper.setAttribute('class','book-tile-wrapper');

		bookTile.setAttribute('class', 'book-tile');
		bookTile.id = title + "-" + isbn;
		var close_button = document.createElement("button");
		close_button.setAttribute('class', 'tile-close');
		close_button.textContent = "ⓧ";

		close_button.onclick = function(){

			while (bookTile.firstChild) {
			    bookTile.removeChild(bookTile.firstChild);
			}

			bookTile.remove()
		};

		title_description_box.insertBefore(close_button, titlePgh)
		// book_tile_wrapper.append(close_button, bookTile);

		book_display.append(bookTile);

		overlayOff();
	};
	
}

function onResize(){
	
	var viewport_width = document.documentElement.clientWidth;
	var header = document.getElementsByTagName('header')[0];
	var form = document.getElementById("form");
	var form_wrapper = document.getElementById("form-wrapper");
	var search_button = form_wrapper.getElementsByTagName("button")[0];
	var main = document.getElementsByTagName("main")[0];
	var magnifying_glass = document.getElementById('magnifying-glass');

	if (viewport_width <= 480 && search_button.getAttribute('class') === "tile-search") { // Mobile View
		magnifying_glass.style.display = "block";
		form.style.display = "none";

		

		// if (search_button.getAttribute('class') === "tile-search") {

			// search_button.style.backgroundColor = "transparent";
			// search_button.textContent = "search";
			// search_button.setAttribute('class', search_button.getAttribute('class') + " material-icons");
			// search_button.style.color = "#4C78FB";
			// header.append(search_button);
			// form.style.display = "none";
		// }

	}
	else{ // Desktop View
		magnifying_glass.style.display = "none";
		// search_button.style.backgroundColor = "#4C78FB";
		// search_button.style.color = "white";
		// search_button.textContent = "Search";
		// form_wrapper.append(search_button);
		form.style.display = "flex";

	}

}

function toTileView(){

	// remove search help text
	var search_help = document.getElementById("search-help");
	search_help.style.display = "none";

	// move the search form into the header
	var search_form = document.getElementById("form-wrapper");
	search_form.style.flexDirection = "row";

	var search_button = search_form.getElementsByTagName("button")[0];
	search_button.style.marginTop = "4%";
	document.getElementById("form").appendChild(search_button);

	var search_button = document.getElementById('search-button');
	search_button.setAttribute('class', 'tile-search');
	var inputs = document.getElementById("form").getElementsByTagName("input");
	var labels = document.getElementById("form").getElementsByTagName("label");
	var ors = document.getElementById("form").getElementsByClassName("form-or");

	for (var i = inputs.length - 1; i >= 0; i--) {
		inputs[i].style.width = "30vw";
		inputs[i].style.marginRight = "5px";
		inputs[i].style.borderWidth = "2px";
	}

	for (var i = labels.length - 1; i >= 0; i--) {
		labels[i].style.marginLeft = "0px";
		labels[i].style.marginRight = "auto";
		labels[i].style.color = "black";
	}

	for (var i = ors.length - 1; i >= 0; i--) {
		ors[i].style.display = "none";
	}


	var header = document.getElementsByTagName("header")[0];
	header.appendChild(search_form);
	header.style.display = "flex";
	header.style.flexDirection = "row";
	header.style.boxShadow = " 1px 1px 15px #888888";
	header.style.zIndex = "5";
	var main = document.getElementsByTagName("main")[0];
	main.style.backgroundColor = "#ededed";
	var page_h1 = header.getElementsByTagName('h1')[0];
	


	// do resize changes to header
	var viewport_width = document.documentElement.clientWidth;

	if(viewport_width <= 480){
		search_form.style.flexDirection = "column";
		onResize();
	}
	else{
		page_h1.style.margin = "0px";
	}
}

function overlayOn(){
	var overlay = document.getElementById("overlay");
	overlay.style.display = "flex";
}

function overlayOff(){
	var overlay = document.getElementById("overlay");
	overlay.style.display = "none";
	while (overlay.firstChild) {
	    overlay.removeChild(overlay.firstChild);
	}
}
