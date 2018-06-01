const reactContainer = document.getElementById("react");

// A react component for a tag
class Tag extends React.Component {

    render () {
	return React.createElement('p',  // type
	    { className: 'tagText'}, // properties
	   this.props.text);  // contents
    }
};

// A react component for controls on an image tile
class TileControl extends React.Component {

    render () {
	// remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
        // parse image src for photo name
	var photoName = _src.split("/").pop();
	photoName = photoName.split('%20').join(' ');

        return ( React.createElement('div', 
 	 {className: _selected ? 'selectedControls' : 'normalControls'},  
         // div contents - so far only one tag
              React.createElement(Tag,
		 { text: photoName })
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
	        {style: {margin: this.props.margin, width: _photo.width},
			 className: 'tile',
                         onClick: function onClick(e) {
			       //          React.cloneElement(this.props.firstChild.doRender(), {
					     //    	style: {display:block}
					     //    	}
					    	// );

			    // call Gallery's onclick
			    return _onClick (e, 
					     { index: _index, photo: _photo }) 
				}
		 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected, 
		     src: _photo.src}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal', 
                     src: _photo.src, 
		     width: _photo.width, 
                     height: _photo.height
			    })
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
    console.log("in onclick!", obj);
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

// Called when the user pushes the "submit" button 
function photoByNumber() {

	var nums = document.getElementById("num").value;
	nums = nums.trim().split(',');
	nums = nums.map(Number);

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

	if (nums.length > 0) {
		var photoURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
		var url = "query?numList="

		for (var i = nums.length - 1; i >= 0; i--) {
			// should probably do some type checking here, but the check also occurs in the server code
			url += nums[i];
			var query_item = document.createElement("div");
			query_item.setAttribute('class', "query-item");
			var item_text = document.createElement("p");
			var item_button = document.createElement("button");
			item_button.setAttribute('class', 'query-item-button');
			item_button.textContent = "X";

			item_text.textContent = nums[i];
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
					photos[i].src = photoURL + photos[i].src;
				}

				galleryApp.setState({ photos: photos });
				galleryApp.render();
			}
			else{
				alert("Invalid Query! Queries should consist only of numbers between 0 and 988.");
			}

		}

		
	}
}



