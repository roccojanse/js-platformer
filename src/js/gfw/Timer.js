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

        console.log(this);

    };

    $.extend(GFW.Timer.prototype, /** @lends GFW.Timer */ {

        _tick: function() {
            this._animId = window.requestAnimationFrame(this._tick.bind(this));
            this.onTick();
        },

        getTime: function() {
            return new Date().getTime();
        },
        
        onTick: function() {
            if (!this._isPaused) {
                this._ticks += 1;
            }
        },

        start: function() {
            this._tick();
        },

        pause: function() {
            this._isPaused = !this._isPaused;
        },

        stop: function() {

            window.cancelAnimationFrame(this._animId);

            var result = this._ticks;
            this._ticks = 0;
            this._isPaused = false;

            return result;
        },

        isPaused: function() {
            return this._isPaused;
        }

    });
