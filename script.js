function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var your_user_id = getCookie("ds_user_id");

let config = {
  followers: {
    hash: 'c76146de99bb02f6415203be841dd25a',
    path: 'edge_followed_by'
  },
  following: {
    hash: 'd04b0a864b4b54837c0d870b0e77e076',
    path: 'edge_follow'
  }
};

var allFollowers = [];

function getFollowers(data) {
    var userBatch = data.map(element => element.node.username);
    allFollowers.push(...userBatch);
}

var allFollowing = [];

function getFollowing(data) {
    var userBatch = data.map(element => element.node.username);
    allFollowing.push(...userBatch);
}

async function makeNextRequest(nextCurser, listConfig) {
    var params = {
        "id": your_user_id,
        "include_reel": true,
        "fetch_mutual": true,
        "first": 50
    };
    if (nextCurser) {
        params.after = nextCurser;
    }
    var requestUrl = `https://www.instagram.com/graphql/query/?query_hash=` + listConfig.hash + `&variables=` + encodeURIComponent(JSON.stringify(params));
	
	if (listConfig.hash === "c76146de99bb02f6415203be841dd25a") {
		var xhr = new XMLHttpRequest();
	    xhr.onload = function(e) {
	        var res = JSON.parse(xhr.response);
	
	        var userData = res.data.user[listConfig.path].edges;
	        getFollowers(userData);
	
	        var curser = "";
	        try {
	            curser = res.data.user[listConfig.path].page_info.end_cursor;
	        } catch {
	
	        }
	        var users = [];
	        if (curser) {
	            makeNextRequest(curser, listConfig);
	        }
	    }
		xhr.open("GET", requestUrl);
		xhr.send();
	}
	if (listConfig.hash === "d04b0a864b4b54837c0d870b0e77e076") {
		var xhr = new XMLHttpRequest();
	    xhr.onload = function(e) {
	        var res = JSON.parse(xhr.response);
	
	        var userData = res.data.user[listConfig.path].edges;
	        getFollowing(userData);
	
	        var curser = "";
	        try {
	            curser = res.data.user[listConfig.path].page_info.end_cursor;
	        } catch {
	
	        }
	        var users = [];
	        if (curser) {
	            makeNextRequest(curser, listConfig);
	        }else {
				unfollow(allFollowers, allFollowing);
	        }
	    }
		xhr.open("GET", requestUrl);
		xhr.send();
	}
}

if ("unfollow" in localStorage) {
    //console.log('armazenado');
	console.log(JSON.parse(localStorage.getItem("unfollow")));
	var tempo = JSON.parse(localStorage.getItem("unfollowDate"));
	var atual = new Date();
	var expira = new Date(tempo);
	if (atual.getTime() > expira.getTime()){
		localStorage.removeItem("unfollow");
		localStorage.removeItem("unfollowDate");
	}
} else {
    //console.log('armazenando...');
	makeNextRequest("", config.followers);
	makeNextRequest("", config.following);
	unfollow(allFollowers, allFollowing);
	console.log("Reload Page");
}

function unfollow(a1, a2) {
	
    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }
	localStorage.setItem("unfollow", JSON.stringify(diff));
	var date = new Date();
	date.setDate(date.getDate() + 1);
	var tempo = date.getTime();
	localStorage.setItem("unfollowDate", tempo);
    return diff;
}