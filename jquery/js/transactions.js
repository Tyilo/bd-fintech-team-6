$(document).ready(function() {
    transactions.init();
});

var transactions = (function(){
	"use strict";

	var selectedAccount;
	var accounts = [];
	var transactions = [];
	var currentPage = 1;
	var ordering = 'trx_time';

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

		function isScrolledIntoView(elem)
		{
			var docViewTop = $(window).scrollTop();
			var docViewBottom = docViewTop + $(window).height();

			var elemTop = $(elem).offset().top;
			var elemBottom = elemTop + $(elem).height();

			return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
		}

		var lastScroll = -1;
		$(document.body).scroll(function(e) {
			if (isScrolledIntoView($('.get-more'))) {
				if (new Date() - lastScroll >= 500) {
					getMoreTransactions(function() {
						lastScroll = +new Date();
					});
				}
			}
		});

		document.body.onscroll = function(ev) {
		};
	};

	//binds click listeners for buttons and stuff
	var bindListeners = function(){
		$(".account a").on("click", function(){
			selectAccount($(this).data("id"));
		});
		$(".get-more").on("click", function(){
			getMoreTransactions();
		});
		$(".get-to-top").on("click", function(){
   			document.body.scrollTo(0,0);
			console.log("HERERE!!!")
		});
	};

	//fetch transactions and add to list in UI
	var updateTransactions = function(accNbr, page, callback){
		service.fetchTransactionsByPage(accNbr, page, ordering, function(response){
			var newTransactions = response.transactions;
			transactions = transactions.concat(newTransactions);
			setTransactionsUI();
			if (callback)
				callback();
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
		$(".balance").html(fixNumber(balance) + " kr");
	};

	//appends the fetched transactions in UI
	var setTransactionsUI = function(){
		$(".transactions").empty();
		//dope style
		$(".transactions").append("<li class='transaction header'>"
				+ "<div class='trx_time'><b>Dato</b></div>"
				+ "<div class='trx_category'><b>Kategori</b></div>"
				+ "<div class='trx_description'><b>Beskrivelse</b></div>"
				+ "<div class='trx_ammount'><b>Beløb</b></div>"
				+ "</li>");
	  	$(".transactions li.header > div").each(function(el) {
		  $(this).on('click', function() {
			  ordering = $(this).attr('class');
			  selectAccount(selectedAccount.account_nbr);
		  });
		});

		for(var i = 0; i < transactions.length; i++){
			var d = formatDate(new Date(transactions[i].trx_time));
			$(".transactions").append("<li class='transaction'>"
							+ "<div class='date'>" + d + "</div>"
							+ "<div class='category'>" + transactions[i].trx_subcategory + " - " + transactions[i].trx_category + "</div>"
							+ "<div class='text'>" + transactions[i].trx_description + "</div>"
							+ "<div class='amount' style='text-align: right;'>" + colorAmount(fixNumber(transactions[i].trx_ammount)) + "</div>"
							+ "</li>");
		}
	};

	//fetches next page of transactions
	var getMoreTransactions = function(callback){
		currentPage++;
		updateTransactions(selectedAccount.account_nbr, currentPage, callback);
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
