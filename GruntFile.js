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
					'www/css/<%= pkg.name %>-<%= pkg.version %>.css': ['src/scss/main.scss']
				}
			}
		},

		concat: {
			// options: {
			// 	separator: '\n',
			// },
			dist: {
				src: ['src/js/intro.js', 'src/js/base.js', 'src/js/outro.js'],
				dest: 'www/js/<%= pkg.name %>.js',
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

	// define task(s)
	grunt.registerTask('default', ['sass', 'concat']);

	// A very basic default task.
	// grunt.registerTask('default', 'Log some stuff.', function() {
	// 	grunt.log.write('Logging some stuff...').ok();
	// });
};