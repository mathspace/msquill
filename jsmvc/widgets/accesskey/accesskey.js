define([
    'jquery', 
    'jquerypp/controller/controller'
], function ($) {

    // We can't use "use strict" in production mode
    // "use strict";

    var n = navigator.userAgent;
    var mac = /Mac/i.test(n);

    $.Controller.extend('Widgets.Accesskey',
        /** @static */
        {
            defaults:{
                keys:[]      // example: keys: ["A","B","C"]

            }
        },
        /** @prototype */
        {
            init:function (el, options) {
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

                var i, l;
                for (i = 0, l = this.options.keys.length; i < l; i++) {
                    this.addKey(this.options.keys[i].toLowerCase());
                }
                /*
                 This breaks IE 8 support
                 this.div.css({
                 display: "none"
                 });
                 */
                var self = this;
                if ($.browser.opera) {
                    $(document.body).bind("keydown.accesskey_widget", function (e) {
                        self.keyDownEvent_opera(document.body, e);
                    });
                }
                else if (_new) {
                    $(el).append(this.div);
                }
            },
            /**
             * Destructor
             */
            destroy:function () {
                if ($.browser.opera) {
                    $(document.body).unbind("keydown.accesskey_widget");
                }
                this._super();
            },
            'keyDownEvent_opera':function (el, e) {
                if (mac) {
                    if (!(e.altKey /*&& e.ctrlKey*/)) {
                        //ctrl + opt. For some reason, opera doesn't set e.ctrlKey = true.
                        return;
                    }
                } else {
                    if (!(e.altKey && e.shiftKey)) {
                        return;
                    }
                    if (e.which == 16) {
                        return;
                    }
                }
                var key;
                if (mac) {
                    if (e.which <= 26) {
                        key = "-ABCDEFGHIJKLMNOPQRSTUVWXYZ"[e.which];
                    } else if (e.which == 31) {
                        key = "-";
                    } else if (e.which == 61) {
                        key = "=";
                    } else if (e.which == 27) {
                        key = "[";
                    } else if (e.which == 29) {
                        key = ']';
                    } else if (e.which == 28) {
                        key = "\\";
                    } else if (e.which == 59) {
                        key = ';';
                    } else if (e.which == 222) {
                        key = "'";
                    } else if (e.which == 188) {
                        key = ",";
                    } else if (e.which == 190) {
                        key = ".";
                    } else if (e.which == 191) {
                        key = "/";
                    } else {
                        key = String.fromCharCode(e.which);
                    }
                } else {
                    if (e.which === 192) {
                        key = '`';
                    } else if (e.which === 189) {
                        key = "-";
                    } else if (e.which === 187) {
                        key = "=";
                    } else if (e.which === 219) {
                        key = "[";
                    } else if (e.which === 221) {
                        key = "]";
                    } else if (e.which === 220) {
                        key = "\\";
                    } else if (e.which === 186) {
                        key = ";";
                    } else if (e.which === 222) {
                        key = "'";
                    } else if (e.which === 188) {
                        key = ",";
                    } else if (e.which === 190) {
                        key = ".";
                    } else if (e.which === 191) {
                        key = "/";
                    } else {
                        key = String.fromCharCode(e.which);
                    }
                }
                if (this.keyhandlers[key]) {
                    e.preventDefault();
                    this.element.trigger('key', [key]);
                    return false;
                }
            },
            'modifier':function (callback) {
                callback(this._modifier());
            },
            '_modifier':function () {
                var str = {
                    ctrlalt:"Ctrl+Alt",
                    alt:"Alt",
                    ctrl:"Ctrl",
                    altshift:"Alt+Shift",
                    shift:"Shift",
                    shiftesc:"Shift+ESC",
                    ctrlopt:"Control+Opt"
                };
                var n = navigator.userAgent;
                var linux = /Linux/i.test(n);
                if (/Amaya/i.test(n)) { // Regex guessed
                    return str.ctrlalt;
                } else if (/Blazer/i.test(n)) { // Regex guessed
                    return "";
                } else if (/Camino/i.test(n)) {
                    return str.ctrl;
                } else if (/Chrome/i.test(n)) {
                    return mac ? str.ctrlopt : (linux ? str.altshift : str.alt);
                } else if (/FireFox/i.test(n)) { //Version 2, 3, 4, 5
                    return mac ? str.ctrl : str.altshift;
                } else if (/MSIE/.test(n)) {
                    //IE7: alt+shift
                    return str.alt;
                } else if (/Konqueror/i.test(n)) {
                    return str.ctrl;
                } else if (/Opera/i.test(n)) {
                    return mac ? str.ctrlopt : str.altshift;
                } else if (/Safari/i.test(n)) {
                    if (!mac) {
                        return str.alt;
                    }
                    var m = /Version\/([\d\.]+)/.exec(n);
                    if (m) {
                        var ver = m[1].split(".");
                        return (ver[0] >= 4) ? str.ctrlopt : str.ctrl;
                    }
                }
                throw("Browser Unknown");
            },
            'addKey':function (key) {
                if ($.browser.opera) {
                    this.keyhandlers[key] = {remove:function () {
                    }};
                    return;
                }
                function createHandler(key) {
                    var o = document.createElement("a");
                    o.href = "javascript:;"; //IE Hack
                    o.accessKey = key;
                    var $elm = $(o);
                    $elm.addClass('accesskey-key'); // for scoping handlers
                    return $elm;
                }

                if (this.keyhandlers[key] === undefined) {
                    var h = createHandler(key);
                    this.div.append(h);
                    this.keyhandlers[key] = h;
                }
            },
            'addKeys':function (keys) {
                var i, l;
                for (i = 0, l = keys.length; i < l; i++) {
                    this.addKey(keys[i]);
                }
            },
            'removeKey':function (key) {
                if (this.keyhandlers[key] !== undefined) {
                    this.keyhandlers[key].remove();
                    this.keyhandlers[key] = undefined;
                }
            },
            'a.accesskey-key focus':function (el, e) {
                //In IE 8, links are only focused on

                if ($.browser.msie) { //In Firefox, it is also focused on, (multiple times).
                    // If it is IE, from 8 to 10.
                    e.preventDefault();
                    this.element.trigger('key', [el[0].accessKey]);
                    el[0].blur();
                    return false;
                }
            },
            'a.accesskey-key click':function (el, e) {
                e.preventDefault();
                this.element.trigger('key', [el[0].accessKey]);
                el[0].blur(); // Fixes firefox reclick on enter bug.
                return false;
            }
        });
});