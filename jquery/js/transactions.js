$(document).ready(function() {
    transactions.init();
});

function pad(s, n) {
	s = '' + s;
	while (s.length < n) {
		s = '0' + s;
	}
	return s;
}

function formatDate(dt) {
	return pad(dt.getDate(), 2) + '.' + pad(dt.getMonth(), 2) + '.' + pad(dt.getFullYear(), 4);
}

var transactions = (function(){
	"use strict";

	var selectedAccount;
	var accounts = [];
	var transactions = [];
	var currentPage = 1;

	var _init = function(){
		updateAccounts();
	};

	//fetches accounts, sets initial data and binds click listeners on success callback
	var updateAccounts = function(){
		service.fetchAccounts(function(response){
			accounts = response.accounts;
			var accountNumber = getURLParameter("account");
			if(accountNumber !== undefined){
				selectedAccount = getAccountById(accountNumber);
			} else{
				selectedAccount = accounts[0];
			}
			setAccountsUI();
			selectAccount(selectedAccount.account_nbr);
			bindListeners();
		});
	};

	//binds click listeners for buttons and stuff
	var bindListeners = function(){
		$(".account a").on("click", function(){
			selectAccount($(this).data("id"));
		});
		$(".get-more").on("click", function(){
			getMoreTransactions();
		});
	};

	//fetch transactions and add to list in UI
	var updateTransactions = function(accNbr, page){
		service.fetchTransactionsByPage(accNbr, page, function(response){
			var newTransactions = response.transactions;
			transactions = transactions.concat(newTransactions);
			setTransactionsUI();
		});
	};

	//appends the fetched accounts in UI
	var setAccountsUI = function(){
		for(var i = 0; i < accounts.length; i++){
			$(".accounts").append("<li class='account'>"
									+ "<a href='#' data-id='"
									+ accounts[i].account_nbr
									+ "'>"
									+ accounts[i].name
									+ " "
									+ accounts[i].account_nbr
									+ "</a>"
									+ "</li>");
		}
	};

	//selects an account, empties transactions list and fetches first page of transactions for selected account
	var urlFlag = false;
	var selectAccount = function(accNbr){
		if(urlFlag) {
		  var url = location.href.substring(0, location.href.lastIndexOf('/')) + '/transactions.html';
		  url += '?account=' + accNbr;
		  history.pushState(null, 'aaa', url);
		} else urlFlag = true;

		currentPage = 1;
		selectedAccount = getAccountById(accNbr);
		transactions = [];
		$(".accounts .account a").removeClass("selected");
		$(".accounts .account a[data-id='" + accNbr + "']").addClass("selected");
		setBalanceUI(selectedAccount.balance);
		updateTransactions(accNbr, currentPage);
	};

	//sets balance (saldo) in UI
	var setBalanceUI = function(balance){
		$(".balance").html(balance + " kr");
	};

	//appends the fetched transactions in UI
	var setTransactionsUI = function(){
		$(".transactions").empty();
    //dope style
    $(".transactions").append("<li class='transaction'>"
            + "<div class='date'><b>date</b></div>"
            + "<div class='category'><b>category</b></div>"
            + "<div class='text'><b>description</b></div>"
            + "<div class='amount'><b>amount</b></div>"
            + "</li>");
		for(var i = 0; i < transactions.length; i++){
			var d = formatDate(new Date(transactions[i].trx_time));
			$(".transactions").append("<li class='transaction'>"
							+ "<div class='date'>" + d + "</div>"
							+ "<div class='category'>" + transactions[i].trx_subcategory + " - " + transactions[i].trx_category + "</div>"
							+ "<div class='text'>" + transactions[i].trx_description + "</div>"
							+ "<div class='amount'>" + transactions[i].trx_ammount + "</div>"
							+ "</li>");
		}
	};

	//fetches next page of transactions
	var getMoreTransactions = function(){
		currentPage++;
		updateTransactions(selectedAccount.account_nbr, currentPage);
	};

	//returns an account object with given account number
	var getAccountById = function(accNbr){
		for(var i = 0; i < accounts.length; i++){
			if(accNbr === accounts[i].account_nbr){
				return accounts[i];
			}
		}
		return null;
	};

	//helper function to get query parameter from url, eg return 'hello' from http://bla.com?param='hello'"
	var getURLParameter = function(paramName){
		var pageURL = window.location.search.substring(1);
	    var URLVariables = pageURL.split('&');
	    for (var i = 0; i < URLVariables.length; i++){
	        var parameterName = URLVariables[i].split('=');
	        if (parameterName[0] == paramName){
	            return parameterName[1];
	        }
	    }
	};

	//public functions
	return {
		init : _init
	}
})();
