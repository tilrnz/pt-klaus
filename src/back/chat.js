var request = new XMLHttpRequest();

request.onreadystatechange = function() {
    console.log("onreadystatechange: " + request.readyState + ", " +  request.status);
    //console.log(request.responseText);
    if (request.readyState == 4) {
        if (request.status == 200) {
            var response = JSON.parse(request.responseText);
            handlers[response._id](response);
        }
        if (request.status == 404) {
            var json = JSON.parse(request.responseText);
            if (json.reason === "no_db_file") {
                createDB();
            } else {
                var url = request.responseURL
//              console.log(typeof(url));
                var i = url.lastIndexOf("/", url.length - 1);
                var name = url.substring(i + 1);
                handlers[name]({ "_id" : name });
            }
        }
    }
};


function set(name) {
    console.log("set::name = " + name);
    console.log("set::GET = " + dburl + name);
    request.open("GET", dburl + name, false);
    request.send();
}

function put(response, message) {
    console.log("put::response = " + response);
    console.log("put::message = " + message);
    request.open("PUT", dburl + response._id, false);
    request.setRequestHeader("Content-type", "application/json");
    message["_id"] = response._id;
    if (response._rev) {
        message["_rev"] = response._rev;
    }
    var s = JSON.stringify(message);
//  console.log("put: " + s);
    request.send(s);
}

function createDB() {
    request.open("PUT", dburl, false);
    request.send();
}

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "gmci";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var handlers = {
    "chat" : updateChat,
};

/*
update the chat window with the response from the database.
if there is a message pending, append it to the response. */
function updateChat(response) {
    //console.log("a");
    if(pendingClear){
        pendingClear = 0;
        put(response, {"value": []} );
    }
    
    
    if(pendingMessage){
        pendingMessage = 0;
        console.log("pending message");
        appendChatMsg(response);
        
    }
    
    var chatHist = "";
    var messages  = response.value;
    console.log("hey");
    messages.forEach(e => {
        chatHist +="<div class='chatmsg list-group-item list-group-item-action active'><p class='chatSender'>"
        + e.sdr + "</p><p class='chatcontent'>" + e.msg
        + "</p></div>";
    });
    //console.log(chatHist);
    
    document.getElementById("chatFrame").innerHTML = chatHist;
}

var pendingMessage = 0;
var pendingClear = 0;

function setPendingMessage(){
    pendingMessage = 1;
    console.log("pending message");
}

function appendChatMsg(response){
    console.log("append called");
    var nxtmsg = document.getElementById('chatField').value;
    document.getElementById('chatField').value = '';
    var chatHist;
    
    var messages=response.value;
    messages.push({sdr: document.getElementById("unameField").value, msg:  nxtmsg  })
    put(response, {"value": messages} );
    console.log(messages);
}


function uc(){
    set('chat');
}

var intervalID = setInterval(uc, 1500);

function clearChat(){
    pendingClear = 1;
    console.log("clearing chat");
}