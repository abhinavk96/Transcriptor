fs = require 'fs'
rimraf = require 'rimraf'
fsTree = require '../fs-tree'

(path) shouldContain (contents) =
  fs.readFileSync(path, "utf-8").should.equal (contents)

describe "fs-tree"
  beforeEach
    rimraf.sync 'public'

  it "makes directories and files from nested properties"
    fsTree! {
      public = {
        scripts = {
          "app.js" = "javascript"
        }
        "index.html" = "<html />"
      }
    }
    "public/scripts/app.js" shouldContain "javascript"
    "public/index.html" shouldContain "<html />"

  it "makes directories and files from flat properties"
    fsTree! {
      "public/scripts/app.js" = "javascript"
      "public/index.html" = "<html />"
    }
    "public/scripts/app.js" shouldContain "javascript"
    "public/index.html" shouldContain "<html />"

  it "accepts a base directory as an optional first argument"
    fsTree! "./public" { "index.html" = "ok!" }
    "./public/index.html" shouldContain "ok!"

  it "overwrites files"
    fsTree! { public = { "index.html" = "overwrite me!" } }
    fsTree! { public = { "index.html" = "overwritten" } }
    "public/index.html" should contain "overwritten"

  it "creates empty directories"
    fsTree! { public = { } }
    fs.existsSync("./public").should.be.true

  it "destroys the tree it created"
    tree = fsTree! "public" { a = { b = "1" }, c = "2" }
    fs.existsSync "./public/a/b".should.be.true
    fs.existsSync "./public/c".should.be.true
    tree.destroy()!
    fs.existsSync "./public".should.be.true
    fs.existsSync "./public/a".should.be.false
    fs.existsSync "./public/c".should.be.false

  context 'with a binary file'
    beforeEach
      fs.writeFile! 'test/binary' 'haha' ^

    afterEach
      rimraf.sync 'test/binary'

    it "can create binary files with a stream"
      tree = fsTree! "public" { a = { b = fs.createReadStream 'test/binary' }, c = "2" }
      buffer = fs.readFile 'public/a/b' 'utf-8' ^!
      buffer.should.eql ('haha')

  it "can create binary files with a Buffer"
    tree = fsTree! "public" { a = { b = new(Buffer [1, 2, 3, 4, 5]) }, c = "2" }
    buffer = fs.readFile 'public/a/b' ^!
    buffer.should.eql (new (Buffer [1, 2, 3, 4, 5]))
