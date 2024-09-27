import type { HeadedNode } from "./Types.d.ts"
import keywordWithNS from "./Syntax-keyword.js"

const keyword = (name) => keywordWithNS("builtin", name);

const builtins: Record<string, HeadedNode> = {
  "lambda": { type: "keyword", label: "lambda", value: keyword("lambda"), slots: [
      { type: "clause", value: {
          type: null,
          slots: [
            { type: "symbol", placeholder: "argument" },
            { type: "ellipsis" }
          ] }
      },
      { type: "value", placeholder: "body ..." },
      { type: "ellipsis" }
    ]},
  "if": { type: "keyword", label: "if", value: keyword("if"), slots: [
      { type: "value", placeholder: "condition" },
      { type: "value", placeholder: "true-case" },
      { type: "value", placeholder: "false-case" },
    ] },
  "quote":  { type: "keyword", label: "quote", value: keyword("quote"), slots: [
      { type: "quote", placeholder: "literal value" }] },
  "quasiquote":  { type: "keyword", label: "quote", value: keyword("quote"), slots: [
      { type: "quasiquote", placeholder: "list template" }] },
  "unquote":  { type: "keyword", label: "unquote", value: keyword("quote"), slots: [
      { type: "value", placeholder: "value" }] },
  "unquote-splicing":  { type: "keyword", label: "unquote-splicing", value: keyword("quote"), slots: [
      { type: "value", placeholder: "in-place value" }] },
  "define": { type: "keyword", label: "define", value: keyword("define"), slots: [
      { type: "symbol", placeholder: "name" },
      { type: "value", placeholder: "value" },
    ]},  
  "let": { type: "keyword", label: "let", value: keyword("let"), slots: [
    { type: "symbol", placeholder: "block name (optional)" },
    { type: "clause", value: {
        type: null,
        slots: [
          { type: "clause", value: {            
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
  "begin": { type: "keyword", label: "begin", value: keyword("begin"), slots: [
    { type: "value", placeholder: "body ..."},
    { type: "ellipsis" }] },
  "list": { type: "function", label: "list", value: x=>x, slots: [
    { type: "value", placeholder: "element ..." },
    { type: "ellipsis" }
  ]},
  "cons": { type: "function", label: "cons", value: (x, y)=>[x, y], slots: [
    { type: "value", placeholder: "car" },
    { type: "value", placeholder: "cdr" }
  ]},
  "car": { type: "function", label: "car", value: (x) => x[0], slots: [
    { type: "value", placeholder: "cons cell" }]},
  "cdr": { type: "function", label: "cdr", value: (x) => x[1], slots: [
    { type: "value", placeholder: "cons cell" }]},
  "+": { type: "function", label: "+", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "-": { type: "function", label: "-", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "*": { type: "function", label: "*", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "/": { type: "function", label: "/", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "=": { type: "function", label: "=", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "<": { type: "function", label: "<", value: (x) => x[0], slots: [
      { type: "value", placeholder: "number" },
      { type: "value", placeholder: "number" },    
      { type: "ellipsis" }
    ] },
  "empty list": { type: null, label: "( Open list )", value: null, slots: [
      { type: "value", placeholder: "item ..." }, 
      { type: "ellipsis" }
  ] },
  "null": { type: "constant", label: "null", value: null, slots: null },
};

export default builtins;
