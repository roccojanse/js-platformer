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
    GFW.AssetManager = function() {
        /** @lends GFW.AssetManager */

        // variables
        this._assets = {};
        this._loaded = 0;
        this._total = 0;
        this._progress = 0;
        this._errors = 0;
        this._cache = {};

    };

    $.extend(GFW.AssetManager.prototype, {
        /** @lends GFW.AssetManager */

        /**
         * adds multiple assets at once to the assets queue
         * @param {array} assetsArray Array of assetobjects
         * @see #GFW.AssetManager.add
         * @returns void
         */
        addAssets: function(assetsArray) {
            for (var i = 0; i < assetsArray.length; i++) {
                this.add(assetsArray[i].id, assetsArray[i]);
            }
        },

        /**
         * adds an asset to the assets queue
         * @param {string} id Asset ID (used for asset retrieval)
         * @param {object} asset Asset object ({object}.id required)
         * @returns void
         */
        add: function(id, asset) {
            this._assets[id] = asset;
            this._assets[id].id = id;
            this._total += 1;
        },

        /**
         * starts (pre)loading the asset queue
         * @returns void
         */
        load: function() {

            var _this = this;

            for (id in this._assets) {

                var asset = this._assets[id];

                // image
                if (asset.type == 'image') {
                    var img = new Image();
                    img.src = asset.path;

                    img.addEventListener('load', function() {    
                        _this._loaded += 1;
                        _this._assets[id].width = this.width;
                        _this._assets[id].height = this.height;
                        _this._cache[id] = img;
                        _this.update();
                    }, false);

                    img.addEventListener('error', function(e) {
                        _this._errors += 1;
                        _this._assets[id] = e;
                        _this._cache[id] = img;
                        _this.update();
                    }, false);

                };

                // audio
                if (asset.type == 'audio') {

                    var audio = document.createElement('audio');
                    var srcMp3 = document.createElement('source');
                    var srcOgg = document.createElement('source');
        
                    audio.id = id;
                    audio.autoplay = false;
                    audio.preload = false;

                    audio.addEventListener('progress', function() {
                        _this._loaded += 1;
                        _this.update();
                        audio.removeEventListener('progress');
                    });

                    srcMp3.src = asset.path;
                    srcMp3.type = 'audio/mpeg';

                    srcOgg.src = asset.path.replace('.mp3', '.ogg');
                    srcOgg.type = 'audio/ogg';

                    audio.appendChild(srcOgg);
                    audio.appendChild(srcMp3);

                    $(document.body).append(audio);

                };

            }            

        },

        /**
         * updates current progress and triggers callbacks
         * @returns void
         */
        update: function() {

            this._progress = Math.round(((this._loaded + this._errors) / this._total)*100);

            this.onProgress(this._total, this._loaded, this._progress);
            
            if (this._loaded === this._total) {
                this.onComplete();
            }
        },

        /**
         * default oncomplete function
         * @returns void
         */
        onComplete: function() {
            return;
        },

        /**
         * default onprogress function
         * @returns {object} stats Object containing total assets, loaded assets and total progress in percs
         */
        onProgress: function(total, loaded, progress) {
            return {
                'total': total,
                'loaded': loaded,
                'progress': progress
            }
        },

        /**
         * is completed check
         * @returns {boolean} completed True or false
         */
        isComplete: function() {
            return (this._loaded + this._errors) === this._total;
        },

        /**
         * returns asset object corresponding to id
         * @param {string} id Asset ID to retrieve
         * @returns {object} asset Asset object
         */
        get: function(id) {
            return this._assets[id];
        },

        /**
         * returns asset from manager cache
         * @param {string} id Asset ID to retrieve
         * @returns {HTMLObject} asset Asset
         */
        getAsset: function(id) {
            return this._cache[id];
        },

        /**
         * clears the asset manager from data
         * @returns void
         */
        clear: function() {
            this._assets = {};
            this._cache = {};
            this._loaded = 0;
            this._erros = 0;
            this._total = 0;
        }

    });
    
    /**
     * ObjectManager class
     * @class Creates object to hold objects used in the game
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.ObjectManager = function() {
        /** @lends GFW.ObjectManager */

        // variables
        this._objects = [];

    };

    $.extend(GFW.ObjectManager.prototype, {
        /** @lends GFW.ObjectManager */

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
        var _this = this,
            _desiredWidth = 1024,
            _desiredHeight = 768,
            _actualWidth = $(window).width();

        // properties
        this._container = $('#game-container');
        this._scaleFactor = 1;
        this._width = _desiredWidth;
        this._height = _desiredHeight;
          
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

            var _this = this;

            // set gamestate to init
            this._gameState = this._gameStates.INIT;

            // set proportions and scaling
            this._scaleFactor = (_actualWidth < _desiredWidth) ? Math.round((_actualWidth/_desiredWidth)*100)/100 : 1;
            this._width = Math.round(_desiredWidth*this._scaleFactor);
            this._height = Math.round(_desiredHeight*this._scaleFactor);




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


})(jQuery);