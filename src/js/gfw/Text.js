    /**
     * Text class
     * @class Creates a DOM text element
     * @param {string} txt Text to display
     * @param {string} font Font type
     * @param {integer} size Font size
     * @param {string} color Color ie. rgb(10, 39, 60)
     * @param {integer} x x Position
     * @param {integer} y y Position     
     * @extends GFW.Object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Text = function(txt, font, size, color, x, y, w, h) {
        /** @lends GFW.Text */

        // init object 
        GFW.Object.call(this, w, h, x, y, 0);
        
        // variables
        this._type = 'Text';
        this._text = txt;
        this._font = font;
        this._size = size;
        this._color = color;
        
        this._$object.addClass('text ' + this._font);
        this._$object.html(this._text);
        
        this._$object.css({
            'font-family': this._font,
            'font-size': this._size,
            'color': this._color,
            'white-space': 'nowrap'
        });

        return this;
    };

    $.extend(GFW.Text.prototype, GFW.Object.prototype, /** @lends GFW.Text */ {
        
        /**
         * set current font of text object
         * @param {font} font New Font type
         * @returns void
         */
        setFont: function(font) {
            return font;
        },

        /**
         * centers text to container
         * @returns { void} [description]
         */
        setCentered: function() {
            this._$object.css({
                'text-align': 'center'
            });
        }

    });
    