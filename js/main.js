var elements = {
	subredditList: $("#subredditList"),
	addInput: $("#addSubreddit"),
	addBtn: $("#addSubredditBtn"),
	changeSettingsInput: $(".settings input"),
	typeChange: $("#type"),
	timeChange: $("#time"),
	statusMessage: $(".statusMessage"),
	imagesContainer: $("#imagesContainer"),
	loading: $("#loading"),
	recommendedList: $("#recommended"),
	inputs: ["#addSubreddit", "#addSubredditBtn", ".settings input", "#type", "#type", ".removeSubreddit"]
};

function ajaxRequest(url, success, condition){
	if(condition){
		$.ajax(url, {
			 beforeSend: function(){
			 	elements.loading.removeClass("hidden");
			 	elements.inputs.forEach(function(selector){
			 		$(selector).attr("disabled", true);
			 	});
			 },
			 method: "GET",
			 crossDomain: true,
			 dataType: "json",
			 success: function(val){
			 	success(val);
			 },
			 error: function(err){
			 	elements.statusMessage.text("Communication failed.")
			 },
			 timeout: 0,
			 headers: {
			 	Origin: "http://127.0.0.1:8080/"
			 },
			 complete: function(){
			 	elements.loading.addClass("hidden");
			 	elements.inputs.forEach(function(selector){
			 		$(selector).attr("disabled", false);
			 	});
			 }
		});
	}
}

var urlParams = {
		searchQuery: {
			name: "q",
			value: "cats"
		},
		limit: {
			name: "limit",
			value: 15,
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
			value: true
		},
		after: {
			name: "after",
			value: "",
		},		
			// ["top", "controversial", "rising", "new", "hot"],
		sortTime: {
			name: "t",
			value: ""
		},
		sortType: "top",
			// ["hour", "day", "week", "month", "year", "all"]
		getParams: function(paramList){
			var params = [];
			for(var i = 0; i < paramList.length; i++){
				params.push(this[paramList[i]].name + "=" + this[paramList[i]].value);
			}
			return params.join("&");
		},
		setType: function(type) {
			if(type !== "top" || type !== "controversial"){
				this.sortTime.value = ""
			}
			else {
				this.sortTime.value = time;
			}
			this.sortType = type;
		},
		setTime: function(time){
			this.sortTime.value = time;
		},
}

var requestUrls = {
	base: "https://www.reddit.com/",
	postsData: function(subreddits){
		subreddits = subreddits.join("+");
		var url = this.base + "r/" + subreddits;
		url += "/" + urlParams.sortType + ".json?";
		return url + urlParams.getParams(["limit", "after", "sortTime"]);
	},
	search: function(query) {
		var url = this.base + "search.json?";
		urlParams.searchQuery.value = query;
		return url + urlParams.getParams(["searchLimit", "adultContent", "searchQuery"]);
	},
	checkSubExist: function(subName) {
		var url = this.base +  "search.json?";
		urlParams.searchQuery.value = "subreddit%3A" + subName + "+nsfw%3A" + urlParams.adultContent.value;
		url += urlParams.getParams(["searchQuery", "existanceLimit", "adultContent"]);
		url += "&sort=relevance&t=all";
		return url;
	},
	recommended: function(){
		var url = this.base + "api/recommend/sr/srnames?";
		url += "srnames=" + subreddits.list.join(",") + "&";
		url += urlParams.getParams(["adultContent"]);
		return url;
	}
};





var subreddits = {
	list: ["cars", "europe"],
	add: function(element){
		var value = element.val();
		if(value){
			element.val("");
			subreddits.list.push(value);
			subreddits.checkDuplicate();
			helperFunctions.showList(elements.subredditList);
		}
		// ajaxRequest(requestUrls.checkSubExist(name), function(succRes){
		// 	console.log(requestUrls.checkSubExist(name));
		// 	console.log(succRes);
		// 	if(succRes.data.children.length){

		// 		
		// 	}
		// 	else {
		// 		elements.statusMessage.text("Subreddit doesn't exist");
		// 	}
		// }, true);
	},
	checkDuplicate: function(){
		this.list = this.list.filter(function(curr, ind, arr){
			return arr.slice(ind + 1).indexOf(curr) === -1;
		});
	},
	remove: function(name, element){
		var dataIndex = this.list.indexOf(name);
		this.list.splice(dataIndex, 1);
		helperFunctions.showList(elements.subredditList);
	}
};

var settings = {
	titles: false,
	adultContent: false,
};

var helperFunctions = {
	addSubreddit: function(thisContext) {
		var value = $(thisContext).prev().val();
		console.log($(thisContext).prev().val());

	},
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
	getImages(){
		var url = requestUrls.postsData(subreddits.list);
		var resData;
		ajaxRequest(url, function(succ){
			resData = succ;
			generalData.searchCount++;
			resData.data.children.forEach(function(cr){
				generalData.arr.push(cr.data);
			});
			generalData.keepOnlyImages();
			urlParams.after.value = resData.data.after;
			generalData.displayImages();
			if(generalData.searchCount && !resData.data.after) {
				generalData.continueSearch = false;
				elements.statusMessage.text("No more images to load.");
			}
		},
		generalData.continueSearch
		);
	},
	addRecommended: function(){
		ajaxRequest(requestUrls.recommended(), function(res){
			var html = "";
			res.forEach(function(srname){
				html += "<li>/r/" + srname + "</li>"; 
			});
			elements.recommended.html(html);
		}, true);
	}
};


var generalData = {
	searchCount: 0,
	continueSearch: true,
	arr: [],
	keepOnlyImages: function(){
		this.arr = this.arr.filter(function(current){
			// if(current.domain.search("imgur") >= 0){
			// 	current.url += ".jpg";
			// }
			return current.url.search(/(.jpg|.png|.gif|.gifv|.jpeg|.bmp|.svg)$/gi) >= 0;
		});
	},
	filterAdult: function(){
		if(settings.adultContent){
			this.arr = this.arr.filter(function(current){
				return !current.data.over_18;
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
	}
};

elements.typeChange.on("change", function(){
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
	subreddits.add($(this).prev());
});

elements.changeSettingsInput.on("change", function(){
	settings[$(this).attr("name")] = this.checked;
});

helperFunctions.showList(elements.subredditList);