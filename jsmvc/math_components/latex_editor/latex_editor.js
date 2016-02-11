/*global
    define:false
 */
define([
    'jquery', 
    'can/util/jquery', 
    'mustache!./latex_editor.mustache',
    'can/component',
    'can/map/define',
    'css!./latex_editor.css',
    'css!widgets/math_input/resources/mathquill.css',
    'ui_components/shortcut_keys/shortcut_keys',
    'widgets/math_input/resources/mathquill'
], function($, can, latexEditorTemplate) {
    "use strict";

    var MATHQUILL_DATA_KEY = '[[mathquill internal data]]';

    /**
     * Mapping of shortcut keys to Widgets.MathInput functions.
     */
    var keyCommandsMap = {
        'p': { name: 'writeLatex', args: ['\\pi'] },
        't': { name: 'writeLatex', args: ['\\triangle'] },
        'a': { name: 'writeLatex', args: ['\\angle'] },
        'v': { name: 'writeNthRoot', args: ['\\sqrt{}'] }, // for square root
        '-': { name: 'writeLatex', args: ['\\pm'] },
        'm': { name: 'writeLatex', args: ['\\text{is common}'] },
        '/': { name: 'writeMixedFraction', args: ['\\frac{}{}'] }
    };

    /**
     * Latex Editor
     * See sandbox page for usages
     * @name mc-latex-editor
     * @example <mc-latex-editor latex="{myExpression}"></mc-latex-editor>
     */
    can.Component.extend({
        tag: 'mc-latex-editor',
        template: latexEditorTemplate,
        scope: {
            define: {
                editable: {
                    type: 'boolean',
                    value: false
                },
                inline: {
                    type: 'boolean',
                    value: true
                },
                /**
                 * Indicates this editor has blinking cursor
                 */
                isInFocus: {
                    type: 'boolean',
                    value: false
                },
                showPlaceholder: {
                    get: function() {
                        var isEditable = this.attr('editable');
                        var hasLatex = Boolean(this.attr('latex'));
                        var isInline = this.attr('inline');

                        return isEditable && !hasLatex && !isInline;
                    }
                },
                showBorder: {
                    get: function() {
                        /*
                            todo: Same as writing_panel_input
                            If it contains editable, do not show border regardlessly
                            Otherwise should hide border if that's not editable
                         */
                        var isInlineBox = this.attr('inline');
                        var hasInlineEditable = this.attr('hasInlineEditable');
                        var isEditable = this.attr('editable');
                        if (hasInlineEditable) {
                            return false;
                        }
                        if (isInlineBox) {
                            if (isEditable) {
                                return true;
                            } else {
                                return false;
                            }

                        }
                        return isEditable;
                    }
                },
                hasInlineEditable: {
                    get: function() {
                        return this.attr('latex').indexOf('\\editable') > -1;
                    }
                },
                keyCommandsList: {
                    get: function(){
                        return $.map(keyCommandsMap, function(obj, key) {
                            return key;
                        });
                    }
                }
            },
            latex: '',
            placeholderText: 'Enter your next step here'
        },
        events: {
            inserted: function() {
                var self = this;
                var elm = this.element.find('.mathquill-element');

                if (this.scope.attr('editable')) {
                    this.mathFieldAPI = MathQuill.MathField(elm[0], {
                        preventBackslash: true,
                        spaceBehavesLikeTab: true,
                        handlers: {
                            edit: function(mathField) {
                                self.scope.attr('latex', mathField.latex());
                            }
                        }
                    });
                    this.buildPlaceholder();
                } else {
                    this.mathFieldAPI = MathQuill.StaticMath(elm[0], {});
                }
            },
            '.math-input-label click': function() {
                // When the placeholder is clicked, focus the field.
                this.element.trigger('requestFocus');
            },
            '.mathquill-element textarea focus': function() {
                this.scope.attr('isInFocus', true);
            },
            '.mathquill-element textarea blur': function() {
                this.scope.attr('isInFocus', false);
            },
            'command.mc-latex-editor': function(elm, ev, commandObj) {
                this.executeCommand(commandObj);
            },
            'key.uc-shortcut-keys': function(elm, ev, key) {
                ev.stopPropagation();
                if (keyCommandsMap[key]) {
                    this.executeCommand(keyCommandsMap[key]);
                }
                this.focusField();
            },
            buildPlaceholder: function() {
                var $target = this.element.find('.mathquill-container');
                var $label = this.element.find('.math-input-label');
                var placeholderStyle = {
                    height: $target.height() + 'px',

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
                $label.css(placeholderStyle);
            },
            executeCommand: function(commandObj) {
                if ($.isFunction(this[commandObj.name])) {
                    this[commandObj.name].apply(this, commandObj.args);
                }
            },
            sendChar: function(character) {
                this.mathFieldAPI.typedText(character);
                this.focusField();
            },
            writeLatex: function(character) {
                this.mathFieldAPI.write(character);
                this.focusField();
            },
            /**
             * Use MathQuill to input a MixedFraction.
             *
             * @param {String} latex - the latex to write. e.g. "\\frac{}{}"
             */
            writeMixedFraction: function(latex) {
                this.writeLatex(latex);
                var ctl = this.mathFieldAPI.__controller;
                ctl.moveLeft();
                ctl.moveLeft();
                ctl.moveLeft();
            },
            /**
             * Use MathQuill to input an nth-root.
             *
             * @param {String} latex -the latex to write. e.g. "\\sqrt[3]{}"
             */
            writeNthRoot: function(latex) {
                this.writeLatex(latex);

                // Now put the cursor in a place convenient for the user.
                var ctl = this.mathFieldAPI.__controller;
                ctl.moveLeft(); // Move cursor into nthroot
            },
            /**
             * Use MathQuill to input a log with base value
             * @param latex
             */
            writeLogWithBase: function(latex) {
                this.writeLatex(latex);
                var ctl = this.mathFieldAPI.__controller;
                ctl.moveLeft();
                ctl.moveLeft();
                ctl.moveLeft();
            },
            /**
             * Sets MathQuill selection to the whole expression contained in
             * the field.
             */
            selectAll: function() {
                this.mathFieldAPI.select();
            },
            ' requestFocus': function(elm, ev) {
                ev.stopPropagation();
                if(!this.scope.attr('hasInlineEditable')) {
                    this.selectAll();
                }
                this.focusField();
            },
            /**
             * Set focus to MathQuill field, in a cross-browser friendly way.
             *
             * This will set focus to the first inner editable field, if there
             * is one.
             */
            focusField: function() {
                //var self = this;
                //
                //var _focusField = function($elm) {
                //    $elm.focus();
                //    self._shortcuts.widgets_math_input_shortcuts('setFocused', self.element);
                //};
                //
                //// Focus on first inner editable, if one exists -- else just focus on container
                //var $innerField = this.element.find('textarea:first');
                //_focusField(($innerField.length) ? $innerField : this.element);
                // todo: Test on inner editable
                this.mathFieldAPI.focus();

            },
            /**
             * Unfocus the MathQuill field, in a cross-browser friendly way.
             */
            blurField: function() {
                this.mathFieldAPI.blur();
            },
            '{scope} latex change': function() {
                // todo: Same as writing_panel_input.js
                if (this.mathFieldAPI) {
                    var mathquillLatex = this.mathFieldAPI.latex();
                    var newLatex = this.scope.attr('latex');

                    // Don't make mathquill re-render, if it already
                    // represents the same latex. That means the user
                    // initiated the latex change, and causing a render
                    // now will lose the position of the cursor!
                    if (mathquillLatex !== newLatex) {
                        this.mathFieldAPI.latex(newLatex);
                    }
                }
            }
        }
    });
});
