/*global
    define:false
 */
define([
    'jquery', 
    'can/util/jquery', 
    'can/component',
    'can/map/define'
], function($, can) {
    "use strict";

    var userAgent = navigator.userAgent;
    var isMacOS = (userAgent.indexOf('Mac') !== -1);
    // IE11 does not report MSIE; IE9 does not always report Trident.
    var isInternetExplorer = (
        (userAgent.indexOf('MSIE') !== -1) ||
        (userAgent.indexOf('Trident') !== -1)
    );

    /**
     * Emits a `key.uc-shortcut-keys` event when a keyboard shortcut is
     * pressed.
     *
     * @name uc-shortcut-keys
     */
    can.Component.extend({
        tag: 'uc-shortcut-keys',
        template: ' ',
        scope: {
            define: {
                // NOTE: We do not support changing `keys` after instantiation.
                keys: {
                    value: function() {
                        return [];
                    }
                }
            }
        },
        events: {
            inserted: function() {
                var _new = false;
                if (!this.keyhandlers) {
                    _new = true;
                    this.keyhandlers = {};
                    this.div = $(document.createElement("div"));
                    this.div.css({
                        position:'fixed',
                        top:0,
                        left:0
                    });
                }
                var i;
                var keysCount = this.scope.attr('keys').length;
                for (i = 0; i < keysCount; i += 1) {
                    this.addKey(this.scope.attr('keys')[i].toLowerCase());
                }
                /*
                 This breaks IE 8 support
                 this.div.css({
                 display: "none"
                 });
                 */
                if (_new) {
                    this.element.append(this.div);
                }
            },
            modifier: function(callback) {
                callback(this._modifier());
            },
            _modifier: function() {
                var str = {
                    ctrlalt:"Ctrl+Alt",
                    alt:"Alt",
                    ctrl:"Ctrl",
                    altshift:"Alt+Shift",
                    shift:"Shift",
                    shiftesc:"Shift+ESC",
                    ctrlopt:"Control+Opt"
                };
                var linux = /Linux/i.test(userAgent);
                if (/Amaya/i.test(userAgent)) { // Regex guessed
                    return str.ctrlalt;
                } else if (/Blazer/i.test(userAgent)) { // Regex guessed
                    return "";
                } else if (/Camino/i.test(userAgent)) {
                    return str.ctrl;
                } else if (/Chrome/i.test(userAgent)) {
                    return isMacOS ? str.ctrlopt : (linux ? str.altshift : str.alt);
                } else if (/FireFox/i.test(userAgent)) { //Version 2, 3, 4, 5
                    return isMacOS ? str.ctrl : str.altshift;
                } else if (isInternetExplorer) {
                    //IE7: alt+shift
                    return str.alt;
                } else if (/Konqueror/i.test(userAgent)) {
                    return str.ctrl;
                } else if (/Safari/i.test(userAgent)) {
                    if (!isMacOS) {
                        return str.alt;
                    }
                    var m = /Version\/([\d\.]+)/.exec(userAgent);
                    if (m) {
                        var ver = m[1].split(".");
                        return (ver[0] >= 4) ? str.ctrlopt : str.ctrl;
                    }
                }
                throw("Browser Unknown");
            },
            addKey: function(key) {
                function createHandler(key) {
                    var link = document.createElement("a");
                    /* jshint -W107 */
                    link.href = "javascript:;"; // IE Hack
                    /* jshint +W107 */
                    link.accessKey = key;
                    var $elm = $(link);
                    $elm.addClass('accesskey-key'); // for scoping handlers
                    return $elm;
                }

                if (this.keyhandlers[key] === undefined) {
                    var h = createHandler(key);
                    this.div.append(h);
                    this.keyhandlers[key] = h;
                }
            },
            removeKey: function(key) {
                if (this.keyhandlers[key] !== undefined) {
                    this.keyhandlers[key].remove();
                    this.keyhandlers[key] = undefined;
                }
            },
            'a.accesskey-key focus': function(element, event) {
                //In IE 8, links are only focused on

                if (isInternetExplorer) { //In Firefox, it is also focused on, (multiple times).
                    // If it is IE, from 8 to 10.
                    event.preventDefault();
                    this.element.trigger('key.uc-shortcut-keys', [element[0].accessKey]);
                    element[0].blur();
                    return false;
                }
            },
            'a.accesskey-key click': function(element, event) {
                event.preventDefault();
                this.element.trigger('key.uc-shortcut-keys', [element[0].accessKey]);
                element[0].blur(); // Fixes firefox reclick on enter bug.
                return false;
            }
        }
    });
});
