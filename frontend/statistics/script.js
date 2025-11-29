fetch('/statistics/avatar')
    .then(response => {
        if (!response.ok) {
            throw new Error('Image acquisition error' + response.status);
        }
        return response.json();
    })
    .then(data => {

        const avatarUrl = data.avatarUrl;
        console.log('Url image received', avatarUrl);

        if (avatarUrl) {
            document.getElementById('user-avatar').src = avatarUrl;
        } else {
            document.getElementById('user-avatar').src = '/backend/uploads/user.jpg';
        }
    })
    .catch(error => {
        console.error('Error', error);
    });

document.addEventListener("DOMContentLoaded", function() {
    const avatarContainer = document.querySelector('.avatar-container');
    const logOutPopup = document.querySelector('#logout-popup');

    avatarContainer.addEventListener('click', function() {

        if (logOutPopup.style.display === 'block') {
            logOutPopup.style.display = 'none';
        } else {
            logOutPopup.style.display = 'block';
        }
    });
});

const modal = document.getElementById('date-range-picker');

const openModalBtn = document.getElementById('datechangebutton');

const closeBtn = document.getElementsByClassName('close')[0];

openModalBtn.onclick = function() {
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

const form = document.getElementById('dateForm');

if (localStorage.getItem('startDate') && localStorage.getItem('endDate')) {
    const startDate = localStorage.getItem('startDate');
    const endDate = localStorage.getItem('endDate');
    document.getElementById('start-date').value = startDate;
    document.getElementById('end-date').value = endDate;
}

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(form);

    localStorage.setItem('startDate', formData.get('start-date'));
    localStorage.setItem('endDate', formData.get('end-date'));

    const filter = {
        'start-date': document.getElementById('start-date').value,
        'end-date': document.getElementById('end-date').value
    };

    fetch('/sort-by-date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            location.reload();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

let myDoughnutChart;

function updateDoughnutChart(data) {
    const categories = data.map(category => category.category);
    const amounts = data.map(category => category.total_amount);
    const total = amounts.reduce((acc, val) => acc + val, 0);

    const percentages = amounts.map(amount => ((amount / total) * 100).toFixed(2) + '%');

    myDoughnutChart.data.labels = categories.map((category, index) => `${category} (${percentages[index]})`);
    myDoughnutChart.data.datasets[0].data = amounts;

    myDoughnutChart.update();

    myDoughnutChart.options.onClick = (event, chartElement) => {
        if (chartElement.length > 0) {
            const index = chartElement[0].index;
            const category = categories[index];
            const amount = amounts[index];

            fetch(`/expenses-list-by-category/${category}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Expenses list response:", data);
                    const expensesList = data.expensesListByCategory;

                    const popupContainer = document.getElementById('popupContainer');
                    const popupTitle = document.getElementById('popupTitle');
                    const popupTable = document.getElementById('popupTable');

                    popupTitle.textContent = `Expenses for ${category}`;

                    popupTable.innerHTML = '';

                    expensesList.forEach(expense => {
                        const tableRow = document.createElement('tr');
                        const amountCell = document.createElement('td');
                        amountCell.textContent = `${expense.amount}`;
                        const dateCell = document.createElement('td');

                        const date = new Date(expense.date);

                        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

                        const formattedDate = date.toLocaleDateString('en-US', options);
                        dateCell.textContent = `${formattedDate}`;

                        tableRow.appendChild(amountCell);
                        tableRow.appendChild(dateCell);
                        popupTable.appendChild(tableRow);
                    });

                    popupContainer.style.display = 'block';

                    document.addEventListener('click', closePopup);

                    function closePopup(event) {
                        if (!popupContainer.contains(event.target)) {
                            popupContainer.style.display = 'none';
                            document.removeEventListener('click', closePopup);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching expenses list:', error);
                });
        }
    };

}

function drawDoughnutChart(data) {

    let ctx = document.getElementById('myDoughnutChart').getContext('2d');

    myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#EBEBEB', '#D8D8D8', '#CBCBCB', '#B4B4B4', '#A4A4A4', '#8D8D8D', '#767676', '#646464', '#545454', '#474545',
                    '#3B3B3B', '#242424', '#000000']
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Expenses by Category'
            },
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
            }
        }
    });

    updateDoughnutChart(data);
}

window.addEventListener('load', () => {
    fetch('/statistics/expenses-by-category')
        .then(response => response.json())
        .then(data => {
            const expensesByCategory = data.expensesByCategory;

            drawDoughnutChart(expensesByCategory);
        })
        .catch(error => {
            console.error('Error fetching expenses by category:', error);
        });
});

window.addEventListener('load', () => {
    fetch('/statistics/income-sum', {
        method: 'GET',
    }).then(response => response.json()).then((data) => {
        const incomeSumElement = document.querySelector(`#income-sum-value`);
        const formattedBalance = parseFloat(data.incomesum).toFixed(2);
        incomeSumElement.innerText = `$${formattedBalance}`;
    })});

window.addEventListener('load', () => {
    fetch('/statistics/expenses-sum', {
        method: 'GET',
    }).then(response => response.json()).then((data) => {
        const expensesSumElement = document.querySelector(`#expenses-sum-value`);
        const formattedBalance = parseFloat(data.expensessum).toFixed(2);
        expensesSumElement.innerText = `$${formattedBalance}`;
    })});

let myBarChart;

function updateBarChart(expensesData, incomeData) {
    const expenseDates = expensesData.map(entry => `${entry.year}-${entry.month}`);
    const expenseTotalAmounts = expensesData.map(entry => entry.total_month_amount);

    const incomeDates = incomeData.map(entry => `${entry.year}-${entry.month}`);
    const incomeTotalAmounts = incomeData.map(entry => entry.total_month_amount);

    myBarChart.data.labels = expenseDates;
    myBarChart.data.labels = incomeDates;
    myBarChart.data.datasets[0].data = expenseTotalAmounts;
    myBarChart.data.datasets[1].data = incomeTotalAmounts;

    myBarChart.update();
}

function drawBarChart(expensesData, incomeData) {

    let ctx = document.getElementById('myBarChart').getContext('2d');

    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Expense Amount',
                data: [],
                backgroundColor: '#242424',
                borderColor: '#242424',
                borderWidth: 1
            }, {
                label: 'Total Income Amount',
                data: [],
                backgroundColor: '#a4a4a4',
                borderColor: '#a4a4a4',
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Expenses and Income by Date'
            },
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
            }
        }
    });

    updateBarChart(expensesData, incomeData);
}

window.addEventListener('load', () => {
    Promise.all([
        fetch('/statistics/expenses-by-date').then(response => response.json()),
        fetch('/statistics/income-by-date').then(response => response.json())
    ]).then(([expensesData, incomeData]) => {
        drawBarChart(expensesData.expensesByDate, incomeData.incomeByDate);
    }).catch(error => {
        console.error('Error fetching data:', error);
    });
});

function logout() {
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.redirected) {

                window.location.href = response.url;
            }
        })
        .catch(error => {
            console.error('Exit error', error);
        });
}

document.getElementById('logout-button').addEventListener('click', logout);

