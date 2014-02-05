(function($) {

    "use strict";

    /* jshint ignore:start */

    var lastTime = 0,
        vendors = ['webkit', 'moz'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() { 
                    callback(currTime + timeToCall); 
                }, timeToCall);
            
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
    }
    
var HANDJS = HANDJS || {};

(function () {
    // If the user agent is already support Pointer Events, do nothing
    if (window.PointerEvent)
        return;

    // Polyfilling indexOf for old browsers
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement) {
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

    // Installing Hand.js
    var supportedEventsNames = ["pointerdown", "pointerup", "pointermove", "pointerover", "pointerout", "pointercancel", "pointerenter", "pointerleave"];
    var upperCaseEventsNames = ["PointerDown", "PointerUp", "PointerMove", "PointerOver", "PointerOut", "PointerCancel", "PointerEnter", "PointerLeave"];

    var POINTER_TYPE_TOUCH = "touch";
    var POINTER_TYPE_PEN = "pen";
    var POINTER_TYPE_MOUSE = "mouse";

    var previousTargets = {};

    var checkPreventDefault = function (node) {
        while (node && !node.handjs_forcePreventDefault) {
            node = node.parentNode;
        }
        return !!node || window.handjs_forcePreventDefault;
    };

    // Touch events
    var generateTouchClonedEvent = function (sourceEvent, newName, canBubble, newtarget) {
        // Considering touch events are almost like super mouse events
        var evObj;

        if (document.createEvent) {
            evObj = document.createEvent('MouseEvents');
            evObj.initMouseEvent(newName, canBubble, true, window, 1, sourceEvent.screenX, sourceEvent.screenY,
                sourceEvent.clientX, sourceEvent.clientY, sourceEvent.ctrlKey, sourceEvent.altKey,
                sourceEvent.shiftKey, sourceEvent.metaKey, sourceEvent.button, null);
        }
        else {
            evObj = document.createEventObject();
            evObj.screenX = sourceEvent.screenX;
            evObj.screenY = sourceEvent.screenY;
            evObj.clientX = sourceEvent.clientX;
            evObj.clientY = sourceEvent.clientY;
            evObj.ctrlKey = sourceEvent.ctrlKey;
            evObj.altKey = sourceEvent.altKey;
            evObj.shiftKey = sourceEvent.shiftKey;
            evObj.metaKey = sourceEvent.metaKey;
            evObj.button = sourceEvent.button;
        }
        // offsets
        if (evObj.offsetX === undefined) {
            if (sourceEvent.offsetX !== undefined) {

                // For Opera which creates readonly properties
                if (Object && Object.defineProperty !== undefined) {
                    Object.defineProperty(evObj, "offsetX", {
                        writable: true
                    });
                    Object.defineProperty(evObj, "offsetY", {
                        writable: true
                    });
                }

                evObj.offsetX = sourceEvent.offsetX;
                evObj.offsetY = sourceEvent.offsetY;
            } else if (Object && Object.defineProperty !== undefined) {
                Object.defineProperty(evObj, "offsetX", {
                    get: function () {
                        if (this.currentTarget && this.currentTarget.offsetLeft) {
                            return sourceEvent.clientX - this.currentTarget.offsetLeft;
                        }
                        return sourceEvent.clientX;
                    }
                });
                Object.defineProperty(evObj, "offsetY", {
                    get: function () {
                        if (this.currentTarget && this.currentTarget.offsetTop) {
                            return sourceEvent.clientY - this.currentTarget.offsetTop;
                        }
                        return sourceEvent.clientY;
                    }
                });
            }
            else if (sourceEvent.layerX !== undefined) {
                evObj.offsetX = sourceEvent.layerX - sourceEvent.currentTarget.offsetLeft;
                evObj.offsetY = sourceEvent.layerY - sourceEvent.currentTarget.offsetTop;
            }
        }

        // adding missing properties

        if (sourceEvent.isPrimary !== undefined)
            evObj.isPrimary = sourceEvent.isPrimary;
        else
            evObj.isPrimary = true;

        if (sourceEvent.pressure)
            evObj.pressure = sourceEvent.pressure;
        else {
            var button = 0;

            if (sourceEvent.which !== undefined)
                button = sourceEvent.which;
            else if (sourceEvent.button !== undefined) {
                button = sourceEvent.button;
            }
            evObj.pressure = (button == 0) ? 0 : 0.5;
        }


        if (sourceEvent.rotation)
            evObj.rotation = sourceEvent.rotation;
        else
            evObj.rotation = 0;

        // Timestamp
        if (sourceEvent.hwTimestamp)
            evObj.hwTimestamp = sourceEvent.hwTimestamp;
        else
            evObj.hwTimestamp = 0;

        // Tilts
        if (sourceEvent.tiltX)
            evObj.tiltX = sourceEvent.tiltX;
        else
            evObj.tiltX = 0;

        if (sourceEvent.tiltY)
            evObj.tiltY = sourceEvent.tiltY;
        else
            evObj.tiltY = 0;

        // Width and Height
        if (sourceEvent.height)
            evObj.height = sourceEvent.height;
        else
            evObj.height = 0;

        if (sourceEvent.width)
            evObj.width = sourceEvent.width;
        else
            evObj.width = 0;

        // preventDefault
        evObj.preventDefault = function () {
            if (sourceEvent.preventDefault !== undefined)
                sourceEvent.preventDefault();
        };

        // stopPropagation
        if (evObj.stopPropagation !== undefined) {
            var current = evObj.stopPropagation;
            evObj.stopPropagation = function () {
                if (sourceEvent.stopPropagation !== undefined)
                    sourceEvent.stopPropagation();
                current.call(this);
            };
        }

        // Pointer values
        evObj.pointerId = sourceEvent.pointerId;
        evObj.pointerType = sourceEvent.pointerType;

        switch (evObj.pointerType) {// Old spec version check
            case 2:
                evObj.pointerType = POINTER_TYPE_TOUCH;
                break;
            case 3:
                evObj.pointerType = POINTER_TYPE_PEN;
                break;
            case 4:
                evObj.pointerType = POINTER_TYPE_MOUSE;
                break;
        }

        // Fire event
        if (newtarget)
            newtarget.dispatchEvent(evObj);
        else if (sourceEvent.target) {
            sourceEvent.target.dispatchEvent(evObj);
        } else {
            sourceEvent.srcElement.fireEvent("on" + getMouseEquivalentEventName(newName), evObj); // We must fallback to mouse event for very old browsers
        }
    };

    var generateMouseProxy = function (evt, eventName, canBubble, target) {
        evt.pointerId = 1;
        evt.pointerType = POINTER_TYPE_MOUSE;
        generateTouchClonedEvent(evt, eventName, canBubble, target);
    };

    var generateTouchEventProxy = function (name, touchPoint, target, eventObject, canBubble) {
        var touchPointId = touchPoint.identifier + 2; // Just to not override mouse id

        touchPoint.pointerId = touchPointId;
        touchPoint.pointerType = POINTER_TYPE_TOUCH;
        touchPoint.currentTarget = target;

        if (eventObject.preventDefault !== undefined) {
            touchPoint.preventDefault = function () {
                eventObject.preventDefault();
            };
        }

        generateTouchClonedEvent(touchPoint, name, canBubble, target);
    };

    var checkEventRegistration = function (node, eventName) {
        return node.__handjsGlobalRegisteredEvents && node.__handjsGlobalRegisteredEvents[eventName];
    }
    var findEventRegisteredNode = function (node, eventName) {
        while (node && !checkEventRegistration(node, eventName))
            node = node.parentNode;
        if (node)
            return node;
        else if (checkEventRegistration(window, eventName))
            return window;
    };

    var generateTouchEventProxyIfRegistered = function (eventName, touchPoint, target, eventObject, canBubble) { // Check if user registered this event
        if (findEventRegisteredNode(target, eventName)) {
            generateTouchEventProxy(eventName, touchPoint, target, eventObject, canBubble);
        }
    };

    var handleOtherEvent = function (eventObject, name, useLocalTarget, checkRegistration) {
        if (eventObject.preventManipulation)
            eventObject.preventManipulation();

        for (var i = 0; i < eventObject.changedTouches.length; ++i) {
            var touchPoint = eventObject.changedTouches[i];

            if (useLocalTarget) {
                previousTargets[touchPoint.identifier] = touchPoint.target;
            }

            if (checkRegistration) {
                generateTouchEventProxyIfRegistered(name, touchPoint, previousTargets[touchPoint.identifier], eventObject, true);
            } else {
                generateTouchEventProxy(name, touchPoint, previousTargets[touchPoint.identifier], eventObject, true);
            }
        }
    };

    var getMouseEquivalentEventName = function (eventName) {
        return eventName.toLowerCase().replace("pointer", "mouse");
    };

    var getPrefixEventName = function (prefix, eventName) {
        var upperCaseIndex = supportedEventsNames.indexOf(eventName);
        var newEventName = prefix + upperCaseEventsNames[upperCaseIndex];

        return newEventName;
    };

    var registerOrUnregisterEvent = function (item, name, func, enable) {
        if (item.__handjsRegisteredEvents === undefined) {
            item.__handjsRegisteredEvents = [];
        }

        if (enable) {
            if (item.__handjsRegisteredEvents[name] !== undefined) {
                item.__handjsRegisteredEvents[name]++;
                return;
            }

            item.__handjsRegisteredEvents[name] = 1;
            item.addEventListener(name, func, false);
        } else {

            if (item.__handjsRegisteredEvents.indexOf(name) !== -1) {
                item.__handjsRegisteredEvents[name]--;

                if (item.__handjsRegisteredEvents[name] != 0) {
                    return;
                }
            }
            item.removeEventListener(name, func);
            item.__handjsRegisteredEvents[name] = 0;
        }
    };

    var setTouchAware = function (item, eventName, enable) {
        // Leaving tokens
        if (!item.__handjsGlobalRegisteredEvents) {
            item.__handjsGlobalRegisteredEvents = [];
        }
        if (enable) {
            if (item.__handjsGlobalRegisteredEvents[eventName] !== undefined) {
                item.__handjsGlobalRegisteredEvents[eventName]++;
                return;
            }
            item.__handjsGlobalRegisteredEvents[eventName] = 1;
        } else {
            if (item.__handjsGlobalRegisteredEvents[eventName] !== undefined) {
                item.__handjsGlobalRegisteredEvents[eventName]--;
                if (item.__handjsGlobalRegisteredEvents[eventName] < 0) {
                    item.__handjsGlobalRegisteredEvents[eventName] = 0;
                }
            }
        }

        // Chrome, Firefox
        if (item.ontouchstart !== undefined) {
            switch (eventName) {
                case "pointermove":
                    registerOrUnregisterEvent(item, "touchmove", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
                case "pointercancel":
                    registerOrUnregisterEvent(item, "touchcancel", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
            }
        }
    };

    // Intercept addEventListener calls by changing the prototype
    var interceptAddEventListener = function (root) {
        var current = root.prototype ? root.prototype.addEventListener : root.addEventListener;

        var customAddEventListener = function (name, func, capture) {
            // Branch when a PointerXXX is used
            if (supportedEventsNames.indexOf(name) != -1) {
                setTouchAware(this, name, true);
            }

            if (current === undefined) {
                this.attachEvent("on" + getMouseEquivalentEventName(name), func);
            } else {
                current.call(this, name, func, capture);
            }
        };

        if (root.prototype) {
            root.prototype.addEventListener = customAddEventListener;
        } else {
            root.addEventListener = customAddEventListener;
        }
    };

    // Intercept removeEventListener calls by changing the prototype
    var interceptRemoveEventListener = function (root) {
        var current = root.prototype ? root.prototype.removeEventListener : root.removeEventListener;

        var customRemoveEventListener = function (name, func, capture) {
            // Release when a PointerXXX is used
            if (supportedEventsNames.indexOf(name) != -1) {
                setTouchAware(this, name, false);
            }

            if (current === undefined) {
                this.detachEvent(getMouseEquivalentEventName(name), func);
            } else {
                current.call(this, name, func, capture);
            }
        };
        if (root.prototype) {
            root.prototype.removeEventListener = customRemoveEventListener;
        } else {
            root.removeEventListener = customRemoveEventListener;
        }
    };

    // Hooks
    interceptAddEventListener(window);
    interceptAddEventListener(HTMLElement || Element);
    interceptAddEventListener(document);
    interceptAddEventListener(HTMLBodyElement);
    interceptAddEventListener(HTMLDivElement);
    interceptAddEventListener(HTMLImageElement);
    interceptAddEventListener(HTMLUListElement);
    interceptAddEventListener(HTMLAnchorElement);
    interceptAddEventListener(HTMLLIElement);
    interceptAddEventListener(HTMLTableElement);
    if (window.HTMLSpanElement) {
        interceptAddEventListener(HTMLSpanElement);
    }
    if (window.HTMLCanvasElement) {
        interceptAddEventListener(HTMLCanvasElement);
    }
    if (window.SVGElement) {
        interceptAddEventListener(SVGElement);
    }

    interceptRemoveEventListener(window);
    interceptRemoveEventListener(HTMLElement || Element);
    interceptRemoveEventListener(document);
    interceptRemoveEventListener(HTMLBodyElement);
    interceptRemoveEventListener(HTMLDivElement);
    interceptRemoveEventListener(HTMLImageElement);
    interceptRemoveEventListener(HTMLUListElement);
    interceptRemoveEventListener(HTMLAnchorElement);
    interceptRemoveEventListener(HTMLLIElement);
    interceptRemoveEventListener(HTMLTableElement);
    if (window.HTMLSpanElement) {
        interceptRemoveEventListener(HTMLSpanElement);
    }
    if (window.HTMLCanvasElement) {
        interceptRemoveEventListener(HTMLCanvasElement);
    }
    if (window.SVGElement) {
        interceptRemoveEventListener(SVGElement);
    }

    // Prevent mouse event from being dispatched after Touch Events action
    var touching = false;
    var touchTimer = -1;

    function setTouchTimer() {
        touching = true;
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () {
            touching = false;
        }, 700);
        // 1. Mobile browsers dispatch mouse events 300ms after touchend
        // 2. Chrome for Android dispatch mousedown for long-touch about 650ms
        // Result: Blocking Mouse Events for 700ms.
    }

    function getDomUpperHierarchy(node) {
        var nodes = [];
        if (node) {
            nodes.unshift(node);
            while (node.parentNode) {
                nodes.unshift(node.parentNode);
                node = node.parentNode;
            }
        }
        return nodes;
    }

    function getFirstCommonNode(node1, node2) {
        var parents1 = getDomUpperHierarchy(node1);
        var parents2 = getDomUpperHierarchy(node2);

        var lastmatch = null
        while (parents1.length > 0 && parents1[0] == parents2.shift())
            lastmatch = parents1.shift();
        return lastmatch;
    }

    //generateProxy receives a node to dispatch the event
    function dispatchPointerEnter(currentTarget, relatedTarget, generateProxy) {
        var commonParent = getFirstCommonNode(currentTarget, relatedTarget);
        var node = currentTarget;
        var nodelist = [];
        while (node && node != commonParent) {//target range: this to the direct child of parent relatedTarget
            if (checkEventRegistration(node, "pointerenter")) //check if any parent node has pointerenter
                nodelist.push(node);
            node = node.parentNode;
        }
        while (nodelist.length > 0)
            generateProxy(nodelist.pop());
    }

    //generateProxy receives a node to dispatch the event
    function dispatchPointerLeave(currentTarget, relatedTarget, generateProxy) {
        var commonParent = getFirstCommonNode(currentTarget, relatedTarget);
        var node = currentTarget;
        while (node && node != commonParent) {//target range: this to the direct child of parent relatedTarget
            if (checkEventRegistration(node, "pointerleave"))//check if any parent node has pointerleave
                generateProxy(node);
            node = node.parentNode;
        }
    }
    
    // Handling events on window to prevent unwanted super-bubbling
    // All mouse events are affected by touch fallback
    function applySimpleEventTunnels(nameGenerator, eventGenerator) {
        ["pointerdown", "pointermove", "pointerup", "pointerover", "pointerout"].forEach(function (eventName) {
            window.addEventListener(nameGenerator(eventName), function (evt) {
                if (!touching && findEventRegisteredNode(evt.target, eventName))
                    eventGenerator(evt, eventName, true);
            });
        });
        window.addEventListener(nameGenerator("pointerover"), function (evt) {
            if (touching)
                return;
            var foundNode = findEventRegisteredNode(evt.target, "pointerenter");
            if (!foundNode || foundNode === window)
                return;
            else if (!foundNode.contains(evt.relatedTarget)) {
                dispatchPointerEnter(foundNode, evt.relatedTarget, function (targetNode) {
                    eventGenerator(evt, "pointerenter", false, targetNode);
                });
            }
        });
        window.addEventListener(nameGenerator("pointerout"), function (evt) {
            if (touching)
                return;
            var foundNode = findEventRegisteredNode(evt.target, "pointerleave");
            if (!foundNode || foundNode === window)
                return;
            else if (!foundNode.contains(evt.relatedTarget)) {
                dispatchPointerLeave(foundNode, evt.relatedTarget, function (targetNode) {
                    eventGenerator(evt, "pointerleave", false, targetNode);
                });
            }
        });
    }

    (function () {
        if (window.MSPointerEvent) {
            //IE 10
            applySimpleEventTunnels(
                function (name) { return getPrefixEventName("MS", name); },
                generateTouchClonedEvent);
        }
        else {
            applySimpleEventTunnels(getMouseEquivalentEventName, generateMouseProxy);

            // Handling move on window to detect pointerleave/out/over
            if (window.ontouchstart !== undefined) {
                window.addEventListener('touchstart', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        previousTargets[touchPoint.identifier] = touchPoint.target;

                        generateTouchEventProxyIfRegistered("pointerover", touchPoint, touchPoint.target, eventObject, true);

                        //pointerenter should not be bubbled
                        dispatchPointerEnter(touchPoint.target, null, function (targetNode) {
                            generateTouchEventProxy("pointerenter", touchPoint, targetNode, eventObject, false);
                        })

                        generateTouchEventProxyIfRegistered("pointerdown", touchPoint, touchPoint.target, eventObject, true);
                    }
                    setTouchTimer();
                });

                window.addEventListener('touchend', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        var currentTarget = previousTargets[touchPoint.identifier];

                        generateTouchEventProxyIfRegistered("pointerup", touchPoint, currentTarget, eventObject, true);
                        generateTouchEventProxyIfRegistered("pointerout", touchPoint, currentTarget, eventObject, true);

                        //pointerleave should not be bubbled
                        dispatchPointerLeave(currentTarget, null, function (targetNode) {
                            generateTouchEventProxy("pointerleave", touchPoint, targetNode, eventObject, false);
                        })
                    }
                    setTouchTimer();
                });

                window.addEventListener('touchmove', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        var newTarget = document.elementFromPoint(touchPoint.clientX, touchPoint.clientY);
                        var currentTarget = previousTargets[touchPoint.identifier];

                        // If force preventDefault
                        if (currentTarget && checkPreventDefault(currentTarget) === true)
                            eventObject.preventDefault();

                        if (currentTarget === newTarget) {
                            continue; // We can skip this as the pointer is effectively over the current target
                        }

                        if (currentTarget) {
                            // Raise out
                            generateTouchEventProxyIfRegistered("pointerout", touchPoint, currentTarget, eventObject, true);

                            // Raise leave
                            if (!currentTarget.contains(newTarget)) { // Leave must be called if the new target is not a child of the current
                                dispatchPointerLeave(currentTarget, newTarget, function (targetNode) {
                                    generateTouchEventProxy("pointerleave", touchPoint, targetNode, eventObject, false);
                                });
                            }
                        }

                        if (newTarget) {
                            // Raise over
                            generateTouchEventProxyIfRegistered("pointerover", touchPoint, newTarget, eventObject, true);

                            // Raise enter
                            if (!newTarget.contains(currentTarget)) { // Leave must be called if the new target is not the parent of the current
                                dispatchPointerEnter(newTarget, currentTarget, function (targetNode) {
                                    generateTouchEventProxy("pointerenter", touchPoint, targetNode, eventObject, false);
                                })
                            }
                        }
                        previousTargets[touchPoint.identifier] = newTarget;
                    }
                    setTouchTimer();
                });
            }
        }
    })();
    

    // Extension to navigator
    if (navigator.pointerEnabled === undefined) {

        // Indicates if the browser will fire pointer events for pointing input
        navigator.pointerEnabled = true;

        // IE
        if (navigator.msPointerEnabled) {
            navigator.maxTouchPoints = navigator.msMaxTouchPoints;
        }
    }

    // Handling touch-action css rule
    if (document.styleSheets && document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {

            if (HANDJS.doNotProcessCSS) {
                return;
            }

            var trim = function (string) {
                return string.replace(/^\s+|\s+$/, '');
            };

            var processStylesheet = function (unfilteredSheet) {
                var globalRegex = new RegExp(".+?{.*?}", "m");
                var selectorRegex = new RegExp(".+?{", "m");

                while (unfilteredSheet != "") {
                    var filter = globalRegex.exec(unfilteredSheet);
                    if (!filter) {
                        break;
                    }
                    var block = filter[0];
                    unfilteredSheet = trim(unfilteredSheet.replace(block, ""));
                    var selectorText = trim(selectorRegex.exec(block)[0].replace("{", ""));

                    // Checking if the user wanted to deactivate the default behavior
                    if (block.replace(/\s/g, "").indexOf("touch-action:none") != -1) {
                        var elements = document.querySelectorAll(selectorText);

                        for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                            var element = elements[elementIndex];

                            if (element.style.msTouchAction !== undefined) {
                                element.style.msTouchAction = "none";
                            }
                            else {
                                element.handjs_forcePreventDefault = true;
                            }
                        }
                    }
                }
            }; // Looking for touch-action in referenced stylesheets
            try {
                for (var index = 0; index < document.styleSheets.length; index++) {
                    var sheet = document.styleSheets[index];

                    if (sheet.href == undefined) { // it is an inline style
                        continue;
                    }

                    // Loading the original stylesheet
                    var xhr = new XMLHttpRequest();
                    xhr.open("get", sheet.href, false);
                    xhr.send();

                    var unfilteredSheet = xhr.responseText.replace(/(\n|\r)/g, "");

                    processStylesheet(unfilteredSheet);
                }
            } catch (e) {
                // Silently fail...
            }

            // Looking for touch-action in inline styles
            var styles = document.getElementsByTagName("style");
            for (var index = 0; index < styles.length; index++) {
                var inlineSheet = styles[index];

                var inlineUnfilteredSheet = trim(inlineSheet.innerHTML.replace(/(\n|\r)/g, ""));

                processStylesheet(inlineUnfilteredSheet);
            }
        }, false);
    }

})();
    /* jshint ignore:end */
    /* global AssetManager, ObjectManager */

    /**
     * GFW - Game FrameWork
     * @class GFW Namespace
     * @author Rocco Janse, roccojanse@outlook.com
     * @namespace
     */
    var GFW = {
        /** @lends GFW */

    };

    $.extend(GFW.prototype, {
        /** @lends GFW */


    });

    /**
     * AssetManager class
     * @class Creates object to hold assets used in the game
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    GFW.AssetManager = function() {
        /** @lends GFW.AssetManager */

        // variables
        this._assets = {};
        this._loaded = 0;
        this._total = 0;
        this._progress = 0;
        this._errors = 0;
        this._cache = {};

    };

    $.extend(GFW.AssetManager.prototype, {
        /** @lends GFW.AssetManager */

        /**
         * adds multiple assets at once to the assets queue
         * @param {array} assetsArray Array of assetobjects
         * @see #GFW.AssetManager.add
         * @returns void
         */
        addAssets: function(assetsArray) {
            for (var i = 0; i < assetsArray.length; i++) {
                this.add(assetsArray[i].id, assetsArray[i]);
            }
        },

        /**
         * adds an asset to the assets queue
         * @param {string} id Asset ID (used for asset retrieval)
         * @param {object} asset Asset object ({object}.id required)
         * @returns void
         */
        add: function(id, asset) {
            this._assets[id] = asset;
            this._assets[id].id = id;
            this._total += 1;
        },

        /**
         * starts (pre)loading the asset queue
         * @returns void
         */
        load: function() {

            var _this = this;

            for (var id in this._assets) {

                var asset = this._assets[id];

                // image
                if (asset.type == 'image') {
                    var img = new Image();
                    img.src = asset.path;

                    img.addEventListener('load', function() {    
                        _this._loaded += 1;
                        _this._assets[id].width = this.width;
                        _this._assets[id].height = this.height;
                        _this._cache[id] = img;
                        _this.update();
                    }, false);

                    img.addEventListener('error', function(e) {
                        _this._errors += 1;
                        _this._assets[id] = e;
                        _this._cache[id] = img;
                        _this.update();
                    }, false);

                }

                // audio
                if (asset.type == 'audio') {

                    var audio = document.createElement('audio');
                    var srcMp3 = document.createElement('source');
                    var srcOgg = document.createElement('source');
        
                    audio.id = id;
                    audio.autoplay = false;
                    audio.preload = false;

                    audio.addEventListener('progress', function() {
                        _this._loaded += 1;
                        _this.update();
                        audio.removeEventListener('progress');
                    });

                    srcMp3.src = asset.path;
                    srcMp3.type = 'audio/mpeg';

                    srcOgg.src = asset.path.replace('.mp3', '.ogg');
                    srcOgg.type = 'audio/ogg';

                    audio.appendChild(srcOgg);
                    audio.appendChild(srcMp3);

                    $(document.body).append(audio);

                }

            }            

        },

        /**
         * updates current progress and triggers callbacks
         * @returns void
         */
        update: function() {

            this._progress = Math.round(((this._loaded + this._errors) / this._total)*100);

            this.onProgress(this._total, this._loaded, this._progress);
            
            if (this._loaded === this._total) {
                this.onComplete();
            }
        },

        /**
         * default oncomplete function
         * @returns void
         */
        onComplete: function() {
            return;
        },

        /**
         * default onprogress function
         * @returns {object} stats Object containing total assets, loaded assets and total progress in percs
         */
        onProgress: function(total, loaded, progress) {
            return {
                'total': total,
                'loaded': loaded,
                'progress': progress
            };
        },

        /**
         * is completed check
         * @returns {boolean} completed True or false
         */
        isComplete: function() {
            return (this._loaded + this._errors) === this._total;
        },

        /**
         * returns asset object corresponding to id
         * @param {string} id Asset ID to retrieve
         * @returns {object} asset Asset object
         */
        get: function(id) {
            return this._assets[id];
        },

        /**
         * returns asset from manager cache
         * @param {string} id Asset ID to retrieve
         * @returns {HTMLObject} asset Asset
         */
        getAsset: function(id) {
            return this._cache[id];
        },

        /**
         * clears the asset manager from data
         * @returns void
         */
        clear: function() {
            this._assets = {};
            this._cache = {};
            this._loaded = 0;
            this._erros = 0;
            this._total = 0;
        }

    });
    
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

        add: function(object) {
            this._objects.push(object);
        }

    });

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
        this._image = img;
        this._offset = { left: ol, top: ot };

        this._$object.css({
            'background-image': 'url(' + img + ')',
            'background-position': this._offset.left + 'px, ' + this._offset.top + 'px',
            'background-size': this._width + 'px ' + this._height + 'px'
        });

        this._$object.addClass('sprite');

        return this._$object;
    };

    $.extend(GFW.Sprite.prototype, GFW.Object.prototype, {
        /** @lends GFW.Sprite */

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
    
    /**
     * Game Main class
     * @class Creates main game object
     * @author Rocco Janse, roccojanse@outlook.com
     * @constructor
     */
    var Game = function() {
        /** @lends Game */

        // variables
        var _this = this;
            
        // properties
        this._container = $('#game-container');
        this._width = 1024;
        this._height = 768;
        this._scaleFactor = 1;
  
        this._fps = 60;
        this._reqAnimId = null;
        this._lastFrame = new Date().getTime();

        // global managers
        window.AssetManager = new GFW.AssetManager();
        window.ObjectManager = new GFW.ObjectManager();

        // game states
        this._gameStates = {
            'INIT': 0,
            'LOADING': 1,
            'MAINMENU': 2,
            'PLAYING': 3
        };

        // do init
        this.init();

        return this;

        

    };

    $.extend(Game.prototype, {
        /** @lends Game */

        init: function() {

            var _this = this,
                _winWidth = $(window).width();

            // set gamestate to init
            this._gameState = this._gameStates.INIT;

            // set proportions and scaling
            this._scaleFactor = (_winWidth < this._width) ? Math.round((_winWidth/this._width)*100)/100 : 1;
            this._width = Math.round(this._width*this._scaleFactor);
            this._height = Math.round(this._height*this._scaleFactor);




            AssetManager.add('splash', {
                path: 'assets/img/bg-splash.png',
                type: 'image'
            });

            AssetManager.onComplete = function() {

                var splash = new GFW.Sprite(AssetManager.get('splash').path, _this._width, _this._height, 0, 0, 0, 0, 0);
                var copy = new GFW.Text('(c)2014 OneManClan. Created by Rocco Janse, roccojanse@outlook.com', 'arial', Math.round(400*_this._scaleFactor), 20, Math.round(30*_this._scaleFactor), Math.round(750*_this._scaleFactor), 0);

                
                // var img = AssetManager.getAsset('splash');
                // $(img).width(Math.round(img.width*_this._scaleFactor));
                // console.log('COMPLETE', AssetManager.isComplete());

                console.log(splash, copy);
                _this._container.append(splash).append(copy);    

            };

            AssetManager.onProgress = function(t, l, p) {
                console.log(t, l, p);
            };

            AssetManager.load();

            console.log('COMPLETE?', AssetManager.isComplete());

        },

        /**
         * Main game logic
         * @return void
         */
        mainLoop: function() {

            var tm = new Date().getTime();
            this._reqAnimId = window.requestAnimationFrame(this.mainLoop.bind(this));
            var dt = (tm - this._lastFrame) / 1000;
            if(dt > 1/15) { dt = 1/15; }
            
            //this.physics.step(dt);
            //this.renderer.drawFrame(dt);
            this._lastFrame = tm;

        },

        /**
         * Start game loop
         * @return void
         */
        start: function() {

            this.mainLoop();
        },

        /**
         * Stop game loop
         * @param {Integer} reqAnimId Id of animation to stop
         * @return void
         */
        stop: function(reqAnimId) {

            var animId = reqAnimId || this._reqAnimId;
            if (animId === 0) { return; }

            window.cancelAnimationFrame(animId);
        }

    });


})(jQuery);