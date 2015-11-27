/*globals
    define:false,
    Widgets:false,
    gettext:false
 */
define([
    'jquery', 
    'app/tooltips/tooltips', 
    'helpers/i18n/i18n', 
    'jquerypp/controller/controller', 
    'widgets/math_input/math_input', 
    'css!widgets/math_toolbar/math_toolbar.css'
], function($) {
    'use strict';


    /**
     * Mapping of toolbar buttons to Widgets.MathInput command functions.
     */
    var buttonCommandsMap = {
        "add": 			{ name: "writeLatex", args: ["+"] },
        "subtract": 	{ name: "writeLatex", args: ["-"] },
        "times": 		{ name: "writeLatex", args: ["\\times"]},
        "divide": 		{ name: "writeLatex", args: ["\\div"] },
        "equals": 		{ name: "writeLatex", args: ["="] },
        "notequals": 	{ name: "writeLatex", args: ["\\ne"] },
        "lessthan": 	{ name: "writeLatex", args: ["<"] },
        "greaterthan": 	{ name: "writeLatex", args: [">"] },
        "lessthaneq": 	{ name: "writeLatex", args: ["\\leq"] },
        "greaterthaneq":{ name: "writeLatex", args: ["\\geq"] },
        "parens": 		{ name: "sendChar", args: ["("] },
        "abs": 	        { name: "sendChar", args: ["|"] },
        "power": 		{ name: "sendChar", args: ["^"] },
        "subscript": 	{ name: "sendChar", args: ["_"] },
        "frac": 		{ name: "sendChar", args: ["/"] },
        "mixedfrac": 	{ name: "writeMixedFraction", args: ["\\frac{}{}"] },
        "sqrt": 		{ name: "writeNthRoot", args: ["\\sqrt{}"] },
        "sqrt3": 		{ name: "writeNthRoot", args: ["\\sqrt[3]{}"] },
        "sin": 			{ name: "writeLatex", args: ["\\sin"] },
        "cos": 			{ name: "writeLatex", args: ["\\cos"] },
        "tan": 			{ name: "writeLatex", args: ["\\tan"] },
        "invsin": 		{ name: "writeLatex", args: ["\\sin ^{-1}"] },
        "invcos": 		{ name: "writeLatex", args: ["\\cos ^{-1}"] },
        "invtan": 		{ name: "writeLatex", args: ["\\tan ^{-1}"] },
        "log": 			{ name: "writeLatex", args: ["\\log"] },
        "logb": 	    { name: "writeLogWithBase", args: ["\\log_{ }\\left("] },
        "ln": 			{ name: "writeLatex", args: ["\\ln"] },
        "pi": 			{ name: "writeLatex", args: ["\\pi"] },
        "alpha": 		{ name: "writeLatex", args: ["\\alpha"] },
        "beta": 		{ name: "writeLatex", args: ["\\beta"] },
        "gamma": 		{ name: "writeLatex", args: ["\\gamma"] },
        "delta": 		{ name: "writeLatex", args: ["\\delta"] },
        "theta": 		{ name: "writeLatex", args: ["\\theta"] },
        "omega": 		{ name: "writeLatex", args: ["\\omega"] },
        "simeq": 		{ name: "writeLatex", args: ["\\simeq"] },
        "similar":     	{ name: "writeLatex", args: ["\\sim"] },
        "approx": 		{ name: "writeLatex", args: ["\\approx"] },
        "cong": 		{ name: "writeLatex", args: ["\\cong"] },
        "iscommon":     { name: "writeLatex", args: ["\\text{is common}"] },
        "parallel": 	{ name: "writeLatex", args: ["\\parallel"] },
        "perp": 		{ name: "writeLatex", args: ["\\perp"] },
        "degrees": 		{ name: "writeLatex", args: ["\\deg"] },
        "mins": 		{ name: "writeLatex", args: ["'"] },
        "secs": 		{ name: "writeLatex", args: ['"'] },
        "angle": 		{ name: "writeLatex", args: ["\\angle"] },
        "triangle": 	{ name: "writeLatex", args: ["\\triangle"] },
        "pm": 	        { name: "writeLatex", args: ["\\pm"] },
        "binomial": 	{ name: "writeLatex", args: ["\\binom"] },
        "ncr": 	        { name: "writeLatex", args: ["\\nCr"] },
        "factorial": 	{ name: "writeLatex", args: ["!"] }
    };
    var shortcut = gettext("Shortcut: ");
    var accessKey = (function(){
        var str = {
            ctrlalt: "<kbd>CTRL</kbd> <kbd>ALT</kbd>",
            alt: "<kbd>ALT</kbd>",
            ctrl: "<kbd>CTRL</kbd>",
            altshift: "<kbd>ALT</kbd> <kbd>SHIFT</kbd>",
            shift: "<kbd>SHIFT</kbd>",
            shiftesc: "<kbd>SHIFT</kbd> <kbd>ESC</kbd>",
            ctrlopt: "<kbd>CTRL</kbd> <kbd>OPT</kbd>"
        };
        var n = navigator.userAgent;
        var mac = /Mac/i.test(n);
        var linux = /Linux/i.test(n);
        if(/Amaya/i.test(n)){ // Regex guessed
            return str.ctrlalt;
        }else if(/Blazer/i.test(n)){ // Regex guessed
            return "";
		}else if(/Camino/i.test(n)){
            return str.ctrl;
		}else if(/Chrome/i.test(n)){
            return mac ? str.ctrlopt : (linux ? str.altshift : str.alt);
		}else if(/FireFox/i.test(n)){ //Version 2, 3, 4, 5
            return mac ? str.ctrl : str.altshift;
		}else if(/MSIE/.test(n)){
			//IE7: alt+shift
            return str.alt;
		}else if(/Konqueror/i.test(n)){
			return str.ctrl;
		}else if(/Opera/i.test(n)){
		    return mac ? str.ctrlopt : str.altshift;
		}else if(/Safari/i.test(n)){
			if(!mac){
				return str.alt;
			}
			var m = /Version\/([\d\.]+)/.exec(n);
			if(m){
				var ver = m[1].split(".");
				return (ver[0] >= 4) ? str.ctrlopt : str.ctrl;
			}
		}
		return false;
    }());
    if(accessKey){
        accessKey+=" ";
    }
    var keyTips = {
        "add": {
            title: gettext("Addition"),
            content: shortcut+"<kbd>+</kbd>"
        },
        "abs": {
            title: gettext("Absolute value"),
            content: "<kbd>|</kbd>"
        },
        "subscript": {
            title: gettext("Subscript"),
            content: "<kbd>_</kbd>"
        },
        "subtract": {
			title: gettext("Subtraction"),
			content: shortcut+"<kbd>-</kbd>"
			},
        "times": {
			title: gettext("Multiplication"),
			content: shortcut+"<kbd>*</kbd>"
		},
        "divide": {
			title: gettext("Division"),
			content: ""
		},
        "equals": {
			title: gettext("Equal to"),
			content: shortcut+"<kbd>=</kbd>"
		},
        "notequals": {
            title: gettext("Not equal to"),
            content: ""
        },
        "lessthan": {
			title: gettext("Less than"),
			content: shortcut+"<kbd>&lt;</kbd>"
		},
        "greaterthan": {
			title: gettext("Greater than"),
			content: shortcut+"<kbd>&gt;</kbd>"
		},
        "lessthaneq": {
			title: gettext("Less than or equal to"),
			content: shortcut+"<kbd>&lt;</kbd> <kbd>=</kbd>"
		},
        "greaterthaneq": {
			title: gettext("Greater than or equal to"),
			content: shortcut+"<kbd>&gt;</kbd> <kbd>=</kbd>"
		},
        "parens": {
			title: gettext("Brackets"),
			content: shortcut+"<kbd>(</kbd>"
		},
        "power": {
			title: gettext("Power"),
			content: shortcut+"<kbd>^</kbd> or <kbd>`</kbd>"
		},
        "frac": {
			title: gettext("Fraction"),
			content: shortcut+"<kbd>/</kbd>"
		},
        "mixedfrac": {
			title: gettext("Mixed fraction"),
			content: shortcut+(accessKey?(accessKey+"<kbd>/</kbd>"):"")
		},
        "sqrt": {
			title: gettext("Square root"),
			content: shortcut+(accessKey?(accessKey+"<kbd>V</kbd>"):"")
		},
        "sqrt3": {
			title: gettext("Cubic root"),
			content: ""
		},
        "sin": {
			title: gettext("Sine"),
			content: shortcut+"<kbd>s</kbd> <kbd>i</kbd> <kbd>n</kbd> "
		},
        "cos": {
			title: gettext("Cosine"),
			content: shortcut+"<kbd>c</kbd> <kbd>o</kbd> <kbd>s</kbd>"
		},
        "tan": {
			title: gettext("Tangent"),
			content: shortcut+"<kbd>t</kbd> <kbd>a</kbd> <kbd>n</kbd>"
		},
        "invsin": {
			title: gettext("Inverse sine"),
			content: shortcut+"<kbd>s</kbd> <kbd>i</kbd> <kbd>n</kbd> <kbd>^</kbd> <kbd>-</kbd> <kbd>1</kbd>"
		},
        "invcos": {
			title: gettext("Inverse cosine"),
            content: shortcut+"<kbd>c</kbd> <kbd>o</kbd> <kbd>s</kbd> <kbd>^</kbd> <kbd>-</kbd> <kbd>1</kbd>"
		},
        "invtan": {
			title: gettext("Inverse tangent"),
            content: shortcut+"<kbd>t</kbd> <kbd>a</kbd> <kbd>n</kbd> <kbd>^</kbd> <kbd>-</kbd> <kbd>1</kbd>"
		},
        "log": {
			title: gettext("Logarithm, base 10"),
			content: shortcut+"<kbd>l</kbd> <kbd>o</kbd> <kbd>g</kbd>"
		},
        "logb": {
			title: gettext("Logarithm with a base"),
			content: ""
		},
        "ln": {
			title: gettext("Logarithm, base e"),
            content: shortcut+"<kbd>l</kbd> <kbd>n</kbd>"
		},
        "pi": {
			title: gettext("Pi"),
			content: shortcut+(accessKey?(accessKey+"<kbd>P</kbd>"):"P")
		},
        "alpha": {
			title: gettext("Alpha"),
			content: ""
		},
        "beta": {
			title: gettext("Beta"),
			content: ""
		},
        "gamma": {
			title: gettext("Gamma"),
			content: ""
		},
        "delta": {
			title: gettext("Delta"),
			content: ""
		},
        "theta": {
			title: gettext("Theta"),
			content: ""
		},
        "omega": {
            title: gettext("Omega"),
			content: ""
        },
        "Delta": {
			title: gettext("Delta"),
			content: ""
		},
        "Sigma": {
			title: gettext("Sigma"),
			content: ""
		},
        "simeq": {
			title: gettext("Similar to"),
			content: ""
		},
        "similar": {
			title: gettext("Similar to"),
			content: ""
		},
        "approx": {
			title: gettext("Approximately equal to"),
			content: ""
		},
        "cong": {
			title: gettext("Congruent to"),
			content: shortcut+"<kbd>=</kbd> <kbd>=</kbd>"
		},
        "parallel": {
			title: gettext("Parallel to"),
			content: ""
		},
        "perp": {
			title: gettext("Perpendicular to"),
			content: ""
		},
        "degrees": {
			title: gettext("Degrees"),
			content: ""
		},
        "mins": {
			title: gettext("Minutes"),
			content: shortcut+"<kbd>'</kbd>"
		},
        "secs": {
			title: gettext("Seconds"),
			content: shortcut+'<kbd>"</kbd>'
		},
        "angle": {
			title: gettext("Angle"),
            content: shortcut+(accessKey?(accessKey+"<kbd>A</kbd>"):"")
		},
        "triangle": {
			title: gettext("Triangle"),
			content: shortcut+(accessKey?(accessKey+"<kbd>T</kbd>"):"")
		},
        "pm": {
			title: gettext("Plus-minus"),
			content: shortcut+(accessKey?(accessKey+"<kbd>-</kbd>"):"")
		},
        "iscommon": {
			title: gettext("(Interval or angle) is common"),
			content: shortcut+(accessKey?(accessKey+"<kbd>M</kbd>"):"")
		},
        "binomial": {
			title: gettext("Binomial"),
			content: ""
		},
        "ncr": {
			title: gettext("N choose r"),
			content: ""
		},
        "factorial": {
			title: gettext("Factorial"),
			content: ""
		}
    };

    /**
     * Widgets.MathToolbar is used to set up a toolbar bound to a MathInput
     * field.
     */
    $.Controller.extend('Widgets.MathToolbar',
        /** @static */
        {
            defaults: {
                lang: 'en',
                input: '',
                buttons: [],
                onLoad: undefined,
                beforeButtonClick: undefined,
                afterButtonClick: undefined,
                // Direction that the submenu opens.
                downwards: false
            }
        },
        /** @prototype */
        {
            /**
             * Constructor
             *
             * @param elm
             * @param options
             */
            init: function(elm, options) {
                var $this = this.element;
                this.options.input = $(options.input).first();

                // build toolbar area
                $this.addClass('math_toolbar');
                $this.css("position", "relative");

                // attach lang class
                $this.addClass('math_toolbar-lang-'+this.options.lang);
                
                // build buttons and attach events
                this._buildButtons();

                // trigger onLoad handler
                if($.isFunction(this.options.onLoad)){
                    this.options.onLoad(this);
                }
            },
            _buildButtons: function() {
                var self = this;
                var $this = this.element;
                var buttons = self.options.buttons;
                var $ul = $("<div/>").addClass("math_toolbar_button_strip");
                var buttonsetFirst = true;
                var buttonsetLast = false;
                $.each(buttons, function(i, val){
                    var button = val;
                    buttonsetLast = (i+1>=buttons.length) || (buttons[i+1] === "-");

                    if("-" === button) {
                        // it's a gap
                        self._buildGap($ul, button);
                        buttonsetFirst = true; // so that next button built is first in its buttonset
                    } else if(typeof button !== "string"){
                        // its a group
                        self._buildButtonGroup($ul, button, buttonsetFirst, buttonsetLast);
                        buttonsetFirst = false;
                    } else {
                        // regular button
                        self._buildButton($ul, button, buttonsetFirst, buttonsetLast);
                        buttonsetFirst = false;
                    }
                });
                $this.append($ul);
                $ul.find(".button").click(function(e){
                    var $button = $(this);
                    var commandName = $(this).attr("data-command");

                    if($.isFunction(self.options.beforeButtonClick)){
                        if(!self.options.beforeButtonClick(e, $this, $button, commandName)) {
                            return;
                        }
                    }
                    var $input = self.options.input;
                    var commandObj = buttonCommandsMap[commandName];
                    $input.widgets_math_input('executeCommand', commandObj);

                    if( $.isFunction( self.options.afterButtonClick )){
                        self.options.afterButtonClick( e, $this, $button, commandObj );
                    }

                    e.stopPropagation(); // Prevents nested buttons from triggering parent .group's click

                });
            },
            _buildButton: function($ul, button, first, last){
                var $li = $("<div/>")
                            .addClass("button")
                            .addClass(button)
                            .attr("data-command", button);
                // Configure the tooltip.
                var keyTip = keyTips[button];
                if (keyTip) {
                    $li.attr("rel", "tooltip")
                        .attr("data-original-title", '<strong>' + keyTip.title + '</strong><br>' + keyTip.content)
                        .attr("data-html", "true");
                }
                if (first)  {
                    $li.addClass('buttonset_first');
                }
                if (last) {
                    $li.addClass('buttonset_last');
                }
                $("<div/>").addClass("button_text").appendTo($li);
                $ul.append($li);
            },
            _buildGap: function($ul){
                var $li = $("<div/>").addClass("gap").data("code", "");
                $ul.append($li);
            },
            _buildButtonGroup: function($ul, buttons, first, last){
                var self = this;
                var $li = $("<div/>")
                            .addClass("button")
                            .addClass(buttons[0])
                            .attr("data-command", buttons[0]);
                if (first) {
                    $li.addClass('buttonset_first');
                }
                if (last) {
                    $li.addClass('buttonset_last');
                }
                $("<div/>").addClass("button_text").appendTo($li);
                $ul.append($li);

                var $gul = $("<div/>").addClass("group");
                var $gc = $("<div/>").addClass("group_connector").appendTo($gul);
                var buttonsetFirst = true;
                var buttonsetLast = false;
                $.each(buttons, function(i, val){
                    var button = val;
                    buttonsetLast = (i+1 >= buttons.length) || (buttons[i+1] === "-");
                    if(button === "-"){
                        // it's a gap
                        self._buildGap($gul);
                        buttonsetFirst = true; // so that next button built is first in its buttonset
                    } else if(typeof button !== "string"){
                        // its a group
                        self._buildButtonGroup($gul, button, buttonsetFirst, buttonsetLast);
                        buttonsetFirst = false;
                    } else {
                        // regular button
                        self._buildButton($gul, button, buttonsetFirst, buttonsetLast);
                        buttonsetFirst = false;
                    }
                });
                $li.addClass("has_group").append($gul);
                $gul.hide();
                $li.hover(
                    function(){
                        //$li.css("background", "#FFF");
                        var bWidth = $li.width();
                        var bHeight = $li.outerHeight(true);
                        var bOffset = $li.offset();
                        $gul.show();
                        var w = 0;
                        var fw = 0;
                        $gul.find(".button").each(function(){
                            if(w === 0){
                                w += $(this).outerWidth(true);
                                fw=w;
                            } else {
                                w += $(this).outerWidth(true);
                            }
                        });
                        var gulLeft = (w-fw)/2;
                        var gulTop = bHeight+5;

                        if(gulLeft > bOffset.left) {
                            gulLeft = bOffset.left;
                        }
                        var _buildDownwardMenu = function() {
                            gulTop -= 14;

                            gulTop = gulTop*(-1);
                            $gul.addClass("top");
                        };
                        var _buildUpwardMenu = function() {
                            gulTop += 5;
                            $gul.removeClass("top");
                        };
                        if (self.options.downwards) {
                            _buildDownwardMenu();
                        } else {
                            _buildUpwardMenu();
                        }
                        // Fix for new border-box calculation
                        var paddingLeft = parseInt($gul.css('padding-left'), 10) || 0;
                        var paddingRight = parseInt($gul.css('padding-right'), 10) || 0;
                        w += paddingLeft;
                        w += paddingRight;

                        $gul.css({
                            "left" : gulLeft * (-1) + "px",
                            "top": gulTop * (-1) + "px",
                            "width": w + "px"
                        });

                        $gc.width(bWidth);
                        $gc.css("left", gulLeft  + "px");
                    },
                    function(){
                        $gul.hide();
                    }
                );
            }
        }
    );
    
});
