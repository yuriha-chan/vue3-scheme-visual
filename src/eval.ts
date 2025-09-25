import convert from './compile.ts'
import builtins from './Builtin.ts'
import { checkpoint, lockdown } from './security.ts'

export default function(expr, io, cont, error) {
  lockdown();
  // code injection Shallow check
  const globalEnv = Object.assign(Object.create(null), ...Object.keys(builtins).map(k => ({ [Symbol.for(k)]: { type: "location", value: builtins[k].value } })));
  const closure = (variables, env, body) => {
	  const ret = function(...args) {
	    let out;
	    cpsEvalBody(ret.body, [ Object.assign(Object.create(null), ...ret.variables.map((k, i) => ({ [k]: { type: "location", value: args[i] } }))), ...ret.env ], v => { out = v });
	    return out;
	  }
	  ret.type = "closure";
	  ret.env = env;
	  ret.variables = variables;
	  ret.body = body;
	  return ret;
  };
  const cpsLookup = (env, name, cont) => {
	  console.log(name);
	  console.log(globalEnv[name]);
	  for (let e of env) {
		  if (e[name] !== undefined) {
			 return cont(e[name]);
		  }
	  }
	  if (globalEnv[name] !== undefined) {
		  cont(globalEnv[name]);
	  } else {
	          error("symbol not found: ", name);
	  }
  }
  const cpsEvalFunctionApply = (func, env, args, cont) => {
    cpsEvalValues (args, env, async (values) => {
      if (func.type === "io") {
        cont(checkpoint(await func(io, ...values)));
      } else {
        cont(checkpoint(await func(...values)));
      }
    });
  };
  const cpsEvalClosureApply = (expr, env, args, cont) => {
    const frame = {};
    const variables = expr.variables;
    cpsEvalValues (args, env, (values) => {
      for (let i = 0; i < variables.length; i++) {
         frame[variables[i]] = { type: "location", value: values[i] }
      }
      console.log("call frame", frame);
      cpsEvalBody(expr.body, [ frame, ...expr.env ], (v) => cont(v))
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
    } else if (typeof(expr) === "number" || typeof(expr) === "string") {
      cont(expr)
    } else if (typeof(expr) === 'symbol') {
      cpsLookup(env, expr, loc => cont(loc.value))
    } else if (expr instanceof Array) {
	    if (expr[0] === Symbol.for("define.internal")) {
		    cpsEvalValue(expr[2], env, v => {
		    	if (env.length === 0) {
		    	  globalEnv[expr[1]] = { type: "location", value: v };
		    	} else {
		    	  env[env.length - 1][expr[1]] = { type: "location", value: v };
		    	}
		    	cont(null); })
	    } else if (expr[0] === Symbol.for("let")) {
	    	let bindings = expr[2];
	    	// exclude bindings where symbol name is not defined
	    	bindings = bindings.filter(x => x[0] !== undefined)
	    	// exclude bindings where bound value is not defined
	    	bindings = bindings.filter(x => x[1] !== undefined)
	    	const variables = bindings.map(x => x[0]);
	    	const expressions = bindings.map(x => x[1]);
	    	let frame = {};
	    	cpsEvalValues(expressions, env, (values) => {
	    	    for (let i = 0; i < variables.length; i++) {
	    	      frame[variables[i]] = { type: "location", value: values[i] }
	    	    }
            	    console.log("let frame", frame);
            	    cpsEvalBody(expr.slice(3), [ frame, ...env ], (v) => cont(v))
	    	});
            } else if (expr[0] === Symbol.for('lambda')) {
	    	cont(closure(expr[1], env, expr.slice(2)))
	    } else if (expr[0] === Symbol.for("if")) {
          	cpsEvalValue(expr[1], env, (v) => {
          	if (v) {
          	  cpsEvalValue(expr[2], env, cont)
          	} else {
          	  cpsEvalValue(expr[3], env, cont)
          	}
                });
	    } else {
	    	cpsEvalValue(expr[0], env,
		v => {
		  if (v.type !== "closure" && typeof(v) === "function") {
			  cpsEvalFunctionApply(v, env, expr.slice(1), cont)
		  } else if (v.type === "closure") {
			  cpsEvalClosureApply(v, env, expr.slice(1), cont)
		  } else {
			  error("attempting to call non-callable type:", v.type);
		  }
	    });
	    }
    } else {
	    error("unknown value type: ", expr.type);
    }
  };
  const cpsEvalBody = (expr, env, cont) => {
    if (expr.length === 0) {
    } else if (expr.length === 1) {
        cpsEvalValue(expr[0], env, cont);
    } else {
        cpsEvalValue(expr[0], env, values => cpsEvalBody(expr.slice(1), env, cont));
    }
  }
  console.log("compile", expr, convert(expr))
  cpsEvalBody(convert(expr), [], cont ? cont : result => { console.log("eval finished:", result); })
}
