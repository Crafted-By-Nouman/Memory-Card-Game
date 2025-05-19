// Game Configuration
const config = {
  emojiArray: [
    "🐶",
    "🐱",
    "🐻",
    "🐼",
    "🐨",
    "🦁",
    "🐯",
    "🦊",
    "🐸",
    "🐵",
    "🦄",
    "🐷",
    "🐮",
    "🐹",
    "🐭",
    "🐰",
    "🦋",
    "🐢",
    "🐠",
    "🐙",
    "🦀",
    "🐳",
    "🦉",
    "🐦",
    "🦇",
    "🐝",
    "🦄",
    "🦕",
    "🦖",
    "🐊",
  ],
  singlePlayer: {
    initialCards: 6,
    maxCards: 20,
    cardsIncrement: 2,
    initialMoves: 10,
    movesIncrement: 3,
    baseScore: 100,
    bonusMultiplier: 1.5,
  },
  twoPlayer: {
    initialCards: 12,
    maxCards: 24,
  },
  sounds: {
    flipVolume: 0.3,
    matchVolume: 0.5,
    winVolume: 0.7,
    loseVolume: 0.7,
    levelUpVolume: 0.6,
  },
  animations: {
    flipDuration: 600,
    matchDelay: 500,
    noMatchDelay: 1000,
  },
};

// Game State
const gameState = {
  currentPage: "home",
  singlePlayer: {
    level: 1,
    movesLeft: 0,
    totalMoves: 0,
    matchedPairs: 0,
    totalPairs: 0,
    score: 0,
    cards: [],
    flippedCards: [],
    isPaused: false,
    timer: null,
    timeLimit: 0,
    timeLeft: 0,
  },
  twoPlayer: {
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    cards: [],
    flippedCards: [],
    canFlip: true,
    consecutiveMatches: 0,
  },
  highScores: JSON.parse(localStorage.getItem("memoryGameHighScores")) || {
    singlePlayer: { level: 1, score: 0 },
    twoPlayer: { player1: 0, player2: 0 },
  },
  soundEnabled: true,
  lastCardIndex: -1, // To prevent double-clicking the same card
};

// DOM Elements
const pages = {
  home: document.getElementById("home-page"),
  singlePlayer: document.getElementById("single-player-page"),
  twoPlayer: document.getElementById("two-player-page"),
  gameOver: document.getElementById("game-over-page"),
};

const buttons = {
  singlePlayer: document.getElementById("single-player-btn"),
  twoPlayer: document.getElementById("two-player-btn"),
  howToPlay: document.getElementById("how-to-play-btn"),
  spPause: document.getElementById("sp-pause-btn"),
  spReset: document.getElementById("sp-reset-btn"),
  spHome: document.getElementById("sp-home-btn"),
  tpReset: document.getElementById("tp-reset-btn"),
  tpHome: document.getElementById("tp-home-btn"),
  playAgain: document.getElementById("play-again-btn"),
  goHome: document.getElementById("go-home-btn"),
  resume: document.getElementById("resume-btn"),
  quit: document.getElementById("quit-btn"),
  closeInstructions: document.getElementById("close-instructions-btn"),
  confirmYes: document.getElementById("confirm-yes"),
  confirmNo: document.getElementById("confirm-no"),
};

const gameElements = {
  currentLevel: document.getElementById("current-level"),
  movesLeft: document.getElementById("moves-left"),
  currentScore: document.getElementById("current-score"),
  levelProgress: document.getElementById("level-progress"),
  spGameBoard: document.getElementById("sp-game-board"),
  currentPlayer: document.getElementById("current-player"),
  player1Score: document.getElementById("player1-score"),
  player2Score: document.getElementById("player2-score"),
  tpGameBoard: document.getElementById("tp-game-board"),
  resultMessage: document.getElementById("result-message"),
  levelReached: document.getElementById("level-reached"),
  scoreAchieved: document.getElementById("score-achieved"),
  movesUsed: document.getElementById("moves-used"),
  winnerDisplay: document.getElementById("winner-display"),
  highScoreMessage: document.getElementById("high-score-message"),
  confirmMessage: document.getElementById("confirm-message"),
};

const modals = {
  pause: document.getElementById("pause-modal"),
  howToPlay: document.getElementById("how-to-play-modal"),
  confirm: document.getElementById("confirm-modal"),
};

const sounds = {
  flip: document.getElementById("flip-sound"),
  match: document.getElementById("match-sound"),
  win: document.getElementById("win-sound"),
  lose: document.getElementById("lose-sound"),
  levelUp: document.getElementById("level-up-sound"),
};

// Initialize game
function init() {
  setSoundVolumes();
  setupEventListeners();
  showPage("home");
}

// Set up event listeners
function setupEventListeners() {
  // Navigation buttons
  buttons.singlePlayer.addEventListener("click", () => startSinglePlayerGame());
  buttons.twoPlayer.addEventListener("click", () => startTwoPlayerGame());
  buttons.howToPlay.addEventListener("click", () => showModal("howToPlay"));
  buttons.spHome.addEventListener("click", () => confirmLeaveGame());
  buttons.tpHome.addEventListener("click", () => confirmLeaveGame());
  buttons.playAgain.addEventListener("click", playAgain);
  buttons.goHome.addEventListener("click", () => showPage("home"));
  buttons.closeInstructions.addEventListener("click", () =>
    hideModal("howToPlay")
  );

  // Game control buttons
  buttons.spPause.addEventListener("click", togglePause);
  buttons.spReset.addEventListener("click", () => confirmResetGame());
  buttons.tpReset.addEventListener("click", () => confirmResetGame());
  buttons.resume.addEventListener("click", togglePause);
  buttons.quit.addEventListener("click", () => {
    togglePause();
    confirmLeaveGame();
  });

  // Confirmation modal buttons
  buttons.confirmYes.addEventListener("click", handleConfirmYes);
  buttons.confirmNo.addEventListener("click", handleConfirmNo);

  // Handle window resize
  window.addEventListener("resize", handleWindowResize);
}

// Set sound volumes
function setSoundVolumes() {
  sounds.flip.volume = config.sounds.flipVolume;
  sounds.match.volume = config.sounds.matchVolume;
  sounds.win.volume = config.sounds.winVolume;
  sounds.lose.volume = config.sounds.loseVolume;
  sounds.levelUp.volume = config.sounds.levelUpVolume;
}

// Show specific page
function showPage(pageName) {
  // Hide all pages
  Object.values(pages).forEach((page) => {
    page.classList.remove("active");
  });

  // Show requested page
  pages[pageName].classList.add("active");
  gameState.currentPage = pageName;

  // Reset any game state if going to home
  if (pageName === "home") {
    resetGameState();
  }
}

// Show modal
function showModal(modalName) {
  modals[modalName].classList.add("active");
}

// Hide modal
function hideModal(modalName) {
  modals[modalName].classList.remove("active");
}

// Confirm before leaving game
function confirmLeaveGame() {
  gameElements.confirmMessage.textContent =
    "Are you sure you want to leave the game? Your progress will be lost.";
  showModal("confirm");
}

// Confirm before resetting game
function confirmResetGame() {
  gameElements.confirmMessage.textContent =
    "Are you sure you want to reset the game?";
  showModal("confirm");
}

// Handle confirmation yes
function handleConfirmYes() {
  hideModal("confirm");

  if (gameElements.confirmMessage.textContent.includes("leave")) {
    showPage("home");
  } else {
    if (gameState.currentPage === "singlePlayer") {
      resetSinglePlayerGame();
    } else {
      resetTwoPlayerGame();
    }
  }
}

// Handle confirmation no
function handleConfirmNo() {
  hideModal("confirm");
}

// Reset all game state
function resetGameState() {
  // Clear any ongoing timers
  if (gameState.singlePlayer.timer) {
    clearInterval(gameState.singlePlayer.timer);
  }

  // Reset single player state
  gameState.singlePlayer = {
    level: 1,
    movesLeft: 0,
    totalMoves: 0,
    matchedPairs: 0,
    totalPairs: 0,
    score: 0,
    cards: [],
    flippedCards: [],
    isPaused: false,
    timer: null,
    timeLimit: 0,
    timeLeft: 0,
  };

  // Reset two player state
  gameState.twoPlayer = {
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    cards: [],
    flippedCards: [],
    canFlip: true,
    consecutiveMatches: 0,
  };

  gameState.lastCardIndex = -1;
}

// Handle window resize
function handleWindowResize() {
  // Adjust card sizes based on window width
  const cardElements = document.querySelectorAll(".card");
  const cardSize = calculateCardSize();

  cardElements.forEach((card) => {
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
  });
}

// Calculate optimal card size based on window width
function calculateCardSize() {
  const minCardSize = 70;
  const maxCardSize = 120;
  const windowWidth = window.innerWidth;

  if (windowWidth < 480) return minCardSize;
  if (windowWidth < 768) return 80;
  if (windowWidth < 1024) return 100;
  return maxCardSize;
}

// Single Player Game Functions
function startSinglePlayerGame() {
  resetGameState();
  gameState.singlePlayer.level = 1;
  gameState.singlePlayer.score = 0;
  gameState.singlePlayer.totalMoves = 0;

  setupSinglePlayerLevel();
  showPage("singlePlayer");
}

function setupSinglePlayerLevel() {
  const level = gameState.singlePlayer.level;

  // Calculate number of cards for this level
  const cardCount = Math.min(
    config.singlePlayer.initialCards +
      (level - 1) * config.singlePlayer.cardsIncrement,
    config.singlePlayer.maxCards
  );

  // Set moves for this level
  gameState.singlePlayer.movesLeft =
    config.singlePlayer.initialMoves +
    (level - 1) * config.singlePlayer.movesIncrement;

  gameState.singlePlayer.totalPairs = cardCount / 2;
  gameState.singlePlayer.matchedPairs = 0;
  gameState.singlePlayer.flippedCards = [];
  gameState.lastCardIndex = -1;

  // Update UI
  gameElements.currentLevel.textContent = level;
  gameElements.movesLeft.textContent = gameState.singlePlayer.movesLeft;
  gameElements.currentScore.textContent = gameState.singlePlayer.score;
  gameElements.levelProgress.style.width = "0%";

  // Create cards
  createCards(gameElements.spGameBoard, cardCount, handleSinglePlayerCardClick);
}

function handleSinglePlayerCardClick(card, index) {
  // Prevent multiple clicks on the same card
  if (index === gameState.lastCardIndex) return;
  gameState.lastCardIndex = index;

  if (gameState.singlePlayer.isPaused) return;
  if (gameState.singlePlayer.flippedCards.length >= 2) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched"))
    return;

  // Play flip sound
  playSound(sounds.flip);

  // Flip card
  card.classList.add("flipped");
  gameState.singlePlayer.flippedCards.push({ card, index });

  // Check for match if two cards are flipped
  if (gameState.singlePlayer.flippedCards.length === 2) {
    const [card1, card2] = gameState.singlePlayer.flippedCards;

    // Decrement moves
    gameState.singlePlayer.movesLeft--;
    gameState.singlePlayer.totalMoves++;
    gameElements.movesLeft.textContent = gameState.singlePlayer.movesLeft;

    // Check for match
    if (card1.card.textContent === card2.card.textContent) {
      // Match found
      playSound(sounds.match);

      gameState.singlePlayer.matchedPairs++;

      // Calculate score for this match
      const baseScore =
        config.singlePlayer.baseScore * gameState.singlePlayer.level;
      const bonusScore = Math.floor(
        baseScore *
          ((gameState.singlePlayer.movesLeft /
            (config.singlePlayer.initialMoves +
              (gameState.singlePlayer.level - 1) *
                config.singlePlayer.movesIncrement)) *
            config.singlePlayer.bonusMultiplier)
      );

      gameState.singlePlayer.score += baseScore + bonusScore;
      gameElements.currentScore.textContent = gameState.singlePlayer.score;

      // Update progress
      const progress =
        (gameState.singlePlayer.matchedPairs /
          gameState.singlePlayer.totalPairs) *
        100;
      gameElements.levelProgress.style.width = `${progress}%`;

      // Mark cards as matched
      setTimeout(() => {
        card1.card.classList.add("matched");
        card2.card.classList.add("matched");
        gameState.singlePlayer.flippedCards = [];
        gameState.lastCardIndex = -1;

        // Check if level is complete
        if (
          gameState.singlePlayer.matchedPairs ===
          gameState.singlePlayer.totalPairs
        ) {
          levelComplete();
        }
      }, config.animations.matchDelay);
    } else {
      // No match
      setTimeout(() => {
        card1.card.classList.remove("flipped");
        card2.card.classList.remove("flipped");
        gameState.singlePlayer.flippedCards = [];
        gameState.lastCardIndex = -1;

        // Check if moves are exhausted
        if (gameState.singlePlayer.movesLeft <= 0) {
          setTimeout(() => gameOver(false), config.animations.noMatchDelay);
        }
      }, config.animations.noMatchDelay);
    }
  }
}

function levelComplete() {
  // Play win sound
  playSound(sounds.levelUp);

  // Update high score if needed
  if (gameState.singlePlayer.score > gameState.highScores.singlePlayer.score) {
    gameState.highScores.singlePlayer.score = gameState.singlePlayer.score;
    gameState.highScores.singlePlayer.level = gameState.singlePlayer.level;
    localStorage.setItem(
      "memoryGameHighScores",
      JSON.stringify(gameState.highScores)
    );
  }

  // Advance to next level after delay
  setTimeout(() => {
    gameState.singlePlayer.level++;
    setupSinglePlayerLevel();
  }, 1500);
}

function resetSinglePlayerGame() {
  setupSinglePlayerLevel();
}

function togglePause() {
  gameState.singlePlayer.isPaused = !gameState.singlePlayer.isPaused;

  if (gameState.singlePlayer.isPaused) {
    showModal("pause");
  } else {
    hideModal("pause");
  }
}

// Two Player Game Functions
function startTwoPlayerGame() {
  resetGameState();
  gameState.twoPlayer.currentPlayer = 1;
  gameState.twoPlayer.player1Score = 0;
  gameState.twoPlayer.player2Score = 0;

  // Update UI
  gameElements.currentPlayer.textContent = gameState.twoPlayer.currentPlayer;
  gameElements.player1Score.textContent = gameState.twoPlayer.player1Score;
  gameElements.player2Score.textContent = gameState.twoPlayer.player2Score;

  // Create cards
  createCards(
    gameElements.tpGameBoard,
    config.twoPlayer.initialCards,
    handleTwoPlayerCardClick
  );

  showPage("twoPlayer");
}

function handleTwoPlayerCardClick(card, index) {
  // Prevent multiple clicks on the same card
  if (index === gameState.lastCardIndex) return;
  gameState.lastCardIndex = index;

  if (!gameState.twoPlayer.canFlip) return;
  if (gameState.twoPlayer.flippedCards.length >= 2) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched"))
    return;

  // Play flip sound
  playSound(sounds.flip);

  // Flip card
  card.classList.add("flipped");
  gameState.twoPlayer.flippedCards.push({ card, index });

  // Check for match if two cards are flipped
  if (gameState.twoPlayer.flippedCards.length === 2) {
    gameState.twoPlayer.canFlip = false;
    const [card1, card2] = gameState.twoPlayer.flippedCards;

    // Check for match
    if (card1.card.textContent === card2.card.textContent) {
      // Match found
      playSound(sounds.match);
      gameState.twoPlayer.consecutiveMatches++;

      // Update score for current player
      if (gameState.twoPlayer.currentPlayer === 1) {
        gameState.twoPlayer.player1Score++;
        gameElements.player1Score.textContent =
          gameState.twoPlayer.player1Score;
      } else {
        gameState.twoPlayer.player2Score++;
        gameElements.player2Score.textContent =
          gameState.twoPlayer.player2Score;
      }

      // Mark cards as matched
      setTimeout(() => {
        card1.card.classList.add("matched");
        card2.card.classList.add("matched");
        gameState.twoPlayer.flippedCards = [];
        gameState.lastCardIndex = -1;
        gameState.twoPlayer.canFlip = true;

        // Check if game is complete
        const totalPairs = config.twoPlayer.initialCards / 2;
        const totalMatched =
          gameState.twoPlayer.player1Score + gameState.twoPlayer.player2Score;

        if (totalMatched === totalPairs) {
          setTimeout(() => gameOver(true), config.animations.matchDelay);
        } else if (gameState.twoPlayer.consecutiveMatches >= 1) {
          // Player gets another turn if they made a match
          gameState.twoPlayer.canFlip = true;
        }
      }, config.animations.matchDelay);
    } else {
      // No match - switch players
      setTimeout(() => {
        card1.card.classList.remove("flipped");
        card2.card.classList.remove("flipped");
        gameState.twoPlayer.flippedCards = [];
        gameState.lastCardIndex = -1;
        gameState.twoPlayer.consecutiveMatches = 0;

        // Switch player
        gameState.twoPlayer.currentPlayer =
          gameState.twoPlayer.currentPlayer === 1 ? 2 : 1;
        gameElements.currentPlayer.textContent =
          gameState.twoPlayer.currentPlayer;

        gameState.twoPlayer.canFlip = true;
      }, config.animations.noMatchDelay);
    }
  }
}

function resetTwoPlayerGame() {
  startTwoPlayerGame();
}

// Common Game Functions
function createCards(boardElement, cardCount, clickHandler) {
  // Clear existing cards
  boardElement.innerHTML = "";

  // Create pairs of emojis
  const emojis = [...config.emojiArray]
    .sort(() => 0.5 - Math.random())
    .slice(0, cardCount / 2);
  const cardValues = [...emojis, ...emojis].sort(() => 0.5 - Math.random());

  // Create card elements
  cardValues.forEach((value, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = index;

    // Set card size based on window width
    const cardSize = calculateCardSize();
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;

    const cardFront = document.createElement("div");
    cardFront.className = "card-face card-front";
    cardFront.textContent = value;

    const cardBack = document.createElement("div");
    cardBack.className = "card-face card-back";

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    card.addEventListener("click", () => clickHandler(card, index));

    boardElement.appendChild(card);
  });
}

function playSound(soundElement) {
  if (!gameState.soundEnabled) return;

  soundElement.currentTime = 0;
  soundElement.play().catch((e) => {
    console.log("Audio play failed:", e);
    // Auto-play was prevented, disable sounds for this session
    gameState.soundEnabled = false;
  });
}

// Game Over Functions
function gameOver(isTwoPlayer) {
  if (isTwoPlayer) {
    // Determine winner
    let winner;
    let isNewHighScore = false;

    if (gameState.twoPlayer.player1Score > gameState.twoPlayer.player2Score) {
      winner = "Player 1";
      if (
        gameState.twoPlayer.player1Score >
        gameState.highScores.twoPlayer.player1
      ) {
        gameState.highScores.twoPlayer.player1 =
          gameState.twoPlayer.player1Score;
        isNewHighScore = true;
      }
    } else if (
      gameState.twoPlayer.player2Score > gameState.twoPlayer.player1Score
    ) {
      winner = "Player 2";
      if (
        gameState.twoPlayer.player2Score >
        gameState.highScores.twoPlayer.player2
      ) {
        gameState.highScores.twoPlayer.player2 =
          gameState.twoPlayer.player2Score;
        isNewHighScore = true;
      }
    } else {
      winner = "It's a tie!";
    }

    // Save high scores if needed
    if (isNewHighScore) {
      localStorage.setItem(
        "memoryGameHighScores",
        JSON.stringify(gameState.highScores)
      );
    }

    // Play appropriate sound
    if (winner.includes("1") || winner.includes("2")) {
      playSound(sounds.win);
    }

    // Update UI
    gameElements.resultMessage.textContent = "Game Completed!";
    gameElements.winnerDisplay.textContent = `Winner: ${winner}`;
    gameElements.levelReached.textContent = "";
    gameElements.movesUsed.textContent = "";

    if (isNewHighScore) {
      gameElements.highScoreMessage.textContent = "New High Score!";
    } else {
      gameElements.highScoreMessage.textContent = "";
    }
  } else {
    // Single player game over
    playSound(sounds.lose);

    gameElements.resultMessage.textContent = "Game Over";
    gameElements.levelReached.textContent = `Level Reached: ${gameState.singlePlayer.level}`;
    gameElements.scoreAchieved.textContent = `Score: ${gameState.singlePlayer.score}`;
    gameElements.movesUsed.textContent = `Total Moves: ${gameState.singlePlayer.totalMoves}`;
    gameElements.winnerDisplay.textContent = "";

    if (
      gameState.singlePlayer.score === gameState.highScores.singlePlayer.score
    ) {
      gameElements.highScoreMessage.textContent = "🏆 High Score! 🏆";
    } else {
      gameElements.highScoreMessage.textContent = "";
    }
  }

  showPage("gameOver");
}

function playAgain() {
  if (
    gameState.currentPage === "singlePlayer" ||
    gameElements.resultMessage.textContent.includes("Single Player")
  ) {
    startSinglePlayerGame();
  } else {
    startTwoPlayerGame();
  }
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
