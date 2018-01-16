var elements = {
	subredditList: $("#subredditList"),
	addInput: $("#addSubreddit"),
	addBtn: $("#addSubredditBtn"),
	changeSettingsInput: $(".settings input"),
	typeChange: $("#type"),
	timeChange: $("#time"),
	statusMessage: $(".statusMessage"),
	imagesContainer: $("#imagesContainer")
};

function ajaxRequest(url, success){
	$.ajax(url, {
		 method: "GET",
		 crossDomain: true,
		 dataType: "json",
		 success: function(val){
		 	success(val);
		 },
		 error: function(err){
		 	elements.statusMessage.text("Communication failed.")
		 },
		 timeout: 0
	});
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
			name: "include_over_18"
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
Object.defineProperty(urlParams.adultContent, "value", {
	get: function(){
		return settings.adultContent;
	}
});

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
		console.log(url);
		urlParams.searchQuery.value = "subreddit%3A" + subName;
		url += urlParams.getParams(["searchQuery", "existanceLimit"]);
		return url;
	}
};





var subreddits = {
	list: ["cars", "europe"],
	add: function(name, element){
		ajaxRequest(requestUrls.checkSubExist(name), function(succRes){
			if(succRes.data.children.length){
				subreddits.list.push(name);
				subreddits.checkDuplicate();
				helperFunctions.showList(elements.subredditList);
			}
			else {
				elements.statusMessage.text("Subreddit doesn't exist");
			}
		});
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
		if(value){
			$(thisContext).prev().val("");
			subreddits.add(value, $(thisContext));	
		}
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
			resData.data.children.forEach(function(cr){
				data.arr.push(cr.data);
			});
			data.keepOnlyImages();
			urlParams.after.value = resData.data.after;
			data.displayImages();
		});
	}
};


var data = {
	arr: [],
	keepOnlyImages: function(){
		this.arr = this.arr.filter(function(current){
			// if(current.domain.search("imgur") >= 0){
			// 	current.url += ".jpg";
			// }
			return current.url.search(/(.jpg|.png|.gif|.gifv|.jpeg|.bmp|.svg)$/gi) >= 0;
		});
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
	helperFunctions.addSubreddit(this);
});

elements.changeSettingsInput.on("change", function(){
	settings[$(this).attr("name")] = this.checked;
});

helperFunctions.showList(elements.subredditList);

