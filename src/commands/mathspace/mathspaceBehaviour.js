// Add old editable support

LatexCmds.editable = P(LatexCmds.MathQuillMathField, function(_, super_) {
  _.ctrlSeq = '\\editable';
  // Fix the latex output so it contains "\editable {}"
  _.latex = function(){ return '\\editable{' + this.ends[L].latex() + '}'};
});


// Add extra space after comma

LatexCmds.comma = LatexCmds[','] = P(Symbol, function(_, super_) {
  _.init = function(ctrlSeq, html, text) {
    super_.init.call(this,
      ctrlSeq, '<span class="mq-comma">,</span>', text
    );
  };
});

// limit symbol
LatexCmds.lim = P(MathCommand, function(_, super_) {
  _.ctrlSeq = '\\lim';
  _.init = function() {
    var htmlTemplate =
        '<span class="mq-large-operator mq-non-leaf">'
      +   '<span class="mq-un-italicized">lim</span>'
      +   '<span style="display: block">'
      +     '<span class="mq-from">'
      +       '<span>&0</span>'
      +       '<span style="padding: 0 .1em">→</span>'
      +       '<span>&1</span>'
      +     '</span>'
      +   '</span>'
      + '</span>'
    ;
    Symbol.prototype.init.call(this, '\\lim ', htmlTemplate);
  };
  _.latex = function() {
    var b = this.blocks;
    return this.ctrlSeq + '{' + b[0].latex() +'}{' + b[1].latex() + '}';
  };
});
