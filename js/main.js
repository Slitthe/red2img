var elements = {
	subredditList: $("#subredditList"),
	addInput: $("#addSubreddit"),
	addBtn: $("#addSubredditBtn"),
	adultSettingInput:$(".settings #nsfw"),
	titleSettingInput: $(".settings #titles"),
	typeChange: $("#type"),
	timeChange: $("#time"),
	statusMessage: $(".statusMessage"),
	imagesContainer: $("#imagesContainer"),
	loading: $("#loading"),
	recommendedList: $("#recommended"),
	loadMore: $("#loadMore"),
	autocompleteRes: $("#autocomplete"),
	inputs: ["#addSubredditBtn", ".settings input", "#type", "#type", ".removeSubreddit"],
};


function ajaxRequest(url, condition){
	var args = arguments;
	if(condition){
		elements.loading.removeClass("hidden");
		elements.inputs.forEach(function(selector){
			$(selector).attr("disabled", true);
		});
		$.ajax(url, {
			 beforeSend: function(){
			 },
			 method: "GET",
			 crossDomain: true,
			 dataType: "json",
			 timeout: args[2],
			 success: function(succData){
			 	// console.log(succData);
			 	if(args[3]){ args[3](succData);	}
			 },
			 failure: function(failData){
			 	// console.log(failData);
			 	if(args[4]){ args[4](failData);	}
			 		console.log("not");
			 },
			 complete: function(completeData){
			 	// console.log(completeData);
			 	if(args[5]){ args[5](completeData);	}
			 	elements.loading.addClass("hidden");
			 	elements.inputs.forEach(function(selector){
			 		$(selector).attr("disabled", false);
			 	});
			 		console.log("complete");

			 }
		});
	}
}

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
			value: elements.titleSettingInput[0].checked
		},
		limit: {
			name: "limit",
			value: 5,
		},
		existanceLimit: {
			name: "limit",
			value: 1
		},
		searchLimit: {
			name: "limit",
			value: 5,
		},
		adultContent: {
			name: "include_over_18",
			value: elements.adultSettingInput[0].checked
		},
		after: {
			name: "after",
			value: "",
		},		
			// ["top", "controversial", "rising", "new", "hot"],
		sortTime: {
			name: "t",
			value: elements.timeChange.val()
		},
		sortType: elements.typeChange.val(),
			// ["hour", "day", "week", "month", "year", "all"]
		getParams: function(paramList){
			var params = [];
			for(var i = 0; i < paramList.length; i++){
				params.push(this[paramList[i]].name + "=" + this[paramList[i]].value);
			}
			return params.join("&");
		},
		setType: function(type) {
			this.sortType = type;
			console.log("Show images again.");
			helperFunctions.getImages(true);

		},
		setTime: function(time){
			this.sortTime.value = time;
			console.log("Show images again");
			helperFunctions.getImages(true);
		},
}

var requestUrls = {
	base: "https://www.reddit.com/",
	corsProxy: "https://cors-anywhere.herokuapp.com/",
	postsData: function(subreddits){
		subreddits = subreddits.join("+");
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
		url += "r/" + subName.toLowerCase() + "/about/rules.json";
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
		url += "&include_over_18=" + adult
		return url;
	}
};





var subreddits = {
	list: ["itookapicture", "photography", "oldschoolcool", "cinemagraphs", "pbandonedporn", "militaryporn", "earthporn", "spaceporn", "eyebleach", "aww"],
	addWithCheck: function(element){
		var value = element.val();
		if(value) {
			element.val("");
			helperFunctions.checkSubExist(value, function(){
				subreddits.addWithoutCheck(value);
				console.log("Added: " + "succesfully");
				console.log("Now Display Images");
			}, function(){
				elements.autocompleteRes.html("");
				elements.autocompleteRes.addClass("hidden");
			})
		}
	},
	addWithoutCheck: function(value){
		subreddits.list.push(value);
		elements.addInput.val("");
		subreddits.checkDuplicate();
		helperFunctions.showList(elements.subredditList);
		helperFunctions.getImages(true);
		elements.autocompleteRes.html("");
		elements.autocompleteRes.addClass("hidden");
		helperFunctions.getRelatedSubs();

	},
	checkDuplicate: function(){
		this.list = this.list.filter(function(curr, ind, arr){
			return arr.slice(ind + 1).indexOf(curr) === -1;
		});
	},
	remove: function(name){
		var dataIndex = this.list.indexOf(name);
		this.list.splice(dataIndex, 1);
		helperFunctions.showList(elements.subredditList);
		console.log("Show images again");
		helperFunctions.getImages(true);
		helperFunctions.getRelatedSubs()
	}
};

var settings = {
	titles: false,
	adultContent: false,
};

var helperFunctions = {
	removeSubreddit: function(thisContext) {
		var name = $(thisContext).prev().text();
		subreddits.remove(name, $(thisContext));
	},
	showList: function(element){
		var html = "";
		subreddits.list.forEach(function(current){
			html += "<div class='subreddit'>"
			html += "<div class='subredditName'>" + current + "</div>";
			html += "<button class='removeSubreddit' type='button'>X</button>";
			html += "</div>";
		});
		element.html(html);
	},
	getImages(newSearch){
		if(newSearch){
			elements.imagesContainer.html("");
			generalData.continueSearch = true;
			urlParams.after.value = "";
			elements.loadMore.addClass("hidden");
		}
		var url = requestUrls.postsData(subreddits.list);
		var resData;
		ajaxRequest(url,generalData.continueSearch,4000 , function(succ){
			resData = succ;
			generalData.searchCount++;
			resData.data.children.forEach(function(cr){
				generalData.arr.push(cr.data);
			});
			generalData.keepOnlyImages();
			generalData.filterAdult()
			urlParams.after.value = resData.data.after;
			generalData.displayImages();
			if(generalData.searchCount && !resData.data.after) {
				generalData.continueSearch = false;
				console.log("No more images to load");
			}
			elements.loadMore.removeClass("hidden");
		});
	},
	getRelatedSubs: function(){
		ajaxRequest(requestUrls.recommended(),3000, true, function(res){
			var html = "";
			res.forEach(function(srname){
				html += "<li>/r/" + srname.sr_name + "</li>"; 
			});
			elements.recommendedList.html(html);
		});
	},
	checkSubExist(subName, fun, done){
		generalData.subExists = false;
		subName = subName.toLowerCase();
		ajaxRequest(requestUrls.subExists(subName),3000, true, function(res){
				if(res.hasOwnProperty("site_rules")){
					generalData.subExists = true;
				}
				if(generalData.subExists){
					fun();
				}
				else {
					console.log("Sub doesn't exist");
				}
		}, function(fail){
			console.log("Communication with the target server failed.");
		}, function(complete){
			if(complete.status === 404 || complete.status === 403){
				console.log("Private or banned subreddit");
				done();
			}
		});
	},
	autocomplete: function(value){
		ajaxRequest(requestUrls.searchAutocomplete(value, true), true, 1500,"","", function(data){
			if(data.responseJSON){
				data.responseJSON.subreddits.forEach(function(sr){
					if(sr.allowedPostTypes.images && sr.name.substring(0,2) !== "u_" && sr.numSubscribers >= 1){
						generalData.recommendedListNSFW.push(sr.name);
					}
				});
			}
			generalData.firstReqDone = true;
			generalData.addSuggestions();
		});
		ajaxRequest(requestUrls.searchAutocomplete(value, false),true, 1500, "", "",function(data){
				if(data.responseJSON){
					data.responseJSON.subreddits.forEach(function(sr){
						if(sr.allowedPostTypes.images && sr.name.substring(0,2) !== "u_" && sr.numSubscribers >= 1){
							generalData.recommendedListSFW.push(sr.name);
						}
					});
					console.log("not");
				}
				generalData.secondReqDone = true;
				generalData.addSuggestions();
		});
	}
};


var generalData = {
	firstReqDone: false,
	secondReqDone: false,
	addSuggestions: function(){
		console.log("tried");
		if(this.firstReqDone && this.secondReqDone){
			this.firstReqDone = false;
			this.secondReqDone = false;
			this.combineSuggestions();
		}
	},
	recommendedListSFW: [],
	recommendedListNSFW: [],
	finalList: [],
	subExists: false,
	searchCount: 0,
	continueSearch: true,
	arr: [],
	keepOnlyImages: function(){
		this.arr = this.arr.filter(function(current){
			// if(current.domain.search("imgur") >= 0){
			// 	current.url += ".jpg";
			// }
			return current.url.search(/(.jpg|.png|.jpeg|.bmp|.svg)$/gi) >= 0;
		});
	},
	filterAdult: function(){
		if(!urlParams.adultContent.value){
			this.arr = this.arr.filter(function(current){
				return !current.over_18;
			});
		}
	},
	displayImages: function(){
		html = "";
		this.arr.forEach(function(current, indx, arr){
			html += "<div class='imageResult'>";
			html += "<img src='" + current.url + "'>";
			html += "<div class='postText'>" + current.title + "</div>";
			html += "<div class='subredditSource'>" + current.subreddit_name_prefixed + "</div>";
			html += "<div class='subredditSource'>" + requestUrls.base + current.permalink + "</div></div>";
		});
		this.arr = [];
		elements.imagesContainer.html(elements.imagesContainer.html() + html);
	},
	combinedSuggestions: [],
	combineSuggestions: function(){
		console.log("even here");
		this.combinedSuggestions = [];
		if(!urlParams.adultContent.value){
			this.recommendedListNSFW = [];
		}
		var i = 0;
		while(this.combinedSuggestions.length <= 5){
			// console.log("i is : " + i);
			// console.log(!!(i % 3 === 0 && this.recommendedListNSFW.length));
			// console.log(!!this.recommendedListSFW.length);
			// console.log(!this.recommendedListSFW.length && !this.recommendedListNSFW.length);
			if(i % 3 === 0 && this.recommendedListNSFW.length){
				this.combinedSuggestions.push(this.recommendedListNSFW.shift());
			}
			else if(this.recommendedListSFW.length) {
				this.combinedSuggestions.push(this.recommendedListSFW.shift())		
			}
			if(!this.recommendedListSFW.length && !this.recommendedListNSFW.length){
				break;
			}
			// console.log(this.combinedSuggestions);
			i++;
			// console.log(this.combinedSuggestions.length);
		}
		console.log(this.combinedSuggestions);
		if(this.combinedSuggestions.length){
			elements.autocompleteRes.removeClass("hidden");
			var html = "";
			this.combinedSuggestions.forEach(function(sr){
				html += "<li data-srname='" + sr.toLowerCase() + "'>/r/" + sr + "</li>"; 
			});
			elements.autocompleteRes.html(html);
		}
		else {
			elements.autocompleteRes.html("");
			elements.autocompleteRes.add("hidden");
		}
		this.recommendedListNSFW = [];
		this.recommendedListSFW = [];
		// console.log(this.combinedSuggestions);
	},
};

elements.typeChange.on("input", function(){
	var value = $(this).val();
	if(value === "controversial" || value === "top"){
		$(this).next().removeClass("hidden");	
	}
	else {
		$(this).next().addClass("hidden");	
	}
	urlParams.setType(value);
});

elements.timeChange.on("change", function(){
	urlParams.setTime($(this).val());
});

elements.subredditList.on("click", ".removeSubreddit", function(){
	helperFunctions.removeSubreddit(this);
});

elements.addBtn.on("click", function(){
	subreddits.addWithCheck(elements.addInput);
});


helperFunctions.showList(elements.subredditList);

elements.addInput.on("input", function(){
	console.log("triggered");
	helperFunctions.autocomplete($(this).val());
});

elements.addInput.on("change", function(){
	if(!$(this).val()){
		helperFunctions.autocomplete($(this).val());	
	}
});

elements.adultSettingInput.on("change", function(){
	urlParams[$(this).attr("name")].value = this.checked;
	console.log("show images");
	helperFunctions.getImages(true);

});

elements.titleSettingInput.on("change", function(){
	settings[$(this).attr("name")] = this.checked;
	console.log("title settings changed");
});

$("#imagesContainer").on("error", ".imageResult img", function(){
	console.log("Image fetching resulted in error");
});

elements.loadMore.on("click", function(){
	helperFunctions.getImages(false);
});

elements.autocompleteRes.on("click", "li", function(){
	subreddits.addWithoutCheck($(this).text().substring(3));
});