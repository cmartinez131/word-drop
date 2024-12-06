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
    this.timer = 10;
    this.intervalId = null;
    
    // Letter bank where the letters will come from
    this.letterBank = this.fillLetterBank();

    // Event listener for lifting up the mouse cursor up
    document.addEventListener('mouseup', () => this.handleMouseUp());
    
    // Instance varibales for the game state
    this.gameBoard = gameBoard;
    
    this.currentWord = currentWord;
    this.currentLetterPositions = currentLetterPositions;
    this.isMouseDown = isMouseDown;
    this.lastPosition = lastPosition;
    
    // Initialize the game board
    this.initializeGameBoard();
    
    // Start the game when the game WebView is first loaded
    this.startGame();
    
    // Code for Devvit - Webview eventlisteners
    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    // window.addEventListener('message', (ev) => {
    //   const { type, data } = ev.data;

    //   // Reserved type for messages sent via `context.ui.webView.postMessage`
    //   if (type === 'devvit-message') {
    //     const { message } = data;

    //     // Always output full message
    //     output.replaceChildren(JSON.stringify(message, undefined, 2));

    //     // Load initial data
    //     if (message.type === 'initialData') {
    //       const { username, currentCounter } = message.data;
    //       usernameLabel.innerText = username;
    //       counterLabel.innerText = counter = currentCounter;
    //     }

    //     // Update counter
    //     if (message.type === 'updateCounter') {
    //       const { currentCounter } = message.data;
    //       counterLabel.innerText = counter = currentCounter;
    //     }
    //   }
    // });

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
    console.log("Game Started");
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isGameActive = true;
    this.timer = 10;
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
    this.isGameActive = false;
    clearInterval(this.intervalId);
    console.log(`Game Over! Score: ${this.score}`);

    // Display gameover popup
    const gameOverPopup = document.getElementById("gameover-popup");
    const finalScoreLabel = document.getElementById("final-score-label");
    gameOverPopup.classList.remove("hidden");
    finalScoreLabel.innerText = `Final Score: ${this.score}`;

    // Add event listeners to buttons
    const newGameButton = document.getElementById("new-game-button");
    const shareScoreButton = document.getElementById("share-score-button");

    newGameButton.addEventListener("click", () => {
      console.log("New Game Button Pressed");
      gameOverPopup.classList.add("hidden");
      this.restartGame();
    });

    shareScoreButton.addEventListener("click", () => {
      console.log("Share Score Button Pressed");
    });
  }

  restartGame() {
    console.log("Game Restarted")
    this.score = 0
    this.timer = 10
    this.isGameActive = false;

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

  fillLetterBank() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 25 }, () =>
      Array.from({ length: 5 }, () => alphabet.charAt(Math.floor(Math.random() * alphabet.length)))
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
    this.gameBoard[row][col].classList.add('highlighted');
  }

  // HandleMouseEnter and HandlemouseUp will only get called in isMouseDown is True
  handleMouseEnter(e, row, col) {
    if (this.isMouseDown) {
      const lastPosition = this.currentLetterPositions[this.currentLetterPositions.length - 1];
  
      // Check if the cell is adjacent and not already used in the current word
      const alreadyUsed = this.currentLetterPositions.some(([usedRow, usedCol]) => usedRow === row && usedCol === col);
  
      if (this.isAdjacent(lastPosition, [row, col]) && !alreadyUsed) {
        this.currentWord += this.gameBoard[row][col].innerText;
        this.currentLetterPositions.push([row, col]);
        this.lastPosition = { row, col };
        this.gameBoard[row][col].classList.add('highlighted');
      }
    }
  }

  // Handle logic for lifting the mouse up which submits a word
  handleMouseUp() {
    if (this.isMouseDown) {
      console.log(`Word Submitted: ${this.currentWord}`);
      console.log('Checking if submitted word is a valid word.')
      
      const wordLength = this.currentWord.length;
      const points = this.calculateScore(wordLength);
      this.updateScore(points);
      this.removeAndDropLetters();
      this.resetSelection();
    }
  }

  calculateScore(wordLength) {
    if (wordLength < 3) {
      return 0;
    }
    const multiplier = 1 + 0.5 * (wordLength - 3);
    return Math.floor(wordLength * multiplier)
  }

  isValidWord(word) {
    // Implmenet logic for checking if word is valid or not
    return True
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
    document.querySelectorAll('.highlighted').forEach((btn) => btn.classList.remove('highlighted'));
  }

}

new App();
