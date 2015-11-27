/*global
    define:false,
    Widgets:false
 */
define([
    'jquery', 
    'can/util/jquery', 
    'mustache!./latex_editor_with_toolbar.mustache', 
    'css!./latex_editor_with_toolbar.css', 
    'can/component', 
    'can/map/define', 
    'math_components/latex_editor/latex_editor', 
    'math_components/latex_toolbar/latex_toolbar',
    'widgets/manager/manager'
], function($, can, editorTemplate) {
    "use strict";

    /**
     * @name mc-latex-editor-with-toolbar
     */
    can.Component.extend({
        tag: 'mc-latex-editor-with-toolbar',
        template: editorTemplate,
        scope: {
            prefix: '',
            suffix: '',
            latex: '',
            define: {
                editable: {
                    type: 'boolean',
                    value: true
                },
                toolbar: {
                    Value: Array
                },
                operatorsUsedHint: {
                    Value: Array
                }
            }
        },
        events: {
            inserted: function() {
                Widgets.Manager.render(this.element.find('.prefix'));
                Widgets.Manager.render(this.element.find('.suffix'));
            },
            'buttonClick.mc-latex-toolbar': function(elm, ev, commandObj) {
                var $editor = $('mc-latex-editor', this.element);
                $editor.trigger('command.mc-latex-editor', commandObj);
            },
            'ready.mc-latex-toolbar': function() {
                this._resizeElements();
            },
            ' requestFocus': function(elm, ev) {
                ev.stopPropagation();
                var $editor = $('mc-latex-editor', this.element);
                $editor.trigger('requestFocus');
            },
            _resizeElements: function() {
                var prefixWidth = this.element.find('.prefix').outerWidth();
                var suffixWidth = this.element.find('.suffix').outerWidth();
                var inputWidget = this.element.find('.mathquill-container');
                var toolbarWidget = this.element.find('mc-latex-toolbar');

                // Align the left of the toolbar with the left of the
                // input.
                if (toolbarWidget) {
                    toolbarWidget.css({
                        'margin-left': prefixWidth
                    });
                }
                /*
                 * labelFitWidth - the editor should be wide enough to fit
                 * the label without wrapping:
                 * ----------------------------- --------
                 *  Editor with long math label   Suffix
                 * ----------------------------- --------
                 * ---------
                 *  Toolbar
                 * ---------
                 */
                var mathInputLabel = this.element.find('.math-input-label:first');
                var labelPadding = 10;
                var labelFitWidth = mathInputLabel.outerWidth(true) + labelPadding;
                /*
                 * toolbarFitWidth - the editor + suffix should be at least as
                 * wide as the toolbar below:
                 * -------------------- --------
                 *  Editor               Suffix
                 * -------------------- --------
                 * -----------------------------
                 *  Toolbar that is really long
                 * -----------------------------
                 */
                var toolbarFitWidth = toolbarWidget.innerWidth()  - suffixWidth;
                inputWidget.css({
                    'min-width': Math.max(labelFitWidth, toolbarFitWidth)
                });
            }
        }
    });
});
