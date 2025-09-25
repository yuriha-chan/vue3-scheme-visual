import { applySyntaxRules } from './syntax-rules.ts'
import builtinSyntaxes from './BuiltinSyntax.ts'
import { notAssigned } from './Types.ts'
export default function(expr) {
  const convertValue = (expr) => (
    (expr === null || typeof(expr) === 'undefined') ?
      null :
    (expr.type === "symbol") ?
      Symbol.for(expr.label) :
    (expr.type === "keyword") ?
      [ Symbol.for(expr.label), ...expr.slots.filter(x => x.type !== "ellipsis").map(x => x.assignment ? convertValue(x.assignment) : notAssigned)] :
    (expr.type === ("function")) ?
      [ Symbol.for(expr.label), ...expr.slots.filter(x => x.type !== "ellipsis").map(x => x.assignment ? convertValue(x.assignment) : notAssigned)] :
    (expr.type === null) ?
      expr.slots.filter(x => x.type !== "ellipsis").map(x => x.assignment ? convertValue(x.assignment) : notAssigned) :
      expr.value );
  const convertBody = (expr) => expr.filter(x => (x.type !== "ellipsis")).map(x => x.assignment ? convertValue(x.assignment) : notAssigned);
  const expandSyntaxRules = (expr, syntaxEnv) => (
	((expr instanceof Array) && expr[0] === Symbol.for("let-syntax")) ? expandSyntaxRules(expr[2], syntaxEnv) :
	((expr instanceof Array) && syntaxEnv.has(expr[0])) ? expandSyntaxRules(applySyntaxRules(syntaxEnv.get(expr[0]), expr), syntaxEnv) :
	(expr instanceof Array) ? expr.map((e) => expandSyntaxRules(e, syntaxEnv)) :
	expr);
  return convertBody(expr).map(expr => expandSyntaxRules(expr, builtinSyntaxes)); }
