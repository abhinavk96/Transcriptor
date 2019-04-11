/* jshint node: true */
'use strict';

const FSTree = require('fs-tree-diff');
const walkSync = require('walk-sync');
const Plugin = require('broccoli-plugin');
const TemplateFile = require('./template-file');
const p = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

class Template extends Plugin {
  constructor(inputTree, templatePath, variablesFn) {
    super([inputTree], {
      persistentOutput: true
    });

    this.variablesFn = variablesFn;
    this._templatePath = templatePath;
    this._currentTemplate = TemplateFile.fromPath(this._templatePath);
    this._previousInput = FSTree.fromPaths([]);
  }

  build() {
    let inputPath = this.inputPaths[0];
    let outputPath = this.outputPath;
    let proposedTemplate = TemplateFile.fromPath(this._templatePath);

    if (!proposedTemplate.equal(this._currentTemplate)) {
      this._currentTemplate = proposedTemplate;
      rimraf.sync(this.outputPath);
      fs.mkdirSync(this.outputPath);
      this._previousInput = FSTree.fromPaths([]);
    }

    let currentInput = FSTree.fromEntries(walkSync.entries(inputPath));

    let changes = this._previousInput.calculatePatch(currentInput);
    let hasChanges = changes.length > 0;

    changes.forEach(change => {
      let operation = change[0];
      let file = change[1];
      let entry = change[2];
      let inputFilePath = `${inputPath}/${file}`;
      let outputFilePath = `${outputPath}/${file}`;

      switch (operation) {
        case 'change':
        case 'create':
          fs.writeFileSync(outputFilePath, this._processString(fs.readFileSync(inputFilePath, 'UTF8'), file));
          break;
        case 'unlink': {
          fs.unlinkSync(outputFilePath);
          break;
        }
        case 'rmdir': {
          fs.rmdirSync(outputFilePath);
          break;
        }
        case 'mkdir': {
          fs.mkdirSync(outputFilePath);
          break;
        }
        default: {
          throw new TypeError(`Unknown operation: ${operation} on ${file}`)
        }
      }
    });

    this._previousInput = currentInput;
  }

  _processString(file, relativePath) {
    return this._currentTemplate.template(this.variablesFn(file, relativePath));
  }
}

Template.prototype.extensions = ['js'];
module.exports = Template;

