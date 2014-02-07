var path = require('path');

/**
 * automatically add ngdoc directives
 */
var processContent = function(content, srcpath) {
  return '@ngdoc overview\n@name ' + path.basename(path.dirname(srcpath)) + '\n@description\n\n' + content;
};

/**
 * prepare file copy string from module name
 */
var copyRules = function(name) {
  return {
    src: 'node_modules/' + name + '/README.md',
    dest: 'results/repositories/' + name + '.ngdoc'
  };
};

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['Gruntfile.js', 'index.js', 'example/**/*.js', 'test/**/*.js']
      },
      ci: {
        options: {
          force: true,
          reporter: 'checkstyle',
          reporterOutput: 'results/jshint-result.xml'
        },
        src: '<%= jshint.all.src %>'
      }
    },
    simplemocha: {
      options: {
        globals: ['should'],
        ignoreLeaks: false,
        timeout: 5000,
        ui: 'bdd'
      },
      all: {
        options: {
          reporter: 'spec'
        },
        src: [
          'test/**/*.js',
          'node_modules/kabam-kernel/test/**/*.js',
          'node_modules/kabam-plugin-hogan/test/**/*.js',
          'node_modules/kabam-plugin-private-message/test/**/*.js',
          'node_modules/kabam-plugin-notify-email/test/**/*.js',
          'node_modules/kabam-plugin-my-profile/test/**/*.js',
          'node_modules/kabam-plugin-welcome/test/**/*.js',
          'node_modules/kabam-plugin-rest/test/**/*.js',
          'node_modules/kabam-plugin-spine/test/**/*.js'
        ]
      },
      ci: {
        options: {
          reporter: 'tap'
        },
        src: '<%= simplemocha.all.src %>'
      }
    },
    clean: {
      docs: [ 'results/docs' ]
    },
    copy: {
      options: {
        processContent: processContent
      },
      readme: {
        files: [
          { src: 'README.md', dest: 'results/index.ngdoc' },
          copyRules('kabam-kernel'),
          copyRules('kabam-plugin-hogan'),
          copyRules('kabam-plugin-my-profile'),
          copyRules('kabam-plugin-notify-email'),
          copyRules('kabam-plugin-private-message'),
          copyRules('kabam-plugin-rest'),
          copyRules('kabam-plugin-spine'),
          copyRules('kabam-plugin-users')
        ]
      }
    },
    ngdocs: {
      options: {
        dest: 'results/docs',
        title: 'Kabam',
        startPage: '/api'
      },
      api: {
        src: [
          'results/index.ngdoc',
          'node_modules/kabam-kernel/bin/*.js',
          'node_modules/kabam-kernel/example/*.js',
          'node_modules/kabam-kernel/lib/*.js',
          'node_modules/kabam-kernel/models/userModel.js',
          'node_modules/kabam-kernel/index.js',
          'node_modules/kabam-kernel/example/plugin.example.js',
          'node_modules/kabam-plugin-hogan/index.js',
          'node_modules/kabam-plugin-my-profile/index.js',
          'node_modules/kabam-plugin-notify-email/index.js',
          'node_modules/kabam-plugin-private-message/index.js',
          'node_modules/kabam-plugin-rest/index.js',
          'node_modules/kabam-plugin-spine/index.js',
          'node_modules/kabam-plugin-spine/welcome.js',
          'node_modules/kabam-plugin-users/index.js'
        ],
        title: 'Kabam API with plugins'
      },
      repositories: {
        src: 'results/repositories/*.ngdoc',
        title: 'Repositories'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-ngdocs');

  // Tasks
  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('testci', ['simplemocha:ci']);
  grunt.registerTask('docs', ['clean:docs', 'copy:readme', 'ngdocs']);
  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);

};
