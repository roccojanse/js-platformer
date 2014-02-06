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
