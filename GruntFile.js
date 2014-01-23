'use strict';

module.exports = function(grunt) {
	// Do grunt-related things in here

	// config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			dist: {
				options: {                          
					style: 'expanded'
				},
				files: {
					'www/css/<%= pkg.name %>.css': ['src/scss/main.scss']
				}
			}
		},

		concat: {
			// options: {
			// 	separator: '\n',
			// },
			dist: {
				src: [
					'src/js/intro.js', 
					'src/js/main.js', 
					'src/js/outro.js'
				],
				dest: 'www/js/<%= pkg.name %>.js',
			}
		},

		jshint: {

			//files: ['src/js/**/*.js'],,
			files: ['www/js/<%= pkg.name %>.js'],

			options: {

				undef: true,
				unused: true,

				globals: {
					jQuery: true,
					console: true,
					module: true,
					'document': true,
					$: true,
					'window': true
				}
			}
		},

		jsdoc: {
			dist: {
				//src: ['www/js/<%= pkg.name %>.js'],
				src: ['src/*.js'],
				dest: 'docs'
			}
		}/*,
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> *//*\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		}*/
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsdoc-plugin');

	// define task(s)
	grunt.registerTask('default', ['sass', 'concat', 'jshint']);

	grunt.registerTask('build', [/*'sass', 'jshint', */'concat', 'jsdoc']);

	// A very basic default task.
	// grunt.registerTask('default', 'Log some stuff.', function() {
	// 	grunt.log.write('Logging some stuff...').ok();
	// });
};