    /**
     * Text class
     * @class Creates a DOM text element
     * @param {string} img Image path
     * @param {string} font Font type
     * @param {integer} w Width
     * @param {integer} h Height
     * @param {integer} x x Position
     * @param {integer} y y Position     
     * @param {integer} r Rotation in degrees
     * @extends GFW.Object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Text = function(txt, font, w, h, x, y, r) {
        /** @lends GFW.Text */

        // init object
        GFW.Object.call(this, w, h, x, y, r);
        
        // variables
        this._text = txt;
        this._font = font;
        this._$object.addClass('text ' + this._font);
        this._$object.html(this._text);

        return this._$object;
    };

    $.extend(GFW.Text.prototype, GFW.Object.prototype, {
        /** @lends GFW.Text */


    });
    