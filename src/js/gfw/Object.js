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
        this._width = w;
        this._height = h;
        this._pos = { x: x, y: y };
        this._rotation = r;
        this._visible = true;
        this._zoomlevel = 1;

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
        }

    });
    