'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'Arjan Hoek',
  movements: [],
  interestRate: 1,
  pin: 5555,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (user) {
  containerMovements.innerHTML = '';

  if (!user) {
    return;
  }

  const { movements } = user;

  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const getUserBalance = user =>
  user.movements.reduce((acc, cur) => acc + cur, 0);

const calcDisplayBalance = function (user) {
  if (!user) {
    labelBalance.textContent = '0000€';
    return;
  }

  const balance = getUserBalance(user);
  labelBalance.textContent = `${balance}€`;
};

const calcDisplaySummary = function (user) {
  if (!user) {
    labelSumIn.textContent =
      labelSumOut.textContent =
      labelSumInterest.textContent =
        '0000€';
    return;
  }

  const { movements, interestRate } = user;

  const deposits = movements.filter(m => m > 0);
  const sumIn = deposits.reduce((acc, cur) => acc + cur, 0);

  labelSumIn.textContent = `${sumIn}€`;

  const sumOut = movements
    .filter(m => m < 0)
    .reduce((acc, cur) => acc + cur, 0);

  labelSumOut.textContent = `${Math.abs(sumOut)}€`;

  const sumInterest = deposits.reduce((acc, cur) => {
    const interest = (cur * interestRate) / 100;
    return interest > 1 ? acc + interest : acc;
  }, 0);

  labelSumInterest.textContent = `${sumInterest}€`;
};

const createUserName = user =>
  user
    .split(' ')
    .map(n => n[0].toLowerCase())
    .join('');

const createUserNames = users =>
  users.forEach(user => (user.userName = createUserName(user.owner)));

createUserNames(accounts);

const findUserByUserName = inputUserName =>
  accounts.find(({ userName }) => userName === inputUserName);

const updateDisplay = user => {
  displayMovements(user);
  calcDisplayBalance(user);
  calcDisplaySummary(user);
};

// Login
let currentUser;

const logout = () => {
  labelWelcome.textContent = '';
  containerApp.style.opacity = 0;
  updateDisplay();
};

const login = () => {
  const inputUserName = inputLoginUsername.value;
  const inputPin = Number(inputLoginPin.value);

  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();

  const user = findUserByUserName(inputUserName);

  if (!user) {
    return;
  }

  const { pin } = user;

  if (pin !== inputPin) {
    return;
  }

  currentUser = user;

  labelWelcome.textContent = `Welcome back, ${currentUser.owner.split(' ')[0]}`;
  containerApp.style.opacity = 1;

  updateDisplay(currentUser);
};

const transfer = () => {
  const inputUserName = inputTransferTo.value;
  const inputAmount = Number(inputTransferAmount.value);

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

  const user = findUserByUserName(inputUserName);

  if (!user || user == currentUser) {
    console.log('Invalid username entered!');
    return;
  }

  if (inputAmount <= 0) {
    console.log('Amount must be a positive number!');
    return;
  }

  if (inputAmount > getUserBalance(currentUser)) {
    console.log('Not enough money to transfer!');
    return;
  }

  user.movements.push(inputAmount);
  currentUser.movements.push(-inputAmount);

  updateDisplay(currentUser);
};

const closeAccount = user => {
  const userNameInput = inputCloseUsername.value;
  const pinInput = Number(inputClosePin.value);

  inputCloseUsername.value = inputClosePin.value = '';

  const { pin, userName } = user;

  if (userNameInput === userName && pinInput === pin) {
    const index = accounts.findIndex(({ userName: u }) => u === userName);
    accounts.splice(index, 1);

    labelWelcome.textContent = '';
    containerApp.style.opacity = 0;

    updateDisplay();
  }
};

const loan = () => {
  const inputAmount = Number(inputLoanAmount.value);
  inputLoanAmount.value = '';

  if (inputAmount <= 0) {
    return;
  }

  const canBeGranted = currentUser.movements.some(m => m >= inputAmount * 0.1);

  if (!canBeGranted) {
    return;
  }

  currentUser.movements.push(inputAmount);
  updateDisplay(currentUser);
};

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  loan();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  closeAccount(currentUser);
});

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  if (currentUser) {
    logout();
  }

  login();
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  transfer();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
