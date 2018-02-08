// DOM elements (selected via jQuery)
var elements = {
 	toTopBtn: $(".to-top"),
	loading: $(".loading"),
	// Side bar
	menu: $(".menu"),
	menuBtn: $("#menu-btn"),
	addSrInput: $("#add-sr"),
	addSrBtn: $("#add-sr-btn"),
	clearInputBtn: $(".clear-input-btn"),
	subredditList: $("#sr-list"),
	restoreSubreddits: $("#restore-sr"),
	checkAllBtn: $("#check-all"),
	multipleDeleteBtn: $("#mult-del"),
	recommendedList: $("#recommended"),
	// Settings
	adultSettingInput: $(".settings #nsfw"),
	titleSettingInput: $(".settings #titles"),
	typeInput: $("#type"),
	timeInput: $("#time"),
	// Images & relateed
	reloadImgsBtn: $("#reload-imgs"),
	imgsContainer: $("#imgs-container"),
	loadMoreBtn: $("#load-more"),
	// Full screen
 	fullScreenContainer: $(".full-screen-container"),
 	fullScreenVideo: $(".full-screen-container > video"),
	fullScreeNext: $(".next"),
	fullScreenPrevious: $(".previous"),
	fullScreenClose: $(".close"),
	currentPositionDisplay: $(".currentPosition"),
 	totalImagesDisplay: $(".totalImages")
};

// Local store related data & methods
var localStorageData = {
	initialData: { // Default values for stored local storage data (in case they don't exist), JSON format
		list: "[\"itookapicture\", \"photography\", \"OldSchoolCool\", \"Cinemagraphs\", \"AbandonedPorn\", \"MilitaryPorn\", \"EarthPorn\", \"spaceporn\", \"Eyebleach\",\"gifs\",\"pics\"]",
		sortType: "\"hot\"",
		sortTime: "\"day\"",
		displayTitles: "\"true\"",
		adultContent: "\"false\""
	},
	locations: { // Where to find the values to store in local storage
		"list": [ ["subreddits", "list"] ],
		"sortType": [ ["urlParams", "sortType"] ],
		"sortTime": [ ["urlParams", "sortTime", "value"] ],
		"adultContent": [ ["urlParams", "adultContent", "value"] ],
		"displayTitles": [ ["images", "displayTitles"] ]
	},
	updateStorage: function(name) { // Stores the current values in local storage (using the locations to know where to find them)
		var item = window, i;
		for(i = 0; i < this.locations[name][0].length; i++){
			item = item[ this.locations[name][0][i] ];
		}
		window.localStorage.setItem(name, JSON.stringify(item));
	},
	deleteStorage: function() { // Completely clears the Local Storage
		window.localStorage.clear();
	},
	getValue: function(name) { // returns the value either from "initialData" or from localStorage if the property exists there
		return window.localStorage.getItem(name) ? JSON.parse(window.localStorage.getItem(name)) : JSON.parse(this.initialData[name]);
	}
};



/*======================= 
				Customized jQuery ajaxReqest, an alternative to jQuery's "ajaxSetup()"

	condition: prevents the function from doing anything
	timeout: request timeout

	Obj can contain: loading (boolean, show the loading circle ) 
				        success (function to run at successful request)
				        fail (functon to run at failed request)
				        complete (function to run at completed request)
				        reqName (what name to use for the alerts)
				        silent (boolean value, display the alerts for communication errors)

	Returns the ajaxRequest (which in turns returns an xhr object) so it can be stored and later cancelled if needed
=========================*/
function ajaxRequest(reqUrl, condition, timeout, obj) {

	if(condition){
		if(obj.loading){
			elements.loading.removeClass("invisible");
		}

		return $.ajax({
			url: reqUrl,
			method: "GET",
			crossDomain: true,
			dataType: "json",
			timeout: timeout,
			success: function(succData){
				if(obj.success){ obj.success(succData); }
			},
			error: function(errorData){
				if(obj.fail){ obj.fail(errorData); }

				if (!obj.silent){
					if(errorData.statusText === "timeout") {
						alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Request timeout.");
					}
					else if(errorData.statusText !== "abort") {
						alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Communication failed.");
					}
				}
			},
			complete: function(completeData){
				if(obj.complete){ obj.complete(completeData); }
				if(obj.loading){ elements.loading.addClass("invisible"); }
			}
		}); // AJAX req return end

	} //Condition end
}

// Returns the API Requests URLs for different tasks
var requestUrls = {
	base: "https://www.reddit.com/",
	postsData: function(subreddits) { /*Get posts data for the current subreddits and sorting values*/
		var url;
		subreddits = subreddits.join("+").toLowerCase();
		url = this.base + "r/" + subreddits;
		url += "/" + urlParams.sortType + ".json?";
		return url + urlParams.getParams(["limit", "after", "sortTime"]);
	},
	subExists: function(subName) { /*Check if the subreddit exists (and is accesible)*/
		var url = this.base;
		url += "r/" + subName + "/about/rules.json";
		return url;
	},
	recommended: function() { /*Get a recommended list of subreddits based on the current list*/
		var url = this.base + "api/recommend/sr/srnames.json?";
		url += "srnames=" + subreddits.list.join(",") + "&";
		url += urlParams.getParams(["adultContent"]);
		return url;
	},
	searchAutocomplete: function(query, adult) {
		var url = this.base + "api/subreddit_autocomplete.json?";
		urlParams.longQuery.value = query;
		url += urlParams.getParams( ["longQuery", "includeProfiles"] );
		url += "&include_over_18=" + adult;
		return url;
	},
	gfyCatVideo: function(name) { /*gfycat url --> gfycat video url*/
		return "https://gfycat.com/cajax/get/" + name;
	}
};

// API URL parameters data & methods for retrieving / changing them
var urlParams = {
		searchQuery: {
			name: "q",
			value: "cats"
		},
		longQuery: {
			name: "query",
			value: "fat_cats"
		},
		includeProfiles: {
			name:"include_profiles",
			value: false
		},
		limit: {
			name: "limit",
			value: 20 /*How many result to get per 1 request, increasing this will result in getting more image per "load" */
		},
		adultContent: {
			name: "include_over_18",
			value: localStorageData.getValue("adultContent")
		},
		after: {
			name: "after",
			value: ""
		},
		// Time and type start out as whatever their HTML value is		
		sortTime: {
			name: "t",
			value: localStorageData.getValue("sortTime")
		},
		sortType: localStorageData.getValue("sortType"),
		getParams: function(paramList) { // <-- takes an array of params obj names (ex: "sortTime"); --> returns that name:value pairs in an URL-friendly string
			var params = [], i;
			for(i = 0; i < paramList.length; i++){
				params.push(this[paramList[i]].name + "=" + this[paramList[i]].value);
			}
			return params.join("&");

		},
		// When sorting is changed, get new images based on the new sorting
		setType: function(type, loadImg) { 
			this.sortType = type;
			if(loadImg) { images.getImages(true, true); }
			localStorageData.updateStorage("sortType");
		},
		setTime: function(time, loadImg) {
			this.sortTime.value = time;
			if(loadImg) { images.getImages(true, true); }
			localStorageData.updateStorage("sortTime");
		}
};




// Contains the subreddits data, as well as the related methods for adding/removing them from the list
var subreddits = {
	list: localStorageData.getValue("list"), /*Subreddits list on which the data is based on*/
	addWithCheck: function(element) { /*Addings the subreddits only after it is checked for existance (and accesability, ie not banned or private)*/
		var value = encodeURI( element.val() );
		if(value) {
			element.val("");
			this.checkSubExist(value, function() {
				subreddits.addWithoutCheck(value);
			});
		}
	},
	addWithoutCheck: function(value) { /*Adds the subreddits without checking (used for recommended list and autocomplete)*/
		subreddits.list.push(value);
		elements.addSrInput.val("");
		subreddits.checkDuplicate();
		subreddits.showList(elements.subredditList, true);
		images.getImages(true, true);
		relatedSubs.getRelatedSubs();
		autocomplete.autocompleteReq.forEach(function(req) {
			req.abort();
			autocomplete.secondReqDone = false;
			autocomplete.firstReqDone = false;
		});
		autocomplete.aComplete.list = [];
		autocomplete.aComplete.close();
		localStorageData.updateStorage("list");

	},
	checkDuplicate: function() { /*Prevents duplicate subreddits from being added*/
		this.list = this.list.filter(function(curr, ind, arr) {
			return arr.slice(ind + 1).indexOf(curr) === -1;
		});
	},
	remove: function(nameList) { /*Removes the subreddits from the list*/
		var dataIndex, i, j;
		for(i = 0; i < nameList.length; i++){
			for(j = 0; j < this.list.length; j++){
				if( this.list[j].toLowerCase() === nameList[i].toLowerCase() ) {
					dataIndex = j;
					break;
				}
			}
			this.list.splice(dataIndex, 1);
		}
		subreddits.showList(elements.subredditList, false);
		images.searchCount = 0;
		images.getImages(true, true);
		relatedSubs.getRelatedSubs();
		localStorageData.updateStorage("list");
	},
	showList: function(element, add) { // constructs the subreddit list based on the subreddits.list (adds/removes if necessary)
		// add --> boolean; true --> adds a subreddits ; false --> removes it
		var html = "", 
		inputs = [], 
		i,
		currentIndex,
		srElements = $("#sr-list > .subreddit-single");
		for(i = 0; i < srElements.length; i++){
			inputs.push( srElements[i].getAttribute("data-srname") );
		}
		if(add) {
			subreddits.list.forEach(function(current) {
				if( inputs.indexOf(current) === -1 ) {
					html = "";
					html += "<div class='subreddit-single clearfix' data-srname=\"" + current + "\">";
					html += "<label><div class=\"custom-checkbox-wrapper\">";
					html += "<input class=\"hidden-input\" type=\"checkbox\" name=\"" + current + "\">";
					html += "<div class=\"faux-checkbox\"></div></div>";
					html += "<div class='subredditName'>" + current + "</div></label>";
					html += "<button class='del-sr no-input-style' type='button'><i class=\"fa fa-trash-o\"></i></button>";
					html += "</div>";
					var el = $(html);
					el.css("backgroundColor", uncategorized.colorGenerator());
					el.appendTo(element);
					fScreen.showHideArrows();
				}
			});
		}
		else {
			inputs.forEach(function(current) {
				currentIndex = subreddits.list.indexOf(current);
				if( currentIndex === -1 ) {
					$("#sr-list").children(".subreddit-single[data-srname='" + current + "']").fadeOut(function() {
						$(this).remove();
					});
				}
			});
		}
	},
	checkSubExist: function(subName, succesful) {
		var reqName = "Subreddit Validation",
		success = function(data){
			if( data.hasOwnProperty("site_rules") ) {
				succesful();
			}
			else {
				alertify.delay(5000).error("<strong>" + reqName + "</strong>:Subreddit doesn't exist.");
			}
		},
		error = function(data) {
			if(data.status === 404) {
				if(data.hasOwnProperty("responseJSON")){
					if( data.responseJSON.hasOwnProperty("reason") ) {
						alertify.delay(5000).error("<strong>" + reqName + "</strong>:Private or banned subreddit");
					}
					else {
						alertify.delay(5000).error("<strong>" + reqName + "</strong>:Subreddit doesn't exist");
					}
				}
			}
			else if(data.status === 403 && data.hasOwnProperty("responseJSON") && data.responseJSON.reason === "private") {
				alertify.delay(5000).error("<strong>" + reqName + "</strong>:Private  subreddit");
			}
			else {
				var online = function(){
					alertify.delay(5000).error("<strong>" + reqName + "</strong>:Subreddit doesn't exist");

				};
				var offline = function(){
					alertify.delay(5000).error("<strong>" + reqName + "</strong>: Communication error.");

				};
				uncategorized.doesConnectionExist(online, offline);
			}
		};

		ajaxRequest(requestUrls.subExists(subName),true, 4000, {
			success: success,
			fail: error,
			reqName: "Subreddit Validation ",
			silent: true,
			loading: false,
		});
	},
};


var images = {
	displayTitles: localStorageData.getValue("displayTitles"),
	currentImages: [], // Stores the images elements of the current images, to be used for full screen showing
	imageRequests: [], // HTTP Requests for images data
	continueSearch: true, // stops calling the getImages function when there is no more data to get
	imagesTarget: 25, // roughly how many images to display for the fresh image requests
	maxNewSearchRequests: 5, // stops trying to get the imagesTarget no. of images when the requests for that exeed this amount
	searchCount: 0, // keeps track of the no. of requests for fresh image requests
	maximumResWidth: 320, // the image resolution target for previews, can go lower than this, but not higher
	rawResponseData: [], // unfiltered (for adult and images) response data
	filterAdult: function() {
		if(!urlParams.adultContent.value) {
			this.rawResponseData = this.rawResponseData.filter(function(current) {
				return !current.over_18;
			});
		}
	},
	keepOnlyImages: function() { // Keep only the data which cointains images and videos
		this.rawResponseData = this.rawResponseData.filter(function(current){
			var conditionOne = current.url.search(/(.jpg|.png|.jpeg|.svg|.gif|.gifv|.mp4|.webm)$/gi) >= 0;
			var conditionTwo = current.url.search("gfycat.com") >= 0;
			return conditionOne || conditionTwo;
		});
	},
	getCorrectResolution: function(post) { // Gets preview images whose width is <= that of the "maximumResWidth" props value
		var i, l;
		if(post.hasOwnProperty("preview")) {
			l = post.preview.images[0].resolutions.length;
			for(i = l - 1; i >= 0; i--) {
				if(post.preview.images[0].resolutions[i].width <= 320) {
					return post.preview.images[0].resolutions[i].url;
				}
			}
		}
		else {
			return post.url;
		}
	},
	displayImages: function() { // Displays the images in the HTML
		var htmlS = "", imagesElements, len, i, crImages;
		this.rawResponseData.forEach(function(current, indx, arr) {
			htmlS += "<div class='img-result'>";
			// htmlS += "<img onerror=\"deleteEl(this);\" onload=\"showOnload(this);\" class=\"content faded\" src=\"" + current.url;
			htmlS += "<img onerror=\"deleteEl(this);\" onload=\"showOnload(this);\" class=\"content faded\" src=\"" + images.getCorrectResolution(current);
			htmlS += "\" data-fullurl=\"" + current.url + "\">";
			htmlS += "<div class=\"img-desc clearfix\"><a href=\"" + requestUrls.base + current.permalink.substring(1) + "\" class='post-txt' target=\"_blank\" title=\"" +current.title + "\">" + current.title + "</a>";
			htmlS += "<div class='img-sr-name'>" + current.subreddit_name_prefixed + "</div></div></div>";
		});
		imagesElements = $(htmlS);
		// for(var i = 0; i < imagesElements.length; i++){
		// 	uncategorized.msnry.appended( imagesElements[i] );
		// }
		uncategorized.msnry.layout();
		
		imagesElements.children("img").on("click", function(){
			fScreen.show(this);
		});
		this.rawResponseData = [];
		imagesElements.appendTo(elements.imgsContainer);
		this.currentImages = [];
		// elements.imgsContainer.children(".img-result").children("img").length;
		len = elements.imgsContainer.children(".img-result").length;
		crImages = elements.imgsContainer.children(".img-result").children("img");
		for (i = 0; i < len; i++) {
			this.currentImages.push(crImages[i]);
		}
		elements.totalImagesDisplay.text(this.currentImages.length);
		fScreen.showHideArrows();
	},
	/*
	Makes the req to get images based on three scenarios:
		freshSearch --> this signified that the new images should be loaded (when sorting or subreddits are added and/or removed)
		newSearch --> this is the search done UNTIL the search quote is reached (or failed to be reached)

		no freshSearch and no newSearch --> just continues to get more images
	*/
	/*=========================================*/
	getImages: function(newSearch, freshSearch) { 
		var url, req;
		if(newSearch) {
			if(!this.searchCount || freshSearch) {
				urlParams.after.value = "";
				images.rawResponseData = [];
				elements.imgsContainer.html("<div class='col-width'></div>");
				uncategorized.msnry.layout();
				this.imageRequests.forEach(function(req) {
					req.abort();
				});
				this.imageRequests = [];
				this.continueSearch = true;
				// elements.loadMoreBtn.removeClass("invisible");
			}
			this.searchCount++;
		}
		else {
			this.searchCount = 0;
			if(images.continueSearch) {
				elements.fullScreeNext.prop("disabled", true);
			}
		}
		uncategorized.avoidMultipleRequests = false;
		url = requestUrls.postsData(subreddits.list);

		if(subreddits.list.length) {
			elements.loadMoreBtn.addClass("invisible");
			req = ajaxRequest(url, images.continueSearch, 7000, {
				reqName: "Getting Images",
				silent: false,
				loading: true,
				success: function(succ) {
							elements.loadMoreBtn.removeClass("invisible");
							var imagesCount;
							succ.data.children.forEach(function(cr){
								images.rawResponseData.push(cr.data);
							});
							images.keepOnlyImages();
							images.filterAdult();
							urlParams.after.value = succ.data.after;
							images.displayImages();
							imagesCount = elements.imgsContainer.children(".img-result").length;
							if(!succ.data.after) {
								images.searchCount = 5;
							}
							if( (images.searchCount === images.maxNewSearchRequests) && imagesCount  === 0){
								alertify.delay(5000).error("No images to load." );
								images.continueSearch = false;
								elements.loadMoreBtn.addClass("invisible");
							}
							else if(!succ.data.after) {
								alertify.delay(5000).error("No more images to load.");
								images.continueSearch = false;
								elements.loadMoreBtn.addClass("invisible");
							}
							if(newSearch && (imagesCount < images.imagesTarget) && (images.searchCount < images.maxNewSearchRequests)){
								images.getImages(true);
							}
							else {
								images.searchCount = 0;
								uncategorized.avoidMultipleRequests = true;
							}
				},
				fail: function() {
					uncategorized.avoidMultipleRequests = false;
					elements.loadMoreBtn.removeClass("invisible");

					// elements.loadMoreBtn.removeClass("hidden");
				},
				complete: function() {
					elements.fullScreeNext.prop("disabled", false);
				}
			});
			if(req) { this.imageRequests.push(req); }
		}
	}
};


// Autocomplete data & methods
var autocomplete = {
	aSrNames: [], // Autocomplete subreddits array
	aComplete: new Awesomplete(elements.addSrInput[0], { // The Awesomplete lib object
		minChars: 1
	}),
	// Signifies the completion of the NSFW/SFW request for autocomplete data
	firstReqDone: false,
	secondReqDone: false,
	combinedSuggestions: [], // based on the adultContent value, the combined list of SFW + (NSFW)
	recommendedListSFW: [], // Safe For Work list of autocomplete subreddits
	recommendedListNSFW: [], // Not Safe For Work list
	autocompleteReq: [], // HTTP Requests for autocomplete data
	/*
		Combined (or not) adult container and safe autocomplete suggestions
		Also, only displays displays SFW and NSFW results in a 3:1 ratio
	*/
	combineSuggestions: function() { 
		var i;
		this.aComplete.list = [];
		this.combinedSuggestions = [];
		if(!urlParams.adultContent.value) { // Removes NSFW data is SFW-only option is chosen
			this.recommendedListNSFW = [];
		}
		i = 0;
		while(this.combinedSuggestions.length <= 5) { // Stops when 6 results are concatendated
			if(i % 3 === 0 && this.recommendedListNSFW.length) {
				this.combinedSuggestions.push( this.recommendedListNSFW.shift() );
			}
			else if(this.recommendedListSFW.length) {
				this.combinedSuggestions.push( this.recommendedListSFW.shift() );		
			}
			if(!this.recommendedListSFW.length && !this.recommendedListNSFW.length) {
				break; // Stops when there's nothing more to sort through (prevents infinite loop)
			}
			i++;
		}
		if(this.combinedSuggestions.length) {
			this.aSrNames = [];
			this.combinedSuggestions.forEach(function(sr) {
				autocomplete.aSrNames.push(sr);
			});
			this.aComplete.list = this.aSrNames;
			this.aComplete.evaluate();
		}
		else {
			this.aComplete.list = [];
			this.aComplete.close();
		}
		this.recommendedListNSFW = [];
		this.recommendedListSFW = [];
	},
	addSuggestions: function() { // Combine the suggestions only when the req for SFW and NSFW are both completeData
		if(this.firstReqDone && this.secondReqDone) {
			this.firstReqDone = false;
			this.secondReqDone = false;
			this.combineSuggestions();
		}
	},
	/*============================*/
	getAutocomplete: function(value) { // Makes the request to get the autocomplete data, and performs the related necessary actions to display them
		this.autocompleteReq.forEach(function(req) {
			req.abort();
			autocomplete.secondReqDone = false;
			autocomplete.firstReqDone = false;
		});
		if(elements.addSrInput.val()) {
			this.autocompleteReq.push( ajaxRequest(requestUrls.searchAutocomplete(value, true), true, 1500, {
				complete: function(data) {
					if(data.responseJSON){
						data.responseJSON.subreddits.forEach(function(sr){
							if(sr.allowedPostTypes.images && sr.name.substring(0,2) !== "u_" && sr.numSubscribers >= 1){
								autocomplete.recommendedListNSFW.push(sr.name);
							}
						});
						autocomplete.firstReqDone = true;
						autocomplete.addSuggestions();
					}
				},
				silent: true
			}) );
			this.autocompleteReq.push( ajaxRequest(requestUrls.searchAutocomplete(value, false), true, 1500, {
				complete: function(data){
					if(data.responseJSON){
						data.responseJSON.subreddits.forEach(function(sr){
							if(sr.allowedPostTypes.images && sr.name.substring(0,2) !== "u_" && sr.numSubscribers >= 1){
								autocomplete.recommendedListSFW.push(sr.name);
							}
						});
					}
					autocomplete.secondReqDone = true;
					autocomplete.addSuggestions();
				},
				silent: true
			}) );
		}
		else {
			this.autocompleteReq.forEach(function(req) {
				req.abort();
				autocomplete.secondReqDone = false;
				autocomplete.firstReqDone = false;
			});
			this.aComplete.list = [];
			this.aComplete.close();
		}
	}
};

// Recommended list of subreddits
var relatedSubs = {
	relatedSubsReq: "", // the xhr requets, so it can be canelled upon making a new request
	getRelatedSubs: function() {
		var html = "";
		if(this.relatedSubsReq) {
			this.relatedSubsReq.abort();
		}
		if(subreddits.list.length) {
			this.relatedSubsReq = ajaxRequest( requestUrls.recommended(), true, 5000, {
				success: function(res) {
					res.forEach(function(srname) { // Displays the recommende list in the HTML
						html += "<li class=\"recommandation\" data-srname=" + srname.sr_name + ">/r/" + srname.sr_name + "</li>"; 
					});
					elements.recommendedList.html(html);
				},
				silent: true,
				loading: false
			});
		}
		else {
			elements.recommendedList.html(html);
		}
	}
};

/*Full Screen Feature*/
var fScreen = {
	/*Boolean values, which type of content it is*/
	isImage: false, 
	isVideo: false,
	isGfyCat: false,
	/*For first and last image*/
	allowPrevious: true,
	allowNext: true,
	currentUrl: "", // url of the content
	currentTarget: "", // html element of the target, whole "img-result" container
	scrollLocation: "", // stores the scrolling location of the body prior to going full screen
	show: function(targetEl) { // Opens the full screen feature
		this.currentTarget = $(targetEl).parent();
		this.scrollLocation = window.scrollY;
		$(document.body).addClass("no-scroll-body");
		elements.fullScreenContainer.removeClass("hidden");
		this.change();
		elements.currentPositionDisplay.text(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) + 1);
		elements.totalImagesDisplay.text(images.currentImages.length);
		if( images.currentImages.indexOf($(this.currentTarget).children("img")[0]) === (images.currentImages.length - 1) ) {
			images.getImages(false);
		}
		this.showHideArrows();
	},
	hide: function() { // closes the full screen feature
		$(document.body).removeClass("no-scroll-body");
		$("html, body").scrollTop(this.scrollLocation);
		elements.fullScreenContainer.addClass("hidden");
		uncategorized.msnry.layout();
	},
	showHideContent: function() { // What to show/hide for img/video content type
		elements.fullScreenContainer.css("backgroundImage", "");
		if(this.isImage >= 0) {
			elements.fullScreenVideo.hide();
			elements.fullScreenVideo.children("source").prop("src", "#");
			elements.fullScreenVideo[0].load();
		}
		else {
			elements.fullScreenVideo.show();
		}
	},
	change: function() { // Performs when showing/changing the elements (next, previous or just show first time)
		elements.fullScreenVideo.hide();
		elements.fullScreenVideo.children("source").prop("src", "#");
		elements.fullScreenVideo[0].load();
		var extension;
		this.currentUrl = $(this.currentTarget).children("img").attr("data-fullurl");
		this.isImage = this.currentUrl.search(/(.jpg|.png|.jpeg|.svg|.gif)$/gi);
		this.isVideo = this.currentUrl.search(/(.mp4|.webm|.gifv)$/i);
		this.isGfyCat = this.currentUrl.search(/^https?:\/\/gfycat.com/);
		this.showHideContent();
		if(this.isImage >= 0) {
			elements.fullScreenContainer.css("backgroundImage", "url(" + this.currentUrl + ")");
		}
		else if(this.isVideo >= 0 || this.isGfyCat >= 0) {
			if(this.isVideo >= 0) {
				// .gifv 
				if(this.currentUrl.search(/.gifv$/i) >= 0){
					extension = ".mp4";
					this.currentUrl = this.currentUrl.replace(/.gifv$/i, extension);
				}
				else {
					extension = this.currentUrl.substring(this.isVideo);
				}
				elements.fullScreenVideo.children("source").prop("src", this.currentUrl);
				elements.fullScreenVideo.children("source").prop("type", "video/" + extension.substring(1));
				elements.fullScreenVideo[0].load();

			}
			
			if(this.isGfyCat >= 0) {
				var vidName =  this.currentUrl.replace(/https?:\/\/gfycat.com\/*/i, "");
				var reqUrl = requestUrls.gfyCatVideo(vidName);
				ajaxRequest(reqUrl, true, 5000, {
					success: function(res) {
						elements.fullScreenVideo.children("source").prop("src", res.gfyItem.mp4Url);
						elements.fullScreenVideo.children("source").prop("type", "video/mp4");
						elements.fullScreenVideo[0].load();
					},
					silent: true
				});
			}
		}
		elements.fullScreenContainer.children(".img-desc").html( $(this.currentTarget).children(".img-desc").html() );
	},
	showHideArrows: function() { // when to show and hide the corresponding arrows, as well as allow them
		if( !$(this.currentTarget).prev()[0] || $(this.currentTarget).prev().hasClass("col-width") ) {
			elements.fullScreenPrevious.addClass("hidden");
			this.allowPrevious = false;
		}
		else {
			elements.fullScreenPrevious.removeClass("hidden");
			this.allowPrevious = true;
		}
		if( !$(this.currentTarget).next()[0] ) {
			elements.fullScreeNext.addClass("hidden");
			this.allowNext = false;
		}
		else {
			elements.fullScreeNext.removeClass("hidden");
			this.allowNext = true;
		}
	},
	previous: function() { // gettings previous content actions
		elements.fullScreenPrevious.removeClass("hidden");
		if( $(this.currentTarget).prev()[0] || !$(this.currentTarget).prev().hasClass("col-width") ) {
			this.currentTarget = $(this.currentTarget).prev();
			this.change();
		}
		this.updatePosition();
		
	},
	next: function() { // gettings next content actions
		elements.fullScreeNext.removeClass("hidden");
		if( $(this.currentTarget).next()[0] ) {
			this.currentTarget = $(this.currentTarget).next();
			this.change();
		}
		if( images.currentImages.indexOf($(this.currentTarget).children("img")[0]) === (images.currentImages.length - 1) ) {
			images.getImages(false);
		}
		this.updatePosition();
	},
	updatePosition: function() { // updates the display of the current / total content number
		if( images.currentImages.indexOf( $(this.currentTarget).children("img")[0] ) !== -1 ) {
			elements.currentPositionDisplay.text(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) + 1);
			elements.totalImagesDisplay.text(images.currentImages.length);
		}
		fScreen.showHideArrows();
	}
};


// Functions and variables which do not belong in any particular object
// To prevent pollution the global object
var uncategorized = {
	menuClosed: true,
	delayList: [], // Contains the "setTimeout"'s for the side menu's hidden, used to cancel them if needed
	avoidMultipleRequests: true, 
	// Checks for internet connectivity by seding a "HEAD" request to the hostname
	doesConnectionExist: function(succ, fail) {
		var xhr = new XMLHttpRequest();
		var randomNum = Math.round(Math.random() * 10000);

		xhr.open('HEAD', "" + "?rand=" + randomNum, true);
		xhr.send();

		xhr.addEventListener("readystatechange", function(){
			if (xhr.readyState == 4) {
				if (xhr.status >= 200 && xhr.status < 304) {
					succ();
				} 
				else {
					fail();
				}
			}
		}, false);
	},
	// Masonry library object
	msnry: new Masonry( elements.imgsContainer[0], {
	   itemSelector: '.img-result',
	   columnWidth: '.col-width',
	   percentPosition: true,
		gutter: 0,
		transitionDuration: 0
	}),
	colorGenerator: function() {
		var number = Math.floor(Math.random() * 361);
		return "hsla(" + number + ", 35%, 35%, 0.2)";
	}
};

// don't show images with broken "src" link
function deleteEl(el) {
	$(el).parent().remove();
};
// Shows an image only when it's fully loaded
function showOnload(el){
	var parent = $(el).parent();
	if(el.naturalWidth / el.naturalHeight >= 2.6){
		parent.addClass("triple");
	}
	else if (el.naturalWidth / el.naturalHeight >= 1.8){
		parent.addClass("double");
	}
	parent.addClass("visible");
	uncategorized.msnry.appended($(el).parent());
	uncategorized.msnry.layout();
}


// What to run the first time the document loads
function init(){

	/*====ALERTIFY LIB SETTINGS====== --> */
	alertify.parent(document.body);
	alertify.maxLogItems(5);
	alertify.logPosition("bottom right");
	/* <-------------------------------- */




	/*====SETTINGS====== --> */
	function setValues() { // changes the HTML's settings values to that of the values in the JS
		elements.adultSettingInput.prop("checked", !urlParams.adultContent.value);
		elements.titleSettingInput.prop("checked", images.displayTitles);
		elements.typeInput.val(urlParams.sortType);
		elements.timeInput.val(urlParams.sortTime.value);
	}

	// changing the adult settings
	function adultSettingsChange(el){
		urlParams[$(el).attr("name")].value = !el.checked;
		images.searchCount = 0;
		images.getImages(true, true);
		autocomplete.getAutocomplete(elements.addSrInput.val());
	}
	// changing the title settings
	function titleSettingsChange(el){
		images[$(el).attr("name")] = el.checked;
		if(images[$(el).attr("name")]){
			$(document.body).removeClass("no-titles");	
		}
		else {
			$(document.body).addClass("no-titles");	
		}
	}
	// changing the time sorting setting
	function timeSettingsChange(el, loadImg){
		urlParams.setTime($(el).val(), loadImg);
	}
	// changing the type sorting setting
	function typeSettingsChange(el, loadImg){
		var value = $(el).val();
		if(value === "controversial" || value === "top"){
			$(el).next().removeClass("hidden");	
		}
		else {
			$(el).next().addClass("hidden");	
		}
		urlParams.setType(value, loadImg);
	}	


	setValues();
	// Runs the chaning of the settings without gettings new images
	adultSettingsChange(elements.adultSettingInput[0], false);
	titleSettingsChange(elements.titleSettingInput[0]);
	timeSettingsChange(elements.timeInput[0], false);
	typeSettingsChange(elements.typeInput[0], false);

	// EVENT LISTENERS 
	elements.adultSettingInput.on("change", function(){
		adultSettingsChange(this);
		localStorageData.updateStorage("adultContent")
	});
	elements.titleSettingInput.on("change", function(){
		titleSettingsChange(this);
		localStorageData.updateStorage("displayTitles")
	});
	elements.typeInput.on("change", function(){
		typeSettingsChange(this, true);
	});
	elements.timeInput.on("change", function(){
		timeSettingsChange(this, true);
	});
	/* <---------------------- */






	/*====AUTOCOMPLETE & SUREDDITS ADD===== --> */
	autocomplete.aComplete.list = [];
	
	elements.addSrInput.on("focus", function() {
		autocomplete.aComplete.evaluate(); // shows the autocomplete
	});
	elements.addSrInput[0].addEventListener("awesomplete-selectcomplete", function(evt) {
		// Adds the selected autocomplete result
		subreddits.addWithoutCheck(evt.text.value);
		autocomplete.aComplete.list = [];
	});
	elements.addSrInput.on("keydown", function(evt) { // add upon pressing "Enter" key
		if( evt.which === 13 && $(this).val() ) {
			subreddits.addWithCheck( $(this) );
		}
	});
	elements.addSrInput.on("input", function() { // get autocomplete on input change
		autocomplete.getAutocomplete($(this).val());
	});

	
	elements.clearInputBtn.on("click", function() { // clear input
		elements.addSrInput.val("");
	});
	elements.addSrBtn.on("click", function() { // add button for the input
		subreddits.addWithCheck(elements.addSrInput);
	});
	/* <--------------------------- */



	/*========MENU & SIDEBAR========*/
	function closeSideMenu(evt) { // Close the side menu based on the target of the event
		if(!uncategorized.menuClosed) {
			var buttonTrigger = evt.target !== elements.menuBtn[0] && !$(evt.target).parents(".menu-btn").length;
			var menuTrigger = evt.target !== elements.menu[0] && $(evt.target).parents(".menu").length === 0;
			var isRecommandation = !(evt.target.classList.contains("recommandation"));
			var isDialog = evt.target !== $(".alertify")[0];
			var isConfirmBox = evt.target !== $(".dialog")[0] && $(evt.target).parents(".dialog").length === 0;

			if(buttonTrigger && menuTrigger && isRecommandation && isDialog && isConfirmBox){
				elements.menu.addClass("slide-closed");
					uncategorized.menuClosed = true;
					elements.menuBtn.toggleClass("open");
			}
		}
	}

	$(document.body).on("click", function(evt) { // checks if the side menu needs closing based on the target (or the ancestor of the target)
		closeSideMenu(evt);
	});

	// Calls the "closeSideMenu" on tap of the body
	var bodyHammer = new Hammer(document.body);
	bodyHammer.on("tap", function(evt){
		closeSideMenu(evt);
	});

	elements.menuBtn.on("click", function() { // Menu button
		$(this).toggleClass("open");
		elements.menu.toggleClass("slide-closed");
		// elements.menu.toggleClass("slideOpen");
		uncategorized.menuClosed = elements.menu.hasClass("slide-closed");
		if(uncategorized.menuClosed) {
			uncategorized.delayList.push(setTimeout(function() { // hides the sidebar when it has reached it's final sliding destination
				$(elements.menu.addClass("invisible"));
			}, 500));
		}
		else {
			uncategorized.delayList.forEach(function(currentDelay) {
				window.clearTimeout(currentDelay); // cancels the hiding if the menu has been opened while in the closing process
			});
			$(elements.menu.removeClass("invisible"));
		}
	});


	elements.subredditList.on("click", ".del-sr", function() { // Delete single subreddit
		subreddits.remove([$(this).prev().text()]);
	});
	elements.recommendedList.on("click", "li", function() { // add a subreddit from the recommende list
		subreddits.addWithoutCheck($(this).attr("data-srname"));
		$(this).remove();
	});

	elements.checkAllBtn.on("change", function() { // Check all the subreddits (to be deleted)
		if(this.checked){
			$(".subreddit-single input").prop("checked", true);
		}
		else {
			$(".subreddit-single input").prop("checked", false);
		}
	});

	elements.multipleDeleteBtn.on("click", function() { // deletes the checked subreddits
		var deleteList = [], currentEl, els;
		
		els = elements.subredditList.children(".subreddit-single");
		for(var i = 0; i < els.length; i++){
			var currentEl = $(els[i]);
			if(currentEl.find("input")[0].checked){
				deleteList.push(currentEl.find("input").attr("name"));
			}
		}
		if(deleteList.length){
			// confirm dialog
			alertify.confirm("Are you sure you want to remove the selected subreddits?", function () {
			    subreddits.remove(deleteList);
			    elements.checkAllBtn.prop("checked", false);
			}, function() {
				for(var i = 0; i < els.length; i++){
					var currentEl = $(els[i]);
					currentEl.find("input").prop("checked", false);

				}
			    elements.checkAllBtn.prop("checked", false);
			});	
		}
	});

	elements.restoreSubreddits.on("click", function() { // restores the default list of subreddits
		alertify.confirm("This will delete the current subreddits and replace them with the defaults one. Are you sure you want to continue?", function () {
			elements.subredditList.html("");
		   localStorageData.deleteStorage();
			subreddits.list = JSON.parse(localStorageData.initialData.list);
			subreddits.showList(elements.subredditList, true);
			images.getImages(true, true);
			relatedSubs.getRelatedSubs();
		});
	});
	
	$(document.body).on("keydown", function(evt) { // closes the side menu when pressing "Esc"
		if(evt.which === 27 && !uncategorized.menuClosed){
			elements.menu.addClass("slide-closed");
			uncategorized.menuClosed = true;
			elements.menuBtn.toggleClass("open");
		}
	});
	/* <--------------------------- */







	/* ======IMAGES LOADING====== */
	elements.loadMoreBtn.on("click", function() { // Load more images button
		images.getImages(false);
		// $(this).addClass("hidden");
	});
	elements.reloadImgsBtn.on("click", function() { // reload (freshLoad) images
		images.getImages(true, true);
	});
	$(window).on("scroll wheel", function(evt) { // loads more images when scrolling to the bottom (based on the body height and window scroll)
		if(uncategorized.avoidMultipleRequests){
			var bodyHeight = document.body.offsetHeight;
			var windowScroll = window.pageYOffset + window.innerHeight;
			if(windowScroll >= (bodyHeight - 35)) {
					images.getImages(false);
			}	
		}
	});
	/* <--------------------------- */


	/* =======SCROLL TO TOP========= */
	$(window).on("scroll", function() { // When to show the scroll to top element
		if(window.scrollY >= 1200){
			elements.toTopBtn.show();
		}
		else {
			elements.toTopBtn.hide();
		}
	});
	function smoothScroll() { // Scroll to the top of the page smoothly
		var scrollElements = $("html, body");
		scrollElements.animate({scrollTop:0}, 500); // 500ms duration
	}
	elements.toTopBtn.on("click", function() { // Click event
		smoothScroll();
	});

	var toTopHammer = new Hammer(elements.toTopBtn[0]);
	toTopHammer.on("tap", function() { // Tap event
		smoothScroll();
	});
	/* <--------------------------- */




	/* ========FULL SCREEN========= */
	elements.fullScreenClose.on("click", function(){
		fScreen.hide();
	});

	elements.fullScreenPrevious.on("click", function(){
		fScreen.previous();
	});
	elements.fullScreeNext.on("click", function(){
		fScreen.next();
	});

	$(document.body).on("keydown", function(evt) { // Keyboard controls
		if($(this).hasClass("no-scroll-body")) {
			if(evt.which === 37) {
				if(fScreen.allowPrevious) { // "Left arrow"
					fScreen.previous();
				}
			}
			else if (evt.which === 39) { // "Right arrow 
				if(fScreen.allowNext){
					fScreen.next();
				}
			}
			else if(evt.which === 27) { // "Esc"
				fScreen.hide();
			}
		}
	});



	var fhHammer = new Hammer(elements.fullScreenContainer[0]);
	// Next/Previous swipe
	fhHammer.on('swipeleft', function(ev) {
		if(fScreen.allowNext){
			fScreen.next();
		}
	});

	fhHammer.on('swiperight', function(ev) {
		if(fScreen.allowPrevious){
			fScreen.previous();
		}
	});
	/* <--------------------------- */

	// Gets images, show subreddits list and get related subs for that subreddits list
	subreddits.showList(elements.subredditList, true);
	images.getImages(true, true);
	relatedSubs.getRelatedSubs();
}

init();