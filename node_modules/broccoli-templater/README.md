# broccoli-templater
[![Build Status](https://travis-ci.org/stefanpenner/broccoli-templater.svg?branch=master)](https://travis-ci.org/stefanpenner/broccoli-templater)

broccoli plugin that combines lodash.template and broccoli for fun stuff.

## example:

```js
var templatedTree = new Template(untemplatedTree, pathToTemplate,
  function buildVariables(content, relativePath) {
    return {
      moduleBody: content
    };
});
```
