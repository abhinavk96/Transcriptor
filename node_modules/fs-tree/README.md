# fs-tree

Builds a hierarchy of directories and files as a single asynchronous operation.

### Install

    npm install fs-tree

### Usage

    fsTree = require 'fs-tree'

    fsTree! {
      ideas = {
        colours = {
          "green.txt" = "apples, pears"
          "white.txt" = "snow"
        }
      }
    }

...creates these directories and files:

    ./ideas/
    ./ideas/colours/
    ./ideas/colours/green.txt  (apples, pears)
    ./ideas/colours/white.txt  (snow)

Each entry can be a string, a `Buffer` or a node stream (anything that has a `.pipe()` method).

### The root directory

By default the hierarchy is created in the current working directory.

Make a hierarchy under another directory like this:

    fsTree! '/your/root/directory' {
      subdir = {
        file = "contents"
      }
    }

### Deleting the files you created

Retain a reference to the original tree to destroy it later:

    tree = fsTree! {
      subdir = {
        file = "contents"
      }
    }

    // then later...
    tree.destroy()!

Destroying the tree is equivalent to

    rm -rf <root directory>

### JavaScript?

The examples above are in [PogoScript](http://pogoscript.org) because it's pretty. There is no dependency on PogoScript, so you can use pure JavaScript if you prefer. It returns a promise:

    var fsTree = require('fs-tree');

    fsTree({
      ideas: {
        colours: {
          "green.txt": "apples, pears",
          "white.txt": "snow"
        }
      }
    }).then(function() {
      console.log("Tree created!");
    }, function (error) {
      console.log("uh oh", error);
    });

### License

BSD
