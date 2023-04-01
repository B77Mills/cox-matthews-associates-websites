const { withWebsiteSection } = require('@parameter1/base-cms-marko-web/middleware');
const { asyncRoute, cleanPath } = require('@parameter1/base-cms-utils');
const queryFragment = require('@parameter1/base-cms-marko-web-theme-monorail/graphql/fragments/website-section-page');
const topWomen = require('../../templates/website-section/awards-honors/top-women');

module.exports = (app) => {
  app.get('/:alias(awards-honors/top-women)', asyncRoute(async (req, res) => {
    const { alias } = req.params;
    res.redirect(301, `/${cleanPath(alias)}/2023`);
  }));

  app.get('/:alias(awards-honors/top-women/\\d{4})', withWebsiteSection({
    template: topWomen,
    queryFragment,
  }));
};
