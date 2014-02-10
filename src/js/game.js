    /**
     * Game Main class
     * @class Creates main game object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    var Game = function() {
        /** @lends Game */

        // variables
        var _this = this;
            
        // properties
        this._$container = $('#game-container');
        this._dwidth = 1024;
        this._dheight = 768;
        this._width = this._dwidth;
        this._height = this._dheight;
        this._scaleFactor = 1;
  
        this._fps = 60;
        this._loopCount = 0;
        this._reqAnimId = null;
        this._lastFrame = new Date().getTime();

        // game states
        this._gameStates = {
            'INIT': 0,
            'LOADING': 1,
            'MAINMENU': 2,
            'PLAYING': 3
        };

        // set scale(factor)
        this.setScale();

        // global managers
        window.AssetManager = new GFW.AssetManager();
        window.ObjectManager = new GFW.ObjectManager();

        // ingame screens
        this._screens = {};

        // define splash screen
        this._screens.splash = new GFW.Screen('splash', _this._$container).setAlpha(0);

        // set event handlers
        $(window).on({
            resize: GFW.debounce(function() {
                _this.resize();
            })
        });

        this.init();

        return this;

    };

    $.extend(Game.prototype, /** @lends Game */ {

        init: function() {

            var _this = this;

            this._gameState = this._gameStates.INIT;

            // add splash screen assets
            AssetManager.add('splash', {
                path: 'assets/img/bg-splash.png',
                type: 'image'
            });

            AssetManager.onComplete = function() {



                // add objects to splash screen
                var splash = new GFW.Sprite(AssetManager.get('splash').path, 1024, 768, 0, 0, 0, 0, 0);
                splash.resize(_this._scaleFactor);
                
                var copy = new GFW.Text('(c)2014 OneManClan. Created by Rocco Janse, roccojanse@outlook.com', 'arial', 14, 'rgb(255, 255, 255)', 0, Math.round((_this._height*_this._scaleFactor)-25), _this._width, 25);
                copy.setCentered();

                _this._screens.splash.add(splash);
                _this._screens.splash.add(copy);

                _this._screens.splash.fadeIn();

                var t = new GFW.Timer();
                t.onTick = function() {
                    var dt = t.getDelta();
                    if (dt > 3) {
                        t.stop();
                        _this._screens.splash.fadeOut();
                    }
                };
                t.start();

                _this.start();

            };

            AssetManager.onProgress = function(t, l, p) {
                console.log(t, l, p);
            };

            AssetManager.load();

        },

        /**
         * resizes and sets game proportions
         * @return void
         */
        setScale: function() {

            var _this = this,
                _winWidth = $(window).width();

            // set proportions and scaling
            this._scaleFactor = (_winWidth < this._dwidth) ? Math.round((_winWidth/this._dwidth)*100)/100 : 1;
            this._width = Math.round(this._dwidth*this._scaleFactor);
            this._height = Math.round(this._dheight*this._scaleFactor);
            this._$container.width(this._width);
            this._$container.height(this._height);

        },

        /**
         * Main game logic
         * @return void
         */
        mainLoop: function() {
            
            
            var tm = new Date().getTime(),
                dt = (tm - this._lastFrame) / 1000;
                
            this._loopCount += 1;
            this._reqAnimId = window.requestAnimationFrame(this.mainLoop.bind(this));
            //if(dt > 1/15) { dt = 1/15; }
            
            if (this._gameState === this._gameStates.INIT) {
                this._screens.splash.update(dt);
            }

            var objects = ObjectManager.getObjects();
            for (var i = 0; i < objects.length; i++) {
                objects[i].update();
            }

            //this.physics.step(dt);
            //this.renderer.drawFrame(dt);
            this._lastFrame = tm;

            if (this._loopCount > 400) {
                console.log('stopped gameloop.');
                this.stop();
            }
        },

        /**
         * Start game loop
         * @return void
         */
        start: function() {

            this.mainLoop();
        },

        /**
         * Stop game loop
         * @param {Integer} reqAnimId Id of animation to stop
         * @return void
         */
        stop: function(reqAnimId) {

            var animId = reqAnimId || this._reqAnimId;
            if (animId === 0) { return; }

            window.cancelAnimationFrame(animId);
        },

        resize: function() {
            this.setScale();
            var objects = ObjectManager.getObjects();
            for (var i = 0; i < objects.length; i++) {
                objects[i].resize(this._scaleFactor);
            }
        }

    });
