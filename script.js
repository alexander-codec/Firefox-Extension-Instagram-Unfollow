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
	        } else {
				localStorage.setItem("followers", JSON.stringify(allFollowers));
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
	        } else {
				localStorage.setItem("following", JSON.stringify(allFollowing));
	        }
	    }
		xhr.open("GET", requestUrl);
		xhr.send();
	}
}

if ("followers" in localStorage || "following" in localStorage) {
    //console.log('armazenado');
	var a1 = JSON.parse(localStorage.getItem("followers"));
	var a2 = JSON.parse(localStorage.getItem("following"));
	console.log(unfollow(a1, a2));
} else {
    //console.log('armazenando...');
	makeNextRequest("", config.followers);
	makeNextRequest("", config.following);
}

function unfollow (a1, a2) {
	
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

    return diff;console.log(diff);
}