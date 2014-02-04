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
        this._container = $('#game-container');
        this._width = 1024;
        this._height = 768;
        this._scaleFactor = 1;
  
        this._fps = 60;
        this._reqAnimId = null;
        this._lastFrame = new Date().getTime();

        // global managers
        window.AssetManager = new GFW.AssetManager();
        window.ObjectManager = new GFW.ObjectManager();

        // game states
        this._gameStates = {
            'INIT': 0,
            'LOADING': 1,
            'MAINMENU': 2,
            'PLAYING': 3
        }

        // do init
        this.init();

        return this;

        

    };

    $.extend(Game.prototype, {
        /** @lends Game */

        init: function() {

            var _this = this,
                _winWidth = $(window).width();

            // set gamestate to init
            this._gameState = this._gameStates.INIT;

            // set proportions and scaling
            this._scaleFactor = (_winWidth < this._width) ? Math.round((_winWidth/this._width)*100)/100 : 1;
            this._width = Math.round(this._width*this._scaleFactor);
            this._height = Math.round(this._height*this._scaleFactor);





            AssetManager.add('splash', {
                path: 'assets/img/bg-splash.png',
                type: 'image'
            });

            AssetManager.onComplete = function() {
                
                var img = AssetManager.getAsset('splash');
                $(img).width(Math.round(img.width*_this._scaleFactor));
                console.log('COMPLETE', AssetManager.isComplete());

                //console.log(img);
                _this._container.append(img);    

            }

            AssetManager.onProgress = function(t, l, p) {
                console.log(t, l, p);
            }

            AssetManager.load();

            console.log('COMPLETE?', AssetManager.isComplete());

        },

        /**
         * Main game logic
         * @return void
         */
        mainLoop: function() {

            var tm = new Date().getTime();
            this._reqAnimId = window.requestAnimationFrame(this.mainLoop.bind(this));
            var dt = (tm - this._lastFrame) / 1000;
            if(dt > 1/15) { dt = 1/15; }
            
            //this.physics.step(dt);
            //this.renderer.drawFrame(dt);
            this._lastFrame = tm;

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
        }

    });
