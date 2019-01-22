Controller.open(function(_) {

  var COMMAND_CONFIGURATION_TYPE_MAP = {
    symbol: 'vanillaSymbol',
    variable: 'variable',
    nonSymbola: 'nonSymbolaSymbol',
    binary: 'binary'
  };

  _.initializeLatexGrammar = function() {
    this.latexCmds = Object.assign({}, LatexCmds);
    this.charCmds = Object.assign({}, CharCmds);
    this.textCommands = {};

    this.cursor.options.autoCommands = {};
    
    // Initialize the grammar processors for various symbols
    // by loading up the default configuration 
    // This is WIP. Eventually all files symbol definitions
    // should be transferred over to the defaultSymbolDefinitions file
    this.extendLatexGrammar(GLOBALLY_DISABLED_INPUT, 'symbol');
    // this.extendLatexGrammar(VANILLA_SYMBOLS, 'symbol');
    // this.extendLatexGrammar(NON_SYMBOLA_SYMBOLS, 'nonSymbola');
    // this.extendLatexGrammar(GREEK_SYMBOLS, 'variable');
    // this.extendLatexGrammar(BINARY_SYMBOLS, 'variable');

    // Process injected commands into autocommands 
    var options = this.cursor.options;
    var commands = options.commands || [];
    this.extendLatexGrammar(commands);
  };

  _.attachKeyboardListener = function (grammarDefinition) {
    if (grammarDefinition.keystroke) {
      // this is still a bit hacky and we may get performance issues in the future
      // but for now it works. 
    
      this.registerKeystrokeHandler(function(pattern,event) {
       
        if (pattern === grammarDefinition.keystroke) {
          event.preventDefault();
          this.API.cmd(grammarDefinition.name);
        }
      });
      // we want to make sure that keystroke inputs do not generate any markup 
      // this means overriding the 
    }
  };

  _.extendLatexGrammar = function(grammarList, type) {
    var maxLength = 0;
    var autoCommands = {};
    var latexCmds = {};
    
    grammarList.forEach(function (symbolDefinition) {
      this.attachKeyboardListener(symbolDefinition);
      function appendtoAutoCommands(item) {
        if (item.length > maxLength) maxLength = item.length;
        autoCommands[item] = 1;
      }
       
      if (symbolDefinition.isTextCommand) appendtoAutoCommands(symbolDefinition.name);
      if (symbolDefinition.commands) {
        symbolDefinition.commands.forEach(function(command) {
          appendtoAutoCommands(command);
          if(symbolDefinition.name) this.textCommands[command] = symbolDefinition.name;
        }.bind(this));
      }
      
      
      var grammarType = type || symbolDefinition.type || 'symbol';
      var processor = grammarProcessors[COMMAND_CONFIGURATION_TYPE_MAP[grammarType]];
      Object.assign(
        latexCmds, 
        processor(symbolDefinition)
      );
    }.bind(this));

    Object.assign(this.latexCmds, latexCmds);

    Object.assign(
      this.cursor.options.autoCommands,
      autoCommands
    );
    // final max computation 
    if (this.cursor.options.autoCommands._maxLength || 0 < maxLength) 
      this.cursor.options.autoCommands._maxLength = maxLength;
  };

  _.searchForCommand = function(cmd) {
    // check latexcmds first 
    if (this.latexCmds[cmd]) return this.latexCmds[cmd];
    if (this.charCmds[cmd]) return this.charCmds[cmd];
    if (this.textCommands[cmd]) return this.searchForCommand(this.textCommands[cmd]);
  };
});

// The following are symbol definition processors that transform symbol definitions into full
// fledged classes for constructing the math AST.

var grammarProcessors = {
  vanillaSymbol: symbolFactory(function(symbolDefinition) {
    return bind(
      VanillaSymbol,
      symbolDefinition.latex,
      symbolDefinition.htmlEntity
    );
  }),
  nonSymbolaSymbol: symbolFactory(function(symbolDefinition) {
    // In the case where the symbol definition is identical for all types,
    // return the default constructor
    if (
      symbolDefinition.latex === symbolDefinition.name &&
      symbolDefinition.htmlEntity === symbolDefinition.htmlEntity
    )
      return NonSymbolaSymbol;
    return bind(
      NonSymbolaSymbol,
      symbolDefinition.latex,
      symbolDefinition.htmlEntity
    );
  }),
  variable: symbolFactory(function(symbolDefinition) {
    if (!symbolDefinition.latex && !symbolDefinition.htmlEntity)
      // considered automatic
      // catch-all variable node. This takes whatever the user inputs
      // and drops it into the node as `\\{input}` and `${input};`.
      // this works for all greek letter entries
      return P(Variable, function(_, super_) {
        _.init = function(latex) {
          super_.init.call(this, '\\' + latex + ' ', '&' + latex + ';');
        };
      });
    return bind(Variable, symbolDefinition.latex, symbolDefinition.htmlEntity);
  }),
  binary: symbolFactory(function(symboldefinition) {
    return bind(
      BinaryOperator,
      symboldefinition.latex,
      symboldefinition.htmlEntity
    );
  })
};
