
/**
 * Basic symbols extend the VanillaSymbol class. each row will be translated 
 * into the following command and assignment 
 * LatexCmds[name] = bind(VanillaSymbol, latex, htmlEntity) 
 * A symbol may also provide 'ailiases' that will be passed recursed upon
 * 
 * The configuration schema is as follows 
 * SymbolDefinition {
 *   name: String         // A globally unique string defining this rule 
 *   match?: String[]     // A list of single character strings that this should trigger on
 *   command?: String[]   // A list of multi-character commands that should match this rule 
 *   latex: String        // The latex symbol this should output 
 *   htmlEntity: String   // The html entity this should display in the dom (mostly unicode e.g. &#340;) 
 *   skip: Boolean        // If this flag is set, the parser will ignore the symbol completely
 * }
 * 
 * If a match configuration is missing, the parser will use the name field as a match string.
 */


var GLOBALLY_DISABLED_INPUT = [
  {
    name: "disableDollar",
    match: ['$'],
    skip: true
  }
];

/**
 * Everything below is not used (yet). We're slowly migrating the core definitions 
 * into this unified definition object
 */

// var VANILLA_SYMBOLS = [
//   {
//     name: "space",
//     match: [' '],
//     latex: "\\ ",
//     htmlEntity: "&nbsp;"
//   },
//   {
//     name: "'",
//     latex: "'",
//     htmlEntity: "&prime;"
//   },
//   {
//     name: "\\",
//     latex: "\\backslash ",
//     htmlEntity: "\\",
//     match: ["backslash"]
//   },
// ];

// var GREEK_SYMBOLS = [
//   {
//     name: "epsilon",
//     latex: "\\epsilon",
//     htmlEntity: "&epsilon;",
//     match: ["ε"]
//   },
//   {
//     name: "phi",
//     latex: "\\phi",
//     htmlEntity: "&#981;"
//   },
//   {
//     name: "phiv",
//     latex: "\\phiv",
//     htmlEntity: "&phi;",
//     match: ["varphi"]
//   },
//   // This set of symbols is automatic. Each symbol will automatically
//   // be converted to \match in latex
//   {
//     match: [
//       "alpha",
//       "beta",
//       "gamma",
//       "delta",
//       "zeta",
//       "eta",
//       "theta",
//       "iota",
//       "kappa",
//       "mu",
//       "nu",
//       "xi",
//       "rho",
//       "sigma",
//       "tau",
//       "chi",
//       "psi",
//       "omega"
//     ]
//   }
// ];

// var NON_SYMBOLA_SYMBOLS = [
//   {
//     name: "@",
//     latex: "@",
//     htmlEntity: "@"
//   },
//   {
//     name: "&",
//     latex: "\\$",
//     htmlEntity: "$&amp;"
//   },
  
// ];

// var BINARY_SYMBOLS = [
//   {
//     name: "≠",
//     match: ["ne", "neq"],
//     commands: ['!='],
//     latex: "\\ne",
//     htmlEntity: "&ne;",
//   }
// ];
