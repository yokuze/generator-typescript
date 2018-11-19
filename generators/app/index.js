'use strict';

const Generator = require('yeoman-generator'),
      prompts = require('./prompts'),
      chalk = require('chalk'),
      yosay = require('yosay'),
      _ = require('underscore');

module.exports = class extends Generator {
   prompting() {
      this.log(yosay(`Let's generate a ${ chalk.red('TypeScript')} project!`));

      return this.prompt(prompts).then(answers => {
         this.config = _.extend({}, answers);
      });
   }

   configuring() {
      // eslint-disable-next-line
      let author = this.spawnCommandSync('git', [ 'config', '--global', 'user.name' ], { stdio: 'pipe' }).stdout;

      this.config.author = author.toString('utf8').trim();
      this.config.currentYear = (new Date()).getFullYear();
      this.config.isBrowser = !this.config.isBackEnd;
   }

   writing() {
      this._generateProjectConfigFiles();
      this._generateSrcFolder();
      this._generateTests();
      this._generateGruntfile();
      this._addTsConfigFiles();
   }

   install() {
      this.npmInstall();
   }

   _generateProjectConfigFiles() {
      this._generatePackageJSON();
      this._copyTemplate([ '.eslintrc.json' ]);
      if (this.config.isOpenSource) {
         this._copyTemplate([ 'LICENSE' ]);
      }
   }

   _generatePackageJSON() {
      this._copyTemplate([ 'package.json' ]);
   }

   _generateSrcFolder() {
      this._copyTemplate([ 'src', 'index.ts' ]);
      this._copyTemplate([ 'src', 'Example.ts' ]);
   }

   _generateTests() {
      this._copyTemplate([ 'tests', 'index.test.ts' ]);
      this._copyTemplate([ 'tests', 'setup', 'before.ts' ]);
      this._copyTemplate([ 'tests', '.eslintrc.json' ]);
      this._copyTemplate([ '.mocha.opts' ]);
      this._copyTemplate([ '.nycrc.json' ]);
   }

   _generateGruntfile() {
      this._copyTemplate([ 'Gruntfile.js' ]);
   }

   _addTsConfigFiles() {
      let configFiles = [];

      if (this.config.isLibrary) {
         configFiles = [
            'tsconfig.commonjs.json',
            'tsconfig.esm.json',
            'tsconfig.types.json',
         ];
      }
      configFiles.push('tsconfig.json');

      _.forEach(configFiles, (fileName) => {
         this._copyTemplate([ 'src', fileName ]);
      });

      // Add tsconfig for tests
      this._copyTemplate([ 'tests', 'tsconfig.json' ]);
   }

   _copyTemplate(pathParts) {
      this.fs.copyTpl(
         this.templatePath.apply(this, pathParts),
         this.destinationPath.apply(this, pathParts),
         this.config
      );
   }
};