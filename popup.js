var currenciesObj = {EUR:1.0};
var storage = chrome.storage.local;

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
function Calculate(baseInputCurrencyIndex){
    var commission = 1;
    var currencyFactor;
    if( $("#checkboxCommission").prop("checked")){
        if($("#commissionAmount").val()){
            commission += parseFloat($("#commissionAmount").val())/100;
        } else {
            $("#commissionAmount").val(0);
        };
    };
    
    var currencyAmount = $("#currencyConverted" + baseInputCurrencyIndex).val();
    if(!$("#currencyConverted" + baseInputCurrencyIndex).val()){
        currencyAmount = 0;
    }
    var selectedCurrency = currenciesObj[$("#selectCurrency" +  baseInputCurrencyIndex + " option:selected").val()];

    for(i = 0 ; i <= 3 ; i++){
        if (i != baseInputCurrencyIndex) {
            currencyFactor = currenciesObj[$("#selectCurrency" + i +" option:selected").val()];
            $("#currencyConverted"+i).val(Math.round( parseFloat(commission) * 
                (parseFloat(currencyFactor) / parseFloat(selectedCurrency)) *  
                parseFloat(currencyAmount)*100)/100);
        }
    }   
    //console.log("Calculate working.")
}

function saveFormData(){
    saveValueToStorage("commissionAmount", $("#commissionAmount").val());
    saveValueToStorage("checkboxCommissionChecked", $("#checkboxCommission").prop("checked"));
    saveValueToStorage("selectCurrency0", $("#selectCurrency0 option:selected").val());
    for(i = 1 ; i <= 3 ; i++){
        saveValueToStorage("selectCurrency" + i, $("#selectCurrency" + i +" option:selected").val());
    }   
}

//save value to chrome (chrome.storage.local)
function saveValueToStorage(key, value){
    storage.set({
        [key]: value
    }, function() {
      });
}


$(function(){
    //get updated currencies, rates and background color on init
    $.getJSON("https://ratesapi.io/api/latest", function(result){
        
        Object.assign(currenciesObj, result.rates);
        addCurrnciesToSelectBoxes(Object.keys(currenciesObj), true);
        loadSavedBodyClass();
        $("#updatedInfo").append(" - " + result.date);
        updatedMessageToggleFading();
    });

    //enable-disable commission and recalculate values
    $("#checkboxCommission").click(function(){
        setCommissionSatate();
        Calculate(0);
        saveFormData();
        currenciesInputBoxEditable();
    });


    function currenciesInputBoxEditable(){
        var isReadOnly = true;
        if(!$("#checkboxCommission").prop("checked")) {
            isReadOnly = false;
        }
        for(i = 1 ; i <= 3 ; i++){
            $("#currencyConverted"+i).prop("readonly", isReadOnly).val("");
        }
    }

    //recalculate values when changing one of the select boxes
    $("select").change(function(){
        var selectId = $(this).attr("id");
        GetCountryFlag(selectId);
        var indexNumberOfSelectCurrency = selectId.charAt(selectId.length - 1);
        $("#currencyConverted"+indexNumberOfSelectCurrency).val("");
        saveFormData();
    });

    //new calculation when changing values in input (number) boxes
    $("input[type='number']").on('input', function(){
        var inputId = $(this).attr("id");
        var indexNumberOfInputCurrency = inputId.charAt(inputId.length - 1);
        if ($("#currencyConverted" + indexNumberOfInputCurrency).is(':focus')) {
            console.log("indexNumberOfInputCurrency: " + indexNumberOfInputCurrency);
            Calculate(indexNumberOfInputCurrency);
        }
        if ($("#commissionAmount").is(':focus')) {
            Calculate(0);
            saveFormData();
        }
    });

    //reset to default values include storage
    $("#resetButton").click(function(){
        addCurrnciesToSelectBoxes(Object.keys(currenciesObj), false);
        storage.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        });
        saveValueToStorage("bodyClass", document.body.className);
    });

    $("#colorPickerSpan").click(function () {  
        switch (document.body.className) {
            case "bodyBackground1":
                $("body").removeClass().addClass('bodyBackground2');
                break;
            case "bodyBackground2":
                $("body").removeClass().addClass('bodyBackground3');
                break;
            case "bodyBackground3":
                $("body").removeClass().addClass('bodyBackground4');
                break;
            case "bodyBackground4":
                $("body").removeClass().addClass('bodyBackground5');
                break;
            case "bodyBackground5":
                $("body").removeClass().addClass('bodyBackground6');
                break;
            case "bodyBackground6":
                $("body").removeClass().addClass('bodyBackground1');
                break;
            default: 
                $("body").removeClass().addClass('bodyBackground1');
        }
        saveValueToStorage("bodyClass", document.body.className);
    });
    
    //load and update body class
    function loadSavedBodyClass(){
        var bodyClass;
        storage.get("bodyClass", function(data) {
            bodyClass = data.bodyClass;
            if(bodyClass && bodyClass != "") {
                $('body').removeClass().addClass(bodyClass);
            }
        });

    }
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
    function addCurrnciesToSelectBoxes(arrCurrencies, isInit){
        setSelectBoxValuesAndDefaults("selectCurrency0", arrCurrencies, "USD");
        setSelectBoxValuesAndDefaults("selectCurrency1", arrCurrencies, "EUR");
        setSelectBoxValuesAndDefaults("selectCurrency2", arrCurrencies, "GBP");
        setSelectBoxValuesAndDefaults("selectCurrency3", arrCurrencies, "ILS");
        if(isInit){
            storage.get(["selectCurrency0", "selectCurrency1", "selectCurrency2", "selectCurrency3", 
            "checkboxCommissionChecked", "commissionAmount"], function (items) {
                if(items.selectCurrency0){
                    setSelectBoxValuesAndDefaults("selectCurrency0", arrCurrencies, items.selectCurrency0);
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
                }
                if(items.commissionAmount){
                    $("#commissionAmount").val(items.commissionAmount);
                }
                currenciesInputBoxEditable();
            });
        }
    }
    $("#currencyConverted0").focus();
 });