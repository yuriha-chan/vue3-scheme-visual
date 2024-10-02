export default function(expr, io, cont, error) {
  const globalEnv = {};
  const rebox = (v) => {
	  if (typeof v === "number") {
		  return { type: "number", value: v };
	  } else if (typeof v === "string") {
		  return { type: "string", value: v };
	  } else {
		  return { type: "null", value: null };
	  }
  };
  const cpsLookup = (env, name, cont) => {
	  for (let e of env) {
		  if (Object.keys(e).includes(name)) {
			 return cont(e[name]);
		  }
	  }
	  if (name in globalEnv) {
		  cont(name);
	  } else {
	          error("symbol not found: ", name);
	  }
  }
  const cpsEvalFunctionApply = (expr, env, restArgs, values, cont) => {
    if (restArgs.length === 0) {
	// unbox
	values = values.map(x => x.value);
      if (expr.type === "function.io") {
        cont(rebox(expr.value(io, ...values)));
      } else {
        cont(rebox(expr.value(...values)));
      }
    } else {
      cpsEvalValue(restArgs[0], env, (v) => cpsEvalFunctionApply(expr, env, restArgs.slice(1), [...values, v], cont));
    }
  };
  const cpsEvalClosureApply = (expr, env, args, cont) => {
    console.log(args);
    const frame = {};
    const variables = expr.value.args;
    cpsEvalValues (args, env, (values) => {
      console.log(values);
      for (let i = 0; i < variables.length; i++) {
         frame[variables[i].label] = { type: "location", value: values[i] }
      }
      console.log("call frame", frame);
      cpsEvalBody(expr.value.body, [ frame, ...expr.value.env ], (v) => cont(v))
    });
  };
  const cpsEvalValues = (rest, env, cont) => {
    if (rest.length === 0) {
	cont([]);
    } else {
      cpsEvalValue(rest[0], env, (v) => cpsEvalValues(rest.slice(1), env, values => cont([v, ...values])));
    }
  };
  const cpsEvalValue = (expr, env, cont) => {
    if (expr === null || typeof(expr) === 'undefined') {
      cont(null)
    } else if (expr.type === "number" || expr.type === "string") {
      cont(expr)
    } else if (expr.type && expr.type.startsWith("function")) {
      cpsEvalFunctionApply(expr, env, expr.slots.filter((x) => x.assignment).map((x) => x.assignment), [], cont)
    } else if (expr.type === 'symbol') {
      cpsLookup(env, expr.label, loc => cont(loc.value))
    } else if (expr.type === 'keyword') {
      // TODO: namespace
      if (expr.label === "if") {
        cpsEvalValue(expr.slots[0].assignment, env, (v) => {
          if (v) {
            cpsEvalValue(expr.slots[1].assignment, env, cont)
          } else {
            cpsEvalValue(expr.slots[2].assignment, env, cont)
          }
        });
      } else if (expr.label === 'annotate') {
	    cpsEvalValue(expr.slots[0].assignment, env, cont);
      } else if (expr.label === 'let') {
	    let bindings = expr.slots[1].assignment;
	    // exclude ellipsis etc.
	    bindings = bindings.slots.filter(x => x.assignment);
	    // exclude bindings where symbol name is not defined
	    bindings = bindings.filter(x => x.assignment.slots[0].assignment)
	    // exclude bindings where bound value is not defined
	    bindings = bindings.filter(x => x.assignment.slots[1].assignment)
	    const variables = bindings.map(x => x.assignment.slots[0].assignment);
	    const expressions = bindings.map(x => x.assignment.slots[1].assignment);
	    let frame = {};
	    cpsEvalValues(expressions, env, (values) => {
	        for (let i = 0; i < variables.length; i++) {
	          frame[variables[i].label] = { type: "location", value: values[i] }
	        }
                cpsEvalBody(expr.slots.slice(2), [ frame, ...env ], (v) => cont(v))
	    });
      } else if (expr.label === 'lambda') {
	    cont({ type: "closure", value: { args: expr.slots[0].assignment.slots.filter((x) => x.type !== "ellipsis").map((x) => x.assignment), env, body: expr.slots.slice(1) } })
      } else {
	    console.log("met ", expr);
	    error("unknown keyword met: ", expr.value);
      }
      /* function apply */
    } else if (expr.type === null) {
	    cpsEvalValue(expr.slots[0].assignment, env,
		v => {
		  if (v.type.startsWith("function")) {
			  cpsEvalFunctionApply(expr, env, expr.slots.slice(1).map((x) => x.assignment), [], cont)
		  } else if (v.type === "closure") {
			  cpsEvalClosureApply(v, env, expr.slots.slice(1).filter((x) => x.type !== "ellipsis").map((x) => x.assignment), cont)
		  } else {
			  error("attempting to call non-callable type:", v.type);
		  }
	    });
    } else {
	    console.log(expr.type);
	    error("unknown value type: ", expr.type);
    }
  };
  const cpsEvalBody = (expr, env, cont) => {
    console.log(expr);
    expr = expr.filter(x => x.assignment);
    if (expr.length === 0) {
	error("empty body");
    } else if (expr.length === 1) {
        cpsEvalValue(expr[0].assignment, env, cont);
    } else {
        cpsEvalValue(expr[0].assignment, env, values => cpsEvalBody(expr.slice(1), env, cont));
    }
  }
  cpsEvalBody(expr, [], cont ? cont : result => { console.log("eval finished:", result); })
}
