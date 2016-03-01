/* Add custom commands  */

// Add compound commands to ≥ ≤
CompoundCmds['<='] = LatexCmds.le;
CompoundCmds['>='] = LatexCmds.ge;

// Different congruent symbol
LatexCmds.cong = bind(BinaryOperator,'\\cong ','&equiv;');
CompoundCmds['=='] = LatexCmds.cong

LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9651;');

LatexCmds.simeq = bind(VanillaSymbol, '\\simeq ', '&#11003;');

// Map * to times instead of dot
CharCmds['*'] = LatexCmds.times;

// Patched latex for % symbol, it should not contain \\ in the beginning.
LatexCmds['%'] = bind(NonSymbolaSymbol, '%', '%');

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



// Define \overrightarrow{} for vectors

// Define markup
var OverLineStyleGenerator = function (className) {
    var arrows = '<span class="' + className + '-inner-right">›</span><span class="' + className + '-inner-left">‹</span>';
    return P(MathCommand, function(_, super_) {
      _.init = function(ctrlSeq, tagName, attrs) {
        super_.init.call(this, ctrlSeq, '<'+tagName+' '+attrs+'><'+tagName+' class="' + className + '-inner">' + arrows + '<span class="mq-empty-box">&0</span></'+tagName+'></'+tagName+'>');
      };
    });
};
// Add command
LatexCmds.overrightarrow = bind(OverLineStyleGenerator('mq-overarrow'), '\\overrightarrow', 'span', 'class="mq-non-leaf mq-overarrow mq-arrow-right"');


// Define \hat{}

// Define markup
var HatStyleGenerator = function (className) {
    var hat = '<span class="' + className + '">^</span>';
    return P(MathCommand, function(_, super_) {
      _.init = function(ctrlSeq, tagName, attrs) {
        super_.init.call(this, ctrlSeq, '<'+tagName+' '+attrs+'><'+tagName+' class="' + className + '-inner">' + hat + '<span class="mq-empty-box">&0</span></'+tagName+'></'+tagName+'>');
      };
    });
};
// Add command
LatexCmds.hat = bind(HatStyleGenerator('mq-hat'), '\\hat', 'span', 'class="mq-non-leaf mq-hat"');