$(document).ready(function() {
    overview.init();
});

var overview = (function(){
	"use strict";

	var accounts = [];
	var accountNames = [];
	var accountBalances = [];
	var transactions = [];

	var _init = function(){
		refreshCurrentBalanceChart();
		bindListeners();
	};

	var findTransactionsWithMinAmount = function(transactions, min, max){
		var newTransactions = [];
    if(max == ""){
  		for(var i = 0; i < transactions.length; i++){
  			if(transactions[i].trx_ammount >= min){
  				newTransactions.push(transactions[i]);
  			}
  		}
    }
    else if(min == ""){
  		for(var i = 0; i < transactions.length; i++){
  			if(transactions[i].trx_ammount <= max){
  				newTransactions.push(transactions[i]);
  			}
  		}
    }
    else {
      for(var i = 0; i < transactions.length; i++){
  			if(transactions[i].trx_ammount <= max && transactions[i].trx_ammount >= min){
  				newTransactions.push(transactions[i]);
  			}
  		}
    }
		return newTransactions;
	};

	//make buttons and stuff clicky
	var bindListeners = function(){
		$("#refresh-balance-chart").on("click", refreshCurrentBalanceChart);
		$("#refresh-amount-stats").on("click", refreshAmountStats);
	};

	//fetch accounts and create chart
	var refreshCurrentBalanceChart = function(){
		service.fetchAccounts(function(response){
			accounts = response.accounts;
      for(var i = 0; i < accounts.length; i++){
        $("#items").append("<option value="+ (i+1) + ">" + accounts[i].name + "</option>")
      }
			setAccountData();
			setupCurrentBalanceChart();
		});
	};

	//fetch transactions and find ones with min amount
	var refreshAmountStats = function(){
		var year = $("#amount-stats-year").val();
    $(".amount-stats-transactions").empty();
    $(".amount-stats-transactions").append("<table class='transactions'></table>");
    $(".transactions").append('<tr><th>Dato</th><th>Beskrivelse</th><th>Beløb</th></tr>');
    var account = $("#items").val();
    if(account == 0){
      for(var i = 0; i < accounts.length; i++){
      	service.fetchTransactionsByDate(accounts[i].account_nbr, year + "-01-01", year + "-12-31", function(response){
      		transactions = findTransactionsWithMinAmount(response.transactions, $("#amount-stats-min").val(), $("#amount-stats-max").val());
      		for(var i = 0; i < transactions.length; i++){
      			$(".transactions").append("<tr><td style='padding-right: 10px; padding-left: 10px;'>" + formatDate(new Date(transactions[i].trx_time)) + "</td><td style='padding-right: 10px; padding-left: 10px;'>" + transactions[i].trx_description + "</td><td style='padding-right: 10px; padding-left: 10px; text-align: right;'>" + fixNumber(transactions[i].trx_ammount) + "</td></tr>")
      		}
      	});
      }
    }else {
      service.fetchTransactionsByDate(accounts[account].account_nbr, year + "-01-01", year + "-12-31", function(response){
        transactions = findTransactionsWithMinAmount(response.transactions, $("#amount-stats-min").val(), $("#amount-stats-max").val());
        for(var i = 0; i < transactions.length; i++){
          $(".transactions").append("<tr><td style='padding-right: 10px; padding-left: 10px;'>" + formatDate(new Date(transactions[i].trx_time)) + "</td><td style='padding-right: 10px; padding-left: 10px;'>" + transactions[i].trx_description + "</td><td style='padding-right: 10px; padding-left: 10px; text-align: right;'>" + fixNumber(transactions[i].trx_ammount) + "</td></tr>")
        }
      });
    }
	};

	//build some account data arrays
	var setAccountData = function(){
		accountNames = [];
		accountBalances = [];
		for(var i = 0; i < accounts.length; i++){
			accountNames.push(accounts[i].name);
			accountBalances.push(accounts[i].balance);
		}
	};

	//make a pretty bar chart
	var setupCurrentBalanceChart = function(){
		$('#container').highcharts({
	        credits: {
	        	enabled : false
	        },
	        legend: {
	        	enabled : false
	        },
	        chart: {
	            type: 'column',
	            width: 500
	        },
	        title: {
	            text: 'Saldo lige nu'
	        },
	        xAxis: {
	            categories: accountNames
	        },
	        yAxis: {
				title: ''
	        },
	        tooltip: {
	            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
	            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
	                '<td style="padding:0"><b>{point.y:.2f} kr</b></td></tr>',
	            footerFormat: '</table>',
	            shared: true,
	            useHTML: true
	        },
	        plotOptions: {
	            column: {
	                pointPadding: 0.2,
	                borderWidth: 0
	            }
	        },
	        series: [{
				name: 'Saldo',
	            data: accountBalances
	        }]
        });
	};

	//public functions
	return {
		init : _init
	}
})();
