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
