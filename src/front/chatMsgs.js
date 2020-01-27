var request = new XMLHttpRequest();

request.onreadystatechange = function() {
	// console.log("onreadystatechange: " + request.readyState + ", " +  request.status);
	// console.log(request.responseText);
	if (request.readyState == 4) {
		if (request.status == 200) {
			var response = JSON.parse(request.responseText);
			handlers[response._id](response);
		}
		if (request.status == 404) {
			console.log("not found: " + request.responseText);
		}
	}
};

function get(variable) {
	// console.log("get " + variable);
	request.open("GET", dburl + variable, false);
	request.send();
}

function update() {
	for (var name in handlers) {
		// console.log("updating " + name);
		get(name);
	}
}

// request updates at a fixed interval (ms)
var intervalID = setInterval(update, 1000);

var dbname = "gmci";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var handlers = {
	"chat" : updateChat,
};


/*
 update the chat window with the response from the database.
 if there is a message pending, append it to the response. */
function updateChat(response) {
	var chatHist = "";
	var messages  = response.value;
	console.log("hey");
	messages.forEach(e => {
		chatHist +="<div class=' msg "
		+ (e.sdr == 'You'? 'yourMsg' : 'otherMsg') 
		+ " >"
		+ "<p class='msgSender'>"
		+ e.sdr + "</p><p class='msgText'>" + e.msg
		+ "</p></div>";
	});
	//console.log(chatHist);
	
	document.getElementById("msgArea").innerHTML = chatHist;
}
