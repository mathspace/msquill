/**
 * @param {*} binder 
 * 
 * this will output an object from a list of object definitions where each
 * definition is called with the binder with the following pattern 
 * 
 * e.g.
 *
 * var binder = function (definition) { return definition.latex + definition.htmlEntity }
 * 
 * example 1:
 * [ { name: '!', latex: '\\!', htmlEntity '&bang;' } ] 
 * becomes
 * { '!':  '\\!&bang' }
 * 
 * example 2: Matches copy the same definition onto multiple keys 
 * [ { name: 'bang', latex: '\\!', htmlEntity '&bang;', name: ['exampleMatch', 'exampleMatch2'] } ]
 * becomes 
 * {
 *   '!': '\\!&bang',
 *   'exampleMatch': '\\!&bang',
 *   'exampleMatch2': '\\!&bang'
 * }
 * 
 * This object can then be merged with the global configuration. The decision not to mutate the arguments 
 * is intentional. 
 */
function symbolFactory(binder) {
  return function loadDynamicSymbol(symbolDefinition) {
    var symbols = {};
    // In cases when the skip flag is set to true
    // we will define a command that has no output { latex: '', htmlEntity: '' }
    // effectively ignoring the input 
    if(symbolDefinition.skip)
      symbolDefinition = {
        name: symbolDefinition.name,
        latex: '',
        htmlEntity: '',
        match: symbolDefinition.match
      };

    var boundSymbol = binder(symbolDefinition);

    if (symbolDefinition.match)
      symbolDefinition.match.forEach(function (match) {
        symbols[match] = boundSymbol;
      });
    
    // In some cases we can opt not to have a name clause. This is used for match only 
    // definitions. See: GREEK_SYMBOLS
    if (symbolDefinition.name) {
      symbols[symbolDefinition.name] = boundSymbol;
    }
    // in cases where the name may be the same as the latex, we want to skip this
    if (symbolDefinition.latex) {
      var latexWithoutBs = symbolDefinition.latex.replace('\\', '');
      symbols[latexWithoutBs] = boundSymbol;
    }
    return symbols;
  }
}

/** this is built with the assumption that latex grammar processing is global. All instances of 
 * a latex input field will have the same commands, same grammar, and same shortcuts.
 * 
 * In this event this is no longer the case, the core architecture of  
 */


