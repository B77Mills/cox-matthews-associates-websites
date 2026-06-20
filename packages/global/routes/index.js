const htmlSitemap = require('@mindful-web/marko-web-html-sitemap/routes');
const defaultRoutes = require('@mindful-web/marko-web-theme-monorail/routes');
const taxonomy = require('@mindful-web/marko-web-theme-monorail/routes/taxonomy');
const magazine = require('@mindful-web/marko-web-theme-monorail-magazine/routes');
const search = require('@mindful-web/marko-web-theme-monorail/routes/search');
const getAdvertisingPostAsNativeStory = require('@mindful-web/mindful/marko-web/middleware/get-advertising-post-as-native-story');

const magazineIndex = require('../templates/magazine/index');
const magazineIssue = require('../templates/magazine/issue');
const magazinePublication = require('../templates/magazine/publication');
const advertisingPostTemplate = require('../templates/content/advertising-post');
const dynamicPage = require('./dynamic-page');
const feed = require('./feed');
const printContent = require('./print-content');
const publicFiles = require('./public-files');
const redirects = require('./redirects');

module.exports = (app, siteConfig) => {
  // HTML Sitemap
  htmlSitemap(app);

  // Feed
  feed(app);

  // Magazine
  magazine(app, {
    index: magazineIndex,
    issue: magazineIssue,
    publication: magazinePublication,
  });

  // NativeX (Story rendering)
  getAdvertisingPostAsNativeStory(app, {
    route: '/sponsored/:section/:slug/:id',
    tenant: 'diverse',
    template: advertisingPostTemplate,
  });

  // Shared Print Content
  printContent(app);

  // Shared Public Files (e.g. ads.txt)
  publicFiles(app);

  // Redirects
  redirects(app);

  // Theme-level default routes (e.g. email-preview, render-block)
  defaultRoutes(app);

  // Search routes
  search(app, siteConfig);

  // Taxonomy pages (for handling redirects from old WP sites)
  taxonomy(app);

  // Dynamic Pages
  dynamicPage(app);
};
