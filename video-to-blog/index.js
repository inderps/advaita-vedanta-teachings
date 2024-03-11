const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');
const { OpenAI } = require('openai');
const { bhagavadGitaVideos } = require('./topics');

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

const writeBlog = async (message, content, title, videoLink, date) => {
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

  return responseText;
}

const fetchSubtitlesAndWriteBlog = async (video, message) => {
  console.log(`Fetching video: ${video.snippet.title}`);

  try {
    const subtitles = await getEnglishSubtitles(video.id.videoId);
    const blog = await writeBlog(message, subtitles, video.snippet.title, `https://www.youtube.com/watch?v=${video.id.videoId}`, video.snippet.publishedAt);
    const blogPath = path.join(__dirname, `blogs/${video.snippet.title}.md`);
    fs.writeFileSync(blogPath, blog, 'utf8');

  } catch (error) {
    console.error(`Error fetching video: ${video.snippet.title}`, error);
  }
}


const main = async () => {
	const videos = await fetchVideos();

  let count = 0;
  for (const video of videos.reverse()) {
    if (!video.snippet.title.toLowerCase().includes(bhagavadGitaVideos.comparisonString)) {
      continue;
    }

    // SHRIMAD BHAGAVAD GITA - DAY 60
    const words = video.snippet.title.split(' ');
    const day = parseInt(words[words.length - 1]);

    if (day < 80) {
      continue;
    }

    await fetchSubtitlesAndWriteBlog(video, bhagavadGitaVideos.message);

    count++;

    if (count === 10) {
      break;
    }
  }

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
