'use strict';

// DATA
const account1 = {
  owner: 'Jonas Schmedtmann',
  // movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movements: [
    {
      amount: 200,
      date: '2020-11-18T21:31:17.178Z',
    },
    {
      amount: 455.23,
      date: '2020-12-23T07:42:02.383Z',
    },
    {
      amount: -306.5,
      date: '2021-01-28T09:15:04.904Z',
    },
    {
      amount: 25000,
      date: '2021-04-01T10:17:24.185Z',
    },
    {
      amount: -642.21,
      date: '2021-05-08T14:11:59.604Z',
    },
    {
      amount: -133.9,
      date: '2021-05-27T17:01:17.194Z',
    },
    {
      amount: 79.97,
      date: '2022-02-13T23:36:17.929Z',
    },
    {
      amount: 1300,
      date: '2022-02-15T01:51:36.790Z',
    },
    {
      amount: 1300,
      date: '2022-02-15T07:51:36.790Z',
    },
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    {
      amount: 5000,
      date: '2020-11-01T13:15:33.035Z',
    },
    {
      amount: 3400,
      date: '2020-11-30T09:48:16.867Z',
    },
    {
      amount: -150,
      date: '2020-12-25T06:04:23.907Z',
    },
    {
      amount: -790,
      date: '2021-01-25T14:18:46.235Z',
    },
    {
      amount: -3210,
      date: '2021-02-05T16:33:06.386Z',
    },
    {
      amount: -1000,
      date: '2021-04-10T14:43:26.374Z',
    },
    {
      amount: 8500,
      date: '2021-06-25T18:49:59.371Z',
    },
    {
      amount: -30,
      date: '2021-07-26T12:01:20.894Z',
    },
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// SELECTORS
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

// INSTANCES
const createCurrencyFormatter = (options, locale = navigator.language) =>
  new Intl.NumberFormat(locale, options);

const getDateFormatter = (options, locale = navigator.language) =>
  new Intl.DateTimeFormat(locale, options);

// FUNCTIONS
const zeroPad = (val, length = 2) => val.toString().padStart(length, 0);

const destructureDate = date => ({
  day: zeroPad(date.getDate()),
  month: zeroPad(date.getMonth() + 1),
  year: date.getFullYear(),
  hour: zeroPad(date.getHours()),
  minutes: zeroPad(date.getMinutes()),
});

const formatMovementDate = date => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (!daysPassed) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return getDateFormatter({}, currentUser.locale).format(date);
};

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  if (!movements) {
    return;
  }

  movements.forEach(function ({ amount, date }, i) {
    const type = amount > 0 ? 'deposit' : 'withdrawal';
    const displayDate = formatMovementDate(new Date(date));

    const displayAmount = createCurrencyFormatter(
      {
        style: 'currency',
        currency: currentUser.currency,
      },
      currentUser.locale
    ).format(amount);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${displayAmount}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const getUserBalance = user =>
  user.movements.reduce((acc, cur) => acc + cur.amount, 0);

const calcDisplayBalance = function (user) {
  if (!user) {
    return (labelBalance.textContent = '');
  }

  const formatter = createCurrencyFormatter(
    {
      style: 'currency',
      currency: user.currency,
    },
    user.locale
  );

  labelBalance.textContent = formatter.format(getUserBalance(user));
};

const calcDisplaySummary = function (user) {
  if (!user) {
    return (labelSumIn.textContent =
      labelSumOut.textContent =
      labelSumInterest.textContent =
        '');
  }

  const formatter = createCurrencyFormatter(
    {
      style: 'currency',
      currency: user.currency,
    },
    user.locale
  );

  const accumulate = (acc, { amount }) => acc + amount;

  const { movements, interestRate } = user;

  const deposits = movements.filter(({ amount }) => amount > 0);
  const sumIn = deposits.reduce(accumulate, 0);

  labelSumIn.textContent = formatter.format(sumIn);

  const sumOut = movements
    .filter(({ amount }) => amount < 0)
    .reduce(accumulate, 0);

  labelSumOut.textContent = formatter.format(Math.abs(sumOut));

  const sumInterest = deposits.reduce((acc, { amount }) => {
    const interest = (amount * interestRate) / 100;
    return interest > 1 ? acc + interest : acc;
  }, 0);

  labelSumInterest.textContent = formatter.format(sumInterest);
};

const displayDate = () => {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  labelDate.textContent = getDateFormatter(options, currentUser.locale).format(
    new Date()
  );
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
  displayMovements(user?.movements);
  calcDisplayBalance(user);
  calcDisplaySummary(user);
  displayDate();
};

const logout = () => {
  clearInterval(interval);
  labelWelcome.textContent = '';
  containerApp.style.opacity = 0;
  updateDisplay();
};

const convertSecondsToTime = totalSeconds => {
  let seconds = totalSeconds % 60;
  let minutes = Math.floor(totalSeconds / 60);
  return `${zeroPad(minutes)}:${zeroPad(seconds)}`;
};

const setLogoutTimer = () => {
  if (interval) {
    clearInterval(interval);
  }

  let timeLeft = 30;

  labelTimer.textContent = convertSecondsToTime(timeLeft);

  interval = setInterval(() => {
    timeLeft--;

    console.log(timeLeft);

    labelTimer.textContent = convertSecondsToTime(timeLeft);

    if (timeLeft === 0) {
      clearInterval(interval);
      logout();
    }
  }, 1000);
};

const login = (u, p) => {
  const inputUserName = u || inputLoginUsername.value;
  const inputPin = p || +inputLoginPin.value;

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

  setLogoutTimer();

  currentUser = user;

  labelWelcome.textContent = `Welcome back, ${currentUser.owner.split(' ')[0]}`;
  containerApp.style.opacity = 1;

  updateDisplay(currentUser);
};

const transfer = () => {
  const inputUserName = inputTransferTo.value;
  const inputAmount = +inputTransferAmount.value;

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

  const date = new Date().toISOString();

  user.movements.push({
    amount: inputAmount,
    date,
  });
  currentUser.movements.push({
    amount: -inputAmount,
    date,
  });

  updateDisplay(currentUser);
};

const closeAccount = user => {
  const userNameInput = inputCloseUsername.value;
  const pinInput = +inputClosePin.value;

  inputCloseUsername.value = inputClosePin.value = '';

  const { pin, userName } = user;

  if (userNameInput === userName && pinInput === pin) {
    const index = accounts.findIndex(({ userName: u }) => u === userName);
    accounts.splice(index, 1);

    labelWelcome.textContent = '';
    containerApp.style.opacity = 0;

    updateDisplay();
    return true;
  }

  return false;
};

const loan = () => {
  const inputAmount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';

  if (inputAmount <= 0) {
    return;
  }

  const canBeGranted = currentUser.movements.some(
    m => m.amount >= inputAmount * 0.1
  );

  if (!canBeGranted) {
    return;
  }

  setTimeout(() => {
    currentUser.movements.push({
      amount: inputAmount,
      date: new Date().toISOString(),
    });
    updateDisplay(currentUser);
  }, 2500);
};

const sort = () => {
  if (!isSorted) {
    displayMovements(
      currentUser.movements
        .slice()
        .sort(({ amount: a }, { amount: b }) => a - b)
    );
  } else {
    displayMovements(currentUser.movements);
  }

  isSorted = !isSorted;
};

// APPLICATION STATE
let currentUser;
let isSorted = false;
const autoLogoutTime = 10;
let interval;

// EVENT LISTENERS
btnSort.addEventListener('click', function () {
  sort();
  setLogoutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  setLogoutTimer();
  loan();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const isCLosed = closeAccount(currentUser);

  if (!isCLosed) {
    setLogoutTimer();
  } else {
    clearInterval(interval);
  }
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
  setLogoutTimer();
  transfer();
});

// LOGIN FOR TESTING PURPOSES
login('js', 1111);
