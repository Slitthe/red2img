// Alertify library settings
alertify.logPosition("bottom right");
alertify.parent(document.body);
alertify.maxLogItems(5);
/*

	see the SUBREDDITS section of https://en.wikipedia.org/wiki/Reddit  for a brief definition of what they are
	=======================================================================================================

			File Structure
			==============

	--> **elements** 
		object: contains the DOM elements

	--> **ajaxRequest** 
		customized $.ajax() request function, via a normal JS function, not $.ajaxSetup()

	--> **urlParams** 
		URL parameters data and methods for retrieveing them in an URL friendly format

	--> **requestUrls**
		Object: contains the API Endpoint URL and the CORS Proxy URL, also constructs the URLs for various situations

	--> **subreddits**
		Object: stores the list of subreddits, as well as handling deletion, addition and displaying of subreddits

	--> **images**
		Stores, filters and displays the response data for images into actual HTML

	--> **autocomplete**
		object: handles the autocomplete-related functions and stores the necessary details

	--> **relatedSubreddits**
		object: handles and processes the logic for displaying the list of related subreddits (relative to the current list of subreddits)

	--> **init**
		function: what to run at the page load
*/





























// DOM elements
var elements = {
	subredditList: $("#subredditList"),
	addInput: $("#addSubreddit"),
	addBtn: $("#addSubredditBtn"),
	adultSettingInput:$(".settings #nsfw"),
	titleSettingInput: $(".settings #titles"),
	typeChange: $("#type"),
	timeChange: $("#time"),
	imagesContainer: $("#imagesContainer"),
	loading: $(".loading"),
	recommendedList: $("#recommended"),
	loadMore: $("#loadMore"),
	// autocompleteDisplay: $("#autocomplete"),
	inputs: [],
	srSearchContainer: $("#srSearchContainer"),
	multipleDeleteBtn: $("#multipleDelete"),
	checkAll: $("#checkAll"),
	resetImagesBtn: $("#resetImages"),
	hideSubreddits: $("#hideSubreddits"),
	subredditsContainer: $(".subreddits"),
	restoreSubreddits: $("#restoreSubreddits"),
	wholeScreenClose: $(".closeImageBtn"),
	wholeScreenNext: $(".nextArrow"),
	wholeScreenPrevious: $(".previousArrow"),
	currentPositionDisplay: $(".currentPosition"),
 	totalImagesDisplay: $(".totalImages"),
 	wholeScreenVideo: $(".fullScreenShower > video"),
 	wholeScreenImg: $(".fullScreenShower > img"),
 	wholeScreenContainer: $(".fullScreenShower"),
 	toTopBtn: $(".toTop")
};














































var localStorageData = {
	initialData: {
		list: "[\"itookapicture\", \"photography\", \"OldSchoolCool\", \"Cinemagraphs\", \"AbandonedPorn\", \"MilitaryPorn\", \"EarthPorn\", \"spaceporn\", \"Eyebleach\"]",
		sortType: "\"hot\"",
		sortTime: "\"day\"",
		displayTitles: "\"true\"",
		adultContent: "\"false\""
	},
	locations: {
		"list": [ ["subreddits", "list"], true],
		"sortType": [ ["urlParams", "sortType"] ],
		"sortTime": [ ["urlParams", "sortTime", "value"] ],
		"adultContent": [ ["urlParams", "adultContent", "value"] ],
		"displayTitles": [ ["images", "displayTitles"] ]
	},
	updateStorage: function(name){
		var item = window;
		for(var i = 0; i < this.locations[name][0].length; i++){
			item = item[this.locations[name][0][i]];
		}
		// console.log(item);
		// for(var i = 0; i < this.locations.length; i++){
		// 	var item = window[name];
		// 	this.locations[i][1].forEach(function(current){
		// 		item = item[current];
		// 	});
		// 	if(this.locations[i][3]){
		// 		items = JSON.stringify(items);
		// 	}
		// 	localStorage.setItem(this.locations[i][0], JSON.stringify(item));
		// }
		window.localStorage.setItem(name, JSON.stringify(item));
	},
	deleteStorage: function(){
		window.localStorage.clear();
	},
	getValue: function(name){
		return window.localStorage.getItem(name) ? JSON.parse(window.localStorage.getItem(name)) : JSON.parse(this.initialData[name]);
	}
}













































// Customized jQuery ajaxReqest, to avoid using $.ajaxSetup()
function ajaxRequest(reqUrl, condition, timeout, obj){
	if(condition){
		if(obj.loading){
			elements.loading.removeClass("hidden");
			elements.loadMore.addClass("hidden");

		}
		return $.ajax({
			 url: reqUrl,
			 method: "GET",
			 crossDomain: true,
			 dataType: "json",
			 timeout: timeout,
			 success: function(succData){
			 	if(obj.success){ obj.success(succData);	}
			 },
			 error: function(errorData){
			 	if(obj.fail){
			 		obj.fail(errorData);
			 	}

			 	if (!obj.silent){
			 		// Timeout message
			 		// General error message (unless the request is aborted by the script via .abort())
			 		if(errorData.statusText === "timeout"){
			 			alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Request timeout.");
			 		}
			 		else if(errorData.statusText !== "abort") {

			 			alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Communication failed.");
			 		}
			 		// else if(errorData.statusText === "errror"){
			 		// 	alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Communication failed.");
			 		// }
			 	}


			 	// if(!obj.silent && errorData.statusText !== "abort"){
			 	// 	alertify.delay(5000).error("<strong>" + obj.reqName + "</strong>: Communication error.");
			 	// }
			 },
			 complete: function(completeData){

			 	if(obj.complete){ obj.complete(completeData);	}
			 	if(obj.loading){
			 		elements.loading.addClass("hidden");
			 		elements.loadMore.removeClass("hidden");
			 	}
			 }
		});
	}
}












































// API URL parameters data & methods for retrieving / changing them
var urlParams = {
		searchQuery: {
			name: "q",
			value: "cats"
		},
		longQuery: {
			name: "query",
			value: ""
		},
		includeProfiles: {
			name:"include_profiles",
			value: false
		},
		limit: {
			name: "limit",
			value: 15,
		},
		adultContent: {
			name: "include_over_18",
			value: localStorageData.getValue("adultContent")
		},
		after: {
			name: "after",
			value: "",
		},
		// Time and type start out as whatever their HTML value is		
		sortTime: {
			name: "t",
			value: localStorageData.getValue("sortTime")
		},
		sortType: localStorageData.getValue("sortType"),
		getParams: function(paramList){ // <-- takes an array of params obj names (ex: "sortTime"); --> returns that name:value pairs in an URL-friendly string
			var params = [];
			for(var i = 0; i < paramList.length; i++){
				params.push(this[paramList[i]].name + "=" + this[paramList[i]].value);
			}
			return params.join("&");Add

		},
		setType: function(type, loadImg) { // makes it that when the type or time is changed, new images are fetched (it affects the results)
			this.sortType = type;
			if(loadImg){
				images.getImages(true, true);	
			}
			localStorageData.updateStorage("sortType")
		},
		setTime: function(time, loadImg){
			this.sortTime.value = time;
			if(loadImg){
				images.getImages(true, true);	
			}
			localStorageData.updateStorage("sortTime")
		},
}

























































// Returns the API Requests URLs for different tasks
var requestUrls = {
	base: "https://www.reddit.com/",
	corsProxy: "https://cors-anywhere.herokuapp.com/",
	postsData: function(subreddits){
		subreddits = subreddits.join("+").toLowerCase();
		var url = this.base + "r/" + subreddits;
		url += "/" + urlParams.sortType + ".json?";
		return url + urlParams.getParams(["limit", "after", "sortTime"]);
	},
	// search: function(query) {
	// 	var url = this.base + "search.json?";
	// 	urlParams.searchQuery.value = query;
	// 	return url + urlParams.getParams(["searchLimit", "adultContent", "searchQuery"]);
	// },
	subExists: function(subName) {
		var url = this.corsProxy + this.base
		url += "r/" + subName + "/about/rules.json";
		return url;
	},
	recommended: function(){
		var url = this.base + "api/recommend/sr/srnames?";
		url += "srnames=" + subreddits.list.join(",") + "&";
		url += urlParams.getParams(["adultContent"]);
		return this.corsProxy + url;
	},
	searchAutocomplete: function(query, adult){
		var url = this.base + "api/subreddit_autocomplete.json?";
		urlParams.longQuery.value = query;
		url += urlParams.getParams(["longQuery", "includeProfiles"]);
		url += "&include_over_18=" + adult;
		return url;
	},
	gfyCatVideo: function(name){
		return "https://gfycat.com/cajax/get/" + name;
	}
};















































































// Contains the subreddits data, as well as the related methods for adding/removing them from the list
var subreddits = {
	list: localStorageData.getValue("list"),
	addWithCheck: function(element){
		var value = encodeURI(element.val());
		if(value) {
			element.val("");
			this.checkSubExist(value, function(){
				subreddits.addWithoutCheck(value);
			}, function(){
				// elements.autocompleteDisplay.html("");
				// elements.autocompleteDisplay.addClass("hidden");
			})
		}
	},
	addWithoutCheck: function(value){
		subreddits.list.push(value);
		elements.addInput.val("");
		subreddits.checkDuplicate();
		subreddits.showList(elements.subredditList, true);
		images.getImages(true, true);
		relatedSubs.getRelatedSubs();
		autocomplete.autocompleteReq.forEach(function(req){
			req.abort();
			autocomplete.secondReqDone = false;
			autocomplete.firstReqDone = false;
		});
		autocomplete.aComplete.list = [];
		autocomplete.aComplete.close();
		localStorageData.updateStorage("list")

	},
	checkDuplicate: function(){
		this.list = this.list.filter(function(curr, ind, arr){
			return arr.slice(ind + 1).indexOf(curr) === -1;
		});
	},
	remove: function(nameList){
		var dataIndex;
		for(var i = 0; i < nameList.length; i++){
			for(var j = 0; j < this.list.length; j++){
				if(this.list[j].toLowerCase() === nameList[i].toLowerCase()){
					dataIndex = j;
					break;
				}
			}
			this.list.splice(dataIndex, 1);
		}
		subreddits.showList(elements.subredditList, false);
		images.searchCount = 0;
		images.getImages(true, true);
		relatedSubs.getRelatedSubs()
		localStorageData.updateStorage("list")
	},
	showList: function(element, add){ // constructs the subreddit list based on the subreddits.list (adds/removes if necessary)
		var html = "", 
		inputs = [], 
		i,
		currentIndex;
		var elements = $("#subredditList > .subreddit-single");
		for(i = 0; i < elements.length; i++){
			inputs.push(elements[i].getAttribute("data-srname"));
		}
		if(add){
			subreddits.list.forEach(function(current){
				// <div class="custom-checkbox-wrapper">
				//     <input type="checkbox" class="checkAll hidden-input" id="checkAll">
				//     <div class="faux-checkbox"></div>
				// </div>
				if( inputs.indexOf(current) === -1){
					html = "";
					html += "<div class='subreddit-single clearfix' data-srname=\"" + current + "\">";
					html += "<label class=\"custom-checkbox-wrapper\">";
					html += "<input class=\"hidden-input\" type=\"checkbox\" name=\"" + current + "\">";
					html += "<div class=\"faux-checkbox\"></div></label>";
					html += "<div class='subredditName'>" + current + "</div>";
					html += "<button class='removeSubreddit no-input-style' type='button'><i class=\"fa fa-trash-o\"></i></button>";
					html += "</div>";
					var el = $(html);
					el.css("backgroundColor", colorGenerator());
					el.appendTo(element);
					wholeScreenShower.showHideArrows();
				}
			});
		}
		else {
			// subreddits.list = subreddits.list.map(function(cr){
			// 	return cr.toLowerCase();
			// });
			inputs.forEach(function(current){
				currentIndex = subreddits.list.indexOf(current);
				if( currentIndex === -1){
					$("#subredditList").children(".subreddit-single[data-srname='" + current + "']").fadeOut(function(){
						$(this).remove();
					});
				}
			});
		}
	},
	checkSubExist(subName, succesful, unsuccesful){
		var reqName = "Subreddit Validation";
		var success = function(data){
			if(data.hasOwnProperty("site_rules")){
				succesful();
			}
			else {
				alertify.delay(5000).error("<strong>" + reqName + "</strong>:Subreddit doesn't exist.");
					unsuccesful();
			}
		};
		var error = function(data){
			if(data.status === 404){
				if(data.hasOwnProperty("responseJSON")){
					if(data.responseJSON.hasOwnProperty("reason")){
						alertify.delay(5000).error("<strong>" + reqName + "</strong>:Private or banned subreddit");
						unsuccesful();
					}
					else {
						alertify.delay(5000).error("<strong>" + reqName + "</strong>:Subreddit doesn't exist");
						unsuccesful();
					}
				}
				else {
					unsuccesful();
				}
			}
			else if(data.status === 403 && data.hasOwnProperty("responseJSON") && data.responseJSON.reason === "private"){
				alertify.delay(5000).error("<strong>" + reqName + "</strong>:Private  subreddit");
				unsuccesful();
			}
			else {
				alertify.delay(5000).error("<strong>" + reqName + "</strong>: Communication error.");

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
	currentImages: [],
	displayTitles: localStorageData.getValue("displayTitles"),
	imageRequests: [], // HTTP Requests for images data
	continueSearch: true, // stops calling the getImages function when there is no more data to get
	imagesTarget: 25, // roughly how many images to display for the fresh image requests
	maxNewSearchRequests: 5, // stops trying to get the imagesTarget no. of images when the requests for that exeed this amount
	searchCount: 0, // keeps track of the no. of requests for fresh image requests
	maximumResWidth: 320, // the image resolution target for previews, can go lower than this, but not higher
	rawResponseData: [], // unfiltered (for adult and images) response data
	filterAdult: function(){
		if(!urlParams.adultContent.value){
			this.rawResponseData = this.rawResponseData.filter(function(current){
				return !current.over_18;
			});
		}
	},
	keepOnlyImages: function(){
		this.rawResponseData = this.rawResponseData.filter(function(current){
			// if(current.domain.search("imgur") >= 0){
			// 	current.url += ".jpg";
			// }
			var conditionOne = current.url.search(/(.jpg|.png|.jpeg|.svg|.gif|.gifv|.mp4|.webm)$/gi) >= 0;
			var conditionTwo = current.url.search("gfycat.com") >= 0;
			return conditionOne || conditionTwo;
		});
	},
	getCorrectResolution: function(post){
		if(post.hasOwnProperty("preview")){
			for(var i = post.preview.images[0].resolutions.length - 1; i >= 0; i--){
				if(post.preview.images[0].resolutions[i].width <= 320){
					return post.preview.images[0].resolutions[i].url;
				}
			}
		}
		else {
			return post.url;
		}
	},
	displayImages: function(){
		var htmlS = "";
		this.rawResponseData.forEach(function(current, indx, arr){
			//  
			htmlS += "<div class='imageResult'>";
			htmlS += "<img onerror=\"deleteEl(this);\" onload=\"showOnload(this);\" class=\"content faded\" src=\"" + images.getCorrectResolution(current);
			htmlS += "\" data-fullurl=\"" + current.url + "\"" + "\">";
			htmlS += "<div class=\"imgDesc clearfix\"><a href=\"" + requestUrls.base + current.permalink.substring(1) + "\" class='postText' target=\"_blank\" title=\"" +current.title + "\">" + current.title + "</a>";
			htmlS += "<div class='imgSubredditName'>" + current.subreddit_name_prefixed + "</div></div></div>";
		});
		var imagesElements = $(htmlS);
		imagesElements.children("img").on("click", function(){
			wholeScreenShower.show(this);
		});
		this.rawResponseData = [];
		imagesElements.appendTo(elements.imagesContainer);
		this.currentImages = [];
		for (var i = 0; i < elements.imagesContainer.children(".imageResult").children("img").length; i++) {
			this.currentImages.push(elements.imagesContainer.children(".imageResult").children("img")[i]);
		};
		elements.totalImagesDisplay.text(this.currentImages.length);
		wholeScreenShower.showHideArrows();
	},
	getImages(newSearch, freshSearch){ 
		if(newSearch){
			if(!this.searchCount || freshSearch){
				urlParams.after.value = "";
				images.rawResponseData = [];
				elements.imagesContainer.html("<div class='col-width'></div>");
				this.imageRequests.forEach(function(req){
					req.abort();
				});
				this.imageRequests = [];
				this.continueSearch = true;
			}
			elements.loadMore.addClass("hidden");
			this.searchCount++;
		}
		else {
			this.searchCount = 0;
			if(images.continueSearch ){
				elements.wholeScreenNext.prop("disabled", true);
			}
		}
		generalSettings.avoidMultipleRequests = false;
		var url = requestUrls.postsData(subreddits.list);
		var resData;

		if(subreddits.list.length){
			var req = ajaxRequest(url, images.continueSearch, 7000, {
				reqName: "Getting Images",
				silent: false,
				loading: true,
				success: function(succ){
							succ.data.children.forEach(function(cr){
								images.rawResponseData.push(cr.data);
							});
							images.keepOnlyImages();
							images.filterAdult()
							urlParams.after.value = succ.data.after;
							var displayImg = new Promise(function(res, rej){
								images.displayImages();
								setTimeout(function(){
									res();
								}, 250);
							}).then(function(){
								var imagesCount = $("#imagesContainer .imageResult").length;
								if(!succ.data.after) {
									images.searchCount = 5;
									images.continueSearch = false;
									elements.loadMore.addClass("hidden");

								}
								else {
									elements.loadMore.removeClass("hidden");							
								}
								if((images.searchCount === images.maxNewSearchRequests) && imagesCount  === 0){
									alertify.delay(5000).error("No images to load." );

								}
								else if(!succ.data.after){
									alertify.delay(5000).error("No more images to load.");

								}
								if(newSearch && (imagesCount < images.imagesTarget) && (images.searchCount < images.maxNewSearchRequests)){
									images.getImages(true);
								}
								else {
									images.searchCount = 0;
									generalSettings.avoidMultipleRequests = true;
								}
							});
				},
				fail: function(){

					generalSettings.avoidMultipleRequests = false;

				},
				complete: function() {
					elements.wholeScreenNext.prop("disabled", false);
					elements.loadMore.removeClass("hidden");
				},

			});
			if(req){this.imageRequests.push(req);}
			
		}
	}
};
























































var autocomplete = {
	aSrNames: [],
	aComplete: new Awesomplete(elements.addInput[0], {
		minChars: 1
	}),
	firstReqDone: false,
	secondReqDone: false,
	combinedSuggestions: [],
	recommendedListSFW: [],
	recommendedListNSFW: [],
	autocompleteReq: [], // HTTP Requests for autocomplete data
	combineSuggestions: function(){
		autocomplete.aComplete.list = [];
		this.combinedSuggestions = [];
		if(!urlParams.adultContent.value){
			this.recommendedListNSFW = [];
		}
		var i = 0;
		while(this.combinedSuggestions.length <= 5){
			if(i % 3 === 0 && this.recommendedListNSFW.length){
				this.combinedSuggestions.push(this.recommendedListNSFW.shift());
			}
			else if(this.recommendedListSFW.length) {
				this.combinedSuggestions.push(this.recommendedListSFW.shift())		
			}
			if(!this.recommendedListSFW.length && !this.recommendedListNSFW.length){
				break;
			}
			i++;
		}
		if(this.combinedSuggestions.length){
			autocomplete.aSrNames = [];
			this.combinedSuggestions.forEach(function(sr){
				autocomplete.aSrNames.push(sr);
			});
			autocomplete.aComplete.list = autocomplete.aSrNames;
			autocomplete.aComplete.evaluate();
		}
		else {
			autocomplete.aComplete.list = [];
			autocomplete.aComplete.close();
		}
		this.recommendedListNSFW = [];
		this.recommendedListSFW = [];
	},
	addSuggestions: function(){
		if(this.firstReqDone && this.secondReqDone){
			this.firstReqDone = false;
			this.secondReqDone = false;
			this.combineSuggestions();
		}
	},
	getAutocomplete: function(value){
		this.autocompleteReq.forEach(function(req){
			req.abort();
			autocomplete.secondReqDone = false;
			autocomplete.firstReqDone = false;
		});
		if(elements.addInput.val()){
			this.autocompleteReq.push( ajaxRequest(requestUrls.searchAutocomplete(value, true), true, 1500, {
				complete: function(data){
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
			this.autocompleteReq.forEach(function(req){
				req.abort();
				autocomplete.secondReqDone = false;
				autocomplete.firstReqDone = false;
			});
			autocomplete.aComplete.list = [];
			autocomplete.aComplete.close();
		}
	}
};
















































var relatedSubs = {
	relatedSubsReq: "",
	getRelatedSubs: function(){
		if(this.relatedSubsReq){
			this.relatedSubsReq.abort();
		}
		var html = "";
		if(subreddits.list.length){
			this.relatedSubsReq = ajaxRequest(requestUrls.recommended(), true, 5000, {
				success: function(res){
				res.forEach(function(srname){
					html += "<li class=\"recommandation\" data-srname=" + srname.sr_name + ">/r/" + srname.sr_name + "</li>"; 
				});
				elements.recommendedList.html(html);
			},
			silent: true,
			loading: false,
			});
		}
		else {
			elements.recommendedList.html(html);
		}
	},
};













































var wholeScreenShower = {
	isVideo: "",
	isGfyCat: "",
	isImage: "", 
	allowPrevious: true,
	allowNext: true,
	currentUrl: "",
	currentTarget: "",
	scrollLocation: "",
	show: function(targetEl){
		this.currentTarget = $(targetEl).parent();;
		this.scrollLocation = window.scrollY;
		$(document.body).addClass("noScrollBody");
		$(".fullScreenShower").removeClass("hidden");
		this.change()
			elements.currentPositionDisplay.text(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) + 1);
			elements.totalImagesDisplay.text(images.currentImages.length);
		this.showHideArrows();
	},
	showHideContent: function(){
		elements.wholeScreenVideo.children("source").prop("src", "");
		// elements.wholeScreenImg.prop("src", "");
		elements.wholeScreenContainer.css("backgroundImage", "");
		if(this.isImage >= 0){
			// elements.wholeScreenImg.show()
			elements.wholeScreenVideo.hide();
		}
		else {
			// elements.wholeScreenImg.hide()
			elements.wholeScreenVideo.show();
		}
	},
	change: function(){
		var extension;
		this.currentUrl = $(this.currentTarget).children("img").attr("data-fullurl");
		this.isImage = this.currentUrl.search(/(.jpg|.png|.jpeg|.svg|.gif)$/gi);
		this.isVideo = this.currentUrl.search(/(.mp4|.webm|.gifv)$/i);
		this.isGfyCat = this.currentUrl.search(/^https:\/\/gfycat.com/);
		this.showHideContent();
		if(this.isImage >= 0){
			elements.wholeScreenContainer.css("backgroundImage", "url(" + this.currentUrl + ")");

		}
		else if(this.isVideo >= 0 || this.isGfyCat >= 0){

			if(this.isVideo >= 0){
				// .gifv 
				if(this.currentUrl.search(/.gifv$/i) >= 0){
					extension = ".mp4";
					this.currentUrl = this.currentUrl.replace(/.gifv$/i, extension);
				}
				else {
					extension = this.currentUrl.substring(isVideo);
				}
				elements.wholeScreenVideo.children("source").prop("src", this.currentUrl);
				elements.wholeScreenVideo.children("source").prop("type", "video/" + extension.substring(1));
				elements.wholeScreenVideo[0].load();
				elements.wholeScreenVideo[0].play();

			}
			

			if(this.isGfyCat >= 0) {
				var vidName =  this.currentUrl.replace(/https:\/\/gfycat.com\/+/, "");
				var reqUrl = requestUrls.gfyCatVideo(vidName);
				ajaxRequest(reqUrl, true, 5000, {
					success: function(res){
						console.log(res.gfyItem.mp4Url)
						$(".fullScreenShower > video source").prop("src", res.gfyItem.mp4Url);
						$(".fullScreenShower > video source").prop("type", "video/mp4");
						elements.wholeScreenVideo[0].load();
						elements.wholeScreenVideo[0].play();
					},
					silent: true
				});
			}
		}



		$(".fullScreenShower > .imgDesc").html($(this.currentTarget).children(".imgDesc").html());
		// console.log($(this.currentTarget).children(".imgDesc").html());

	},
	showHideArrows: function(){
		if(!$(this.currentTarget).prev()[0] || $(this.currentTarget).prev().hasClass("col-width") ){
			elements.wholeScreenPrevious.addClass("hidden");
			this.allowPrevious = false;
		}
		else {
			elements.wholeScreenPrevious.removeClass("hidden");
			this.allowPrevious = true;
		}
		if(!$(this.currentTarget).next()[0]){
			elements.wholeScreenNext.addClass("hidden");
			this.allowNext = false;
		}
		else {
			elements.wholeScreenNext.removeClass("hidden");
			this.allowNext = true;
		}
	},
	hide: function(){
		$("html")[0].scrollTop = this.scrollLocation;
		$(document.body).removeClass("noScrollBody");
		$(".fullScreenShower").addClass("hidden");
		msnry.layout();
	},
	previous: function(){
		elements.wholeScreenPrevious.removeClass("hidden");
		if($(this.currentTarget).prev()[0] || !$(this.currentTarget).prev().hasClass("col-width")){
			this.currentTarget = $(this.currentTarget).prev();
			this.change();
		}

		if(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) !== -1){
			elements.currentPositionDisplay.text(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) + 1);
			elements.totalImagesDisplay.text(images.currentImages.length);
		}
		wholeScreenShower.showHideArrows();

		// else {
		// 	elements.wholeScreenPrevious.addClass("hidden");
		// }
	},
	next: function(){
		elements.wholeScreenNext.removeClass("hidden");

		if($(this.currentTarget).next()[0]){
			this.currentTarget = $(this.currentTarget).next();
			this.change();
		}
		if( images.currentImages.indexOf($(this.currentTarget).children("img")[0]) === (images.currentImages.length - 1) ) {
			images.getImages(false);
		}
		if(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) !== -1){
			elements.currentPositionDisplay.text(images.currentImages.indexOf($(this.currentTarget).children("img")[0]) + 1);
			elements.totalImagesDisplay.text(images.currentImages.length);
		}
		wholeScreenShower.showHideArrows();
	},
}

var generalSettings = {
	menuClosed: true,
	delayList: [],
	avoidMultipleRequests: true,
	isTap: false
}


// don't show images with broken "src" link
function deleteEl(el) {
	$(el).parent().remove();
};
// Shows an image only when it's fully loaded
function showOnload(el){
	$(el).parent().addClass("visible");
	msnry.appended($(el).parent());
	msnry.layout();
}
























































function init(){
	function setValues(){
		elements.adultSettingInput.prop("checked", !urlParams.adultContent.value);
		elements.titleSettingInput.prop("checked", images.displayTitles);
		elements.typeChange.val(urlParams.sortType);
		elements.timeChange.val(urlParams.sortTime.value);
	}
	function adultSettingsChange(el, loadImg){
		urlParams[$(el).attr("name")].value = !el.checked;
		images.searchCount = 0;
		if(loadImg){
			images.getImages(true, true);
		}
		autocomplete.getAutocomplete(elements.addInput.val());
	}
	function titleSettingsChange(el){
		images[$(el).attr("name")] = el.checked;
		if(images[$(el).attr("name")]){
			$(document.body).removeClass("no-titles");	
		}
		else {
			$(document.body).addClass("no-titles");	
		}
	}
	function timeSettingsChange(el, loadImg){
		urlParams.setTime($(el).val(), loadImg);
	}
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
	adultSettingsChange(elements.adultSettingInput[0], false);
	titleSettingsChange(elements.titleSettingInput[0]);
	timeSettingsChange(elements.timeChange[0], false);
	typeSettingsChange(elements.typeChange[0], false);

	autocomplete.aComplete.list = [];
	elements.typeChange.on("input", function(){
		typeSettingsChange(this, true);
	});
	elements.timeChange.on("change", function(){
		timeSettingsChange(this, true);
	});

	elements.subredditList.on("click", ".removeSubreddit", function(){
		subreddits.remove([$(this).prev().text()]);
	});


	elements.addInput.on("focus", function(){
		autocomplete.aComplete.evaluate();
	});


	elements.adultSettingInput.on("change", function(){
		adultSettingsChange(this, true);
		localStorageData.updateStorage("adultContent")
	});

	elements.titleSettingInput.on("change", function(){
		titleSettingsChange(this);
		localStorageData.updateStorage("displayTitles")
	});

	elements.addInput[0].addEventListener("awesomplete-selectcomplete", function(evt){
		subreddits.addWithoutCheck(evt.text.value);
		autocomplete.aComplete.list = [];

	})

	$("#imagesContainer").on("error", ".imageResult img", function(){
	});

	elements.loadMore.on("click", function(){
		images.getImages(false);
		$(this).addClass("hidden");
	});

	elements.recommendedList.on("click", "li", function(){
		subreddits.addWithoutCheck($(this).attr("data-srname"));
		$(this).remove();
	});

	elements.addInput.on("input", function(){
		if(!$(this).val()){
		}
		autocomplete.getAutocomplete($(this).val());
	});

	// elements.srSearchContainer.on("blur", function(){
	// 	autocomplete.autocompleteReq.forEach(function(req){
	// 		req.abort();
	// 	});
	// 	autocomplete.aComplete.close();
	// });

	elements.hideSubreddits.on("click", function(){
		$(this).toggleClass("open");
		elements.subredditsContainer.toggleClass("slideHidden");
		// elements.subredditsContainer.toggleClass("slideOpen");
		generalSettings.menuClosed = elements.subredditsContainer.hasClass("slideHidden");
		if(generalSettings.menuClosed){
			generalSettings.delayList.push(setTimeout(function(){
				$(elements.subredditsContainer.addClass("invisible"));
			}, 500));
		}
		else {
			generalSettings.delayList.forEach(function(currentDelay){
				window.clearTimeout(currentDelay);
			});
			$(elements.subredditsContainer.removeClass("invisible"));
		}
	});

	elements.addBtn.on("click", function(){
		subreddits.addWithCheck(elements.addInput);
	});

	elements.multipleDeleteBtn.on("click", function(){
		var deleteList = [],
		currentEl;
		
		var els = elements.subredditList.children(".subreddit-single");
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
			    elements.checkAll.prop("checked", false);
			}, function() {
				for(var i = 0; i < els.length; i++){
					var currentEl = $(els[i]);
					currentEl.find("input").prop("checked", false);

				}
			    elements.checkAll.prop("checked", false);
			});
				
		}

	});

	elements.checkAll.on("change", function(){
		if(this.checked){
			$(".subreddit-single input").prop("checked", true);
		}
		else {
			$(".subreddit-single input").prop("checked", false);
		}
	});
	elements.resetImagesBtn.on("click", function(){
		images.getImages(true, true);
	});

	elements.restoreSubreddits.on("click", function(){
		alertify.confirm("This will delete the current subreddits and replace them with the defaults one, are you sure you want to continue?", function () {
		    localStorageData.deleteStorage();
			subreddits.list = JSON.parse(localStorageData.initialData.list);
			subreddits.showList(elements.subredditList, true);
			images.getImages(true, true);
			relatedSubs.getRelatedSubs();
		}, function() {
			
		});
		
	})

	function closeSideMenu(evt){
		var menuClosed = !generalSettings.menuClosed;
		if(menuClosed){
			var buttonTrigger = evt.target !== elements.hideSubreddits[0] && !$(evt.target).parents(".hideSubreddits").length;
			var subredditsContainerTrigger = evt.target !== elements.subredditsContainer[0] && $(evt.target).parents(".subreddits").length === 0;
			var isRecommandation = !(evt.target.classList.contains("recommandation"));
			var isDialog = evt.target !== $(".alertify")[0];
			var isConfirmBox = evt.target !== $(".dialog")[0] && $(evt.target).parents(".dialog").length === 0;

			if(buttonTrigger && subredditsContainerTrigger && isRecommandation && isDialog && isConfirmBox){
				elements.subredditsContainer.addClass("slideHidden");
					// console.log(evt.target, $(evt.target).parent(".subreddits").length);
					generalSettings.menuClosed = true;
					elements.hideSubreddits.toggleClass("open");
			}
		}

	}
	var c = true;
	$(window).on("resize", function(){
	});
	$(document.body).on("click", function(evt){
		closeSideMenu(evt);
	});
	// $(document.body).on("touchstart", function(evt){
	// 	generalSettings.isTap = true; 

	// });
	// $(document.body).on("touchmove", function(){
	// 	generalSettings.isTap = false;
	// });
	// $(document.body).on("touchend", function(evt){
	// 		console.log(evt);
	// 	if(generalSettings.isTap){
	// 		closeSideMenu(evt);
	// 	}
	// });
	$(window).on("scroll wheel", function(evt){
		if(generalSettings.avoidMultipleRequests){
			var bodyHeight = document.body.offsetHeight;
			var windowScroll = window.scrollY + window.innerHeight;
			if(windowScroll >= (bodyHeight - 35)) {
					images.getImages(false);
			}	
		}
	});
	elements.toTopBtn.hide();
	var isGreater = false;
	$(window).on("scroll", function(){
		if(window.scrollY >= 1200){
			elements.toTopBtn.show();
		}
		else {
			elements.toTopBtn.hide();
		}
	});
	elements.toTopBtn.on("click", function(){
		var scrollElements = $("html, body");
		scrollElements.animate({scrollTop:0}, 500);
	});

	elements.wholeScreenClose.on("click", function(){
		wholeScreenShower.hide();
	});
	elements.wholeScreenClose.on("click", function(){
		wholeScreenShower.hide();
	});
	elements.wholeScreenPrevious.on("click", function(){
		wholeScreenShower.previous();
	});
	elements.wholeScreenNext.on("click", function(){
		wholeScreenShower.next();
	});
	$(document.body).on("keydown", function(evt){
		if($(this).hasClass("noScrollBody")){
			if(evt.which === 37) {
				if(wholeScreenShower.allowPrevious){
					wholeScreenShower.previous();
				}
			}
			else if (evt.which === 39) {
				if(wholeScreenShower.allowNext){
					wholeScreenShower.next();
				}
			}
			else if(evt.which === 27){
				wholeScreenShower.hide();
			}
		}
	});


	var bodyHm = new Hammer(document.body);
	bodyHm.on("tap", function(evt){
		console.log("tap");
		closeSideMenu(evt);
	})

	var isTap = false;

		subreddits.showList(elements.subredditList, true);
	images.getImages(true, true);
	relatedSubs.getRelatedSubs();
}


init();

var es = document.querySelector('.imagesContainer');
var msnry = new Masonry( es, {
  itemSelector: '.imageResult',
  columnWidth: '.col-width',
    percentPosition: true,
	gutter: 0
});

function colorGenerator(){
	var number = Math.floor(Math.random() * 361);
	return "hsla(" + number + ", 35%, 35%, 0.2)";
}




var hm = new Hammer(elements.wholeScreenContainer[0]);
hm.on('swipeleft', function(ev) {
	if(wholeScreenShower.allowNext){
		wholeScreenShower.next();
	}
});

hm.on('swiperight', function(ev) {
	if(wholeScreenShower.allowPrevious){
		wholeScreenShower.previous();
	}
});