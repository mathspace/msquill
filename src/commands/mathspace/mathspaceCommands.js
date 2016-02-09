/* Add custom commands  */

// Different congruent symbol
LatexCmds.cong = bind(BinaryOperator,'\\cong ','&equiv;');
CompoundCmds['=='] = LatexCmds.cong

LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9651;');

var nCr = LatexCmds.nCr = P(MathCommand, function(_, super_) {
  _.ctrlSeq = '\\nCr';
  _.htmlTemplate =
      '<span>'
          + '<span class="mq-supsub mq-sup-only mq-non-leaf">'
          +     '<span class="mq-sup">'
          +         '<span>&0</span>'
          +     '</span>'
          + '</span>'
          + '<var>C</var>'
          + '<span class="mq-supsub mq-non-leaf">'
          +     '<span class="mq-sub">'
          +         '<span>&1</span>'
          +     '</span>'
          + '</span>'
    + '</span>'
  ;
  _.text_template = ['nCr[', '](', ')'];
  _.latex = function() {
    return '\\nCr{'+this.ends[L].latex()+'}{'+this.ends[R].latex()+'}';
  };
});

var nPr = LatexCmds.nPr = P(MathCommand, function(_, super_) {
  _.ctrlSeq = '\\nPr';
  _.htmlTemplate =
      '<span>'
          + '<span class="mq-supsub mq-sup-only mq-non-leaf">'
          +     '<span class="mq-sup">'
          +         '<span>&0</span>'
          +     '</span>'
          + '</span>'
          + '<var>P</var>'
          + '<span class="mq-supsub mq-non-leaf">'
          +     '<span class="mq-sub">'
          +         '<span>&1</span>'
          +     '</span>'
          + '</span>'
    + '</span>'
  ;
  _.text_template = ['nPr[', '](', ')'];
  _.latex = function() {
    return '\\nPr{'+this.ends[L].latex()+'}{'+this.ends[R].latex()+'}';
  };
});