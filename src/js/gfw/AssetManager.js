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

            for (var id in this._assets) {

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
    