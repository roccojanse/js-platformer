    /**
     * Title Screen class
     * @class Title Screen class
     * @extends GFW.Screen
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Screen.Title = function(container) {
        /** @lends GFW.Screen.Title */

        // init object
        var name = 'title';

        GFW.Screen.call(this, name, container);

        // vars

        // properties
        this._container = container.attr('id');
        this._name = name;
        this._alpha = 0;

        return this;
        
    };

    $.extend(GFW.Screen.Title.prototype, GFW.Screen.prototype, /** @lends GFW.Screen.Title */ {
        


    });
    