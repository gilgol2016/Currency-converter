const currenciesObj = { USD: 1.0 };
const supportedCurrencies = [
  "AUD", "BRL", "CHF", "CZK", "EUR", "HKD", "HUF", "ILS", "ISK", "KRW", "MYR", "NZD", "PLN", "RUB", "SGD", "TRY", "ZAR",
  "BGN", "CAD", "CNY", "DKK", "GBP", "HRK", "IDR", "INR", "JPY", "MXN", "NOK", "PHP", "RON", "SEK", "THB"
];

function setSelectBoxValuesAndDefaults(selectId, array, selectedCurrency) {
  const selectList = document.getElementById(selectId);
  selectList.innerHTML = "";

  array.forEach(currency => {
    const option = document.createElement("option");
    option.value = currency;
    option.text = currency;
    selectList.appendChild(option);
  });

  $(`#${selectId} option[value=${selectedCurrency}]`).attr("selected", "selected");
  updateCountryFlag(selectId);
}

function updateCountryFlag(selectId) {
  const selectedCountry = $(`#${selectId} option:selected`).val();
  const imageElement = $(`#${selectId}`).closest("div").find("img").first();
  imageElement.attr("src", `./images/flags/${selectedCountry}.gif`);
}

function calculateRates() {
  let commission = 1;
  const commissionInput = $("#commissionAmount").val();

  if ($("#checkboxCommission").prop("checked")) {
    commission += parseFloat(commissionInput || 0) / 100;
    saveToStorage("commissionAmount", commissionInput || 0);
  }

  saveToStorage("checkboxCommissionChecked", $("#checkboxCommission").prop("checked"));

  const currencyAmount = parseFloat($("#amount").val()) || 0;
  const baseCurrency = currenciesObj[$("#selectBaseCurrency option:selected").val()];
  saveToStorage("selectBaseCurrency", $("#selectBaseCurrency option:selected").val());

  for (let i = 1; i <= 3; i++) {
    const selectedCurrency = $(`#selectCurrency${i} option:selected`).val();
    const currencyFactor = currenciesObj[selectedCurrency];
    saveToStorage(`selectCurrency${i}`, selectedCurrency);

    const converted = Math.round(commission * (currencyFactor / baseCurrency) * currencyAmount * 100) / 100;
    $(`#currencyConverted${i}`).val(converted);
  }
}

function saveToStorage(key, value) {
  chrome.storage.sync.set({ [key]: value }, () => {
    console.log(`${key} = ${value}, saved.`);
  });
}

$(function () {
  $.getJSON(`https://api.frankfurter.app/latest?from=USD&to=${supportedCurrencies.join(",")}`, result => {
    if (result?.rates) {
      Object.assign(currenciesObj, result.rates);
      currenciesObj["USD"] = 1.0;
      populateCurrencySelectors(Object.keys(currenciesObj), true);
      $("#updatedInfo").append(` - ${result.date}`);
      fadeUpdatedMessage();
    } else {
      $("#updatedInfo").text("Currency data unavailable").css("color", "red").fadeTo("slow", 0.8);
    }
  });

  $("#checkboxCommission").on("click", () => {
    toggleCommissionState();
    calculateRates();
  });

  $("select").on("change", function () {
    updateCountryFlag(this.id);
    calculateRates();
  });

  $("#amount, #commissionAmount").on("input", calculateRates);

  $("#resetButton").on("click", () => {
    $("#amount").val(0);
    $("#checkboxCommission").prop("checked", false);
    $("#commissionAmount").val("0.0").attr("disabled", true);
    populateCurrencySelectors(Object.keys(currenciesObj), false);

    for (let i = 1; i <= 3; i++) {
      $(`#currencyConverted${i}`).val(0);
    }

    chrome.storage.sync.clear(() => {
      const error = chrome.runtime.lastError;
      if (error) console.error(error);
    });
  });

  function fadeUpdatedMessage() {
    $("#updatedInfo").delay(1000).fadeTo("slow", 0.8);
  }

  function toggleCommissionState() {
    $("#commissionAmount").prop("disabled", !$("#checkboxCommission").prop("checked"));
  }

  function getUserCurrencyFromSupported(locale, supportedCurrencies) {
  const langPrefix = locale.split('-')[0];
  const regionCode = locale.split('-')[1] || ''; // example: 'IL' from 'he-IL'

  const langToCurrency = {
    'he': 'ILS',
    'en': 'USD',
    'fr': 'EUR',
    'ja': 'JPY',
    'de': 'EUR',
    'ru': 'RUB',
    'es': 'EUR',
    'ar': 'AED',
    'zh': 'CNY',
    'pt': 'BRL',
    'pl': 'PLN',
    'ko': 'KRW',
    'id': 'IDR',
    'th': 'THB',
    'in': 'INR',
    'no': 'NOK',
    'da': 'DKK',
    'sv': 'SEK',
    'ro': 'RON',
    'hu': 'HUF',
    'cs': 'CZK',
    'hr': 'HRK',
    'bg': 'BGN',
    'ms': 'MYR',
    'is': 'ISK',
    'tr': 'TRY',
    'mx': 'MXN',
    'nl': 'EUR',
    'fi': 'EUR',
    'ca': 'CAD',
    'au': 'AUD',
    'nz': 'NZD',
    'ph': 'PHP',
    'sg': 'SGD',
    'za': 'ZAR',
    'hk': 'HKD',
    'ch': 'CHF'
  };

  const regionToCurrency = {
    'IL': 'ILS',
    'US': 'USD',
    'GB': 'GBP',
    'FR': 'EUR',
    'JP': 'JPY',
    'DE': 'EUR',
    'RU': 'RUB',
    'ES': 'EUR',
    'BR': 'BRL',
    'PL': 'PLN',
    'KR': 'KRW',
    'ID': 'IDR',
    'TH': 'THB',
    'IN': 'INR',
    'NO': 'NOK',
    'DK': 'DKK',
    'SE': 'SEK',
    'RO': 'RON',
    'HU': 'HUF',
    'CZ': 'CZK',
    'HR': 'HRK',
    'BG': 'BGN',
    'MY': 'MYR',
    'IS': 'ISK',
    'TR': 'TRY',
    'MX': 'MXN',
    'NL': 'EUR',
    'FI': 'EUR',
    'CA': 'CAD',
    'AU': 'AUD',
    'NZ': 'NZD',
    'PH': 'PHP',
    'SG': 'SGD',
    'ZA': 'ZAR',
    'HK': 'HKD',
    'CH': 'CHF'
  };

  const currencyFromLang = langToCurrency[langPrefix];
  const currencyFromRegion = regionToCurrency[regionCode];

  if (supportedCurrencies.includes(currencyFromLang)) {
    return currencyFromLang;
  } else if (supportedCurrencies.includes(currencyFromRegion)) {
    return currencyFromRegion;
  } else {
    return 'USD'; // default
  }
}



function populateCurrencySelectors(arrCurrencies, isInit) {
  const userLocale = navigator.language || 'en-US';
  const localCurrency = getUserCurrencyFromSupported(userLocale, supportedCurrencies);

  const savedBase = localStorage.getItem('baseCurrency') || 'USD';
  const savedCurrency1 = localStorage.getItem('currency1') || localCurrency;
  const savedCurrency2 = localStorage.getItem('currency2') || 'EUR';
  const savedCurrency3 = localStorage.getItem('currency3') || 'GBP';

  setSelectBoxValuesAndDefaults("selectBaseCurrency", arrCurrencies, savedBase);
  setSelectBoxValuesAndDefaults("selectCurrency1", arrCurrencies, savedCurrency1);
  setSelectBoxValuesAndDefaults("selectCurrency2", arrCurrencies, savedCurrency2);
  setSelectBoxValuesAndDefaults("selectCurrency3", arrCurrencies, savedCurrency3);

  // שמירה מקומית
  ['selectBaseCurrency', 'selectCurrency1', 'selectCurrency2', 'selectCurrency3'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      localStorage.setItem(id, e.target.value);
      chrome.storage.sync.set({ [id]: e.target.value }); // save also in cloud
    });
  });

  if (isInit) {
    chrome.storage.sync.get([
      "selectBaseCurrency", "selectCurrency1", "selectCurrency2", "selectCurrency3",
      "checkboxCommissionChecked", "commissionAmount"
    ], items => {
      if ("checkboxCommissionChecked" in items) {
        $("#checkboxCommission").prop("checked", items.checkboxCommissionChecked);
        toggleCommissionState();
      }
      if (items.commissionAmount) {
        $("#commissionAmount").val(items.commissionAmount);
      }
    });
  }

  $("#amount").focus(); 
}
});
