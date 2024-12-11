import './createPost.js';

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
          // Compare finalScore and longestWord with stored values and update if better.
          if (!username) return;

          const highScoreKey = `high_score_${username}`;
          const longestWordKey = `longest_word_${username}`;

          const currentHighScore = userStats?.highScore ?? 0;
          const currentLongestWord = userStats?.longestWord ?? '';

          const newHighScore = msg.data.finalScore > currentHighScore ? msg.data.finalScore : currentHighScore;
          const newLongestWord = msg.data.longestWord.length > currentLongestWord.length ? msg.data.longestWord : currentLongestWord;

          // Update Redis
          if (newHighScore !== currentHighScore) {
            await context.redis.set(highScoreKey, newHighScore.toString());
          }
          if (newLongestWord !== currentLongestWord) {
            await context.redis.set(longestWordKey, newLongestWord);
          }

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
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
          currentCounter: counter,
        },
      });
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold">
            Play Word Drop
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {' '}
                {username ?? ''}
              </text>
            </hstack>
            
            <hstack>
              {/* <text size="medium">Current counter:</text>
              <text size="medium" weight="bold">
                {' '}
                {counter ?? ''}
              </text> */}
              <text size="medium" weight="bold">
                How to Play:
              </text>
              <text size="small" wrap>
                1. Press and hold the mouse over letters and drag to form words.
              </text>
              <text size="small" wrap>
                2. Release the mouse to submit your word.
              </text>
            </hstack>
            {userStatsLoading ? (
              <text>Loading Stats...</text>
            ) : (
              <>
                <hstack>
                  <text size="medium">All-Time High Score:</text>
                  <text size="medium" weight="bold">
                    {userStats?.highScore ?? 0}
                  </text>
                </hstack>
                <hstack>
                  <text size="medium">All-Time Longest Word:</text>
                  <text size="medium" weight="bold">
                    {userStats?.longestWord ?? ''}
                  </text>
                </hstack>
              </>
            )}

          </vstack>
          <spacer />
          <button onPress={onShowWebviewClick} appearance="primary" size="medium">Start Game</button>
        </vstack>
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack cornerRadius="small" border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
