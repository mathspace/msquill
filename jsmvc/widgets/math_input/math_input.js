/*global
    document:false,
    define:false,
    Widgets:false,
    MathQuill:false
 */
define([
    'jquery', 
    'widgets/math_input/resources/mathquill',
    'jquerypp/controller/controller',
    'widgets/math_input_shortcuts/math_input_shortcuts',
    'css!widgets/math_input/resources/mathquill.css'
], function($, MathQuill) {
    "use strict";

    /**
     * Exposed an internal detail of MathQuill so that we can implement
     * commands that operate on the MathQuill internal data structure directly.
     */
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
     * Array of keys to listen to, for shortcut keys.
     */
    var keyCommandsList = $.map(keyCommandsMap, function(obj, key) { return key; });


    /**
     * Widgets.MathDisplay is a wrapper around $.fn.mathquill().
     *
     * It is to encapsulate a DOMElement that represents a math expression,
     * formatted for display purposes (not editable).
     *
     * @class Widgets.MathDisplay
     * @extends jQuery.Controller
     */
    $.Controller.extend('Widgets.MathDisplay',
        /** @static */
        {
            defaults: {}
        },
        /** @prototype */
        {
            /**
             * Constructor.
             */
            init: function() {
                 this.mathFieldAPI = MathQuill.StaticMath(this.element[0]);
            },
            /**
             * Return true if the latex value is of non-zero length.
             * @return {Boolean}
             */
            hasContent: function() {
                return Boolean(this.mathFieldAPI.latex() > 0);
            },
            /**
             * Returns Latex representation of expression in given MathQuill field
             *
             * @return {String} latex value.
             */
            latex: function() {
                return this.mathFieldAPI.latex();
            }
        }
    );


    /**
     * Widgets.MathInput is a wrapper around $.fn.mathquill(), and extends
     * from Widgets.MathDisplay.
     *
     * It is to encapsulate a DOMElement that represents a math expression
     * editor; it builds upon MathQuill's editable mode to add shortcut keys
     * and other editor features.
     *
     * @class Widgets.MathInput
     * @extends jQuery.Controller
     */
    Widgets.MathDisplay.extend('Widgets.MathInput',
        /** @static */
        {
            defaults: {}
        },
        /** @prototype */
        {
            /**
             * The last valid latex value.
             *
             * @type {String}
             */
            _lastLatexValue: '',
            /**
             * Reference to the Widgets.MathInputShortcuts subcontroller.
             * @type {Widgets.MathInputShortcuts}
             */
            _shortcuts: null,
            /**
             * Constructor
             *
             */
            init: function() {
                // Initialise the shortcuts.
                this._shortcuts = $(document.body).widgets_math_input_shortcuts({
                    keys: keyCommandsList
                });
                var self = this;
                // todo: Add arc_, _h, arc_h, a_, and a_h versions of each.
                var autoOperators = [
                    'sin', 'cos', 'tan', 'sec', 'cosec', 'csc', 'cotan', 'cot', 'ctg'
                ].join(' ');
                this.mathFieldAPI = MathQuill.MathField(this.element[0], {
                    autoOperatorNames: autoOperators,
                    handlers: {
                        edit: function(control) {
                            self.element.trigger('latexupdate.mathquill', control.latex());
                        }
                    }
                });
            },
            destroy: function() {
                this._shortcuts = null;
                this._super();
            },
            /**
             * Returns Latex representation of expression in our MathQuill
             * field.
             *
             * @return {String}
             */
            latexForParser: function() {
                return this.mathFieldAPI.latex() || "";
            },
            /**
             * Check if there was a possible change in our latex value,
             * and trigger the latex change event.
             *
             * @private
             */
            _possibleLatexChange: function() {
                var latex = this.latexForParser();
                var changed = (this._lastLatexValue !== latex);
                if (changed) {
                    this._lastLatexValue = latex;
                    this._triggerLatexChange(latex);
                }
            },

            /**
             * Trigger a latex change event on our DOM element, with the new
             * latex value.
             *
             * @param {String} latex - changed latex value.
             * @private
             */
            _triggerLatexChange: function(latex) {
                // Trigger a jQuery Custom Event, to notify of changes to our
                // latex value.
                this.element.trigger('latexchange.mathinput', latex);
            },

            /**
             * Listen for keyup events, so we may trigger any possible latex
             * change events.
             *
             * Note that we're implicitly ignoring keypresses that don't
             * eventuate in a latex change, such as TAB or ENTER keys.
             */
            ' latexupdate.mathquill': function() {
                var self = this;
                self._possibleLatexChange();
            },
            /**
             * Update the MathQuill field to display an expression with latex
             * errors highlighted.
             *
             * @param {String} correct Fragment of the whole latex string that was parsed correctly
             * @param {String} remaining Remaining fragment of whole latex string that could not be parsed
             *
             */
            writeLatexError: function(correct, remaining) {

                // write the unparsed latex and highlight
                // * we add a class to apply styles to elements
                //   where the color of other CSS properties need to change,
                //   e.g. borders
                // * we add an inline style, because mathquill has a quirk
                //   where it will remove classes applied to elements.
                this.mathFieldAPI.latex(remaining);

                this.element.children('.mq-root-block').children()
                                                        .addClass('latexerror')
                                                        .css('color','red');
                this.mathFieldAPI.moveToLeftEnd();
                this.mathFieldAPI.write(correct);
            },
            /**
             * Clears out the latex value.
             */
            clear: function() {
                this.mathFieldAPI.latex('');

            },

            /**
             * Sets MathQuill selection to the whole expression contained in
             * the field.
             */
            selectAll: function() {
                this.mathFieldAPI.select();
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
            /**
             * Handle mouse click events.
             */
            'click': function() {
                this._setShortcutsFocus();
            },
            /**
             * Handle when the MathQuill field is focused on, especially
             * through use of the TAB key.
             */
            'textarea focus': function() {
                this._setShortcutsFocus();
            },
            /**
             * Handle when the the mouse is used to focus on the field.
             */
            'mousedown': function() {
                this._setShortcutsFocus();
            },
            /**
             * Tells the Shortcuts subcontroller that this field is the
             * target for any shortcut keypresses.
             * @private
             */
            _setShortcutsFocus: function() {
                this._shortcuts.widgets_math_input_shortcuts('setFocused', this.element);
            },
            /**
             * Handle shortcut combination used.
             * @param {String} key
             */
            handleShortcutCommand: function(key){
                if (keyCommandsMap[key]) {
                    var commandObj = keyCommandsMap[key];
                    this.executeCommand(commandObj);
                }
                this.focusField();
            },

            /**
             * Executes a command object
             *
             * @param {Object} command Object literal with `name` and `args` entries.
             */
            executeCommand: function(command) {
                var commandHandler = this[command.name];
                if (commandHandler) {
                    commandHandler.apply(this, command.args);
                }
            },

            /**
             * Converts this element to Widgets.MathDisplay, hence making
             * the fields non-editable.
             */
            disable: function() {
                // Convert to a math display field
                var $elm = this.element;
                var latex = this.mathFieldAPI.latex();
                // Can't use revert straight away as it restores to the original un-edited latex input
                this.mathFieldAPI.revert().widgets_math_input('destroy');
                $elm.text(latex);
                $elm.widgets_math_display();
            },
            /**
             * Handlers for MathQuill commands, which generally allow us to
             * input some latex and correct the position of the cursor after.
             * Used by shortcut keys and Widgets.MathToolbar.
             */

            /**
             * Sends a character to MathQuill, so that it will trigger
             * same behavior as a user typing that character.
             * This is to leverage its built-in behaviors as much as
             * possible.
             *
             * @param character String containing character to send
             */
            'sendChar': function(character) {
                var input = this.element;
                var data = input.data(MATHQUILL_DATA_KEY),
                        block = data && data.block,
                        cursor = block && block.cursor;
                if (cursor) {
                    cursor.write(character);
                    this._possibleLatexChange();
                    input.widgets_math_input('focusField');
                }
            },

            /**
             * Use MathQuill to input some latex directly.
             *
             * @param latex String containing latex to write
             */
            'writeLatex': function(latex) {
                var input = this.element;
                input.mathquill('write', latex);
                this._possibleLatexChange();
                input.widgets_math_input('focusField');
            },

            /**
             * Use MathQuill to input a MixedFraction.
             *
             * @param {String} latex - the latex to write. e.g. "\\frac{}{}"
             */
            'writeMixedFraction': function(latex) {
                this.writeLatex(latex);

                // Now put the cursor in a place convenient for the user.
                var input = this.element;
                var data = input.data(MATHQUILL_DATA_KEY),
                        block = data && data.block,
                        cursor = block && block.cursor;
                cursor.moveLeft();
                cursor.moveLeft();

                if (!cursor.parent.parent.prev || isNaN(cursor.parent.parent.prev.cmd)) {
                    cursor.moveLeft();
                }
            },
            /**
             * Use MathQuill to input an nth-root.
             *
             * @param {String} latex -the latex to write. e.g. "\\sqrt[3]{}"
             */
            'writeNthRoot': function(latex) {
                this.writeLatex(latex);

                // Now put the cursor in a place convenient for the user.
                var input = this.element;
                var data = input.data(MATHQUILL_DATA_KEY),
                        block = data && data.block,
                        cursor = block && block.cursor;
                cursor.moveLeft(); // Move cursor into nthroot
            },
            /**
             * Use MathQuill to input a log with base value
             * @param latex
             */
            writeLogWithBase: function(latex) {
                this.writeLatex(latex);
                var input = this.element;
                var data = input.data(MATHQUILL_DATA_KEY),
                        block = data && data.block,
                        cursor = block && block.cursor;
                cursor.moveLeft();
                cursor.moveLeft();
                cursor.moveLeft();
            }
        }
    );
    
});
