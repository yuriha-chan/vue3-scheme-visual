const match = (pattern, literals, ellipsis, expression) => {
	console.log("matching", pattern, expression)
	const capture = new Map();
	if (typeof(pattern) === "string" || typeof(pattern) === "number" || typeof(pattern) == "boolean") {
		if (pattern === expression) {
			return capture;
		} else {
			return false;
		}
	} else if (pattern === Symbol.for("_")) {
		return capture;
	} else if (typeof(pattern) === "symbol") {
		if (literals.some(x => x === pattern)) {
			return (pattern === expression) && capture;
		} else {
			capture.set(pattern, expression);
			return capture;
		}
	} else if (expression instanceof Array) {
		if (!(expression instanceof Array)) {
			return false;
		}
		const k = pattern.map((x, i) => (x === ellipsis) ? [i] : []).flat()
		if (k.length === 0) {
			if (pattern.length !== expression.length) {
				return false;
			} else {
				for (let i = 0; i < pattern.length; i++) {
					const subCapture = match(pattern[i], literals, ellipsis, expression[i]);
					if (!subCapture) {
						return false;
					}
					for (const key of subCapture.keys()) {
						capture.set(key, subCapture.get(key));
					}
				}
				return capture;
			}
		} else if (k.length === 1) {
			const k0 = k[0];
			if (pattern.length - 2 >= expression.length) {
				return false;
			} else {
				for (let i = 0; i < k0 - 1; i++) {
					const subCapture = match(pattern[i], literals, ellipsis, expression[i]);
					if (!subCapture) {
						return false;
					}
					for (const key of subCapture.keys()) {
						capture.set(key, subCapture.get(key));
					}
				}
				/*
				patt a    b    ...  c    d
				     0    1    k0   *    patt.length-1
				expr a    b1   b2   b3   c    d
				     0    k0-1 k0   k0+1 *    expr.length-1
				*/
				for (let i = k0 - 1; i < expression.length - pattern.length + k0 + 1; i++) {
					const subCapture = match(pattern[k0 - 1], literals, ellipsis, expression[i]);
					if (!subCapture) {
						return false;
					}
					for (const k of subCapture.keys()) {
						if (capture.has(k)) {
							capture.get(k).push(subCapture.get(k));
						} else {
							capture.set(k, [ subCapture.get(k) ]);
						}
					}
				}
				let j = k0 + 1;
				for (let i = expression.length - pattern.length + k0 + 1; i < expression.length; i++) {
					const subCapture = (match(pattern[j], literals, ellipsis, expression[i]));
					if (!subCapture) {
						return false;
					}
					for (const key of subCapture.keys()) {
						capture.set(key, subCapture.get(key));
					}
					j++;
				}
				return capture;
			}
		} else {
			throw new Error("Ellipsis (...) must appear at most once on a single nest level")
		}
	}
}

const expand = (matches, ellipsis, template, indices=[]) => {
	const expandAsMany = (template) => {
		const ret = [];
		for (let i = 0; true; i++) {
			const add = expand(matches, ellipsis, template, [...indices, i]);
			if (add) {
				ret.push(add);
			} else {
				break;
			}
		}
		return ret;
	};
	const expandAux = (template) => {
       		if (typeof(template) === "string" || typeof(template) === "number" || typeof(template) == "boolean") {
			return template;
		} else if (typeof(template) === "symbol") {
			if (matches.has(template)) {
				const vars = matches.get(template);
				return indices.reduce((s, i) => s && s[i], vars);
			} else {
				return template;
			}
		} else if (template.length > 1 && template[1] === ellipsis) {
			return [ ...expandAsMany(template[0]), ...expandAux(template.slice(2))] ;
		} else if (template.length > 0) {
			return [ expandAux(template[0]), ...expandAux(template.slice(1))];
		} else if (template.length === 0) {
			return [];
		}
	};
	const res = expandAux(template);
	if (res instanceof Array && res.some(x => x === undefined)) {
		return undefined;
	} else {
		return res;
	}
}

const applySyntaxRules = ({ ellipsis, literals, rules }, expression) => {
	for (const r of rules) {
		const matches = match(r.pattern, literals, ellipsis, expression);
		if (!matches) {
			continue;
		}
		return expand(matches, ellipsis, r.template);
	}
	throw new Error("Expression does not match any syntax rule.");
}

export { applySyntaxRules };
