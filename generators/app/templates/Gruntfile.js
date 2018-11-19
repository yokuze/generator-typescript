'use strict';

<% if (isBrowser) { _%>
const path = require('path');

function getEnvironment(grunt) {
   const TYPES = [ 'prd', 'dev' ],
         env = grunt.option('env');

   return TYPES.indexOf(env) === -1 ? 'dev' : env;
}
<% } _%>
module.exports = (grunt) => {
   <%_ if (isBrowser) { _%>
   const ENVIRONMENT = getEnvironment(grunt);
   <%_ } _%>
   let config;

   config = {
      js: {
         all: [
            'Gruntfile.js',
            './src/**/*.js',
            './tests/**/*.js',
         ],
      },
      ts: {
         src: './src/**/*.ts',
         all: [
            './src/**/*.ts',
            './tests/**/*.ts',
         ],
         configs: {
            standards: './src/tsconfig.json',
            <%_ if (isLibrary) { _%>
            commonjs: './src/tsconfig.commonjs.json',
            esm: './src/tsconfig.esm.json',
            types: './src/tsconfig.types.json',
            <%_ } _%>
         },
      },
   };

   grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         target: [ ...config.js.all, ...config.ts.all ],
      },

      ts: {
         standards: {
            tsconfig: {
               tsconfig: config.ts.configs.standards,
               passThrough: true,
            },
         },
         <%_ if (isLibrary) { _%>
         types: {
            tsconfig: {
               tsconfig: config.ts.configs.types,
               passThrough: true,
            },
         },
         esm: {
            tsconfig: {
               tsconfig: config.ts.configs.esm,
               passThrough: true,
            },
         },
         commonjs: {
            tsconfig: {
               tsconfig: config.ts.configs.commonjs,
               passThrough: true,
            },
         },
         <%_ } _%>
      },
      <%_ if (isBrowser) { %>
      webpack: {
         umd: {
            entry: './src/index.ts',
            devtool: ENVIRONMENT === 'dev' ? 'eval-source-map' : false,
            output: {
               <%_ if (isLibrary) { _%>
               // The name of the global variable that will be exported when the UMD
               // bundle is executed
               library: '<%= globalVarName %>',
               libraryTarget: 'umd',
               <%_ } _%>
               // Use `this` instead of `window` as the global variable that the UMD
               // bundle sets the library to when executed in a node.js context.
               //
               // Ironically, if we don't set this configuration value to `this`, the UMD
               // bundle will throw a `ReferenceError: "window" is undefined` error when
               // executed in node.js.
               globalObject: 'this',
               path: path.resolve(__dirname, 'dist'),
               filename: '<%%= pkg.name %%>.min.js',
            },
            // Let wepback recognize both javascript and typescript files
            resolve: {
               extensions: [ '.js', '.ts' ],
            },
            // This enables tree shaking by telling webpack that no files in our project
            // contain side effects, allowing it to remove any code that is not imported.
            // If we do eventually have a file that has side effects, we'd add the paths
            // to those files here.
            optimization: {
               sideEffects: false,
            },
            module: {
               rules: [
                  // all files with a `.ts` extension will be handled by `ts-loader`
                  {
                     test: /\.ts$/,
                     loader: 'ts-loader',
                     options: {
                        configFile: 'src/tsconfig.commonjs.json',
                     },
                  },
               ],
            },
            mode: ENVIRONMENT === 'prd' ? 'production' : 'development',
         },
      },
      <%_ } _%>
      <%_ if (isBrowser && isLibrary) { %>
      watch: {
         ts: {
            files: [ config.ts.src ],
            tasks: [ 'build' ],
         },
      },
      <%_ } else if (isLibrary) { %>
      watch: {
         ts: {
            files: [ config.ts.src ],
            tasks: [ 'build-types' ],
         },
      },
      <%_ } %>
   });

   grunt.loadNpmTasks('grunt-eslint');
   grunt.loadNpmTasks('grunt-ts');
   <%_ if (isLibrary) { _%>
   grunt.loadNpmTasks('grunt-contrib-watch');
   <%_ } _%>
   <%_ if (isBrowser) { _%>
   grunt.loadNpmTasks('grunt-webpack');
   <%_ } _%>

   grunt.registerTask('standards', [ 'eslint', 'ts:standards' ]);
   grunt.registerTask('default', [ 'standards' ]);
   <%_ if (isLibrary) { _%>

   grunt.registerTask('build-types', 'ts:types');
   grunt.registerTask('build-esm', 'ts:esm');
   grunt.registerTask('build-commonjs', 'ts:commonjs');
   grunt.registerTask('build-ts-outputs', [ 'build-types', 'build-esm', 'build-commonjs' ]);
   <%_ } _%>
   <%_ if (isBrowser) { %>
   grunt.registerTask('build-umd', 'webpack:umd');
   <%_ } _%>
   <%_ if (isLibrary && isBrowser) { %>
   grunt.registerTask('build', [ 'build-ts-outputs', 'build-umd' ]);
   <%_ } else if (isLibrary) { _%>
   grunt.registerTask('build', [ 'build-ts-outputs' ]);
   <%_ } _%>
   <%_ if (isLibrary) { %>
   grunt.registerTask('develop', [ 'build', 'watch' ]);
   <%_ } %>
};