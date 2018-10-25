const reactContainer = document.getElementById("react");

// A react component for a tag
class Tag extends React.Component {

    render () {

    	var _parentUpdate = this.props.parentUpdate;
    	var key = this.props.tagID;

    	function tagOnClick(e){
    		e.stopPropagation();
    		_parentUpdate(e, key);
    	}

		return React.createElement(
			'div',
			{className:'tagBox'},

			React.createElement(
				'p',  // type
				{ className: 'tagText', onClick: tagOnClick }, // properties
	   			this.props.text + ' x'
	   		)  // contents
		);



    }
};

// A react component for a add tag
class AddTag extends React.Component {

    render () {

    	var _parentUpdate = this.props.parentUpdate;
    	var _photo_name = this.props.photoName;
    	var inputID = _photo_name.replace(/\s+/g, '')+'-input';

    	function tagOnClick(e){
    		e.stopPropagation();
    		
    		var key = document.getElementById(inputID).value;
    		_parentUpdate(e, key);
    	}

		return React.createElement(
			'div',
			{className:'tagBox tagAddBox', 
				onClick:function(e){
					e.stopPropagation();
				}
			},

			React.createElement(
				'input',  // type
				{ className: 'tagInput', id:inputID}// properties
	   		),
	   		  // contents
	   		React.createElement(
				'button',  // type
				{ className: 'tagButton', onClick:tagOnClick}, // properties
	   			'+'
	   		)  // contents

		);



    }
};

// A react component for controls on an image tile
class TileControl extends React.Component {

	constructor (props) {
	super(props);
		var _tags = props.tags;
		var _tagElements = []
        var tagList = _tags.split(',');
        this.deleteTag = this.deleteTag.bind(this);
        this.addTag = this.addTag.bind(this);

        for(let i=0;  i< tagList.length;  i++) {
         	_tagElements.push(React.createElement(Tag, {text:tagList[i], key:tagList[i]+i, tagID:tagList[i]+i, parentUpdate:this.deleteTag}));      
        }
        //  empty tag
        _tagElements.push(React.createElement(AddTag, {text: '+', key:'add-tag', tagID:'add-tag', photoName:this.props.file_name, parentUpdate:this.addTag}));

		this.state = {tagElements:_tagElements, photoID:props.photo_id};
        
    }

    getIndex(array, key){

    	for (var i = array.length - 1; i >= 0; i--) {
    	 	if(array[i].key === key){
    	 		return i;
    	 	}
    	}
    	return -1;
    }

   	deleteTag(event, key){
   		var new_tag_elements = this.state.tagElements;
   		var index = this.getIndex(new_tag_elements, key);
   		var removed = new_tag_elements.splice(index, 1);
   		var photo_id = this.state.photoID;
   		var tag = String(key);
   		var url = "action?type=delete&photo_id="+ photo_id + "&tag=" + encodeURIComponent(tag.substring(0, tag.length -1));
   		var $this = this;
   		// send ajax call to server to delete the tag from the photo with the right id
   		var request = new XMLHttpRequest();
		request.open("GET", url);
		
		request.addEventListener("load", reqListener);

		request.send();

		function reqListener(){
			if (this.status === 200) {
				$this.setState({tagElements:new_tag_elements, photoID:photo_id});
			}
			else{
				alert("Couldn't delete the tag! An error happened.");
			}
		}
	}

	addTag(event, key){
		var new_tag_elements = this.state.tagElements;
		var photo_id = this.state.photoID;
		var url = "action?type=add&photo_id="+ photo_id + "&tag=" + encodeURIComponent(key);
   		var $this = this;

   		if (new_tag_elements.length - 1 >= 6) {
   			alert("The maximum number of tags has been reached! Please delete some and try again.");
   		}
   		else{
   			// add new tag
	   		new_tag_elements.pop();
	   		new_tag_elements.push(React.createElement(Tag, {text:key, key:key+(new_tag_elements.length + 1), tagID:key+(new_tag_elements.length + 1), parentUpdate:this.deleteTag}));
	   		new_tag_elements.push(React.createElement(AddTag, {text: '+', key:'add-tag', tagID:'add-tag', photoName:this.props.file_name, parentUpdate:this.addTag}));
	   		
	   		// send ajax call to server to delete the tag from the photo with the right id
	   		var request = new XMLHttpRequest();
			request.open("GET", url);
			request.addEventListener("load", reqListener);
			request.send();

			function reqListener(){
				if (this.status === 200) {
					$this.setState({tagElements:new_tag_elements, photoID:photo_id});
				}
				else{
					alert("Couldn't add the tag! An error happened.");
				}
			}
   		}

	}

    render () {
	// remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;

        // this.setState({tagElements:_tagElements});
        return ( React.createElement('div', 
	 	 	{
	 	 		className: _selected ? 'selectedControls' : 'normalControls'
	 	 	},  
	         // div contents
	         this.state.tagElements
		   )// createElement div
		)// return
    } // render
};

// A react component for an image tile
class ImageTile extends React.Component {

    render() {
		// onClick function needs to remember these as a closure
		var _onClick = this.props.onClick;
		var _index = this.props.index;
		var _photo = this.props.photo;
		var _selected = _photo.selected; // this one is just for readability
		var $this = this;
		return (
		    React.createElement('div', 
			    {
			    	style: {margin: this.props.margin, width: _photo.width},
					className: 'tile',
		            onClick: function onClick(e) {

		            	$this.setState({onClick:_onClick, index:_index, photo:_photo, selected:!_selected});
					    // call Gallery's onclick
					    return _onClick (e, 
							     { index: _index, photo: _photo }) 
					}
				 }, // end of props of div
				 // contents of div - the Controls and an Image
				 React.createElement('div',
				 	{
				    	className: _selected ? 'overlayOn' : 'overlayOff', 
					},

				 	React.createElement(TileControl,
					    {
					    	selected: _selected,
					    	photo_id:_photo.idNum, 
					     	src: _photo.src,
					     	file_name:_photo.fileName,
					     	tags: _photo.tags
					    }
					),

				 	),

				React.createElement('img',
				    {
				    	className: _selected ? 'selected' : 'normal', 
		                src: _photo.src, 
				     	width: _photo.width, 
		                height: _photo.height
					}
				)
		)//createElement div
	); // return
    } // render
} // class

// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: [] };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
    return (
       React.createElement( Gallery, {photos: this.state.photos, 
		   onClick: this.selectTile, 
		   ImageComponent: ImageTile} )
	    );
  }

}

var galleryApp = ReactDOM.render(React.createElement(App),reactContainer);

function reset_autocomplete_box(){

	var autocomplete_box = document.getElementById("autocomplete");
	var suggested_children = [];

	while (autocomplete_box.firstChild) {

		if (autocomplete_box.firstChild.id === "selected_tags" && autocomplete_box.firstChild.childElementCount > 0) {

			suggested_children = autocomplete_box.firstChild.childNodes;
		}
		
		autocomplete_box.removeChild(autocomplete_box.firstChild);
	}

	var selected_tags = document.createElement('div');
	selected_tags.id = "selected_tags";

	if (suggested_children.length > 0) {
		for (var i = suggested_children.length - 1; i >= 0; i--) {
			selected_tags.prepend(suggested_children[i]);
		}

	}

	var autocomplete_texts = document.createElement('div');
	autocomplete_texts.id = "autocomplete_texts";

	var autocomplete_texts_top = document.createElement('p');
	autocomplete_texts_top.textContent = "Press enter or click the search button to search";

	var autocomplete_texts_bottom = document.createElement('p');
	autocomplete_texts_bottom.textContent = "Suggested Tags";
	
	autocomplete_texts.append(autocomplete_texts_top);
	autocomplete_texts.append(autocomplete_texts_bottom);

	autocomplete_box.append(selected_tags);
	autocomplete_box.append(autocomplete_texts);
	
}

function autocompleteQuery(){
	var KeyID = event.keyCode
	var autocomplete_box = document.getElementById("autocomplete");
	var selected = document.getElementById("selected_tags");
	var letters = document.getElementById("num").value;

	if (KeyID === 13) { // on enter send the query
		var no_search_text = document.getElementById("no-search");
		no_search_text.style.display = "none";
		queryWithSelected();
	}

	else if (KeyID === 8 || KeyID === 46) { // don't count backspaces

		if(letters.length === 0){
			
			reset_autocomplete_box();
			var selected = document.getElementById("selected_tags");

			if (selected.childElementCount === 0 && autocomplete_box.classList.contains('has_suggestions')) {
				autocomplete_box.classList.toggle('has_suggestions');
			}

			
		}	

	}

	else if(letters.length === 2){
		var url = "query?autocomplete=" + encodeURIComponent(letters);
		var autoReq = new XMLHttpRequest();

		autoReq.open("GET", url);

		function autocompleteCallBack(){
			if (this.status === 200) {
				var tag_completes = JSON.parse(this.responseText);
				reset_autocomplete_box();
				for(var key in tag_completes.tags){
					var tag_suggestion = document.createElement("div");
					tag_suggestion.classList.add("tag_suggestion");
					tag_suggestion.id = key + "-suggestion";
					
					var suggestion_tag = document.createElement("p");
					suggestion_tag.id = key + "-autocomplete-tag";
					suggestion_tag.classList.add("autocomplete-tag");
					suggestion_tag.textContent = key;

					var tag_suggestion_arrow = document.createElement("p");
					tag_suggestion_arrow.classList.add('material-icons');
					tag_suggestion_arrow.classList.add('tag_suggestion_arrow');
					tag_suggestion_arrow.id = key + "-arrow";
					tag_suggestion_arrow.textContent = "call_made";

					tag_suggestion.append(suggestion_tag);
					tag_suggestion.append(tag_suggestion_arrow);

					tag_suggestion.onclick = tag_suggestion_onclick;

					function tag_suggestion_onclick(event){
						target = event.target.textContent;
						selected_tag = document.getElementById(target +  "-suggestion");
						selected = document.getElementById("selected_tags");
						selected_tag.classList.remove("tag_suggestion");
						selected_tag.classList.add("tag_selected");
						arrow = document.getElementById(target + "-arrow");
						arrow.parentNode.removeChild(arrow);

						tag = document.getElementById(target + "-autocomplete-tag");
						tag.textContent = tag.textContent + " x";

						selected_tag.onclick = tag_selected_onclick;
						selected_tag.append(tag);
						selected.append(selected_tag);
					}

					function tag_selected_onclick(event){
						var target = event.target.textContent;
						var selectd_tag = document.getElementById(target.substring(0, target.length - 2) + "-suggestion");
						var auto_texts = document.getElementById("autocomplete_texts");
						selectd_tag.classList.remove("tag_selected");
						selectd_tag.classList.add("tag_suggestion");

						tag = document.getElementById(target.substring(0, target.length - 2) + "-autocomplete-tag");
						tag.textContent = target.substring(0, target.length - 2);

						var tag_suggestion_arrow = document.createElement("p");
						tag_suggestion_arrow.classList.add('material-icons');
						tag_suggestion_arrow.classList.add('tag_suggestion_arrow');
						tag_suggestion_arrow.textContent = "call_made";
						tag_suggestion_arrow.id = target.substring(0, target.length - 2) + "-arrow";

						selectd_tag.onclick = tag_suggestion_onclick;
						
						selectd_tag.append(tag);
						selectd_tag.append(tag_suggestion_arrow);

						auto_texts.after(selectd_tag);

					}



					autocomplete_box.append(tag_suggestion);
				}

				// might need to change this

				if (selected.childElementCount === 0 && !autocomplete_box.classList.contains('has_suggestions')) {
					autocomplete_box.classList.toggle('has_suggestions');
				}

			}
			else{
				console.log("No autocomplete matches.");
			}
		}

		autoReq.addEventListener("load", autocompleteCallBack);
		autoReq.send();

	}

}

function queryWithSelected(){
	var autocomplete_box = document.getElementById("autocomplete");
	autocomplete_box.classList.remove('has_suggestions');

	var selected = document.getElementById("selected_tags");
	var tag_nodes = selected.childNodes;
	var query_result = document.getElementById("query-result");

	while (query_result.firstChild) {
	    query_result.removeChild(query_result.firstChild);
	}

	var query_result_text = document.createElement("p");
	query_result_text.id = "query-result-text";
	query_result_text.style.display = "block";
	query_result_text.textContent = "You searched for ";
	query_result.append(query_result_text);

	var url = "query?keyList=";
	for (var i = 0; i <= tag_nodes.length - 1; i++) {

		var query_item = document.createElement("div");
		query_item.setAttribute('class', "query-item");
		var item_text = document.createElement("p");
		var item_button = document.createElement("button");
		item_button.setAttribute('class', 'query-item-button');
		item_button.textContent = "X";

		item_text.textContent = tag_nodes[i].textContent.substring(0, tag_nodes[i].textContent.length - 2);
		query_item.append(item_text);
		query_item.append(item_button);
		query_result_text.after(query_item);

		url += tag_nodes[i].textContent.substring(0, tag_nodes[i].textContent.length - 2);;
		if (i < tag_nodes.length - 1) {
			url += "+";
		}
	}

		var auto_tag_req = new XMLHttpRequest();

		auto_tag_req.open("GET", url);

		auto_tag_req.addEventListener("load", reqListener);

		auto_tag_req.send();

		function reqListener(){
			if (this.status === 200) {
				var photoURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
				var photos = JSON.parse(this.responseText);
				for (var i = photos.length - 1; i >= 0; i--) {
					photos[i].src = photoURL + encodeURIComponent(photos[i].fileName);
				}

				galleryApp.setState({ photos: photos });
				galleryApp.render();
			}
			else{
				alert("Invalid Query! Queries should consist only of lower case words.");
			}

		}

}
// Called when the user pushes the "submit" button 
function photoQuery() {
	var autocomplete_box = document.getElementById("autocomplete");
	autocomplete_box.classList.remove('has_suggestions');

	var tags = document.getElementById("num").value;
	tags = tags.trim().split(',');
	// nums = nums.map(Number);

	var no_search_text = document.getElementById("no-search");
	no_search_text.style.display = "none";

	// set up the 'You searched for ' text
	var query_result = document.getElementById("query-result");

	while (query_result.firstChild) {
	    query_result.removeChild(query_result.firstChild);
	}

	var query_result_text = document.createElement("p");
	query_result_text.id = "query-result-text";
	query_result_text.style.display = "block";
	query_result_text.textContent = "You searched for ";
	query_result.append(query_result_text);


	var selected = document.getElementById("selected_tags");
	var tag_nodes = selected.childNodes;

	if (tags.length > 0 && tag_nodes.length === 0) {
		var photoURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
		var url = "query?keyList="

		for (var i = tags.length - 1; i >= 0; i--) {
			// should probably do some type checking here, but the check also occurs in the server code
			url += encodeURIComponent(tags[i]);
			var query_item = document.createElement("div");
			query_item.setAttribute('class', "query-item");
			var item_text = document.createElement("p");
			var item_button = document.createElement("button");
			item_button.setAttribute('class', 'query-item-button');
			item_button.textContent = "X";

			item_text.textContent = tags[i];
			query_item.append(item_text);
			query_item.append(item_button);
			query_result_text.after(query_item);

			if (i > 0) {
				url += '+';
			}
		}
		var oReq = new XMLHttpRequest();

		oReq.open("GET", url);

		oReq.addEventListener("load", reqListener);

		oReq.send();

		function reqListener(){
			if (this.status === 200) {
				// photoURL = photoURL + this.responseText;
				var photos = JSON.parse(this.responseText);
				for (var i = photos.length - 1; i >= 0; i--) {
					photos[i].src = photoURL + encodeURIComponent(photos[i].fileName);
				}

				galleryApp.setState({ photos: photos });
				galleryApp.render();
			}
			else{
				alert("Invalid Query! Queries should consist only of lower case words.");
			}

		}
	}
	else if(tag_nodes.length > 0){
		queryWithSelected();
	}
}


