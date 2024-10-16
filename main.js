const apiKey = 'cac7a1cdd1f30d36b805c162';
const fromCurrencySelect = document.getElementById('from');
const toCurrencySelect = document.getElementById('to');
const form = document.getElementById('converter');

// Fetch and populate currency list
async function fetchCurrencyList() {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/codes`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok && data.supported_codes) {
            populateCurrencyOptions(data.supported_codes);
        } else {
            console.error('Error fetching currency codes:', data);
        }
    } catch (error) {
        console.error('Error fetching currency list:', error);
    }
}

function populateCurrencyOptions(currencies) {
    currencies.forEach(([currencyCode, currencyName]) => {
        const option = document.createElement('option');
        option.value = currencyCode;
        option.textContent = `${currencyName} (${currencyCode})`;

        // Append to both "From" and "To" select dropdowns
        fromCurrencySelect.appendChild(option.cloneNode(true));
        toCurrencySelect.appendChild(option);
    });
}

// Fetch and store exchange rates
async function fetchAndStoreRates(baseCurrency) {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const rates = await response.json();
        
        // Check if the response has conversion_rates
        if (rates.conversion_rates) {
            // Store the exchange rates and the last update time locally
            localStorage.setItem('exchangeRates', JSON.stringify(rates));
            localStorage.setItem('lastUpdated', new Date().toISOString());
        } else {
            console.error('Invalid response: No conversion rates found.');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}


// Convert currencies
function convertCurrency(amount, fromCurrency, toCurrencies) {
    const cachedRates = JSON.parse(localStorage.getItem('exchangeRates'));

    if (!cachedRates || !cachedRates.conversion_rates) {
        console.error('No exchange rates available or conversion_rates field is missing.');
        return null;
    }

    const results = [];
    
    toCurrencies.forEach((toCurrency) => {
        if (toCurrency === fromCurrency) {
            results.push({ currency: toCurrency, amount });
            return;
        }

        // Get the rates for the selected currencies
        const fromRate = cachedRates.conversion_rates[fromCurrency];
        const toRate = cachedRates.conversion_rates[toCurrency];

        if (!fromRate || !toRate) {
            console.error(`Invalid or missing rate for: ${fromCurrency} or ${toCurrency}`);
            return;
        }

        const convertedAmount = (amount / fromRate) * toRate;
        results.push({ currency: toCurrency, amount: convertedAmount });
    });
    if (results.length > 0) {
        const firstResult = results[0].amount
        document.getElementById('result').value = firstResult.toFixed(3) ;
    }
    return results;
}


// Check if cache is expired
function isCacheExpired() {
    const lastUpdated = localStorage.getItem('lastUpdated');
    if (!lastUpdated) return true;

    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const now = new Date();
    const lastUpdatedDate = new Date(lastUpdated);

    return (now - lastUpdatedDate) > oneDay;
}

// Display last updated time
function displayLastUpdated() {
    const lastUpdated = localStorage.getItem('lastUpdated');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdatedElement.textContent = `Last Updated: ${new Date(lastUpdated).toLocaleString()}`;
    } else {
        lastUpdatedElement.textContent = 'Rates not available.';
    }
}

// Handle form submit and conversion logic
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get user input
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    const fromCurrency = document.getElementById('from').value;
    const toCurrencyOptions = document.getElementById('to').selectedOptions;
    const toCurrencies = Array.from(toCurrencyOptions).map(option => option.value);

    if (toCurrencies.length === 0) {
        alert('Please select at least one currency to convert to.');
        return;
    }

    // Check if cache is expired or if the user is online
    if (navigator.onLine && isCacheExpired()) {
        await fetchAndStoreRates(fromCurrency);
    }

    const convertedResults = convertCurrency(amount, fromCurrency, toCurrencies);
    if (convertedResults) {
        displayLastUpdated();
    }
});

// Call the function to fetch and populate currencies when the page loads
fetchCurrencyList();
console.log(localStorage.getItem('exchangeRates'));
