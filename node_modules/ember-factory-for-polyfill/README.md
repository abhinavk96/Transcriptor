# ember-factory-for-polyfill

This addon provides a best effort polyfill for the `ember-factory-for` feature added in Ember 2.12.

Please review [emberjs/rfcs#150](https://github.com/emberjs/rfcs/blob/master/text/0150-factory-for.md) for more details.

## Installation

```sh
ember install ember-factory-for-polyfill
```

## Usage

```javascript
import Ember from 'ember';

export default Ember.Service.extend({
  someMethod() {
    let owner = Ember.getOwner(this);
    let ValidatorFactory = owner.factoryFor('validator:post');
    let validator = ValidatorFactory.create();
  }
});
```

## Migration

### Applications

After you upgrade your application to Ember 2.12, you should remove `ember-factory-for-polyfill` from
your `package.json`.

### Addons

Addons generally support many different Ember versions, so leaving `ember-factory-for-polyfill` in
place for consumers of your addon is perfectly normal.  When the addon no longer supports Ember
versions older than 2.12, we recommend removing `ember-factory-for-polyfill` from your `package.json`
and doing a major version bump.

## Compatibility

This addon is tested against quite a few past Ember versions. Check `config/ember-try.js` for the current list, but
the list of supported Ember versions at the time of authoring was:

* 2.3
* 2.4
* 2.8
* 2.12
* 2.16 (canary at the time)

For compatibility with older Ember versions prior to 2.3, please use [ember-getowner-polyfill](https://github.com/rwjblue/ember-getowner-polyfill) instead.

## Addon Maintenance

### Installation

* `git clone <repository-url>` this repository
* `cd ember-factory-for-polyfill`
* `npm install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
