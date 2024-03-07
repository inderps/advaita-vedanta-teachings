const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');
const { OpenAI } = require('openai');

require('dotenv').config({ path: '.env' });

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const videosFilePath = path.join(__dirname, 'videosData.json');

const fetchAllVideos = async (channelId) => {
  let allVideos = [];
  let nextPageToken = '';

  do {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      maxResults: 50, // Max allowed value
      order: 'date',
      pageToken: nextPageToken,
    });

    allVideos = allVideos.concat(response.data.items);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return allVideos;
};

const fetchVideos = async () => {

  if (fs.existsSync(videosFilePath)) {
    const fileContent = fs.readFileSync(videosFilePath, 'utf8');
    return JSON.parse(fileContent);
  }

  const allVideos = await fetchAllVideos('UCssxbnFeTEDAZcwzL6saHCg');

  fs.writeFileSync(videosFilePath, JSON.stringify(allVideos, null, 2), 'utf8');

  return allVideos;
}

const getEnglishSubtitles = async (videoId) => {
  const subtitles = await getSubtitles({
    videoID: videoId,
    lang: 'en',
  });

  return subtitles.map(subtitle => subtitle.text).join(' ');
}

const writeBlog = async (content, title, videoLink, date) => {
  const message = 'You are a write who converts video transcripts into blog posts. You will be given a transcript and you will have to write a elaborative blog without losing information from transcript and also without adding your own concepts. You will return the answer only as raw markdown nothing else (i will directly paste your response to my blog, so dont write anything else). You will also be provided a title, youtube video link and date to place in the markdown. The format has to be below: \
  +++ \
  author = "ChatGPT Generated" \
  title = "Bhagavad Gita: Day 6" \
  date = "2020-08-05" \
  +++ \
  ### Credits: \
  Learning extracted through subtitles and then articulated by ChatGPT  \
  * [Youtube Video](https://www.youtube.com/watch?v=RMCFMC7DOsA) \
  * [Swami Prabuddhananda](https://www.youtube.com/@upanishadswithswamiprabudd4019/streams) \
';
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: message,
      },
      {
        role: 'user',
        content: `Here is the transcript for the video: ${content}`,
      },
      {
        role: 'user',
        content: `Title: ${title}`,
      },
      {
        role: 'user',
        content: `Video Link: ${videoLink}`,
      },
      {
        role: 'user',
        content: `Date: ${date}`,
      },
    ],
    model: 'gpt-4-turbo-preview',
  });

  const responseText = completion.choices[0].message.content?.trim();

  console.log(responseText);
}


const main = async () => {
	const videos = await fetchVideos();
  console.log(videos);
  // const subtitles = await getEnglishSubtitles('JDRuVsQTLnw');
  // await writeBlog(subtitles, 'Bhagavad Gita: Day 10', 'https://www.youtube.com/watch?v=assaSDjs', '2023-05-05');
  // console.log(subtitles);
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
