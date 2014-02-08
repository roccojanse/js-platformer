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
        this._container = null;
        this._width = w;
        this._height = h;
        this._pos = { x: x, y: y };
        this._rotation = r;
        this._remove = false;
        this._zoomlevel = 1;
        this._type = 'Object';
        this._alpha = 1;

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
         * adds object to container (parent) element
         * @param {HTMLDomElement} container Container jQuery object
         * @returns void
         */
        addTo: function(container) {
            if (container.attr('id')) {
                this._container = container.attr('id');
            }
            container.append(this._$object);
            ObjectManager.add(this);
            return this._$object;
        },

        /**
         * sets alpha of object
         * @param {integer} a Alpha value ( 0 - 1 ) ie: 0.4
         * @returns void
         */
        setAlpha: function(a) {
            this._alpha = a;
        },

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
    