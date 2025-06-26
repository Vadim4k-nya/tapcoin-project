let counter = 0;
let clickValue = 1;
let boostMultiplier = 1;
const BOOST_DURATION = 20;
const BOOST_COOLDOWN = 60;
let boostTimeoutId = null;
let boostIntervalId = null;
let cooldownTimeoutId = null;
let cooldownIntervalId = null;
let lastBoostActivationTime = 0;

const coinTypes = [
    {
        id: "faritcoin",
        name: "Faritcoin",
        image: "./images/faritcoin.png",
        baseValue: 2
    },
    {
        id: "topcoin",
        name: "Topcoin",
        image: "./images/topcoin.png",
        baseValue: 1
    }
];

let currentCoin = coinTypes[0]; 

const counterDisplay = document.getElementById('counter');
const tapcoinImage = document.getElementById('tapcoin');
const boostButton = document.getElementById('boost-button');
const boostTimerDisplay = document.getElementById('boost-timer');
const timerSpan = document.getElementById('timer-display');
const pointsPopupContainer = document.getElementById('points-popup-container');
const openCoinModalButton = document.getElementById('open-coin-modal-button');
const coinSelectionModal = document.getElementById('coin-selection-modal');
const closeModalButton = document.getElementById('close-modal-button');

const updateCounterDisplay = () => {
    counterDisplay.innerText = Math.floor(counter);
};

const updateCoinButtonHighlights = () => {
    document.querySelectorAll('.coin-select-btn').forEach(btn => {
        const coinId = btn.id.replace('modal-select-', '');
        if (coinId === currentCoin.id) {
            btn.classList.add('ring-4', 'ring-offset-2', 'ring-white');
        } else {
            btn.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
        }
    });
};

const selectCoin = (newCoin) => {
    currentCoin = newCoin;
    tapcoinImage.src = currentCoin.image;
    
    updateCoinButtonHighlights();

    coinSelectionModal.classList.add('hidden');
};

const onClick = () => {
    const pointsGained = currentCoin.baseValue * boostMultiplier;
    counter += pointsGained;
    updateCounterDisplay();

    tapcoinImage.classList.add('clicked');
    setTimeout(() => {
        tapcoinImage.classList.remove('clicked');
    }, 100);

    const popup = document.createElement('div');
    popup.classList.add('points-popup');
    popup.innerText = `+${pointsGained}`;
    pointsPopupContainer.appendChild(popup);

    popup.addEventListener('animationend', () => {
        popup.remove();
    });
};

const updateBoostButtonState = () => {
    const now = Date.now();
    const timeSinceLastBoost = (now - lastBoostActivationTime) / 1000;
    const remainingCooldown = BOOST_COOLDOWN - timeSinceLastBoost;

    if (remainingCooldown <= 0) {
        boostButton.disabled = false;
        boostButton.classList.remove('bg-gray-600', 'cursor-not-allowed');
        boostButton.classList.add('bg-green-500', 'hover:bg-green-600');
        boostButton.innerText = 'Активировать буст!';
        clearInterval(cooldownIntervalId);
    } else {
        boostButton.disabled = true;
        boostButton.classList.remove('bg-green-500', 'hover:bg-green-600');
        boostButton.classList.add('bg-gray-600', 'cursor-not-allowed');
        const minutes = Math.floor(remainingCooldown / 60);
        const seconds = Math.floor(remainingCooldown % 60);
        boostButton.innerText = `Перезарядка: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (!cooldownIntervalId) {
            cooldownIntervalId = setInterval(updateBoostButtonState, 1000);
        }
    }
};

const activateBoost = () => {
    const now = Date.now();
    const timeSinceLastBoost = (now - lastBoostActivationTime) / 1000;
    if (timeSinceLastBoost < BOOST_COOLDOWN && lastBoostActivationTime !== 0) {
        return;
    }

    if (boostTimeoutId) {
        clearTimeout(boostTimeoutId);
        clearInterval(boostIntervalId);
    }

    boostMultiplier = 2;
    lastBoostActivationTime = now;
    
    updateBoostButtonState(); 

    tapcoinImage.classList.add('boost-active-glow');

    let remainingTime = BOOST_DURATION;
    timerSpan.innerText = `${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`;
    boostTimerDisplay.classList.remove('opacity-0');

    boostIntervalId = setInterval(() => {
        remainingTime--;
        timerSpan.innerText = `${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`;
        if (remainingTime <= 0) {
            deactivateBoost();
        }
    }, 1000);

    boostTimeoutId = setTimeout(deactivateBoost, BOOST_DURATION * 1000);
};

const deactivateBoost = () => {
    boostMultiplier = 1;

    tapcoinImage.classList.remove('boost-active-glow');

    boostTimerDisplay.classList.add('opacity-0');
    clearInterval(boostIntervalId);
    clearTimeout(boostTimeoutId);
    
    updateBoostButtonState();
};

document.addEventListener('DOMContentLoaded', () => {
    updateCounterDisplay();
    selectCoin(coinTypes[0]);

    tapcoinImage.addEventListener('click', onClick);

    openCoinModalButton.addEventListener('click', () => {
        coinSelectionModal.classList.remove('hidden');
        updateCoinButtonHighlights();
    });

    closeModalButton.addEventListener('click', () => {
        coinSelectionModal.classList.add('hidden');
    });

    document.getElementById('modal-select-faritcoin').addEventListener('click', () => selectCoin(coinTypes[0]));
    document.getElementById('modal-select-topcoin').addEventListener('click', () => selectCoin(coinTypes[1]));

    boostButton.addEventListener('click', activateBoost);

    updateBoostButtonState();
});
