require('dotenv').config({ path: '.env' });

const { google, youtube_v3 } = require('googleapis');

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY,
});

const fetchVideos = async () => {
	const response = await youtube.search.list({
		part: ['snippet'],
		channelId: 'UCssxbnFeTEDAZcwzL6saHCg',
		maxResults: 100,
		order: 'date',
	});

	return response.data.items;
}

const getEnglishSubtitles = async (videoId) => {
  try {
    const captionsList = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    const englishCaption = captionsList.data.items.find(caption => caption.snippet.language === 'en' && caption.snippet.trackKind !== 'ASR');
    if (!englishCaption) {
      console.log('No English captions found.');
      return '';
    }

    // Download the caption track
    const captionsResponse = await youtube.captions.download({
      id: englishCaption.id,
      tfmt: 'vtt', // Use WebVTT format for easier handling in text.
    }, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let subtitles = '';
      captionsResponse.data.on('data', (chunk) => {
        subtitles += chunk.toString();
      });
      captionsResponse.data.on('end', () => {
        resolve(subtitles);
      });
      captionsResponse.data.on('error', reject);
    });
  } catch (error) {
    console.error('Error fetching English subtitles:', error);
    return '';
  }
}



// const id = findChannelId('https://www.youtube.com/@upanishadswithswamiprabudd4019');
async function findChannelId(channelName) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      type: 'channel',
      q: channelName,
      maxResults: 1,
    });

    if (response.data.items.length === 0) {
      console.log('No channel found with the specified name.');
      return;
    }

    const channelId = response.data.items[0].id.channelId;
    console.log(`Channel ID for '${channelName}': ${channelId}`);
  } catch (error) {
    console.error('Error fetching channel ID:', error);
  }
}

const main = async () => {
	// const videos = await fetchVideos();
	// console.log(videos.map(video => ({ title: video.snippet.title, id: video.id.videoId })));
	
	const subtitles = await getEnglishSubtitles('JDRuVsQTLnw');
	console.log(subtitles);
}

main();
