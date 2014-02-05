'use strict';

module.exports = function(grunt) {
	
	var jsFiles = [
		'src/js/polyfills/raf.polyfill.js',
		'src/js/polyfills/hand-1.3.5.js',
		'src/js/gfw/GFW.js',
		'src/js/gfw/AssetManager.js',
		'src/js/gfw/ObjectManager.js',
		'src/js/gfw/Object.js',
		'src/js/gfw/Text.js',
		'src/js/gfw/Sprite.js',
		'src/js/Game.js' 
	];
	
	var jsConcatFiles = jsFiles.concat();
	jsConcatFiles.unshift('src/js/tpl/intro.js');
	jsConcatFiles.push('src/js/tpl/outro.js');


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
			//		separator: '\n',
			// },
			dist: {
				src: jsConcatFiles,
				dest: 'www/js/<%= pkg.name %>.js',
			}
		},

		jshint: {

			//files: jsFiles,
			files: ['www/js/<%= pkg.name %>.js'],

			options: {
				undef: true,
				unused: true,
				loopfunc: true,
				browser: true,
				devel: true,
				jquery: true
			}
		},

		jsdoc : {
			dist : {
				src: ['src/js/gfw/*.js', 'README.md'], 
				//src: ['www/js/<%= pkg.name %>.js', 'README.md'],
				options: {
					destination: 'dist/docs',
					//template: '',
					private: true
				}
			}
		}

	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsdoc');

	// define task(s)
	grunt.registerTask('default', ['sass', 'concat']);
	grunt.registerTask('lint', ['sass', 'concat', 'jshint']);
	grunt.registerTask('dist', ['sass', 'concat', 'jshint', 'jsdoc']);

};