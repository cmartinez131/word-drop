import './createPost.js';
import './testMenuItems.js';

import { Devvit, useState, useAsync } from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'initialData';
      data: { username: string; currentCounter: number };
    }
  | {
      type: 'setCounter';
      data: { newCounter: number };
    }
  | {
      type: 'updateCounter';
      data: { currentCounter: number };
    }
  | {
      type: 'gameEnded';
      data: { finalScore: number; longestWord: string };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    // Explicitly type the leaderboard state
    const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);

    // Load the user's high score and longest word from redis with 'useAsync' hook
    const {
      data: userStats,
      loading: userStatsLoading,
      error: userStatsError,
    } = useAsync(async () => {
      if (!username) return { highScore: 0, longestWord: '' };
      const highScoreKey = `high_score_${username}`;
      const longestWordKey = `longest_word_${username}`;
      const storedHighScore = await context.redis.get(highScoreKey);
      const storedLongestWord = await context.redis.get(longestWordKey);
      return {
        highScore: storedHighScore ? Number(storedHighScore) : 0,
        longestWord: storedLongestWord ?? '',
      };
    }, { depends: username });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'setCounter':
          await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
          context.ui.webView.postMessage('myWebView', {
            type: 'updateCounter',
            data: {
              currentCounter: msg.data.newCounter,
            },
          });
          setCounter(msg.data.newCounter);
          break;

        case 'gameEnded':
          console.log(`Game Ended with score: ${msg.data.finalScore} and longest word: ${msg.data.longestWord}`);
          // Compare finalScore and longestWord with stored values and update if better.
          if (!username) return;

          const highScoreKey = `high_score_${username}`;
          const longestWordKey = `longest_word_${username}`;
          const leaderboardKey = 'worddrop_leaderboard';

          const currentHighScore = userStats?.highScore ?? 0;
          const currentLongestWord = userStats?.longestWord ?? '';

          const newHighScore = msg.data.finalScore > currentHighScore ? msg.data.finalScore : currentHighScore;
          const newLongestWord = msg.data.longestWord.length > currentLongestWord.length ? msg.data.longestWord : currentLongestWord;

          // Update user's highest score in Redis if there's a new high score
          if (newHighScore !== currentHighScore) {
            await context.redis.set(highScoreKey, newHighScore.toString());
          }

          // Update user's longest word in Redis if there's a new longest word
          if (newLongestWord !== currentLongestWord) {
            await context.redis.set(longestWordKey, newLongestWord);
          }

          // Add or update the user's score in the leaderboard
          await context.redis.zAdd(leaderboardKey, { member: username, score: newHighScore });
          console.log('High Score and Leaderboard Updated');
          break;

        case 'initialData':
        case 'updateCounter':
          break;

        default:
          throw new Error(`Unknown message type: ${msg satisfies never}`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = () => {
      setLeaderboardVisible(false);
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
          currentCounter: counter,
        },
      });
    };

    const onShowLeaderboardClick = async () => {
      try {
        const leaderboardData = await fetchLeaderboard(context);
        setLeaderboard(leaderboardData);
    
        console.log("leaderboard fetched");
        console.log(leaderboardData);

        setLeaderboardVisible(true);
        // context.ui.showToast('Showing top 10 scores');

      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        context.ui.showToast('Error showing leaderboard')
      }
    };
    
    // A helper function to fetch the top 10 players from the leaderboard using zRange
  // Note: `zRange` returns elements in ascending order by score when using by: 'score', 
  // so we fetch all, then sort in descending order and slice the top 10.
  async function fetchLeaderboard(context: Devvit.Context): Promise<{ username: string; score: number }[]> {
    const leaderboardKey = 'worddrop_leaderboard';

    // Use '-inf' and '+inf' to cover all possible scores.
    const players = await context.redis.zRange(leaderboardKey, '-inf', '+inf', { by: 'score' });
    // print players before sorting and limiting to 10
    console.log('Raw players fetched:', players);

    // Sort in descending order by score
    players.sort((a, b) => b.score - a.score);

    // Take the top 10
    const topTen = players.slice(0, 10);

    // Map member -> username
    return topTen.map((p) => ({ username: p.member, score: p.score }));
  }

    // Render the custom post type
    return (
      <vstack grow padding="small">
  {/* Main Content */}
  <vstack
    grow={!webviewVisible && !leaderboardVisible}
    height={webviewVisible || leaderboardVisible ? '0%' : '100%'}
    alignment="middle center"
  >
    <text size="xxlarge" weight="bold" style='heading'>Play Word Drop</text>
    <spacer size='large'/>
    <vstack alignment="start middle">
      {/* <hstack>
        <text size="medium">Username:</text>
        <text size="medium" weight="bold">{username ?? ''}</text>
      </hstack> */}
      <text size="xlarge" weight="bold">How to Play:</text>
      <spacer />
      <text size="medium" wrap>1. Press and hold the mouse over letters and drag to form words.</text>
      <text size="medium" wrap>2. Release the mouse to submit your word.</text>
      <text size="medium" wrap>3. Click to pop a single letter.</text>
      <spacer />
      {userStatsLoading ? (
        <text>Loading Stats...</text>
      ) : (
        <>
          <hstack>
            <text size="medium">Your All-Time High Score:</text>
            <text size="medium" weight="bold">{userStats?.highScore ?? 0}</text>
          </hstack>
          <hstack>
            <text size="medium">Your All-Time Longest Word:</text>
            <text size="medium" weight="bold">{userStats?.longestWord ?? ''}</text>
          </hstack>
        </>
      )}
    </vstack>
    <spacer size='large'/>
    <hstack alignment='middle center'>
      <button onPress={onShowLeaderboardClick} appearance="bordered" size="medium" icon='rules'>Rules</button>
      <spacer />
      <button onPress={onShowWebviewClick} appearance="primary" size="large" icon='play'>Start</button>
      <spacer />
      <button onPress={onShowLeaderboardClick} appearance="bordered" size="medium" icon='list-numbered'>Leaderboard</button>
    </hstack>
  </vstack>

  {/* Webview */}
  <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
    <vstack cornerRadius="small" border="thick" borderColor="black" height="100%">
      <webview
        id="myWebView"
        url="page.html"
        onMessage={(msg) => onMessage(msg as WebViewMessage)}
        grow
      />
    </vstack>
  </vstack>

  {/* Leaderboard Modal */}
  {leaderboardVisible && (
    <zstack alignment="middle center" width="100%" height="80%">
      <vstack
        width="80%"
        height="60%"
        backgroundColor="PureGray-200"
        cornerRadius="medium"
        padding="medium"
        border="thick"
        borderColor="black"
        alignment="center top"
      >
        <hstack alignment="middle center">
          <text size="xxlarge" weight="bold" style='heading'>Leaderboard</text>
        </hstack>
        <spacer />
        <hstack>
          <text size="large" weight="bold">Most Points scored</text>
        </hstack>
        <spacer size="small" />
        {leaderboard.length === 0 ? (
          <text>No leaderboard entries found.</text>
        ) : (
          leaderboard.map((entry, index) => (
            <hstack key={entry.username}>
              <text size="medium">{index + 1}. {entry.username}</text>
              <spacer />
              <text size="medium" weight='bold'>{entry.score}</text>
            </hstack>
          ))
        )}
        <spacer />
        <hstack>
          <button
            onPress={() => setLeaderboardVisible(false)}
            appearance="primary"
            size="small"
          >
            Close
          </button>
        </hstack>
      </vstack>
    </zstack>
  )}
</vstack>

    );
  },
});

export default Devvit;
