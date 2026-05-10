const axios = require('axios');

const BACKEND_URL = 'http://backend:3000/queue';
const POLL_INTERVAL = 3000; // 3 seconds

console.log('Worker service started...');

const processQueue = async () => {
  try {
    const response = await axios.get(BACKEND_URL);
    const queue = response.data.queue;

    if (queue && queue.length > 0) {
      // For this simple simulation, we process the last message added
      const lastMessage = queue[queue.length - 1];
      console.log(`[Worker] Processing message: "${lastMessage}"`);
      console.log(`[Worker] Uppercase Result: ${lastMessage.toUpperCase()}`);
    } else {
      console.log('[Worker] Queue is empty, waiting...');
    }
  } catch (error) {
    console.error('[Worker] Error connecting to backend:', error.message);
  }
};

// Run the worker every 3 seconds
setInterval(processQueue, POLL_INTERVAL);
