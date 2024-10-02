export default function(expr, io, cont) {
  const cpsEvalFunctionApply = (expr, restArgs, values, cont) => {
    if (restArgs.length === 0) {
      if (expr.type === "function.io") {
        cont(expr.value(io, ...values));
      } else {
        cont(expr.value(...values));
      }
    } else {
      cpsEvalValue(restArgs[0], (v) => cpsEvalFunctionApply(expr, restArgs.slice(1), [...values, v], cont));
    }
  };
  const cpsEvalValue = (expr, cont) => {
    if (expr === null || typeof(expr) === 'undefined') {
      cont(null)
    } else if (expr.type === "number" || expr.type === "string") {
      cont(expr.value)
    } else if (expr.type.startsWith("function")) {
      cpsEvalFunctionApply(expr, expr.slots.filter((x) => x.assignment).map((x) => x.assignment), [], cont)
    } else if (expr.type === 'keyword') {
      // TODO: namespace
      if (expr.label === "if") {
        cpsEvalValue(expr.slots[0].assignment, (v) => {
          if (v) {
            cpsEvalValue(expr.slots[1].assignment, cont)
          } else {
            cpsEvalValue(expr.slots[2].assignment, cont)
          }
        });
      }
    }
  };
  const cpsEvalBody = (expr, cont) => {
    expr = expr.filter(x => x.assignment);
    if (expr.length === 1) {
        cpsEvalValue(expr[0].assignment, cont); 
    } else {
        cpsEvalValue(expr[0].assignment, values => cpsEvalBody(expr.slice(1), cont));
    }
  }
  cpsEvalBody(expr, cont ? cont : result => { console.log("eval finished:", result); })
}
