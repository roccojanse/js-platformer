    /* jshint ignore:end */
    /* global AssetManager, ObjectManager */

    /**
     * GFW - Game FrameWork
     * @author Rocco Janse, roccojanse@outlook.com
     * @namespace
     */
    var GFW = {
        /** @lends GFW */

        /**
         * bounces function calls to prevent multilple event calls. Useful for window.resize or key events
         * @param  {Function} func Function to call after bouncing
         * @param  {Number} timeout Timeout of bouncing
         * @return void
         * @public
         */
        debounce: function(func, timeout) {
            var timeoutID, 
                to = timeout || 200;

            return function () {
                var args = arguments;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() {
                    func.apply(this, Array.prototype.slice.call(args));
                }, to);
            };
        }

    };

    $.extend(GFW.prototype, /** @lends GFW */{
        


    });
