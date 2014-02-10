    /**
     * Screen class
     * @class Base Screen class. Should be extended.
     * @param {string} name Screen name
     * @param {HTMLDomElement} container Container element of screen DOM Element
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Screen = function(name, container) {
        /** @lends GFW.Screen */

        // properties
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

    $.extend(GFW.Screen.prototype, /** @lends GFW.Screen */ {
        
        /**
         * adds object to current screen
         * @param {object} obj Object to add
         * @returns {integer} Index of object
         */
        add: function(obj) {
            this._$object.append(obj.getElement());
            return ObjectManager.add(obj);
        },

        /**
         * updates screen in game loop
         * @return void
         */
        update: function(dt) {

            this._$object.css({
                'opacity': this._alpha
            });
        },

        /**
         * sets alpha of screen
         * @param {integer} a Alpha value ( 0 - 1 ) ie: 0.4
         * @returns void
         */
        setAlpha: function(a) {
            this._alpha = a;
            return this;
        },

        /**
         * fades screen object in
         * @param  {integer} [duration=1] Duration
         * @return void
         */
        fadeIn: function(duration) {

            var _this = this,
                d = duration || 1,
                t = new GFW.Timer(),
                startTime = t.getTime();
            
            t.onTick = function() {

                var dt = (t.getTime() - startTime) / 1000,
                    alpha = (1/d)*dt;
                
                _this.setAlpha((_this._alpha < 1) ? parseFloat(alpha) : 1);
                
                if (dt > d) {
                    t.stop();
                }
            };
            t.start();
        },

        /**
         * fades screen object out
         * @param  {integer} [duration=1] Duration
         * @return void
         */
        fadeOut: function(duration) {
            
            var _this = this,
                d = duration || 1,
                t = new GFW.Timer(),
                startTime = t.getTime();

            t.onTick = function() {

                var dt = (t.getTime() - startTime) / 1000,
                    alpha = (1/d)*dt;

                 _this.setAlpha((_this._alpha > 0) ? 1 - parseFloat(alpha) : 0);
                
                if (dt > d) {
                    t.stop();
                }
            };
            t.start();
        }
    });
    