// Add old editable support

LatexCmds.editable = P(LatexCmds.MathQuillMathField, function(_, super_) {
  _.ctrlSeq = '\\editable';
  // Fix the latex output so it contains "\editable {}"
  _.latex = function(){ return '\\editable{' + this.ends[L].latex() + '}'};
});
