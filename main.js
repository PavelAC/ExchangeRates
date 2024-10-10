const form = document.getElementById('converter');
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const fromCurrency = document.getElementById('from').value;
    const toCurrency = document.getElementById('to').value;
    const amount = parseFloat(document.getElementById('amount').value);

    const apiKey = 'cac7a1cdd1f30d36b805c162';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rate = data.conversion_rate;
            const result = rate * amount;
            document.getElementById('result').value = result.toFixed(2);
        })
        .catch(error => console.error('Error fetching the exchange rate:', error));
});