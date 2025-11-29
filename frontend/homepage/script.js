fetch('/homepage/avatar')
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

let modal1 = document.getElementById("myModal1");
let btn1 = document.getElementById("openModal1");
let span1 = modal1.getElementsByClassName("close")[0];

btn1.onclick = function() {
    modal1.style.display = "block";
}

span1.onclick = function() {
    modal1.style.display = "none";
    location.reload();
}

window.onclick = function(event) {
    if (event.target === modal1) {
        modal1.style.display = "none";
    }
}

let modal2 = document.getElementById("myModal2");
let btn2 = document.getElementById("openModal2");
let span2 = modal2.getElementsByClassName("close")[0];

btn2.onclick = function() {
    modal2.style.display = "block";
}

span2.onclick = function() {
    modal2.style.display = "none";
    location.reload();
}

window.onclick = function(event) {
    if (event.target === modal2) {
        modal2.style.display = "none";
    }
}

document.getElementById("expensesbutton").addEventListener("click", function(event) {
    let categorySelect = document.getElementById("expensescategory");
    let selectedCategory = categorySelect.options[categorySelect.selectedIndex].value;

    if (selectedCategory === "category") {
        event.preventDefault();
        alert("please select an expenses category");
    }
});

window.addEventListener('load', () => {
    fetch('/homepage/account-balance', {
        method: 'GET',
    }).then(response => response.json()).then((data) => {
        const balanceValueElement = document.querySelector(`#balance-value`);
        const formattedBalance = parseFloat(data.value).toFixed(2);
        balanceValueElement.innerText = `$${formattedBalance}`;
    });

    function fetchTransactions() {
        fetch('/homepage/recent-transactions')
            .then(response => response.json())
            .then(data => {
                const transactionsBody = document.getElementById('transactions-body');
                transactionsBody.innerHTML = '';

                data.transactions.forEach(transaction => {
                    const row = document.createElement('tr');

                    const date = new Date(transaction.date);
                    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                    const formattedDate = date.toLocaleDateString('en-US', options);

                    row.innerHTML = `
                        <td>${transaction.category}</td>
                        <td>${formattedDate}</td>
                        <td>${transaction.amount}</td>
                        <td><button class="edit-button"><img src="/frontend/elements/3dot_icon.png" alt="3dot icon"></button></td>
                    `;

                    row.querySelector('.edit-button').addEventListener('click', () => {

                        openChangeModal(transaction);
                    });

                    transactionsBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
            });
    }

    function openChangeModal(transaction) {
        const changeModal = document.getElementById('change');
        changeModal.style.display = 'block';

        const closeButton = changeModal.querySelector('.close');
        closeButton.addEventListener('click', () => {
            changeModal.style.display = 'none';
        });

        const editButton = changeModal.querySelector('#edit');

        editButton.addEventListener('click', (event) => {

            event.preventDefault();

            changeModal.style.display = 'none';

            openEditModal(transaction);
        });

        const deleteButton = changeModal.querySelector('#delete');

        deleteButton.addEventListener('click', () => {
            const transactionId = transaction.id;
            const transactionType = transaction.type;

            deleteTransaction(transactionId, transactionType);
            changeModal.style.display = 'none';
        });

    }

    function deleteTransaction(transactionId, transactionType) {
        fetch(`/homepage/transactions/${transactionId}/delete/${transactionType}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Delete was not successful');
                }
                location.reload();
            })
            .catch(error => {
                console.error('Error', error);
            });
    }

    function openEditModal(transaction) {
        const editModal = document.getElementById('edit-modal');
        const editModalContent = document.getElementById('edit-modal-content');
        const userTimezoneOffset = new Date().getTimezoneOffset() * 60000;
        const formattedDate = new Date(new Date(transaction.date) - userTimezoneOffset).toISOString().split('T')[0];

        const transactionType = transaction.type;

        editModalContent.classList.add(transactionType === 'expenses' ? 'expenses-content' : 'income-content');

        const categories = ['food and drinks', 'clothes and shoes', 'cafes and restaurants', 'health and beauty', 'transport', 'rent', 'entertainment', 'education', 'household goods', 'pets', 'gifts and charity', 'financial expenses', 'other']; // Замініть це на ваш список категорій

        let categoryOptions = '';

        if (transaction.type !== 'income') {

            categoryOptions = '<select id="edit-category">';
            categories.forEach(category => {
                categoryOptions += `<option value="${category}" ${transaction.category === category ? 'selected' : ''}>${category}</option>`;
            });
            categoryOptions += '</select>';
        }

        editModalContent.innerHTML = `
        <span class="close">&times;</span>
        <h1>Edit</h1>
            <input type="text" id="edit-amount" value="${transaction.amount}">
            <input type="date" id="edit-date" value="${formattedDate}">
            ${categoryOptions}
        <button id="save-edit">Save changes</button>
    `;

        const saveButton = document.getElementById('save-edit');

        const closeButton = editModal.querySelector('.close');
        closeButton.addEventListener('click', () => {
            editModal.style.display = 'none';
            location.reload();
        });

        function getTransactionData(type) {
            let data = {};
            if (type === 'income') {
                data = {
                    amount: document.getElementById('edit-amount').value,
                    date: document.getElementById('edit-date').value
                };
            } else if (type === 'expenses') {
                data = {
                    amount: document.getElementById('edit-amount').value,
                    date: document.getElementById('edit-date').value,
                    category: document.getElementById('edit-category').value
                };
            }
            return data;
        }

        saveButton.addEventListener('click', async () => {
            const transactionId = transaction.id;
            const transactionType = transaction.type;
            // Get transaction data based on the transaction type
            const transactionData = getTransactionData(transactionType);

            try {

                const response = await editTransaction(transactionId, transactionType, transactionData);

                if (response && response.error) {
                    console.error(response.error);
                } else {
                    console.log("Transaction edited successfully");
                    editModal.style.display = 'none';

                    location.reload();
                }
            } catch (error) {
                console.error(error.message);
            }
        });

        editModal.style.display = 'block';
    }

    async function editTransaction(id, type, data) {
        try {
            const response = await fetch(`/homepage/transactions/${id}/edit/${type}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                return { error: 'Error editing transaction' };
            }

            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    fetchTransactions();
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













