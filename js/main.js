var endpoints = {
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
			value: "",
		},
		sortType: "top",
			// ["hour", "day", "week", "month", "year", "all"]
		setSorting: function(type, time){
			if(type !== "controversial" && type !== "hot") {
				sortTime = time;
			}
			else {
				sortTime = "";
			}
			sortType = type;
		},
		getParams: function(paramList){
			var urlParams = [];
			for(var i = 0; i < paramList.length; i++){
				urlParams.push(this[paramList[i]].name + "=" + this[paramList[i]].value);
			}
			return urlParams.join("&");
		},
		changeSorting: function(type, time) {
			if(type !== "top" || type !== "controversial"){
				this.sortType.value = ""
			}
			else {
				this.sortTime.value = time;
			}
			this.sortType = type;
		}
}
Object.defineProperty(urlParams.adultContent, "value", {
	get: function(){
		return settings.adultContent;
	}
});


var subreddits = {
	dataList: ["pics", "cars", "europe"],
	showList: ["pics"],
	addSubreddit: function(list, name){
		this.checkDuplicate(list, name);
		list.push(name);
	},
	checkDuplicate: function(list, name){
		list = list.filter(function(curr, ind, arr){
			return arr.slice(ind + 1).indexOf(curr) === -1;
		});
		return list;
	},
	removeSubreddit: function(name){
		var dataIndex = this.dataList.indexOf(name);
		var showIndex = this.dataList.indexOf(name);
		this.dataList.splice(dataIndex, 1);
		this.showList.splice(showIndex, 1);
	}
}

var settings = {
	titles: false,
	adultContent: false,
}

function ajaxReq(){

}

function ajaxRequest(url, success, error){
	$.ajax(url, {
		 complete: function(val){
		 	success(val);
		 },
		 crossDomain: true,
		 dataType: "json",
		 error: function(err){
		 	error(err);
		 },
		 method: "GET"
	});
}

ajaxRequest(
	endpoints.search("query"), 
	function(value){
		console.log(value);
	}, 
	function(err){
		alert("error");
	}
);
