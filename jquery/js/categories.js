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
			bindListeners();

			service.fetchCategories(function(cats) {
			  for(var i = 0; i < cats.length; i++) {
				var tit = cats[i].title;
				$('#cats').append('<option value="' + tit + '">' + tit + '</option>');
			  }
			  $('#cats').on('change', function() {
				  updateTransactions();
			  });
			  updateTransactions();
			});
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
	var updateTransactions = function(){
		var category = $('#cats').val();
		transactions = [];
	  service.fetchTransactionsByCategory(category, function(response){
			var newTransactions = response.transactions;
			transactions = transactions.concat(newTransactions);
			setTransactionsUI();
		});
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
							+ "<div class='amount' style='text-align: right;'>" + fixNumber(transactions[i].trx_ammount) + "</div>"
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
