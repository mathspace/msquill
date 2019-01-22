
/**
 * Basic symbols extend the VanillaSymbol class. each row will be translated 
 * into the following command and assignment 
 * LatexCmds[name] = bind(VanillaSymbol, latex, htmlEntity) 
 * A symbol may also provide 'ailiases' that will be passed recursed upon
 */

var VANILLA_SYMBOLS = [
  {
    name: " ",
    latex: "\\ ",
    htmlEntity: "&nbsp;"
  },
  {
    name: "'",
    latex: "'",
    htmlEntity: "&prime;"
  },
  {
    name: "\\",
    latex: "\\backslash ",
    htmlEntity: "\\",
    alias: ["backslash"]
  },
];

var GLOBALLY_DISABLED_INPUT = [
  {
    name: "$",
    skip: true // Ignore this character completely
  }
];


var GREEK_SYMBOLS = [
  {
    name: "epsilon",
    latex: "\\epsilon",
    htmlEntity: "&epsilon;",
    alias: ["ε"]
  },
  {
    name: "phi",
    latex: "\\phi",
    htmlEntity: "&#981;"
  },
  {
    name: "phiv",
    latex: "\\phiv",
    htmlEntity: "&phi;",
    alias: ["varphi"]
  },
  // This set of symbols is automatic. Each symbol will automatically
  // be converted to \alias in latex
  {
    alias: [
      "alpha",
      "beta",
      "gamma",
      "delta",
      "zeta",
      "eta",
      "theta",
      "iota",
      "kappa",
      "mu",
      "nu",
      "xi",
      "rho",
      "sigma",
      "tau",
      "chi",
      "psi",
      "omega"
    ]
  }
];

var NON_SYMBOLA_SYMBOLS = [
  {
    name: "@",
    latex: "@",
    htmlEntity: "@"
  },
  {
    name: "&",
    latex: "\\$",
    htmlEntity: "$&amp;"
  },
  
];

var BINARY_SYMBOLS = [
  {
    name: "≠",
    alias: ["ne", "neq"],
    commands: ['!='],
    latex: "\\ne",
    htmlEntity: "&ne;",
  }
];