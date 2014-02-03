'use strict';

module.exports = function(grunt) {
	
	var jsFiles = [
		'src/js/raf.polyfill.js',
		'src/js/AssetManager.js',
		'src/js/ObjectManager.js',
		'src/js/Game.js' 
	];
	
	var jsConcatFiles = jsFiles.concat();
	jsConcatFiles.unshift('src/js/intro.js');
	jsConcatFiles.push('src/js/outro.js');


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
				src: jsConcatFiles,
				dest: 'www/js/<%= pkg.name %>.js',
			}
		},

		jshint: {

			files: jsFiles,
			//files: ['www/js/<%= pkg.name %>.js'],

			options: {

				undef: true,
				unused: true,

				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true,
					$: true,
					window: true
				}
			}
		}

	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// define task(s)
	grunt.registerTask('default', ['sass', 'concat', 'jshint']);

};