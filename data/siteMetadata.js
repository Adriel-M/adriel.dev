/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: "Adriel's Thoughts",
  author: 'Adriel Martinez',
  headerTitle: "Adriel's Thoughts",
  description: 'Stuff I think about 🤔',
  language: 'en-us',
  theme: 'light', // system, dark or light
  siteUrl: 'https://adriel.dev',
  siteRepo: 'https://github.com/Adriel-M/adriel.dev',
  socialBanner: '/static/images/twitter-card.png',
  github: 'https://github.com/Adriel-M',
  linkedin: 'https://www.linkedin.com/in/adrielmartinez/',
  locale: 'en-US',
  postSummaryLength: 25,
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      src: '/stats/script.js',
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  newsletter: {
    // // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus
    // // Please add your .env file and modify it according to your selection
    // provider: 'buttondown',
  },
  // comments: {
  //   // If you want to use an analytics provider you have to add it to the
  //   // content security policy in the `next.config.js` file.
  //   // Select a provider and use the environment variables associated to it
  //   // https://vercel.com/docs/environment-variables
  //   provider: 'giscus', // supported providers: giscus, utterances, disqus
  //   giscusConfig: {
  //     // Visit the link below, and follow the steps in the 'configuration' section
  //     // https://giscus.app/
  //     repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  //     repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
  //     category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  //     categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  //     mapping: 'pathname', // supported options: pathname, url, title
  //     reactions: '1', // Emoji reactions: 1 = enable / 0 = disable
  //     // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
  //     metadata: '0',
  //     // theme example: light, dark, dark_dimmed, dark_high_contrast
  //     // transparent_dark, preferred_color_scheme, custom
  //     theme: 'light',
  //     // theme when dark mode
  //     darkTheme: 'transparent_dark',
  //     // If the theme option above is set to 'custom`
  //     // please provide a link below to your custom theme css file.
  //     // example: https://giscus.app/themes/custom_example.css
  //     themeURL: '',
  //     // This corresponds to the `data-lang="en"` in giscus's configurations
  //     lang: 'en',
  //   },
  // },
  search: {
    // provider: 'kbar', // kbar or algolia
    // kbarConfig: {
    //   searchDocumentsPath: 'search.json', // path to load documents to search
    // },
    provider: 'algolia',
    algoliaConfig: {
      // The application ID provided by Algolia
      appId: '2F6FRLRIAP',
      // Public API key: it is safe to commit it
      apiKey: '518da9d8c62bdc48ab2a557b2f91d576',
      indexName: 'adriel',
    },
  },
  emailAddress: process.env.EMAIL_ADDRESS,
  postsInFrontPageCount: 5,
  postsInPostsPageCount: 5,
}

module.exports = siteMetadata
