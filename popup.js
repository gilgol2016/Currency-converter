var currenciesObj = {EUR:1.0};
var storage = chrome.storage.local;
var numOfConvertingCurrencies = 3;
var maxAddCurrencies = 7;
var defaultNumOfConvertingCurrencies = 3;
var defaultCurrency = "USD";
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

    for(i = 0 ; i <= numOfConvertingCurrencies ; i++){
        if (i != baseInputCurrencyIndex) {
            currencyFactor = currenciesObj[$("#selectCurrency" + i +" option:selected").val()];
            $("#currencyConverted"+i).val(Math.round( parseFloat(commission) * 
                (parseFloat(currencyFactor) / parseFloat(selectedCurrency)) *  
                parseFloat(currencyAmount)*100)/100);
        }
    }   
}

function saveFormData(){
    saveValueToStorage("commissionAmount", $("#commissionAmount").val());
    saveValueToStorage("checkboxCommissionChecked", $("#checkboxCommission").prop("checked"));
    saveValueToStorage("numOfConvertingCurrencies", numOfConvertingCurrencies);
    saveCurrencyArr();
}

function saveCurrencyArr(){
    var currencyArr = new Array();
    for(i = 0 ; i <= numOfConvertingCurrencies ; i++){
        currencyArr.push($("#selectCurrency" + i +" option:selected").val());
    }
    saveValueToStorage("currencyArr", currencyArr);
}

//save value to chrome (chrome.storage.local)
function saveValueToStorage(key, value){
    storage.set({[key]: value});
}

function createNewConvertCurrency(currencyIndexToCreate){
    var elmnt = document.createElement("div");
    var attribute = document.createAttribute("class");
    var container = document.getElementById("lowerContainer");
    attribute.value = "margin";
    elmnt.setAttributeNode(attribute);
    elmnt.innerHTML = '<div class="imageDivContainer"><img class="flagImage" id="flagImage'+ currencyIndexToCreate + '"/></div>';
    elmnt.innerHTML += '<select id="selectCurrency' + currencyIndexToCreate + '" class="resultSelectBox"></select>';
    elmnt.innerHTML += '<input type="number" id="currencyConverted' + currencyIndexToCreate + '" class="resultTxt " readonly>';
    container.appendChild(elmnt);
    setSelectBoxValuesAndDefaults("selectCurrency" + currencyIndexToCreate, Object.keys(currenciesObj), defaultCurrency);
    if(!$("#checkboxCommission").prop("checked")) {
        $("#currencyConverted" + currencyIndexToCreate).prop("readonly", false).val("");
    }
}

function removeCurrencyLine(){
    var container = document.getElementById("lowerContainer");
    if(numOfConvertingCurrencies > defaultNumOfConvertingCurrencies){
        container.removeChild(container.lastChild)
        numOfConvertingCurrencies--;
        saveValueToStorage("numOfConvertingCurrencies", numOfConvertingCurrencies);
        saveCurrencyArr();
    }
}

function currenciesInputBoxEditable(){
    var isReadOnly = true;
    if(!$("#checkboxCommission").prop("checked")) {
        isReadOnly = false;
    }
    for(i = 1 ; i <= numOfConvertingCurrencies ; i++){
        $("#currencyConverted"+i).prop("readonly", isReadOnly).val("");
    }
}

$(function(){
    //get updated currencies, rates and background color on init
    $.getJSON("https://ratesapi.io/api/latest", function(result){
        Object.assign(currenciesObj, result.rates);
        addCurrnciesToSelectBoxes(Object.keys(currenciesObj));
        loadSavedBodyClass();
        $("#updatedInfo").append(" - " + result.date);
        updatedMessageToggleFading();
    });

    //enable-disable commission and recalculate values
    $("#container").on('change', '#checkboxCommission' ,function(){
        setCommissionSatate();
        Calculate(0);
        saveFormData();
        currenciesInputBoxEditable();
    });

    //$("#addCurrencyButton").click(function(){
    $("#buttonsDiv").on('click', '#addCurrencyButton' ,function(){
        if(numOfConvertingCurrencies < maxAddCurrencies){
            createNewConvertCurrency(++numOfConvertingCurrencies);
            saveValueToStorage("numOfConvertingCurrencies", numOfConvertingCurrencies);
            saveCurrencyArr();
        }
    });

    $("#buttonsDiv").on('click', '#removeCurrencyButton' ,function(){
        removeCurrencyLine();
    });


    //recalculate values when changing one of the select boxes
    $("form").on('change', 'select' ,function(){
        var selectId = $(this).attr("id");
        GetCountryFlag(selectId);
        var indexNumberOfSelectCurrency = selectId.charAt(selectId.length - 1);
        $("#currencyConverted"+indexNumberOfSelectCurrency).val("");
        saveFormData();
    });

    //new calculation when changing values in input (number) boxes
    $("form").on('input', "input[type='number']", function(){
        var inputId = $(this).attr("id");
        var indexNumberOfInputCurrency = inputId.charAt(inputId.length - 1);
        if ($("#currencyConverted" + indexNumberOfInputCurrency).is(':focus')) {
            Calculate(indexNumberOfInputCurrency);
        }
        if ($("#commissionAmount").is(':focus')) {
            Calculate(0);
            saveFormData();
        }
    });

    //reset to default values include storage
    $("#buttonsDiv").on('click', '#resetButton' ,function(){
        setCurrenciesDefaults(Object.keys(currenciesObj));
        $("#checkboxCommission").prop( "checked", false);
        $("#commissionAmount").val("");
        storage.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        });
        saveFormData();
        setCommissionSatate();
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
    
    function setCurrenciesDefaults(arrCurrencies){
        setSelectBoxValuesAndDefaults("selectCurrency0", arrCurrencies, "USD");
        setSelectBoxValuesAndDefaults("selectCurrency1", arrCurrencies, "EUR");
        setSelectBoxValuesAndDefaults("selectCurrency2", arrCurrencies, "GBP");
        setSelectBoxValuesAndDefaults("selectCurrency3", arrCurrencies, "ILS");
    }
    
    //add values and defaults to select boxes
    function addCurrnciesToSelectBoxes(arrCurrencies){
        setCurrenciesDefaults(arrCurrencies);
        storage.get(["currencyArr", "numOfConvertingCurrencies", "checkboxCommissionChecked", "commissionAmount"], function(storageItems){
            if(storageItems.checkboxCommissionChecked){
                $("#checkboxCommission").prop( "checked", storageItems.checkboxCommissionChecked);
                setCommissionSatate();
            }
            if(storageItems.commissionAmount){
                $("#commissionAmount").val(storageItems.commissionAmount);
            }
            if(storageItems.currencyArr && storageItems.currencyArr.length > 4){
                numOfConvertingCurrencies = storageItems.currencyArr.length - 1;
            }
            for ( i = 0 ; i < storageItems.currencyArr.length ; i++) {
                if(i > defaultNumOfConvertingCurrencies){
                    createNewConvertCurrency(i);
                }
                setSelectBoxValuesAndDefaults("selectCurrency"+i, arrCurrencies, storageItems.currencyArr[i]);
            }
            currenciesInputBoxEditable();
        });
    }
    $("#currencyConverted0").focus();
 });