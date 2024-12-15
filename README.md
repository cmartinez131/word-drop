### Word Drop

Word Drop is a fast-paced word game developed for the [Reddit Games and Puzzles Hackathon](https://redditgamesandpuzzles.devpost.com/). Built using Reddit's Developer Platform, Word Drop offers a dynamic and engaging gameplay experience for users directly within Reddit communities.

#### Goal of the Game

Build as many words as you can in 60 seconds! Drag your mouse over adjacent letters to form a word and release to submit it. Once a word is submitted, the used letters disappear, and new letters drop into place, creating fresh opportunities to score. The longer your words, the higher your score.

#### Features

- **Dynamic Word Gameplay**: Form words by selecting adjacent letters on a 5x5 grid.
- **Scoring System**: Earn points based on the length of words you form:
  - Longer words equal more points.
- **Dynamic Game Board Updates**: Letters used in a word disappear, and new letters drop in to replace them, ensuring endless gameplay possibilities.

#### How to Play
1. Go to the r/WordDrop subreddit.
2. Click the "Start Game" button.
3. Press and hold the mouse cursor over letters to form a word by dragging over adjacent letters. Release the mouse to submit the word.
4. Score as many points as possible within the 60-second timer.

#### Technologies Used

- **Devvit**: For Reddit Developer Platform integration.
- **TypeScript**: For the Devvit app to comminucate with the WebView app and make API request.
- **HTML/CSS/JavaScript**: For the game interface and core game logic.
- **WebViews**: For integrating web technologies into the Reddit platform, allowing full customization of the app's interface.
- **Redis**: (Todo) Stores and manages game state, such as the score and board data, enabling persistent gameplay across sessions.
- **React-like Hooks**: Devvit uses hooks similar to React's hooks for state management within the Devvit platform.

#### About the Integration with WebViews

Word Drop leverages **WebViews** to integrate rich web technologies into the Reddit platform. This allows for a fully customizable game interface and dynamic interactions within the Reddit app. Communication between Devvit (the server-side application) and WebViews (the client-side interface) ensures that the game state is consistently updated. For example:
- **WebViews** handle rendering the game board and capturing user interactions.
- **Devvit** acts as a backend for performing backend logic, like storing the score and ensuring gameplay continuity using Redis.
- The **WebView** must interact with the Devvit app to perform all services like API calls.

---

### Done:

- [x] Validate word before adding score.
- [x] Add end game logic to end game after 60 seconds.
- [x] Increase frequency of commonly used letters for a more balanced game.
- [x] Improve scoring calculation logic.
- [x] **Score Tracking**: Keep track of your high scores. Send score from webview to devvit for user so user can track highest score.
- [x] On mouse up, show green when the word is valid.
- [x] Or show green when the word is valid and the user hasn’t lifted the mouse yet.
- [x] keep track of longest word in the game and display it on gamover screen
- [x] make border for leaderboard (the black border) centered on the page

TODO:
- [x] button to show leaderboard from end game screen
- [ ] maybe use the same font and background as pixelary game, pixel font playground.[PixelFont Playgrounds](https://developers.reddit.com/docs/showcase/playgrounds).
- [ ] Update UI to show future letters in letter bank. Update new letter logic to get words from columns in letter bank.
- [ ] Implement word falling animation.
- [ ] Animation for word formation.
- [ ] **Leaderboards**: Compete against other redditors in daily competitions.
- [ ] **Share Your Score**: Share your score and current game with other redditors to compete on the same board of letters.
- [ ] **Subreddit Integration**: Compete against others within a subreddit. Implement leaderboard for subreddit competitions (communities compete for the best community score).
- [ ] if the user finds a hidden/key word, like reddit-y words like [flair, upvote, mod, reddit, home, ban, etc] they get extra points