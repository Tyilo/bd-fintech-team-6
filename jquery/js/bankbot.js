$(document).ready(function() {
    bot.init();
});

var bot = (function(){
	"use strict";

	var annoyanceCounter;
    var annoyanceMessage = null;
    var annoyanceBurst = 3;

	var _init = function(){
        insertChatMessage("bot", "Hej, du snakker med Banky Bot");
        bindListeners();
    };
    
    //add click listeners
    var bindListeners = function(){
        $('#submit-btn').on('click', function(e) {
            sendMessage();
            return false;
        });
        $('#user-msg').on('keyup', function(e) {
            if (e.keyCode == 13) {
                sendMessage();
                return false;
            }
        });
    };

    //send message to server and clear input field
    var sendMessage = function(){
        let clientmsg = $("#user-msg").val();
        if(clientmsg == '') {
            return false;
        }
        $('#chat-window').scrollTop(10000000);
        $("#user-msg").val("");
        insertChatMessage("self", clientmsg);
        var words = clientmsg.split(' ');
        var account = words.length === 1? '': words[words.length - 1];
        service.fetchBotIntent(clientmsg, function(response) {
            let handledResponse = handleBotResponse(response, account, function(handledResponse) {
                insertChatMessage("bot", handledResponse);
                $('#chat-window').scrollTop(10000000);
            });
        });
        return false;
    };

    //insert chat message in UI
    var insertChatMessage = function(sender, message){
        let photo = '<div class="image ' + sender +'"></div>';
        let msg = '<p class="chat-message ' + sender + '">' + message + '</p>';
        let responseMsg = '<div class="chat">' + photo + msg + '</div>';
        $('#chat-window').append(responseMsg);
    };
    
    //handle server response
    var handleBotResponse = function(response, account, callback) {
        function showBalance(account) {
            service.fetchAccounts(function(r) {
                var accounts = r.accounts;
                var response = 'Det giver jeg dig lige. Saldo på kontoer:';
                for (var acc of accounts) {
                    if (acc.name.toLowerCase().startsWith(account.toLowerCase())) {
                        response += '<br>';
                        response += acc.name.trim() + ': ' + fixNumber(acc.balance);
                    }
                }
                callback(response);
            });
        }

        let limit = 0.7;
        let intent = null;
        response.forEach(element => {
            if(element.value >= limit){
                limit = element.value;
                intent = element.label;
            }
        });
        let intentMsg;
        console.log(response);

        if (intent === annoyanceMessage) {
            annoyanceCounter++;
            if(annoyanceCounter >= annoyanceBurst){
                return "Hvad vil du mig?!";
            }
        } else {
            annoyanceCounter = 0;
            annoyanceMessage = intent;
        }
        switch(intent){
            case "Opsparingskonto":
            case "Budgetkonto":
            case "Madkonto":
                showBalance(intent);
                break;
            case "Hilsen":
                callback(welcomeMessage());
                break;
            case "Overblik":
            case "Saldo":
                showBalance(account);
                break;
            default:
                callback("Den besked forstod jeg desværre ikke.");
                break;
        }
    };
    
    //return random greeting
    var welcomeMessage = function(){
        let responseList = [];
        responseList.push("Hej med dig, hvad leder du efter?");
        responseList.push("Hej, hvordan kan jeg hjælpe?");
        responseList.push("Øh hejsa du");
        responseList.push("Hej, hvad leder du efter?");
        let idx = Math.floor(Math.random() * responseList.length);
        return responseList[idx];
    };

	//public functions
	return {
		init : _init
	}
})();
