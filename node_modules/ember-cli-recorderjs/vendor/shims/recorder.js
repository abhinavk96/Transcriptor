(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['Recorder'],
      __esModule: true,
    };
  }

  define('Recorder', [], vendorModule);
})();
