const newrelic = require('newrelic');
const { startServer } = require('@mindful-web/marko-web');
const { set, get, getAsObject } = require('@mindful-web/object-path');
const omedaIdentityX = require('@mindful-web/marko-web-omeda-identity-x');
const htmlSitemapPagination = require('@mindful-web/marko-web-html-sitemap/middleware/paginated');
const contentGating = require('@mindful-web/marko-web-theme-monorail/middleware/content-gating');
const newsletterModalState = require('@mindful-web/marko-web-theme-monorail/middleware/newsletter-modal-state');
const MindfulMarkoWebService = require('@mindful-web/mindful/marko-web/middleware/service');
const paginated = require('@mindful-web/marko-web/middleware/paginated');

const document = require('./components/document');
const components = require('./components');
const fragments = require('./fragments');
const sharedRoutes = require('./routes');
const redirectHandler = require('./redirect-handler');
const oembedHandler = require('./oembed-handler');
const idxRouteTemplates = require('./templates/user');
const idxNavItems = require('./config/identity-x-nav');

const routes = (siteRoutes, siteConfig) => (app) => {
  // Shared/global routes (all sites)
  sharedRoutes(app, siteConfig);
  // Load site routes
  siteRoutes(app);
};

module.exports = (options = {}) => {
  const { onStart } = options;
  return startServer({
    ...options,
    routes: routes(options.routes, options.siteConfig),
    document: options.document || document,
    components: options.components || components,
    fragments: options.fragments || fragments,
    onStart: async (app) => {
      if (typeof onStart === 'function') await onStart(app);
      app.set('trust proxy', 'loopback, linklocal, uniquelocal');

      // Use paginated middleware
      app.use(paginated());

      // i18n
      const i18n = (v) => v;
      set(app.locals, 'i18n', options.i18n || i18n);

      // Use paginated middleware
      app.use(htmlSitemapPagination());

      const { namespace } = getAsObject(options, 'siteConfig.mindful');
      app.use(MindfulMarkoWebService({ namespace }));

      // Use newsletterModalState middleware
      app.use(newsletterModalState());

      // Use Omeda middleware
      const omedaIdentityXConfig = getAsObject(options, 'siteConfig.omedaIdentityX');
      set(app.locals, 'omedaConfig', getAsObject(options, 'siteConfig.omeda'));
      omedaIdentityX(app, { ...omedaIdentityXConfig, idxRouteTemplates });
      idxNavItems({ site: app.locals.site });

      // Install custom content gating middleware
      contentGating(app);

      // Setup GAM.
      const gamConfig = get(options, 'siteConfig.gam');
      set(app.locals, 'GAM', gamConfig);

      // Setup NativeX.
      const nativeXConfig = get(options, 'siteConfig.nativeX');
      set(app.locals, 'nativeX', nativeXConfig);
    },
    onAsyncBlockError: (e) => newrelic.noticeError(e),

    redirectHandler,

    embeddedMediaHandlers: {
      oembed: oembedHandler,
    },
  });
};
