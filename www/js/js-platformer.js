(function($) {

    "use strict";

    var lastTime = 0,
        vendors = ['webkit', 'moz'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() { 
                    callback(currTime + timeToCall); 
                }, timeToCall);
            
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
    }
    
    /**
     * AssetManager class
     * @class Creates object to hold assets used in the game
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    var AssetManager = function() {
        /** @lends AssetManager */

        // variables
        this._assets = {};

    };

    $.extend(AssetManager.prototype, {
        /** @lends AssetManager */

        addAssets: function(assetsArray) {
            for (var i = 0; i < assetsArray.length; i++) {
                this.add(assetsArray[i].id, assetsArray[i].src);
            }
        },

        add: function(id, asset) {
            this._assets[id] = asset;
        },

        get: function(id) {
            return this._assets[id];
        },

        clear: function() {
            this._assets = {};
        }

    });
    
    /**
     * ObjectManager class
     * @class Creates object to hold objects used in the game
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    var ObjectManager = function() {
        /** @lends ObjectManager */

        // variables
        this._objects = [];

    };

    $.extend(ObjectManager.prototype, {
        /** @lends ObjectManager */

        add: function(object) {
            this._objects.push(object);
        }

    });

    /**
     * Game Main class
     * @class Creates main game object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    var Game = function() {
        /** @lends Game */

        // variables
        this._fps = 60;
        this._reqAnimId = null;
        this._lastFrame = new Date().getTime();

        window.assetManager = new AssetManager();
        window.objectManager = new ObjectManager();
        
        return this;

        

    };

    $.extend(Game.prototype, {
        /** @lends Game */

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


})(jQuery);