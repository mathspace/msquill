/*globals
    define:false,
    Widgets:false,
    UIComponents:false
 */
define([
    'jquery', 
    'jquerypp/controller/controller', 
    'widgets/math_input/math_input'
], function($) {
    'use strict';

    /**
     * Responsible for instantiating rich widgets that are in their
     * "deflated" form, within the target element.
     *
     * NOTE: Do not use by instantiating this controller directly.
     * Instead, use ``Widgets.Manager.render(targetElement);``.
     * This is to ensure that repeated calls on the same element will
     * still work.
     *
     * @class Widgets.Manager
     * @extends jQuery.Controller
     */
    $.Controller.extend("Widgets.Manager",
        /** @static */
        {
            defaults: {
                /**
                 * Defines the maximum height to render any widgets at.
                 * @type Number
                 */
                maxWidgetHeight: 400,
                /**
                 * Defines the maximum width to render any widgets at.
                 * @type Number
                 */
                maxWidgetWidth: 400
            },
            /**
             * Renders any rich widgets that are yet to be instantiated,
             * in a given element.
             *
             * @param {jQuery} elm - Target element
             * @param {Object} opts - Hash-map of options to pass to the
             *      controller's constructor.
             */
            render: function(elm, opts) {
                var $elm = $(elm).widgets_manager(opts);

                // This is so a second call on the same element will still
                // work.
                $elm.widgets_manager('destroy');
            }

        },
        /** @prototype */
        {
            /**
             * Controller initialisation.
             */
            init: function() {
                this._renderWidgets();
            },
            /**
             * Renders deflated math expressions.
             * @private
             */
            _renderMathExpressions: function() {
                var deflatedWidgets = this.element.find('.mathquill-embedded-latex:not(.mathquill-rendered-math)');
                deflatedWidgets.widgets_math_display();
            },

            /**
             * Renders deflated math inline (but non-interactive) fields.
             * @private
             */
            _renderMathInlineFields: function() {
                // .js-inline-control is the old django rendered template
                // todo: migrate to new js driven problem preview api
                // todo: Remove custom tag selectors after we stop using .latex-map-value
                // Double rendering will break mathquill.
                var deflatedWidgets = this.element.addBack()
                    .find('.latex-map-value, .js-inline-control')
                    .not('.mathquill-rendered-math')
                    .not('mc-latex-editor')
                    .not('mc-writing-panel-input');

                deflatedWidgets.each(function() {
                    var $input = $(this);
                    $input.widgets_math_input();

                    // Enforces read-only / non-interactive mode.
                    $input.widgets_math_input('disable');
                });
            },
            /**
             * Renders all rich widgets within this controller's element.
             * @private
             */
            _renderWidgets: function() {
                this._renderMathExpressions();
                this._renderMathInlineFields();
            }
        });

});
