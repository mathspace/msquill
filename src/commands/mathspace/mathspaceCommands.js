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
  _.htmlTemplate =
        '<span class="mq-large-operator mq-non-leaf mq-lim">'
      +   '<span class="mq-un-italicized">lim</span>'
      +   '<span class="mq-approach-container">'
      +     '<span class="mq-approach">'
      +       '<span>&0</span>'
      +       '<span class="mq-approach-arrow">→</span>'
      +       '<span>&1</span>'
      +     '</span>'
      +   '</span>'
      + '</span>';
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


// Define \definite{}_{}^{} for definite integrals.

var Definite = LatexCmds.definite = P(MathCommand, function(_, super_) {
  _.ctrlSeq = '\\definite';
  _.htmlTemplate =
      '<span class="mq-integral-limits">'
      +    '<span class="mq-non-leaf">'
      +      '<span class="mq-scaled mq-paren">[</span>'
      +      '<span class="mq-non-leaf">'
      +          '<span>&0</span>'
      +      '</span>'
      +      '<span class="mq-scaled mq-paren mq-paren-close">]</span>'
      +  '</span>'
      +  '<span class="mq-supsub mq-non-leaf">'
      +      '<span class="mq-sup">'
      +          '<span>&1</span>'
      +      '</span>'
      +      '<span class="mq-sub">'
      +          '<span>&2</span>'
      +      '</span>'
      +      '<span style="display:inline-block;width:0">&#8203;</span>'
      +  '</span>'
    + '</span>'
  ;
  _.text_template = ['definite[', '](', ')(', ')'];
  _.latex = function() {
    var b = this.blocks;
    return '\\definite{'+ b[0].latex() +'}{'+ b[1].latex() + '}{' + b[2].latex() + '}';
  };
  _.jQadd = function () {
    super_.jQadd.apply(this, arguments);
    var p = this.jQ.children(':first');
    this.delimjQs = p.children(':first').add(p.children(':last'));
    this.contentjQ = p.children(':eq(1)');
    this.supjQ = this.jQ.find('.integral-sup > span').children();
    this.subjQ = this.jQ.find('.integral-sub > span').children();

  };
  _.reflow = function() {
    var height = this.contentjQ.outerHeight() /
                 parseFloat(this.contentjQ.css('fontSize'));
    scale(this.delimjQs, min(1 + .2*(height - 1), 1.2), 1.2*height);
    //  Fix the positioning... When there is a fraction
    //this.supjQ.css({'vertical-align': height/3.9 + 'em'});
    //this.subjQ.css({'vertical-align': height*0.55 / -1 + 'em'});
  };
});
