    /**
     * Timer class
     * @class Creates a timer object used in the game
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Timer = function() {
        /** @lends GFW.Timer */

        // properties
        this._date = new Date();
        this._ticks = 0;
        this._animId = null;
        this._isPaused = false;
        this._start = 0;

    };

    $.extend(GFW.Timer.prototype, /** @lends GFW.Timer */ {

        /**
         * game tick
         * @private
         * @return void
         */
        _tick: function() {
            this._animId = window.requestAnimationFrame(this._tick.bind(this));
            this.onTick();
        },

        /**
         * returns current timestamp
         * @return {integer} Timestamp of now
         */
        getTime: function() {
            return new Date().getTime();
        },
        
        /**
         * default onTick handler. Triggered by the private game _tick method. Should be overridden.
         * @return void
         */
        onTick: function() {
            if (!this._isPaused) {
                this._ticks += 1;
            }
        },

        /**
         * starts timer
         * @return void
         */
        start: function() {
            this._start = this.getTime();
            this._tick();
        },

        /**
         * returns delta time (time elapsed since start of timer) in seconds
         * @param  {[integer]} [start=timestamp] Timestamp of start time
         * @return {integer} Delta time in seconds
         */
        getDelta: function(start) {
            var s = start || this._start;
            return (this.getTime() - s) / 1000;
        },

        /**
         * pauses timer
         * @return void
         */
        pause: function() {
            this._isPaused = !this._isPaused;
        },

        /**
         * stops timer
         * @return void
         */
        stop: function() {

            window.cancelAnimationFrame(this._animId);

            var result = this._ticks;
            this._ticks = 0;
            this._isPaused = false;

            return result;
        },

        /**
         * returns paused state of timer
         * @return {boolean} True or false
         */
        isPaused: function() {
            return this._isPaused;
        }

    });
