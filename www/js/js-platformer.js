(function($) {

    "use strict";

    /* jshint ignore:start */

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
    
    /* jshint ignore:end */
    /* global AssetManager, ObjectManager */

    /**
     * GFW - Game FrameWork
     * @author Rocco Janse, roccojanse@outlook.com
     * @namespace
     */
    var GFW = {
        /** @lends GFW */

    };

    $.extend(GFW.prototype, /** @lends GFW */{
        


    });

    /* jshint loopfunc: true */

    /**
     * AssetManager class
     * @class Creates object to hold assets used in the game
     * @param {integer} [scale] ScaleFactor
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.AssetManager = function(scale) {
        /** @lends GFW.AssetManager */

        // variables
        this._assets = {};
        this._loaded = 0;
        this._total = 0;
        this._progress = 0;
        this._errors = 0;
        this._cache = {};
        this._scale = scale || 1;

    };


    $.extend(GFW.AssetManager.prototype, /** @lends GFW.AssetManager */ {
 
        /**
         * adds multiple assets at once to the assets queue
         * @param {array} assetsArray Array of assetobjects
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
         * @param {object} asset Asset object (object.id required)
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

            for (var id in this._assets) {

                var asset = this._assets[id];

                // image
                if (asset.type == 'image') {
                    var img = new Image();
                    img.src = asset.path;
                    img.width = Math.round(this.width*_this.scaleFactor);
                    img.height = Math.round(this.height*_this.scaleFactor);

                    img.addEventListener('load', function() {    
                        _this._loaded += 1;
                        _this._assets[id].width = this.width;
                        _this._assets[id].height = this.height;
                        _this._cache[id] = this;
                        _this.update();
                    }, false);

                    img.addEventListener('error', function(e) {
                        _this._errors += 1;
                        _this._assets[id] = e;
                        _this._cache[id] = img;
                        _this.update();
                    }, false);

                }

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

                }

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
            };
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

    $.extend(GFW.ObjectManager.prototype, /** @lends GFW.ObjectManager */ {
        
        /**
         * adds object to object array
         * @param {object} object Object to add
         * @returns void
         */
        add: function(object) {
            this._objects.push(object);
        }

    });

    /**
     * Screen class
     * @class Base Screen class. Should be extended.
     * @param {string} name Screen name
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Screen = function(name, container) {
        /** @lends GFW.Screen */

        // variables
        this._container = container.attr('id');
        this._name = name;
        this._remove = false;
        this._alpha = 1;

        this._$object = $(document.createElement('div'));
        this._$object.addClass('screen');
        this._$object.attr('id', this._name);
        
        container.append(this._$object);

        return this;
        
    };

    $.extend(GFW.Screen.prototype, {
        /** @lends GFW.Screen */

        /**
         * adds object to current screen element
         * @param {HTMLDomElement} container Container jQuery object
         * @returns void
         */
        add: function(el) {
            this._$object.append(el);
            ObjectManager.add(el);
            return el;
        },

        /**
         * sets alpha of screen
         * @param {integer} a Alpha value ( 0 - 1 ) ie: 0.4
         * @returns void
         */
        setAlpha: function(a) {
            this._alpha = a;
        }

    });
    
    /**
     * Object class
     * @class Base class for all game objects. Should be extended.
     * @param {integer} w Width
     * @param {integer} h Height
     * @param {integer} x x Position
     * @param {integer} y y Position
     * @param {integer} r Rotation in degrees
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Object = function(w, h, x, y, r) {
        /** @lends GFW.Object */

        // variables
        this._container = null;
        this._width = w;
        this._height = h;
        this._pos = { x: x, y: y };
        this._rotation = r;
        this._remove = false;
        this._zoomlevel = 1;
        this._type = 'Object';
        this._alpha = 1;

        this._$object = $(document.createElement('div'));
        this._$object.css({
            'position': 'absolute',
            'top': this._pos.y,
            'left': this._pos.x,
            'width': this._width,
            'height': this._height,
            '-webkit-transform': 'rotate(' + r + 'deg)',
            '-moz-transform': 'rotate(' + r + 'deg)',
            '-o-transform': 'rotate(' + r + 'deg)',
            '-ms-transform': 'rotate(' + r + 'deg)',
            'transform': 'rotate(' + r + 'deg)',
            'opacity': 1
        });

        return this;
        
    };

    $.extend(GFW.Object.prototype, {
        /** @lends GFW.Object */

        /**
         * adds object to container (parent) element
         * @param {HTMLDomElement} container Container jQuery object
         * @returns void
         */
        addTo: function(container) {
            if (container.attr('id')) {
                this._container = container.attr('id');
            }
            container.append(this._$object);
            ObjectManager.add(this);
            return this._$object;
        },

        /**
         * sets alpha of object
         * @param {integer} a Alpha value ( 0 - 1 ) ie: 0.4
         * @returns void
         */
        setAlpha: function(a) {
            this._alpha = a;
        },

        /**
         * sets rotation of object
         * @param {integer} r Rotation in degrees
         * @returns void
         */
        setRotation: function(r) {
            this._rotation = r;
        },

        /**
         * sets position of object
         * @param {integer} x X Position
         * @param {integer} y Y Position
         * @returns void
         */
        setPosition: function(x, y) {
            this._pos = { x: x, y: y };
        },

        /**
         * updates object
         * @returns void
         */
        update: function() {
            this._$object.css({
                'top': this._pos.y,
                'left': this._pos.x,
                'width': this._width,
                'height': this._height,
                '-webkit-transform': 'rotate(' + this._rotation + 'deg)',
                '-moz-transform': 'rotate(' + this._rotation + 'deg)',
                '-o-transform': 'rotate(' + this._rotation + 'deg)',
                '-ms-transform': 'rotate(' + this._rotation + 'deg)',
                'transform': 'rotate(' + this._rotation + 'deg)',
                'opacity': 1
            });
        },

        /**
         * sets container of object
         * @param {string} container name of id
         * @returns void
         */
        setContainer: function(container) {
            this._container = container;
        }

    });

    /**
     * Text class
     * @class Creates a DOM text element
     * @param {string} txt Text to display
     * @param {string} font Font type
     * @param {integer} size Font size
     * @param {string} color Color ie. rgb(10, 39, 60)
     * @param {integer} x x Position
     * @param {integer} y y Position     
     * @extends GFW.Object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Text = function(txt, font, size, color, x, y, w, h) {
        /** @lends GFW.Text */

        // init object 
        GFW.Object.call(this, w, h, x, y, 0);
        
        // variables
        this._type = 'Text';
        this._text = txt;
        this._font = font;
        this._size = size;
        this._color = color;
        
        this._$object.addClass('text ' + this._font);
        this._$object.html(this._text);
        
        this._$object.css({
            'font-family': this._font,
            'font-size': this._size,
            'color': this._color,
            'white-space': 'nowrap'
        });

        return this;
    };

    $.extend(GFW.Text.prototype, GFW.Object.prototype, /** @lends GFW.Text */ {
        
        /**
         * set current font of text object
         * @param {font} font New Font type
         * @returns void
         */
        setFont: function(font) {
            return font;
        },

        /**
         * centers text to container
         * @returns { void} [description]
         */
        setCentered: function() {
            this._$object.css({
                'text-align': 'center'
            });
        }

    });
    
    /**
     * Sprite class
     * @class Creates a DOM sprite
     * @param {string} img Image path
     * @param {integer} w Width
     * @param {integer} h Height
     * @param {integer} x x Position
     * @param {integer} y y Position     
     * @param {integer} ol Offset left
     * @param {integer} ot Offset top
     * @param {integer} r Rotation in degrees
     * @extends GFW.Object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Sprite = function(img, w, h, x, y, ol, ot, r) {
        /** @lends GFW.Sprite */

        // init object
        GFW.Object.call(this, w, h, x, y, r);
        
        // variables
        this._type = 'Sprite';
        this._image = img;
        this._offset = { left: ol, top: ot };

        this._$object.css({
            'background-image': 'url(' + img + ')',
            'background-position': this._offset.left + 'px, ' + this._offset.top + 'px',
            'background-size': this._width + 'px ' + this._height + 'px'
        });

        this._$object.addClass('sprite');

        return this;
    };

    $.extend(GFW.Sprite.prototype, GFW.Object.prototype, /** @lends GFW.Sprite */ {
        
        /**
         * sets offset of background
         * @param {integer} l Offset left
         * @param {integer} t Offset top
         * @returns void
         */
        setOffset: function(l, t) {
            this._offset.left = l;
            this._offset.top = t;
        },

        /**
         * updates sprite
         * @returns void
         */
        update: function() {
            this._$object.css({
                'top': this._pos.y,
                'left': this._pos.x,
                'width': this._width,
                'height': this._height,
                '-webkit-transform': 'rotate(' + this._rotation + 'deg)',
                '-moz-transform': 'rotate(' + this._rotation + 'deg)',
                '-o-transform': 'rotate(' + this._rotation + 'deg)',
                '-ms-transform': 'rotate(' + this._rotation + 'deg)',
                'transform': 'rotate(' + this._rotation + 'deg)',
                'background-position': this._offset.left + 'px, ' + this._offset.top + 'px',
                'background-size': this._width + 'px ' + this._height + 'px',
                'opacity': 1
            });
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
        // var _this = this;
            
        // properties
        this._$container = $('#game-container');
        this._width = 1024;
        this._height = 768;
        this._scaleFactor = 1;
  
        this._fps = 60;
        this._reqAnimId = null;
        this._lastFrame = new Date().getTime();

        // game states
        this._gameStates = {
            'INIT': 0,
            'LOADING': 1,
            'MAINMENU': 2,
            'PLAYING': 3
        };

        // do init
        this.init();

        return this;

        

    };

    $.extend(Game.prototype, /** @lends Game */ {

        init: function() {

            var _this = this,
                _winWidth = $(window).width();

            // set gamestate to init
            this._gameState = this._gameStates.INIT;

            // set proportions and scaling
            this._scaleFactor = (_winWidth < this._width) ? Math.round((_winWidth/this._width)*100)/100 : 1;
            this._width = Math.round(this._width*this._scaleFactor);
            this._height = Math.round(this._height*this._scaleFactor);
            this._$container.width(this._width);
            this._$container.height(this._height);

            // global managers
            window.AssetManager = new GFW.AssetManager(this._scaleFactor);
            window.ObjectManager = new GFW.ObjectManager();


            AssetManager.add('splash', {
                path: 'assets/img/bg-splash.png',
                type: 'image'
            });

            AssetManager.onComplete = function() {

                var splashScreen = new GFW.Screen('splash', _this._$container);

                var splash = new GFW.Sprite(AssetManager.get('splash').path, _this._width, _this._height, 0, 0, 0, 0, 0);
                var copy = new GFW.Text('(c)2014 OneManClan. Created by Rocco Janse, roccojanse@outlook.com', 'arial', 14, 'rgb(255, 255, 255)', 0, Math.round((_this._height*_this._scaleFactor)-25), _this._width, 25);
                copy.setCentered();

                //splash.addTo(splashScreen);
                //copy.addTo(splashScreen);

                splashScreen.add(splash);
                splashScreen.add(copy);

                console.log(splash, copy);

                
                // var img = AssetManager.getAsset('splash');
                // $(img).width(Math.round(img.width*_this._scaleFactor));
                // console.log('COMPLETE', AssetManager.isComplete());

                //_this._container.append(splash).append(copy);    
 

            };

            AssetManager.onProgress = function(t, l, p) {
                console.log(t, l, p);
            };

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