async function convert()
{
    const amount= document.getElementById('amount').value;
    const from= document.getElementById('from_currency').value.toUpperCase();
    const to= document.getElementById('to_currency').value.toUpperCase();
    const apiKey = '3414f7eef4596afd83330129f4d3ac7a';
    

    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`;
    try {
        const response = await fetch(apiUrl);
        
        // Check if response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the API result is 'success' and data contains conversion_rate
        if (data.result === 'success' && data.conversion_rate) {
            const rate = data.conversion_rate;
            const result = rate * amount;
            document.getElementById('result').textContent = `Converted: ${result} ${to}`;
        } else {
            document.getElementById('result').textContent = 'Error fetching exchange rate';
        }
    } catch (error) {
        document.getElementById('result').textContent = 'Error: ' + error.message;
    }
}