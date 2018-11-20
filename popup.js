var currenciesObj = {EUR:1.0};

function setSelectBoxValuesAndDefaults(selectId, array, selectedCurrency){
    var selectList = document.getElementById(selectId);
    for (var i = 0; i < array.length; i++) {
        var option = document.createElement("option");
        if(array != null && array != ""){
            option.value = array[i];
            option.text = array[i];
        }
        else
        {
            option.value = i;
            option.text = i;
        }
        selectList.appendChild(option);
    }
    $("#" + selectId + " option[value=" + selectedCurrency + "]").attr("selected","selected");
    GetCountryFlag(selectId);
}

//show the appropriate flag image 
function GetCountryFlag(selectId){
    var selectedCountry = $("#"+ selectId+ " option:selected").val();
    var imageElement = $("#"+ selectId).closest("div").find("img").first();
    imageElement.attr("src", "./images/flags/" + selectedCountry + ".gif");
};

//calculate the rates according to all available parameters
function Calculator(){
    var commission = 1;
    var currencyFactor;
    if( $("#checkboxCommission").prop("checked")){
        if($("#commissionAmount").val()){
            commission += parseFloat($("#commissionAmount").val())/100;
        } else {
            $("#commissionAmount").val(0);
        };
        saveValueToStorage("commissionAmount", $("#commissionAmount").val());
    };
    
    saveValueToStorage("checkboxCommissionChecked", $("#checkboxCommission").prop("checked"));
    var currencyAmount = $("#amount").val();
    if(!$("#amount").val()){
        currencyAmount = 0;
    }
    selectBaseCurrency = currenciesObj[$("#selectBaseCurrency option:selected").val()];
    saveValueToStorage("selectBaseCurrency", $("#selectBaseCurrency option:selected").val());

    for(i=1;i<=3;i++){
        currencyFactor = currenciesObj[$("#selectCurrency" + i +" option:selected").val()];
        saveValueToStorage("selectCurrency" + i, $("#selectCurrency" + i +" option:selected").val());
        $("#currencyConverted"+i).val(Math.round( parseFloat(commission) * (parseFloat(currencyFactor) / parseFloat(selectBaseCurrency)) *  parseFloat(currencyAmount)*100)/100);
    }   
}

//save value to chrome (chrome.storage.sync)
function saveValueToStorage(key, value){
    chrome.storage.sync.set({
        [key]: value
    }, function() {
        console.log(key + " = " + value + ",  saved.");
      });
}


$(function(){
    //get updated currencies and rates
    $.getJSON("https://ratesapi.io/api/latest", function(result){
        
        Object.assign(currenciesObj, result.rates);
        addCurrnciesToSelectBoxes(Object.keys(currenciesObj), true);
        $("#updatedInfo").append(" - " + result.date);
        updatedMessageToggleFading();
    });

    //enable-disable commission and recalculate values
    $("#checkboxCommission").click(function(){
        setCommissionSatate();
        Calculator();
    });

    //recalculate values when changing one of the select boxes
    $("select").change(function(){
        var selectId = $(this).attr("id");
        GetCountryFlag(selectId);
        Calculator();
    });

    //new calculation when changing values in input (text) boxes
    $("#amount, #commissionAmount").on('input', function(){
        Calculator();
    });

    //reset to default values include storage
    $("#resetButton").click(function(){
        $("#amount").val(0);
        $("#checkboxCommission").prop( "checked", false );
        $("#commissionAmount").val("0.0");
        $("#commissionAmount").attr("disabled", true);
        addCurrnciesToSelectBoxes(Object.keys(currenciesObj), false);
        for(i=1;i<=3;i++){
            $("#currencyConverted"+i).val(0);
        }
        chrome.storage.sync.clear(function() {
            //console.log("-Storage cleared-");
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        });
    });

    function updatedMessageToggleFading(){
        $("#updatedInfo").delay(1000).fadeTo( "slow", 0.8 );
    }

    function setCommissionSatate(){
        if ($("#checkboxCommission").prop("checked")) {
            $("#commissionAmount").removeAttr("disabled");
          } else {
            $("#commissionAmount").attr("disabled", true);
          }
    }

    //add values and defaults to select boxes
    function addCurrnciesToSelectBoxes(arrCurrencies, isInint){
        setSelectBoxValuesAndDefaults("selectBaseCurrency", arrCurrencies, "USD");
        setSelectBoxValuesAndDefaults("selectCurrency1", arrCurrencies, "EUR");
        setSelectBoxValuesAndDefaults("selectCurrency2", arrCurrencies, "GBP");
        setSelectBoxValuesAndDefaults("selectCurrency3", arrCurrencies, "RUB");
        if(isInint){
            chrome.storage.sync.get(["selectBaseCurrency", "selectCurrency1", "selectCurrency2", "selectCurrency3", 
            "checkboxCommissionChecked", "commissionAmount"], function (items) {
                if(items.selectBaseCurrency){
                    setSelectBoxValuesAndDefaults("selectBaseCurrency", arrCurrencies, items.selectBaseCurrency);
                }
                if(items.selectCurrency1){
                    setSelectBoxValuesAndDefaults("selectCurrency1", arrCurrencies, items.selectCurrency1);
                }
                if(items.selectCurrency2){
                    setSelectBoxValuesAndDefaults("selectCurrency2", arrCurrencies, items.selectCurrency2);
                }
                if(items.selectCurrency3){
                    setSelectBoxValuesAndDefaults("selectCurrency3", arrCurrencies, items.selectCurrency3);
                }
                if(items.checkboxCommissionChecked){
                    $("#checkboxCommission").prop( "checked", items.checkboxCommissionChecked );
                    setCommissionSatate();
                }
                if(items.commissionAmount){
                    $("#commissionAmount").val(items.commissionAmount);
                }
            });
        }
    }
    $("#amount").focus();
 });