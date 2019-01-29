/* Add custom commands  */

LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9651;');

LatexCmds.simeq = bind(VanillaSymbol, '\\simeq ', '&#11003;');

LatexCmds.interleave = bind(VanillaSymbol, '\\interleave', '&#10996;');

// Map * to times instead of dot
CharCmds['*'] = LatexCmds.times;

// Patched latex for % symbol, it should not contain \\ in the beginning.
LatexCmds['%'] = bind(NonSymbolaSymbol, '%', '%');

var MixedFraction = 
  LatexCmds.mixed = P(MathCommand, function(_, super_) {
    _.ctrlSeq = '\\frac';
    _.htmlTemplate = 
    '<span>'
    +  '<span>&0</span>'
    +  '<span class="mq-fraction mq-non-leaf">'
    +     '<span class="mq-numerator">&1</span>'
    +     '<span class="mq-denominator">&2</span>'
    +     '<span style="display:inline-block;width:0">&#8203;</span>'
    +   '</span>'
    + '</span>';
    _.text_template = ['frac[', ']', '(', ')', '(', ')'];
    _.latex = function() {
      var blocks = this.blocks;
      return blocks[0].latex() + '\\frac{' + blocks[1].latex() + '}' + '{' + blocks[2].latex() + '}'
    };
  })

var Defint = 
  LatexCmds.defint = P(MathCommand, function(_, super_) {
    _.ctrlSeq = '\\int';
    _.htmlTemplate = 
    '<span>'
    +  '<big>&int;</big>'
    +  '<span class="mq-supsub mq-non-leaf mq-limit">'
    +     '<span class="mq-sup"><span>&0</span></span>'
    +     '<span class="mq-sub"><span>&1</span></span>'
    +     '<span style="display:inline-block;width:0">&#8203;</span>'
    +   '</span>'
    + '</span>';
    _.text_template = ['int[', ']', '(', ')'];
    _.latex = function() {
      return '\\int_{' + this.ends[L].latex() + '}^{' + this.ends[R].latex() + '}'
    };
  })
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


// Because \operatorname{} doesn't put enough surrounding whitespace
LatexCmds.andword = P(Symbol, function(_, super_) {
    _.init = function() {
        super_.init.call(this,
            '\\andword ',
            '<span class="mq-binary-operator-word">and</span>',
            ' and '
        );
    };
});


// Because \operatorname{} doesn't put enough surrounding whitespace
LatexCmds.orword = P(Symbol, function(_, super_) {
    _.init = function() {
        super_.init.call(this,
            '\\orword ',
            '<span class="mq-binary-operator-word">or</span>',
            ' or '
        );
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
LatexCmds.overleftarrow = bind(OverLineStyleGenerator('mq-overarrow'), '\\overleftarrow', 'span', 'class="mq-non-leaf mq-overarrow mq-arrow-left"');
LatexCmds.overleftrightarrow = bind(OverLineStyleGenerator('mq-overarrow'), '\\overleftrightarrow', 'span', 'class="mq-non-leaf mq-overarrow mq-arrow-both"');


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


LatexCmds.lim =
LatexCmds.limit = P(MathCommand, function(_, super_) {
  _.init = function() {
    var htmlTemplate =
      '<span class="mq-limit mq-non-leaf">'
    +   '<span class="mq-lim">lim</span>'
    +   '<span class="mq-approaches"><span>&0</span></span>'
    + '</span>'
    ;
    Symbol.prototype.init.call(this, '\\lim ', htmlTemplate);
  };
  _.latex = function() {
    function simplify(latex) {
      return latex.length === 1 ? latex : '{' + (latex || ' ') + '}';
    }
    return this.ctrlSeq + '_' + simplify(this.ends[L].latex());
  };
  _.parser = function(cursor) {
    var string = Parser.string;
    var optWhitespace = Parser.optWhitespace;
    var succeed = Parser.succeed;
    var block = latexMathParser(cursor).block;

    var self = this, child = MathBlock();
    self.blocks = [ child ];
    child.adopt(self, 0, 0);

    return optWhitespace.then(string('_')).then(function(supOrSub) {
      return block.then(function(block) {
        block.children().adopt(child, child.ends[R], 0);
        return succeed(self);
      });
    }).many().result(self);
  };
  _.finalizeTree = function() {
    this.downInto = this.ends[L];
    this.ends[L].upOutOf = function(cursor) {
      // this is basically gonna be insRightOfMeUnlessAtEnd,
      // by analogy with insLeftOfMeUnlessAtEnd
      var cmd = this.parent, ancestorCmd = cursor;
      do {
        if (ancestorCmd[L]) return cursor.insRightOf(cmd);
        ancestorCmd = ancestorCmd.parent.parent;
      } while (ancestorCmd !== cmd);
      cursor.insLeftOf(cmd);
    };
  };
  _.createLeftOf = function(cursor) {
      super_.createLeftOf.apply(this, arguments);
      var arrow = LatexCmds.to();
      arrow.createLeftOf(cursor);
      cursor.insLeftOf(arrow);
  };
});
