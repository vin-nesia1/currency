document.addEventListener('DOMContentLoaded', async () => {
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const converterForm = document.getElementById('converter-form');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    if (!fromCurrency || !toCurrency || !converterForm || !resultDiv || !loadingDiv) {
        console.error('DOM elements not found:', { fromCurrency, toCurrency, converterForm, resultDiv, loadingDiv });
        resultDiv.innerHTML = 'Error: Page elements not loaded correctly. Please refresh or check code.';
        return;
    }

    // Fungsi untuk memuat daftar mata uang dari Frankfurter dengan nama lengkap
    async function loadCurrencies() {
        try {
            const response = await fetch('https://api.frankfurter.app/currencies', {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('API Response (currencies):', data);
            const currencies = Object.entries(data);
            if (currencies.length === 0) throw new Error('No currencies returned by API');
            fromCurrency.innerHTML = '<option value="">Select Currency</option>';
            toCurrency.innerHTML = '<option value="">Select Currency</option>';
            currencies.forEach(([code, name]) => {
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');
                option1.value = option2.value = code;
                option1.text = option2.text = `${code} - ${name}`;
                fromCurrency.appendChild(option1);
                toCurrency.appendChild(option2);
            });
        } catch (error) {
            console.error('Error loading currencies:', error);
            resultDiv.innerHTML = 'Failed to load currencies. Check console or try again later.';
            const fallbackCurrencies = {
                'USD': 'United States Dollar',
                'EUR': 'Euro',
                'IDR': 'Indonesian Rupiah',
                'JPY': 'Japanese Yen',
                'GBP': 'British Pound',
                'AUD': 'Australian Dollar',
                'CAD': 'Canadian Dollar',
                'CHF': 'Swiss Franc',
                'CNY': 'Chinese Yuan',
                'SGD': 'Singapore Dollar'
            };
            fromCurrency.innerHTML = '<option value="">Select Currency</option>';
            toCurrency.innerHTML = '<option value="">Select Currency</option>';
            Object.entries(fallbackCurrencies).forEach(([code, name]) => {
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');
                option1.value = option2.value = code;
                option1.text = option2.text = `${code} - ${name}`;
                fromCurrency.appendChild(option1);
                toCurrency.appendChild(option2);
            });
        }
    }

    // Muat mata uang saat halaman dimuat
    loadCurrencies();

    // Handle form submission untuk konversi
    converterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('amount').value;
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (!amount || !from || !to) {
            resultDiv.innerHTML = 'Please fill in all fields.';
            resultDiv.style.opacity = '1';
            return;
        }

        // Tampilkan loading spinner
        loadingDiv.classList.remove('hidden');
        resultDiv.style.opacity = '0'; // Sembunyikan hasil sementara

        try {
            const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('API Response (conversion):', data);
            if (data.rates && data.rates[to]) {
                resultDiv.innerHTML = `${amount} ${from} = ${data.rates[to].toFixed(2)} ${to}`;
            } else {
                resultDiv.innerHTML = 'Conversion failed. Check if currencies are valid.';
            }
        } catch (error) {
            console.error('Error converting currency:', error);
            resultDiv.innerHTML = `Error: ${error.message}. Check console for details.`;
        }

        // Sembunyikan loading spinner dan tampilkan hasil
        loadingDiv.classList.add('hidden');
        resultDiv.style.opacity = '1';
    });
});
