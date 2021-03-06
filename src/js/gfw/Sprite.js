    /**
     * Sprite class
     * @class Creates a DOM sprite
     * @param {string} img Image path
     * @param {integer} w Width
     * @param {integer} h Height
     * @param {integer} x x Position
     * @param {integer} y y Position     
     * @param {integer} ol Offset left
     * @param {integer} ot Offset top
     * @param {integer} r Rotation in degrees
     * @extends GFW.Object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Sprite = function(img, w, h, x, y, ol, ot, r) {
        /** @lends GFW.Sprite */

        // init object
        GFW.Object.call(this, w, h, x, y, r);
        
        // variables
        this._type = 'Sprite';
        this._image = img;
        this._offset = { left: ol, top: ot };

        this._$object.css({
            'background-image': 'url(' + img + ')',
            'background-position': this._offset.left + 'px, ' + this._offset.top + 'px',
            'background-size': this._width + 'px ' + this._height + 'px'
        });

        this._$object.addClass('sprite');

        return this;
    };

    $.extend(GFW.Sprite.prototype, GFW.Object.prototype, /** @lends GFW.Sprite */ {
        
        /**
         * sets offset of background
         * @param {integer} l Offset left
         * @param {integer} t Offset top
         * @returns void
         */
        setOffset: function(l, t) {
            this._offset.left = l;
            this._offset.top = t;
        },

        /**
         * updates sprite
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
                'background-position': this._offset.left + 'px, ' + this._offset.top + 'px',
                'background-size': this._width + 'px ' + this._height + 'px',
                'opacity': 1
            });
        }

    });
    