class App {
  constructor() {
    // const output = document.querySelector('#messageOutput');
    // const increaseButton = document.querySelector('#btn-increase');
    // const decreaseButton = document.querySelector('#btn-decrease');
    // const usernameLabel = document.querySelector('#username');
    // const counterLabel = document.querySelector('#counter');
    // var counter = 0;

    // Logic for WordDrop Game
    const gameBoardElement = document.querySelector('#game-board');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentUsername = '';

    // 2D array of 5x5 grid representing the game board
    const gameBoard = Array.from({ length: 5 }, () => Array(5).fill(null));

    // Keep track of the current word that is being built
    let currentWord = '';

    // Array of tuples that tracks the coordinates on the board of the selected letters of the current word
    let currentLetterPositions = [];
    let isMouseDown = false;

    // Keep track of the coordinate of last letter used. Used to prevent the same letter from being clicked twice in a row
    let lastPosition = null;
    
    const scoreElement = document.querySelector('#score');
    const timerLabel = document.querySelector("#timer");

    // Score variable keeps track of score and persists across multiple methods
    this.score = 0

    // Store reference to DOM element so it can be accessed derectly in methods without querying the DOM repeatedly
    this.scoreElement = scoreElement;
    
    
    this.timerLabel = timerLabel;
    this.isGameActive = false;
    this.timer = 60;
    this.intervalId = null;

    // More common letters will show up more frequently
    this.letterFrequencies = [
      { letter: 'E', weight: 9.00 },
      { letter: 'T', weight: 8.00 },
      { letter: 'A', weight: 8.00 },
      { letter: 'O', weight: 7.00 },
      { letter: 'I', weight: 6.50 },
      { letter: 'N', weight: 7.00 },
      { letter: 'S', weight: 6.51 },
      { letter: 'R', weight: 6.28 },
      { letter: 'H', weight: 5.00 },
      { letter: 'L', weight: 4.50 },
      { letter: 'D', weight: 3.82 },
      { letter: 'C', weight: 3.50 },
      { letter: 'U', weight: 2.50 },
      { letter: 'M', weight: 2.50 },
      { letter: 'F', weight: 2.00 },
      { letter: 'P', weight: 2.00 },
      { letter: 'G', weight: 2.00 },
      { letter: 'W', weight: 1.50 },
      { letter: 'Y', weight: 1.66 },
      { letter: 'B', weight: 1.48 },
      { letter: 'V', weight: 0.80 },
      { letter: 'K', weight: 0.54 },
      { letter: 'X', weight: 0.23 },
      { letter: 'J', weight: 0.16 },
      { letter: 'Q', weight: 0.12 },
      { letter: 'Z', weight: 0.09 },
    ];
    
    // Letter bank where the letters will come from
    this.letterBank = this.fillLetterBank();
    
    // Instance varibales for the game state
    this.gameBoard = gameBoard;
    
    this.currentWord = currentWord;
    this.currentLetterPositions = currentLetterPositions;
    this.isMouseDown = isMouseDown;
    this.lastPosition = lastPosition;

    // Keep track of the longest valid word played this round
    this.longestWord = '';

    // keep track of longest valid word across all rounds this session
    this.longestWordOverall = '';

    // Keep track of the highest score played this game session
    this.highScore = 0;

    
    // Code for Devvit - Webview eventlisteners
    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    // Listen for the initialData message to start the game
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        // output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Load initial data
        // Start the game
        if (message.type === 'initialData') {
          // const { username, currentCounter } = message.data;
          // usernameLabel.innerText = username;
          // counterLabel.innerText = counter = currentCounter;
          const {username, currentCounter } = message.data;
          this.currentUsername = username;

          // Event listener for lifting up the mouse cursor up
          document.addEventListener('mouseup', () => this.handleMouseUp());

          // Initialize the game board
          this.initializeGameBoard();

          // Start the game when the game WebView is first loaded
          this.startGame();
        }

        // Update counter
        // if (message.type === 'updateCounter') {
        //   const { currentCounter } = message.data;
        //   counterLabel.innerText = counter = currentCounter;
        // }
      }
    });
    

    // // Example of devvit-webview event listener for writing to devvit app
    // increaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter + 1) } },
    //     '*'
    //   );
    // });

    // // Example of devvit-webview event listener for writing to devvit app
    // decreaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter - 1) } },
    //     '*'
    //   );
    // });
  }

  // Code for Word Drop Game App Methods

  startGame() {
    if (this.isGameActive) return;
    console.log("Game Started");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log(`${this.currentUsername} is starting the game`)
    this.isGameActive = true;
    this.timer = 60;
    this.updateTimerLabel();

    // Start Countdown
    this.intervalId = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        this.updateTimerLabel();
      } else {
        this.endGame();
      }
    }, 1000);
  }

  endGame() {
    if (!this.isGameActive) return;
    this.isGameActive = false;
    clearInterval(this.intervalId);
    console.log(`Game Over! Score: ${this.score}`);

    // Update the high score this game session if the current score is higher
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Display gameover popup
    const gameOverPopup = document.getElementById("gameover-popup");
    const finalScoreLabel = document.getElementById("final-score-label");
    const longestWordLabel = document.getElementById("longest-word-label");
    const highScoreLabel = document.getElementById("high-score-label");
    const longestWordOverallLabel = document.getElementById("longest-word-overall-label");

    gameOverPopup.classList.remove("hidden");
    finalScoreLabel.innerText = `Final Score: ${this.score}`;
    longestWordLabel.innerText = `Longest Word: ${this.longestWord || 'None'}`;
    highScoreLabel.innerText = `High Score: ${this.highScore}`;
    longestWordOverallLabel.innerText = `Longest Word This Session: ${this.longestWordOverall || 'None'}`;


    // Add event listeners to buttons
    const newGameButton = document.getElementById("new-game-button");
    const shareScoreButton = document.getElementById("share-score-button");
    const showLeaderboardButton = document.getElementById("show-leaderboard-button");


    newGameButton.addEventListener("click", () => {
      console.log("New Game Button Pressed");
      gameOverPopup.classList.add("hidden");
      this.restartGame();
    });

    shareScoreButton.addEventListener("click", () => {
      console.log("Share Score Button Pressed");

      // Send message to the Devvit app to handle sharing the current score
      window.parent?.postMessage(
        {
          type: "shareScore",
          data: {
            score: this.score,
            longestWord: this.longestWord,
            currentUsername: this.currentUsername
          }
        },
        "*"
      );
    });

    showLeaderboardButton.addEventListener("click", () => {
      console.log("Show Leaderboard Button Pressed");
    
      // Send a message to the Devvit app to show the leaderboard
      window.parent?.postMessage(
        {
          type: "showLeaderboard",
          data: {
            score: this.score, // Pass the current score or other relevant data
          },
        },
        "*"
      );
    });
    
  // After showing game over, send data back to Devvit app
    window.parent?.postMessage(
      {
        type: 'gameEnded',
        data: {
          finalScore: this.score,
          longestWord: this.longestWord,
        },
      },
      '*'
    );
  }

  restartGame() {
    console.log("Game Restarted")
    this.score = 0
    this.timer = 60
    this.isGameActive = false;
    // Reset Longest word for round
    this.longestWord = '';
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }  

    // Update the score in the DOM back to 0
    this.updateScore(0);
    this.updateTimerLabel();

    this.letterBank = this.fillLetterBank();

    // Clear the game board
    const gameBoardElement = document.getElementById("game-board");
    gameBoardElement.innerHTML = "";

    // Reinitialize the game board
    this.initializeGameBoard();

    this.startGame();
  }

  updateTimerLabel() {
    this.timerLabel.innerText = `Timer: ${this.timer} seconds`;
  }

  initializeGameBoard() {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const button = document.createElement("button");
        button.classList.add("letter-button");
        button.innerText = this.letterBank[row][col];
  
        button.dataset.row = row;
        button.dataset.col = col;
  
        button.addEventListener("mousedown", (e) => this.handleMouseDown(e, row, col));
        button.addEventListener("mouseenter", (e) => this.handleMouseEnter(e, row, col));
  
        this.gameBoard[row][col] = button;
        const gameBoardElement = document.getElementById("game-board");
        gameBoardElement.appendChild(button);
      }
    }
  }

  getWeightedRandomLetter() {
    // Calculate total weight
    const totalWeight = this.letterFrequencies.reduce((sum, { weight }) => sum + weight, 0);
  
    // Generate a random number between 0 and totalWeight
    const random = Math.random() * totalWeight;
  
    // Map the random number to a letter
    let cumulativeWeight = 0;
    for (const { letter, weight } of this.letterFrequencies) {
      cumulativeWeight += weight;
      if (random <= cumulativeWeight) {
        return letter;
      }
    }
  }

  fillLetterBank() {
    return Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => this.getWeightedRandomLetter())
    );
  }
  
  // Word Forming with HandleMouseDown can only get called if the game is active
  handleMouseDown(e, row, col) {
    if (!this.isGameActive) {
      return;
    }
    this.isMouseDown = true;
    this.currentWord = this.gameBoard[row][col].innerText;
    this.currentLetterPositions.push([row, col]);
    this.lastPosition = { row, col };
    this.updateHighlight();
  }

  // HandleMouseEnter and HandlemouseUp will only get called in isMouseDown is True
  handleMouseEnter(e, row, col) {
    if (this.isMouseDown) {
      const lastPosition = this.currentLetterPositions[this.currentLetterPositions.length - 1];
  
      // Check if the cell is adjacent and not already used in the current word
      const alreadyUsed = this.currentLetterPositions.some(
        ([usedRow, usedCol]) => usedRow === row && usedCol === col
      );
  
      if (this.isAdjacent(lastPosition, [row, col]) && !alreadyUsed) {
        this.currentWord += this.gameBoard[row][col].innerText;
        this.currentLetterPositions.push([row, col]);
        this.lastPosition = { row, col };
        this.updateHighlight();
      }
    }
  }

  // Handle logic for lifting the mouse up which submits a word
  handleMouseUp() {
    if (this.isMouseDown) {
      console.log(`Word Submitted: ${this.currentWord}`);
      
      if (this.isValidWord(this.currentWord)) {
        console.log(`${this.currentWord} is a valid word`);
        const wordLength = this.currentWord.length;
        const points = this.calculateScore(wordLength);

        // Update the longest word if the current valid word is longer
        if (this.currentWord.length > this.longestWord.length) {
          this.longestWord = this.currentWord;
        }

        // Update the overall longest word
        if (this.currentWord.length > this.longestWordOverall.length) {
          this.longestWordOverall = this.currentWord;
        }

        this.updateScore(points);
        this.removeAndDropLetters();
      } else if (this.currentWord.length === 1) { // player can remove one letter for a penalty
        console.log(`Single letter selected :${this.currentWord}`);
        this.updateScore(-3);
        this.removeAndDropLetters();
      } else {
        console.log(`${this.currentWord} is invalid`);
      }
      this.resetSelection();
    }
  }

  updateHighlight() {
    // Remove previous highlights
    document.querySelectorAll('.highlighted, .valid-word').forEach((btn) => {
      btn.classList.remove('highlighted', 'valid-word');
    });
  
    // Add highlights to current selection
    this.currentLetterPositions.forEach(([row, col]) => {
      const button = this.gameBoard[row][col];
      if (this.isValidWord(this.currentWord)) {
        button.classList.add('valid-word');
      } else {
        button.classList.add('highlighted');
      }
    });
  }

  calculateScore(wordLength) {
    if (wordLength < 3) {
      return 0; // No points for words shorter than 3 letters
    }
    
    // Base points for a 3-letter word
    const basePoints = 10;

    // Use an exponential growth factor
    const growthFactor = 1.8;

    // Calculate score exponentially
    const score = Math.floor(basePoints * Math.pow(growthFactor, wordLength - 3));
    return score;
}

  isValidWord(word) {
    // Check against the DICTIONARY_SET for efficient lookup
    return DICTIONARY_SET.has(word.toLowerCase());
  }

  updateScore(points) {
    this.score += points;
    this.scoreElement.innerText = `Score: ${this.score}`;
  }

  // Check that the current letter cell being used is adjacent to the previous letter cell
  isAdjacent(last, current) {
    const [lastRow, lastCol] = last;
    const [row, col] = current;
    const rowDiff = Math.abs(lastRow - row);
    const colDiff = Math.abs(lastCol - col);
    return rowDiff <= 1 && colDiff <= 1;
  }

  // Manage the game board after a word is submitted 
  // Removing the used letters, and dropping the letters in respective columns, and get new letters for top rows
  removeAndDropLetters() {
    const columnsToUpdate = new Set();

    // Clear selected letters and collect affected columns
    this.currentLetterPositions.forEach(([row, col]) => {
      // Clear letter
      this.gameBoard[row][col].innerText = ''; 
      columnsToUpdate.add(col);
    });

    // Handle dropping logic for each affected column
    columnsToUpdate.forEach((col) => {
      for (let row = 4; row >= 0; row--) {
        if (this.gameBoard[row][col].innerText === '') {
          // Find the first non-empty cell above
          for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
            if (this.gameBoard[aboveRow][col].innerText !== '') {
              this.gameBoard[row][col].innerText = this.gameBoard[aboveRow][col].innerText;
              this.gameBoard[aboveRow][col].innerText = '';
              break;
            }
          }
        }
      }

      // Fill empty spaces at the top with new letters from the letter bank
      for (let row = 0; row < 5; row++) {
        if (this.gameBoard[row][col].innerText === '') {
          const newLetter = this.getNewLetter();
          this.gameBoard[row][col].innerText = newLetter;
        }
      }
    });
  }

  // Get random letters from letter bank first, then if its empty, generate random letters to fill the game board
  getNewLetter() {
    if (this.letterBank.length === 0) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    const lastRow = this.letterBank.pop();
    return lastRow[Math.floor(Math.random() * lastRow.length)];
  }

  // Reset the state of the word selection after a word is submitted
  resetSelection() {
    this.currentWord = '';
    this.currentLetterPositions = [];
    this.isMouseDown = false;
    this.lastPosition = null;
  
    document.querySelectorAll('.highlighted, .valid-word').forEach((btn) => {
      btn.classList.remove('highlighted', 'valid-word');
    });
  }
  

}

new App();
