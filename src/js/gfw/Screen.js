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
         * sets alpha of screen
         * @param {integer} a Alpha value ( 0 - 1 ) ie: 0.4
         * @returns void
         */
        setAlpha: function(a) {
            this._alpha = a;
        }

    });
    