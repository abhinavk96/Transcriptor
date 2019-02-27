'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'transcriptor',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      apiHost      : process.env.API_HOST || 'http://127.0.0.1:5000',

    },
    fastboot: {
      hostWhitelist: [/.+/]
    }
  };
  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:jwt'
  };
  ENV['ember-simple-auth-token'] = {
    refreshAccessTokens      : false,
    serverTokenEndpoint      : `${ENV.APP.apiHost}/auth`,
    identificationField      : 'username',
    passwordField            : 'password',
    tokenPropertyName        : 'access_token',
    refreshTokenPropertyName : 'refresh_token',
    authorizationPrefix      : 'JWT ',
    authorizationHeaderName  : 'Authorization',
    headers                  : {}
  };
  ENV.contentSecurityPolicy = { 'default-src': ['*', '', 'data:', 'blob:', '\'unsafe-inline\'', '\'unsafe-eval\''], 'script-src': ['*', '\'unsafe-inline\'', '\'unsafe-eval\''], 'connect-src': ['*', 'http://127.0.0.1:5000', '\'unsafe-inline\''], 'img-src': ['*', 'data:', 'blob:', '\'unsafe-inline\''], 'frame-src': ['*'], 'style-src': ['*', 'data:', 'blob:', '\'unsafe-inline\''], 'font-src': ['*', 'data:', 'blob:', '\'unsafe-inline\''] };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
