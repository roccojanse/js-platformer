    /**
     * Splash Screen class
     * @class Splash Screen class
     * @extends GFW.Screen
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.Screen.Splash = function(container) {
        /** @lends GFW.Screen.Splash */

        // init object
        var name = 'splash';

        GFW.Screen.call(this, name, container);

        // vars

        // properties
        this._container = container.attr('id');
        this._name = name;
        this._alpha = 0;

        return this;
        
    };

    $.extend(GFW.Screen.Splash.prototype, GFW.Screen.prototype, /** @lends GFW.Screen.Splash */ {
        
        show: function(game) {

            var _this = this;
            
            this.fadeIn(function() {

                var t = new GFW.Timer();
                
                t.onTick = function() {
                    var dt = t.getDelta();
                    if (dt > 3) {
                        t.stop();
                        _this.fadeOut(function() {
                            game._gameState = game._gameStates.TITLE;
                        });
                    }
                };
                t.start();
            });

        }

    });
    