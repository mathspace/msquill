/*globals
    define:false,
    Widgets:false
 */
define([
    'jquery', 
    'jquerypp/controller/controller', 
    'widgets/accesskey/accesskey'
], function($) {
    'use strict';

    /**
     * @class Widgets.MathInputShortcuts
     * @extends jQuery.Controller
     */
    $.Controller.extend('Widgets.MathInputShortcuts',
        /** @static */
        {
            defaults: {
                keys: []
            }
        },
        /** @prototype */
        {
            _focused: null,
            init: function() {
                $(this.element).widgets_accesskey({
                    keys: this.options.keys
                });
            },
            destroy: function() {
                this._focused = null;
                this._super();
            },
            setFocused: function(elm) {
                this._focused = elm;
            },
            'key.math_input_shortcuts': function(elm, event, key) {
                if (this._focused) {
                    this._focused.widgets_math_input(
                        'handleShortcutCommand',
                        key
                    );
                }
            }
        }
    );
});
