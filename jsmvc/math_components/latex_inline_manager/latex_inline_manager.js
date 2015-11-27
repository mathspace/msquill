/*global
    define:false,
    Widgets:false
 */
define([
    'jquery', 
    'can/util/jquery', 
    'can/view/mustache', 
    'can/component', 
    'can/map/define', 
    'math_components/latex_editor/latex_editor', 
    'widgets/math_input/resources/mathquill',
    'css!widgets/math_input/resources/mathquill.css',
    'widgets/manager/manager'
], function($, can) {
    "use strict";

    /**
     * @name mc-latex-inline-manager
     */
    can.Component.extend({
        tag: 'mc-latex-inline-manager',
        template: ' ',
        scope: {
            define: {
                editable: {
                    type: 'boolean',
                    value: true
                },
                values: {
                    Type: can.Map
                },
                layout: {
                    // todo: Same as mobile_latex_inline_manager
                    value: '',
                    set: function(newValue) {
                        var targetTag = 'mc-latex-editor';
                        var newTag = newValue.replace(/mc-answer/g, targetTag);
                        newTag = '<div>' + newTag + '</div>';
                        var $newTag = $(newTag);
                        $newTag.find(targetTag).each(function(i, elm) {
                            var $elm = $(elm);
                            var answerKey = $elm.attr('data-key');
                            $elm.attr({
                                'latex': '{values.'+ answerKey +'.value}',
                                'inline': 'true',
                                'class': 'latex-map-value {{values.'+ answerKey + '.substatus}}',
                                'editable': '{editable}'
                            });
                        });
                        return $newTag.html();
                    }
                }
            }
        },
        events: {
            inserted: function() {
                // todo:Same as mobile
                var renderer = can.mustache(this.scope.attr('layout'));
                var view = renderer(this.scope);
                this.element.html(view);
                // Until we replace how we render <mi> we have to manually
                // render read only mathquill
                Widgets.Manager.render(this.element);

                this.element.find('mc-latex-editor').each(function(i, elm){
                    // Set tab index; this way, the tab key cycles through
                    // each field in order.
                    var $elm = $(elm);
                    $elm.find('textarea:first')
                        .attr('tabindex', $elm.data('key'));
                });
            },
            '{scope} values.*.value change': function(Type, ev, attr){
                //todo: Duplicated from mobile_latex_inline_manager
                var index = attr.split('.')[1];
                var substatusKey = index + '.substatus';
                this.scope.values.attr(substatusKey, 'unknown');
            }
        }
    });
});
