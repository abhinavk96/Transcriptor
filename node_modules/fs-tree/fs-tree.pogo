fs = require 'fs'
mkdirp = require 'mkdirp'
rimraf = require 'rimraf'
path = require 'path'

module.exports (args, ...) =
  if (args.length == 1)
    root = "."
    tree = args.0
  else
    root := args.0
    tree := args.1

  entries = flatten (tree, "#(root)/")
  write (entries)!

write (entries, done) =
  writeFile (filePath, written) =
    mkdirp (path.dirname(filePath)) ^!
    entry = entries.files.(filePath)

    if (entry @and entry.pipe :: Function)
      promise! @(result, error)
        entry.pipe (fs.createWriteStream (filePath))
        entry.on 'end' (result)
        entry.on 'error' (error)
    else
      fs.writeFile (filePath, entry, ^)!

  [dir <- entries.dirs, mkdirp(dir) ^!]
  [file <- Object.keys(entries.files), writeFile!(file)]

  destroyable (entries)

destroyable (entries) =
  {
    destroy (done) =
      [file <- Object.keys(entries.files), fs.unlink(file) ^!]
      [dir <- entries.dirs, rimraf(dir, ^)!]
  }

flatten (obj, prefix) =
  dirs = []
  files = {}

  for each @(key) in (Object.keys (obj))
    objectPath = prefix + key
    if (obj.(key).constructor == {}.constructor)
      dirs.push(objectPath)
      children = flatten (obj.(key), "#(objectPath)/")
      dirs := dirs.concat(children.dirs)
      merge (children.files) into (files)
    else
      files.(objectPath) = obj.(key)

  { dirs = dirs, files = files }

merge (obj) into (other) =
  for @(key) in (obj)
    other.(key) = obj.(key)
