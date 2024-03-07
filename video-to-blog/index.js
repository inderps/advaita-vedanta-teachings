require('dotenv').config({ path: '.env' });

const { google, youtube_v3 } = require('googleapis');

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY,
});


