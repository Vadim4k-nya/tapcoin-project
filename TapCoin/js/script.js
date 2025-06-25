// Initialize variables
let counter = 0; // Current coin count
let clickValue = 1; // Base value earned per click
let boostMultiplier = 1; // Multiplier for active boosts
const BOOST_DURATION = 5 * 60; // Boost duration in seconds (5 minutes)
const BOOST_COOLDOWN = 30 * 60; // Boost cooldown in seconds (30 minutes)
let boostTimeoutId = null; // To store the timeout ID for boost activation
let boostIntervalId = null; // To store the interval ID for boost timer display
let cooldownTimeoutId = null; // To store the timeout ID for cooldown end
let cooldownIntervalId = null; // To store the interval ID for cooldown timer display
let lastBoostActivationTime = 0; // Timestamp of the last boost activation

// Define different coin types with their properties
const coinTypes = [
    {
        id: "faritcoin",
        name: "Faritcoin",
        image: "./images/faritcoin.png",
        baseValue: 3
    },
    {
        id: "topcoin",
        name: "Topcoin",
        image: "./images/topcoin.png", // Убедитесь, что у вас есть изображение topcoin.png
        baseValue: 1 // Или любое другое значение
    }
];

let currentCoin = coinTypes[0]; // Set initial coin type to Faritcoin

// Get references to DOM elements
const counterDisplay = document.getElementById('counter');
const topcoinImage = document.getElementById('topcoin');
const boostButton = document.getElementById('boost-button');
const boostTimerDisplay = document.getElementById('boost-timer');
const timerSpan = document.getElementById('timer-display');
const pointsPopupContainer = document.getElementById('points-popup-container');
const openCoinModalButton = document.getElementById('open-coin-modal-button');
const coinSelectionModal = document.getElementById('coin-selection-modal');
const closeModalButton = document.getElementById('close-modal-button');

/**
 * Updates the display of the counter with the current coin count.
 */
const updateCounterDisplay = () => {
    counterDisplay.innerText = Math.floor(counter); // Display integer value
};

/**
 * Updates the visual highlight on the selected coin button within the modal.
 */
const updateCoinButtonHighlights = () => {
    document.querySelectorAll('.coin-select-btn').forEach(btn => {
        const coinId = btn.id.replace('modal-select-', ''); // Extract coin ID from button ID
        if (coinId === currentCoin.id) {
            btn.classList.add('ring-4', 'ring-offset-2', 'ring-white'); // Highlight selected button
        } else {
            btn.classList.remove('ring-4', 'ring-offset-2', 'ring-white');
        }
    });
};

/**
 * Selects a new coin type and updates the coin image.
 * Also updates the highlight on the selected coin button within the modal.
 * @param {object} newCoin - The new coin object to select.
 */
const selectCoin = (newCoin) => {
    currentCoin = newCoin;
    topcoinImage.src = currentCoin.image;
    
    // Update visual highlight for selected coin buttons in the modal
    updateCoinButtonHighlights(); // Use the new function to update highlights

    // Close the modal after selection
    coinSelectionModal.classList.add('hidden');
};

/**
 * Handles the click event on the coin.
 * Increments the counter based on current coin value and boost.
 * Shows a pop-up with points gained.
 */
const onClick = () => {
    const pointsGained = currentCoin.baseValue * boostMultiplier;
    counter += pointsGained;
    updateCounterDisplay();

    // Add click animation to the coin
    topcoinImage.classList.add('clicked');
    setTimeout(() => {
        topcoinImage.classList.remove('clicked');
    }, 100); // Remove class after a short delay

    // Show points pop-up
    const popup = document.createElement('div');
    popup.classList.add('points-popup');
    popup.innerText = `+${pointsGained}`;
    pointsPopupContainer.appendChild(popup);

    // Remove pop-up after animation
    popup.addEventListener('animationend', () => {
        popup.remove();
    });
};

/**
 * Updates the boost button state (enabled/disabled) and text based on cooldown.
 */
const updateBoostButtonState = () => {
    const now = Date.now();
    const timeSinceLastBoost = (now - lastBoostActivationTime) / 1000; // in seconds
    const remainingCooldown = BOOST_COOLDOWN - timeSinceLastBoost;

    if (remainingCooldown <= 0) {
        boostButton.disabled = false;
        boostButton.classList.remove('bg-gray-600', 'cursor-not-allowed');
        boostButton.classList.add('bg-green-500', 'hover:bg-green-600');
        boostButton.innerText = 'Активировать буст!';
        clearInterval(cooldownIntervalId); // Stop cooldown timer if active
    } else {
        boostButton.disabled = true;
        boostButton.classList.remove('bg-green-500', 'hover:bg-green-600');
        boostButton.classList.add('bg-gray-600', 'cursor-not-allowed');
        const minutes = Math.floor(remainingCooldown / 60);
        const seconds = Math.floor(remainingCooldown % 60);
        boostButton.innerText = `Перезарядка: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Start/continue cooldown timer display if not already running
        if (!cooldownIntervalId) {
            cooldownIntervalId = setInterval(updateBoostButtonState, 1000);
        }
    }
};


/**
 * Activates the temporary boost.
 * Increases click multiplier, starts a timer, and updates UI.
 */
const activateBoost = () => {
    // Check if cooldown allows activation
    const now = Date.now();
    const timeSinceLastBoost = (now - lastBoostActivationTime) / 1000;
    if (timeSinceLastBoost < BOOST_COOLDOWN && lastBoostActivationTime !== 0) {
        // Boost is still on cooldown, do nothing
        return;
    }

    if (boostTimeoutId) {
        // If a boost is already active, clear previous timers
        clearTimeout(boostTimeoutId);
        clearInterval(boostIntervalId);
    }

    boostMultiplier = 2; // Example: 2x boost
    lastBoostActivationTime = now; // Record activation time
    
    // Immediately update button state to show cooldown
    updateBoostButtonState(); 

    topcoinImage.classList.add('boost-active-glow'); // Add visual glow to coin

    let remainingTime = BOOST_DURATION;
    timerSpan.innerText = `${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`;
    boostTimerDisplay.classList.remove('opacity-0'); // Show timer display

    // Update timer every second
    boostIntervalId = setInterval(() => {
        remainingTime--;
        timerSpan.innerText = `${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`;
        if (remainingTime <= 0) {
            deactivateBoost();
        }
    }, 1000);

    // Set timeout to deactivate boost after BOOST_DURATION
    boostTimeoutId = setTimeout(deactivateBoost, BOOST_DURATION * 1000);
};

/**
 * Deactivates the temporary boost.
 * Resets click multiplier, clears timers, and updates UI.
 */
const deactivateBoost = () => {
    boostMultiplier = 1; // Reset to normal

    topcoinImage.classList.remove('boost-active-glow'); // Remove glow from coin

    boostTimerDisplay.classList.add('opacity-0'); // Hide timer display
    clearInterval(boostIntervalId); // Clear the interval for timer updates
    clearTimeout(boostTimeoutId); // Clear the boost timeout
    
    // Start cooldown timer display on boost end
    updateBoostButtonState();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial display update
    updateCounterDisplay();
    selectCoin(coinTypes[0]); // Select Faritcoin by default

    // Attach click listener to the main coin
    topcoinImage.addEventListener('click', onClick);

    // Attach click listener to open coin selection modal
    openCoinModalButton.addEventListener('click', () => {
        coinSelectionModal.classList.remove('hidden');
        // Ensure the correct button is highlighted when opening the modal without closing it
        updateCoinButtonHighlights();
    });

    // Attach click listener to close modal button
    closeModalButton.addEventListener('click', () => {
        coinSelectionModal.classList.add('hidden');
    });

    // Attach click listeners to coin selection buttons inside the modal
    document.getElementById('modal-select-faritcoin').addEventListener('click', () => selectCoin(coinTypes[0]));
    document.getElementById('modal-select-topcoin').addEventListener('click', () => selectCoin(coinTypes[1]));

    // Attach click listener to the boost button
    boostButton.addEventListener('click', activateBoost);

    // Initial check for boost button state (in case of page refresh with active cooldown)
    updateBoostButtonState();
});
