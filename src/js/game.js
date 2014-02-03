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
        var _desiredWidth = 1024;
        var _desiredHeight = 768;
        var _actualWidth = $(window).width();
        var _actualHeight = $(window).height();

        // properties
        this._scaleFactor = Math.round((_actualWidth/_desiredWidth)*100)/100;
        this._width = Math.round(_desiredWidth*this._scaleFactor);
        this._height = Math.round(_desiredHeight*this._scaleFactor);
       
        console.log('SCALE', _actualWidth/_desiredWidth);

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


        this.init();

        return this;

        

    };

    $.extend(Game.prototype, {
        /** @lends Game */

        init: function() {

            var _this = this;

            this._gameState = this._gameStates.INIT;

            AssetManager.add('splash', {
                path: 'assets/img/bg-splash.png',
                type: 'image'
            });

            AssetManager.onComplete = function() {
                
                var img = AssetManager.getAsset('splash');
                console.log('COMPLETE', AssetManager.isComplete());

                //console.log(img);
                $(document.body).append(img);    

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
