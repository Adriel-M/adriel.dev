const siteConfig = {
  title: 'Adriel Martinez',
  author: 'Adriel Martinez',
  description: 'Thinking Emoji 🤔',
  language: 'en-us',
  siteUrl: 'https://adriel.dev',
  github: 'https://github.com/Adriel-M',
  linkedin: 'https://www.linkedin.com/in/adrielmartinez/',
  locale: 'en-US',
  postSummaryLength: 40,
  search: {
    provider: 'algolia',
    algoliaConfig: {
      // The application ID provided by Algolia
      appId: '2F6FRLRIAP',
      // Public API key: it is safe to commit it
      apiKey: '518da9d8c62bdc48ab2a557b2f91d576',
      indexName: 'adriel',
    },
  },
  postsInFrontPageCount: 5,
  postsInPostsPageCount: 5,
  bundledImagesFolderName: 'bundled-images',
}

export default siteConfig
