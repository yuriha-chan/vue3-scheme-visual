import type { HeadedNode } from "./Types.d.ts"
import keywordWithNS from "./Syntax-keyword.js"
import { checkpoint } from './security.js'

const builtinsNS = {};
const keyword = (name) => {
  if (builtinsNS[name]) {
    return builtinsNS[name] 
  } else {
    builtinsNS[name] = keywordWithNS("builtin", name);
    return builtinsNS[name]
  }
};
const IO = (proc) => {
	proc.type="io";
	return proc;
}

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
      { type: "clause", clauseClass: "list", description: "lambda.args", rotate: 2, value: {
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
  "define": { type: "keyword", label: "define", value: 0, rotate: 1, slots: [
      { type: "choices", syntaxChoices:
	{ variable:
	    [ { type: "symbol", description: "define.variable", placeholder: "variable name" },
              { type: "value", placeholder: "value" } ],
	  function:
	    [ { type: "clause", description: "define.function", clauseClass: "list", rotate: 3, value: {
	        type: null, rotate: 3,
	        slots: [
                  { type: "symbol", description: "define.function-name", placeholder: "function name" },
                  { type: "symbol", description: "define.function-args", placeholder: "argument" },
                  { type: "ellipsis" }
	        ]},
	      }, 
              { type: "value", description: "lambda.body", placeholder: "body" },
              { type: "ellipsis" },
	  ],
	},
	placeholder: "variable or function",
      },
    ]},  
  "let": { type: "keyword", label: "let", value: keyword("let"),
    rotate: 1,
    slots: [
      { type: "symbol", placeholder: "block name (optional)" },
      { type: "clause",
        clauseClass: "list",
        rotate: 1,
	description: "let.substitute",
	value: {
          type: null,
          slots: [
            { type: "clause",
              clauseClass: "pair",
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
  "list": { type: "function", label: "list", rotate: 0, value: (...x)=>x, slots: [
    { type: "value", placeholder: "element ..." },
    { type: "ellipsis" }
  ]},
  "setMessage": { type: "function", label: "setMessage", value: IO((io, x) => { io.message().innerHTML = x }), rotate: 0, slots: [ { type: "value", placeholder: "text" } ] },
  "substring": { type: "function", label: "substring", rotate: 1, value: (str, start, end) => str.substring(start, end),
    slots: [ { type: "value", placeholder: "string" }, { type: "value", placeholder: "start" }, { type: "value", placeholder: "end" } ] },
  "length": { type: "function", label: "length", rotate: 1, value: (v) => v.length,
    slots: [ { type: "value", placeholder: "string, array or similar" } ]},
  "x->string": { type: "function", label: "x->string", rotate: 0,
    value: (x) => 
      (x.type === "syntax-keyword") ? `#syntax-keyword<${x.namespace}:${x.name}>` :
      x ,
    slots: [
      { type: "value", placeholder: "any object ..." },
      { type: "ellipsis" }
    ] },
  "make-hashtable": { type: "function", label: "make-hashtable", rotate: 2, value: (x) => Object.assign(...x.map((record)=>({ [ record[0] ]: record[1]}))), slots: [
      { type: "value", placeholder: "pairs ..." },
  ] },
  "print": { type: "function", label: "print", rotate: 2, value: IO((io, ...x) => io.log(...x)), slots: [
      { type: "value", placeholder: "string ..." },
      { type: "ellipsis" }
  ] },
  "roll": { type: "function", label: "roll", rotate: 1, value: IO((io, x) => io.roll(x)), slots: [
      { type: "value", placeholder: "2d10" },
  ] },
  "sleep": { type: "function", label: "sleep", rotate: 1, value: async (time) => new Promise((r) => setTimeout(r, time)), slots: [
    { type: "value", placeholder: "time in milliseconds" }]},
  "setTimeout": { type: "function", label: "sleep", rotate: 1, value: (func, time) => wrappedSetTimeout(func, time), slots: [
    { type: "value", placeholder: "function"},
    { type: "value", placeholder: "time in milliseconds" }]},
  "setInterval": { type: "function", label: "sleep", rotate: 1, value: (func, time) => wrappedSetInterval(func, time), slots: [
    { type: "value", placeholder: "function"},
    { type: "value", placeholder: "time in milliseconds" }]},
  "play-audio": { type: "function", label: "play-audio", rotate: 1, value: (x) => { let a = new Audio(x); a.play(); }, slots: [
    { type: "value", placeholder: "audio url" }]},
  "js-object": { type: "function", label: "js-object", rotate: 1, value: (x) => window[x], slots: [
    { type: "value", placeholder: "object name" }]},
  "ref": { type: "function", label: "ref", rotate: 0, value: (...x) => x.slice(1).reduce((s, k) => checkpoint(s[k]), x[0]), slots: [
    { type: "value", placeholder: "object" },
    { type: "value", placeholder: "key" },
    { type: "ellipsis" }
  ]},
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
  "<": { type: "function", label: "<", rotate: 3, value: (...x) => false !== (x.slice(1).reduce((s, a) => (s !== false) && s < a && a, x[0])), slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "empty list": { type: null, label: "( ... )", rotate: 0, value: null, slots: [
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
