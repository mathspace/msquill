/* Add custom commands  */

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