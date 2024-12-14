import { Devvit } from '@devvit/public-api';

// Menu item to add test data to redis
Devvit.addMenuItem({
    location: 'subreddit',
    label: 'Add Test Leaderboard Data',
    onPress: async (_event, context) => {
      try {
        const { redis } = context;
  
        // Add sample leaderboard data
        const result = await redis.zAdd('worddrop_leaderboard', 
          { member: 'user1', score: 100 },
          { member: 'user2', score: 200 }
        );
  
        console.log('zAdd result:', result);
        console.log('Test leaderboard data added.');
        context.ui.showToast('Test data added successfully!');
      } catch (error) {
        console.error('Error adding test data:', error);
        context.ui.showToast('Failed to add test data.');
      }
    },
  });
  
  // Menu item to test fetching from redis database
  Devvit.addMenuItem({
    location: 'subreddit',
    label: 'Fetch Leaderboard Data',
    onPress: async (_event, context) => {
      try {
        const { redis } = context;
  
        // Check if the leaderboard exists
        const exists = await redis.type('worddrop_leaderboard');
        console.log('worddrop_leaderboard exists as:', exists);
  
        // Fetch leaderboard data
        const leaderboard = await redis.zRange('worddrop_leaderboard', '-inf', '+inf', { by: 'score' });
  
        console.log('Fetched leaderboard:', leaderboard);
        context.ui.showToast(`Fetched ${leaderboard.length} entries.`);
  
        leaderboard.forEach((entry, index) => {
          console.log(`Rank ${index + 1}: ${entry.member} - ${entry.score}`);
        });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        context.ui.showToast('Failed to fetch leaderboard.');
      }
    },
  });