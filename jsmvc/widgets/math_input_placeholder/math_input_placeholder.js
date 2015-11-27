/*global
    define:false,
    Widgets:false
 */
define([
    'jquery', 
    'css!./css/math_input_placeholder.css', 
    'jquerypp/controller/controller', 
    'widgets/math_input/math_input'
], function($) {
    'use strict';

    /**
     * @class Widgets.MathInputPlaceholder
     * @extends jQuery.Controller
     */
    $.Controller.extend('Widgets.MathInputPlaceholder',
        /** @static */
        {
            defaults: {
                $placeholder: null,
                text: 'Default placeholder text'
            }
        },
        /** @prototype */
        {
            _wasBlank: null,
            init: function() {
                this.buildPlaceholder();
                this.refresh();
            },
            destroy: function() {
                this.options.$placeholder.remove();
                this._super();
            },
            buildPlaceholder: function() {
                var $target = this.element;

                $target.parent().css({'position': 'relative'});

                var placeholderStyle = {
                    height: $target.height() + 'px',
                    width: $target.width() + 'px',
                    lineHeight: $target.css('line-height'),
                    // Add 3 pixels so the cursor do not overlaps on the first letter
                    paddingLeft: (
                        parseInt($target.css('padding-left'), 10) +
                        3 +
                        'px'
                    ),
                    paddingTop: (
                        parseInt($target.css('padding-top'), 10) +
                        parseInt($target.css('border-top-width'), 10) +
                        parseInt($target.css('margin-top'), 10) +
                        'px'
                    )
                };

                var $placeholder = $('<div />').addClass('math_input_label')
                                                .text(this.options.text)
                                                .css(placeholderStyle)
                                                .insertBefore($target);

                this.update({'$placeholder': $placeholder});
            },
            /**
             * Listen to clicks received on the label; it means the user
             * wanted to focus on the field, so make that happen.
             */
            '{$placeholder} click': function() {
                this.element.controller(Widgets.MathInput).focusField();
            },
            /**
             * React to any changes to the math input field.
             */
            ' latexchange.mathinput': function() {
                this.refresh();
            },
            hide: function(){
                this.options.$placeholder.css('visibility', 'hidden');
            },
            show: function() {
                this.options.$placeholder.css('visibility', 'visible');
            },
            /**
             * Update the visibility of the placeholder text.
             */
            refresh: function() {
                // The placeholder visibility is determined by whether
                // the field is blank.

                // MathInput may not exists, if this is on mobile site
                var controller =
                    this.element.controller(Widgets.MathInput) ||
                        this.element.controller(Widgets.MathDisplay);

                var isBlank = controller.hasContent() !== true;

                // Only update if the "blankness" property has changed
                // since last time.
                if (isBlank !== this._wasBlank) {
                    this._wasBlank = isBlank;
                    if (isBlank) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
            }
        });
});