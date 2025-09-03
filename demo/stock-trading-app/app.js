const stocks = {
    nvidia: { price: 120, quantity: 0, history: [120] },
    apple: { price: 230, quantity: 0, history: [230] }
};
let balance = 1000;

function updateStockPrice(stock) {
    const base = stock === 'nvidia' ? 120 : 230;
    const randomPrice = base + Math.floor(Math.random() * 16);
    stocks[stock].price = randomPrice;
    stocks[stock].history.push(randomPrice);
    document.getElementById(`${stock}-value`).innerText = randomPrice;
}

function updateOwnedStocks() {
    document.getElementById('nvidia-owned').innerText = `Owned: ${stocks.nvidia.quantity}`;
    document.getElementById('apple-owned').innerText = `Owned: ${stocks.apple.quantity}`;
}

function buyStock(stock) {
    const qty = parseInt(document.getElementById(`${stock}-qty`).value);
    const totalCost = qty * stocks[stock].price;
    const msgDiv = document.getElementById(`${stock}-msg`);
    if (isNaN(qty) || qty <= 0) {
        showMessage(msgDiv, "Enter a valid quantity.", true);
        return;
    }
    if (totalCost > balance) {
        showMessage(msgDiv, "Insufficient balance.", true);
    } else {
        balance -= totalCost;
        stocks[stock].quantity += qty;
        showMessage(msgDiv, `Bought ${qty} shares.`, false);
        updateBalance();
        updateOwnedStocks();
    }
}

function sellStock(stock) {
    const qty = parseInt(document.getElementById(`${stock}-qty`).value);
    const msgDiv = document.getElementById(`${stock}-msg`);
    if (isNaN(qty) || qty <= 0 || qty > stocks[stock].quantity) {
        showMessage(msgDiv, "Invalid quantity to sell.", true);
        return;
    }
    stocks[stock].quantity -= qty;
    balance += qty * stocks[stock].price;
    showMessage(msgDiv, `Sold ${qty} shares.`, false);
    updateBalance();
    updateOwnedStocks();
}

function updateBalance() {
    document.getElementById('balance').innerText = `Balance: $${balance}`;
}

function showMessage(div, msg, isError) {
    div.innerText = msg;
    div.style.color = isError ? '#d32f2f' : '#1a7f37';
    setTimeout(() => { div.innerText = ''; }, 2200);
}

// Chart.js setup
let nvidiaChart, appleChart;
function setupCharts() {
    nvidiaChart = new Chart(document.getElementById('nvidia-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(stocks.nvidia.history.length).fill(''),
            datasets: [{
                label: 'Nvidia Price',
                data: stocks.nvidia.history,
                borderColor: '#1a7f37',
                fill: false,
                tension: 0.1
            }]
        },
        options: { scales: { x: { display: false } }, plugins: { legend: { display: false } } }
    });
    appleChart = new Chart(document.getElementById('apple-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(stocks.apple.history.length).fill(''),
            datasets: [{
                label: 'Apple Price',
                data: stocks.apple.history,
                borderColor: '#1976d2',
                fill: false,
                tension: 0.1
            }]
        },
        options: { scales: { x: { display: false } }, plugins: { legend: { display: false } } }
    });
}

function updateCharts() {
    nvidiaChart.data.labels.push('');
    nvidiaChart.data.datasets[0].data = stocks.nvidia.history;
    nvidiaChart.update();

    appleChart.data.labels.push('');
    appleChart.data.datasets[0].data = stocks.apple.history;
    appleChart.update();
}

function initialize() {
    updateBalance();
    updateOwnedStocks();
    document.getElementById('nvidia-value').innerText = stocks.nvidia.price;
    document.getElementById('apple-value').innerText = stocks.apple.price;

    document.getElementById('nvidia-buy').onclick = () => buyStock('nvidia');
    document.getElementById('nvidia-sell').onclick = () => sellStock('nvidia');
    document.getElementById('apple-buy').onclick = () => buyStock('apple');
    document.getElementById('apple-sell').onclick = () => sellStock('apple');

    setupCharts();

    setInterval(() => {
        updateStockPrice('nvidia');
        updateStockPrice('apple');
        updateCharts();
    }, 5000);
}

window.onload = initialize;