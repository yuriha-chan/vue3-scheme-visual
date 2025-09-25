const builtinSyntaxes = new Map(Object.entries({
	"define": {
		ellipsis: Symbol.for("..."),
		literals: [],
		rules: [
			{ pattern: [Symbol.for("_"), [Symbol.for("function"), Symbol.for("args"), Symbol.for("...")], Symbol.for("body"), Symbol.for("...")],
			       template: [Symbol.for("define.internal"), Symbol.for("function"), [Symbol.for("lambda"), [Symbol.for("args"), Symbol.for("...")], Symbol.for("body"), Symbol.for("...")]] },
			{ pattern: [Symbol.for("_"), Symbol.for("variable"), Symbol.for("value")], template: [Symbol.for("define.internal"), Symbol.for("variable"), Symbol.for("value")] }
			],
	},
	"begin": {
		ellipsis: Symbol.for("..."),
		literals: [],
		rules: [
			{ pattern: [Symbol.for("_"), Symbol.for("body"), Symbol.for("...")],
				template: [Symbol.for("let"), Symbol.for("_"), [], Symbol.for("body"), Symbol.for("...")] },
			],
	},
}).map(x => [Symbol.for(x[0]), x[1]]));
export default builtinSyntaxes;
