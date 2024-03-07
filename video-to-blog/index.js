require('dotenv').config({ path: '.env' });

const { google, youtube_v3 } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');

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
  const subtitles = await getSubtitles({
    videoID: videoId,
    lang: 'en',
  });

  return subtitles.map(subtitle => subtitle.text).join(' ');
}


const main = async () => {
	// const videos = await fetchVideos();
  // console.log(videos);
  const subtitles = await getEnglishSubtitles('JDRuVsQTLnw');
  console.log(subtitles);
	// console.log(videos.map(video => ({ title: video.snippet.title, id: video.id.videoId })));
	
	// const subtitles = await getEnglishSubtitles('JDRuVsQTLnw');
	// console.log(subtitles);
}

main();

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
