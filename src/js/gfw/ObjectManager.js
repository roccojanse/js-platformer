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

        /**
         * adds object to object manager
         * @param {object} object Game object to add
         */
        add: function(object) {
            return this._objects.push(object);
        }

    });
