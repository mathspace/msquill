Controller.open(function(_) {

  _.initializeLatexGrammar = function () {
    this.cursor.options.autoCommands = this.cursor.options.autoCommands || {};
    this.cursor.grammarDicts = {
      latexCmds: Object.assign({}, LatexCmds),
      charCmds: Object.assign({}, CharCmds),
      textCommands: {},
      ignoredCharacters: {}
    };

    // MatHSPaCE HacK - Allow multiplication sign to be configurable
    if (this.cursor.options.multiplicationDisplaySymbol === "dot") {
      this.cursor.grammarDicts.latexCmds["*"] = LatexCmds.cdot;
    }  

    // Process injected commands into autocommands
    var options = this.cursor.options;
    var commands = options.commands || [];
    var ignoredCharacters = options.ignoredCharacters || [];
    // We're going to create an index for ignored character lookup
    ignoredCharacters.forEach(function(char) { this.cursor.grammarDicts.ignoredCharacters[char] = true }.bind(this));
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
          if (symbolDefinition.name) this.cursor.grammarDicts.textCommands[command] = symbolDefinition.name;
        }.bind(this));
      }
      
      
      var processor = grammarProcessors.vanillaSymbol;
      Object.assign(
        latexCmds, 
        processor(symbolDefinition)
      );
    }.bind(this));

    Object.assign(this.cursor.grammarDicts.latexCmds, latexCmds);

    Object.assign(
      this.cursor.options.autoCommands,
      autoCommands
    );
    // final max computation 
    if (this.cursor.options.autoCommands._maxLength || 0 < maxLength) 
      this.cursor.options.autoCommands._maxLength = maxLength;
  };
});

Cursor.open(function(_) {
  _.searchForCommand = function(cmd) {
    var grammarDicts = this.grammarDicts;
    if (grammarDicts.latexCmds[cmd]) return grammarDicts.latexCmds[cmd];
    if (grammarDicts.charCmds[cmd]) return  grammarDicts.charCmds[cmd];
    if (grammarDicts.textCommands[cmd]) return this.searchForCommand(grammarDicts.textCommands[cmd]);
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
