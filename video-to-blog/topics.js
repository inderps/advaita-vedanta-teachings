const bhagavadGitaVideos = {
  message: 'You are a writer who converts video transcripts into blog posts. You will be given a transcript and you will have to write a elaborative blog without losing information from transcript and also without adding your own concepts. Make sure to cover every line of transcript into the blog post. Dont worry about blog length, you have to add everything that was present in transcript. You can use subheadings the divide it into multiple sections. The blog post should be 800 words minimum if possible. Dont invent and add your statements. Also the blog post should be written in a way such that the video speaker wrote it. So no need to mention about video in the blog post. You will return the answer only as raw markdown nothing else (i will directly paste your response to my blog, so dont write anything else). You will also be provided a title, youtube video link and date to place in the markdown. The format has to be below: \
  +++ \
  author = "ChatGPT Generated" \
  title = "Bhagavad Gita: Day 6" \
  date = "2020-08-05" \
  +++ \
  ### (Please remove this line and start writing your blog from here. After your blog, do mention the credits below) \
  ### Credits: \
  Learning extracted through subtitles and then articulated by ChatGPT  \
  * [Youtube Video](https://www.youtube.com/watch?v=RMCFMC7DOsA) \
  * [Swami Prabuddhananda](https://www.youtube.com/@upanishadswithswamiprabudd4019/streams) \
',
 comparisonString: 'bhagavad gita',
}

module.exports = {
  bhagavadGitaVideos,
};
