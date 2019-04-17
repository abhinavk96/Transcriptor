# Ember WeakMap

This addon is a polyfill for the [Ember.WeakMap RFC](https://github.com/emberjs/rfcs/blob/master/text/0091-weakmap.md).

A WeakMap provides a mechanism for storing and retrieving private state. The WeakMap
itself does not retain a reference to the state, allowing the state to be reclaimed
when the key is reclaimed.

A traditional WeakMap (and the one that will be part of the ES2015 language) allows for
weakness from key -> map, and also from map -> key. This allows either the Map,
or the key being reclaimed to also release the state.

Unfortunately, this bi-directional weakness is problematic to polyfill.
Luckily, uni-directional weakness, in either direction, "just works". A polyfill
must just choose a direction.

Note: Just like ES2015 WeakMap, only non null Objects can be used as keys

## Installation

```shell
ember install ember-weakmap
```

## Usage

```js
import Ember from 'ember';

const myWeakMap = new Ember.WeakMap();
```

### Set

```js
/*
 * @method set
 * @param key {Object}
 * @param value {Any}
 * @return {Any} stored value
 */
 
const emailObj = { id: 1, subject: 'Hello World' };

myWeakMap.set(emailObj, {read: true});
```

The key **must be an object**.

### Get

```js
/*
 * @method get
 * @param key {Object}
 * @return {*} stored value
*/

myWeakMap.get(emailObj); // => { read: true }
myWeakMap.get(someObjThatWasNotSet); // => undefined
```

### Has

```js
/*
 * @method has
 * @param key {Object}
 * @return {Boolean} if the key exists
*/

myWeakMap.has(emailObj); // => true
myWeakMap.has(someObjThatWasNotSet); // => false
```

### Delete

```js
/*
 * @method delete
 * @param key {Object}
 */

myWeakMap.delete(emailObj);
myWeakMap.get(emailObj); // => undefined
myWeakMap.has(emailObj); // false
```
