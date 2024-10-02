import type { HeadedNode } from "./Types.d.ts"
import keywordWithNS from "./Syntax-keyword.js"

const keyword = (name) => keywordWithNS("builtin", name);

const builtins: Record<string, HeadedNode> = {
  "library": { type: "keyword", label: "library", value: keyword("library"),
    rotate: 1,
    slots: [
      { type: "symbol", placeholder: " name ..." },
      { type: "clause", rotate: 0, value: {
        type: "keyword", label: "export", value: keyword("export"), rotate: 0,
          slots: [
            { type: "symbol", placeholder: "exporting symbol bindings ..." },
            { type: "ellipsis" }
          ],
        },
      },
      { type: "clause", rotate: 0, value: {
	type: "keyword", label: "import", value: keyword("import"), rotate: 0,
        slots: [
          { type: "clause", clauseClass: "symbols", description: "import.library-reference", rotate: 2, value: {
            type: null,
            slots: [
              { type: "symbol", placeholder: "library name ..." },
              { type: "ellipsis" }
            ],
            }
          },
          { type: "ellipsis" }
        ]},
      },
      { type: "value", placeholder: "body ..." },
      { type: "ellipsis" }
    ]},
  "import": { type: "keyword", label: "import", value: keyword("import"),
    rotate: 0,
    slots: [
      { type: "clause", clauseClass: "symbols", description: "import.library-reference", rotate: 2, value: {
          type: null,
          slots: [
            { type: "symbol", placeholder: "library name ..." },
            { type: "ellipsis" }
          ],
          }
      },
      { type: "ellipsis" }
    ]},
  "lambda": { type: "keyword", label: "lambda", value: keyword("lambda"),
    rotate: 1,
    slots: [
      { type: "clause", clauseClass: "symbols", description: "lambda.args", rotate: 2, value: {
          type: null,
          slots: [
            { type: "symbol", placeholder: "argument" },
            { type: "ellipsis" }
          ],
          }
      },
      { type: "value", description: "lambda.body", placeholder: "body ..." },
      { type: "ellipsis" }
    ]},
  "if": { type: "keyword", label: "if", value: keyword("if"),
    rotate: 1,
    slots: [
      { type: "value", placeholder: "condition", description: "if.condition" },
      { type: "value", placeholder: "true-case", description: "if.true-case" },
      { type: "value", placeholder: "false-case", description: "if.false-case" },
    ] },
  "annotate":  { type: "keyword", label: "annotate", value: keyword("annotate"), rotate: 1, slots: [
      { type: "quote", placeholder: "annotation string"},
      { type: "value", placeholder: "annotated expression"},
  ] },
  "quote":  { type: "keyword", label: "quote", value: keyword("quote"), rotate: 2, slots: [
      { type: "quote", placeholder: "literal value" }] },
  "quasiquote":  { type: "keyword", label: "quasiquote", value: keyword("quasiquote"), rotate: 2, slots: [
      { type: "quasiquote", placeholder: "list template" }] },
  "unquote":  { type: "keyword", label: "unquote", value: keyword("unquote"), rotate: 2, slots: [
      { type: "value", placeholder: "value" }] },
  "unquote-splicing":  { type: "keyword", label: "unquote-splicing", value: keyword("unquote-splicing"), rotate: 2, slots: [
      { type: "value", placeholder: "in-place value" }] },
  "define": { type: "keyword", label: "define", value: keyword("define"), rotate: 1, slots: [
      { type: "symbol", placeholder: "name" },
      { type: "value", placeholder: "value" },
    ]},  
  "let": { type: "keyword", label: "let", value: keyword("let"),
    rotate: 1,
    slots: [
      { type: "symbol", placeholder: "block name (optional)" },
      { type: "clause",
        clauseClass: "assoc",
        rotate: 1,
	description: "let.substitute",
	value: {
          type: null,
          slots: [
            { type: "clause",
              rotate: 2,
	      value: {            
                type: null,
                slots: [
                  { type: "symbol", placeholder: "variable name" },
                  { type: "value", placeholder: "value" }
                ] }
            },
            { type: "ellipsis" },
          ] }
      },
      { type: "value", placeholder: "body ..." },
      { type: "ellipsis" }
    ]},
  "begin": { type: "keyword", label: "begin", value: keyword("begin"), rotate: 0, slots: [
    { type: "value", placeholder: "body ..."},
    { type: "ellipsis" }] },
  "list": { type: "function", label: "list", rotate: 0, value: x=>x, slots: [
    { type: "value", placeholder: "element ..." },
    { type: "ellipsis" }
  ]},
  "print": { type: "function.io", label: "print", rotate: 2, value: (io, ...x) => io.log(...x), slots: [
      { type: "value", placeholder: "string ..." },
      { type: "ellipsis" }
  ] },
  "cons": { type: "function", label: "cons", rotate: 2, value: (x, y)=>[x, y], slots: [
    { type: "value", placeholder: "car" },
    { type: "value", placeholder: "cdr" }
  ]},
  "car": { type: "function", label: "car", rotate: 1, value: (x) => x[0], slots: [
    { type: "value", placeholder: "cons cell" }]},
  "cdr": { type: "function", label: "cdr", rotate: 1, value: (x) => x[1], slots: [
    { type: "value", placeholder: "cons cell" }]},
  "+": { type: "function", label: "+", rotate: 3, value: (...x) => x.reduce((s, a) => (s + a), 0), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },
      { type: "ellipsis" }
    ] },
  "-": { type: "function", label: "-", rotate: 3, value: (...x) =>  x.slice(1).reduce((s, a) => (s - a), x[0]), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "*": { type: "function", label: "*", rotate: 3, value: (...x) =>  x.reduce((s, a) => (s * a), 1), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "/": { type: "function", label: "/", rotate: 3, value: (...x) =>  x.slice(1).reduce((s, a) => (s / a), x[0]), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "%": { type: "function", label: "%", rotate: 2, value: (x, y) => x % y, slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
    ] },
  "=": { type: "function", label: "=", rotate: 3, value: (...x) => x.reduce((s, a) => s && (x[0] === a), true), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "<": { type: "function", label: "<", rotate: 3, value: (...x) => x.slice(1).reduce((s, a) => (s !== false) && s < a && a, x[0]), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "empty list": { type: null, label: "( Open list )", rotate: 0, value: null, slots: [
      { type: "value", placeholder: "item ..." }, 
      { type: "ellipsis" }
  ] },
  "empty list quote": { type: null, label: "( quoted list )", rotate: 0, value: null, slots: [
      { type: "quote", placeholder: "item ..." }, 
      { type: "ellipsis" }
  ] },
  "null": { type: "constant", label: "null", value: null, slots: null },
};

export default builtins;
