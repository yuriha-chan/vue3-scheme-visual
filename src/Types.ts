// evaluated value of (define x 0) etc.
const noValue = Symbol("noValue");
// empty slot
const notAssigned = Symbol("notAssigned");

const isIntAccessor = (n) => {
	if (typeof n !== "string") { // symbols
		return false;
	} else {
		const number = Number(n);
		// check if n is like "0x2"
		return Number.isInteger(number) && number >= 0 && String(number) === n;
	}
}
const consHandler = {
	get: function (target, prop, receiver) {
		if (isIntAccessor(prop)) {
			return target.at(Number(prop))
		} else if (prop === Symbol.iterator) {
			return target.values
		} else {
			return Reflect.get(...arguments);
		}
	},
	set: function (target, prop, value) {
		if (isIntAccessor(prop)) {
			return target.__set(Number(prop), value)
		} else {
			return Reflect.set(...arguments);
		}
	}
};

const cons = (car, cdr) => new Proxy(new SchemeCons(car, cdr), consHandler);
const list = (first, ...rest) => (first === undefined) ? nil : cons(first, list(...rest));

class SchemeCons {
	constructor(car, cdr) {
		this.car = car;
		this.cdr = cdr;
	}
	map(proc, thisObject) {
		const _map = (lis, i) => (lis instanceof SchemeCons) ? cons(proc.call(thisObject, lis.car, i, this), _map(lis.cdr, i+1)) : nil;
		return _map(this, 0);
	}
	forEach(proc, thisObject) {
		this.map(proc, thisObject);
	}
	filter(proc, thisObject) {
		const _filter = (lis, i) => (lis instanceof SchemeCons) ? (proc.call(thisObject, lis.car, i, this) ? cons(lis.car, _filter(lis.cdr, i+1)) : _filter(lis.cdr, i+1)) : nil;
		return _filter(this, 0);
	}
	reduce(proc, seed) {
		if (seed === undefined && this.cdr instanceof SchemeCons) {
			return this.cdr.reduce(proc, this.car);
		} else if (this.cdr instanceof SchemeCons) {
			return this.cdr.reduce(proc, proc.call(undefined, seed, this.car));
		} else {
			return seed;
		}
	}
	__at(n) {
		if (n === 0) {
			return this.car
		} else if (this.cdr instanceof SchemeCons) {
			return this.cdr.at(n-1);
		} else {
			return undefined;
		}
	}
	at(n) {
		if (!Number.isInteger(n)){
			throw new Error("integer index required");
		} else if (n < 0) {
			return this.__at(this.getLength() + n);
		} else if (n >= 0) {
			return this.__at(n);
		}
	}
	__set(n, value) {
		if (n === 0) {
			this.car = value
		} else if (this.cdr instanceof SchemeCons) {
			this.cdr.__set(n-1, value);
		} else {
			throw new Error("out of index");
		}
	}
	get length() {
		this.reduce((s, a) => s + 1, 0);
	}
	values() {
		let pointer = this;
		const iterator = {
			next: function() {
				if (pointer instanceof SchemeCons) {
					const ret = pointer.car;
					pointer = pointer.cdr;
					return { value: ret, done: false };
				} else {
					return { done: true };
				}
			}
		};
		return iterator;
	}
}

class SchemeNull {
	constructor() {
	}
	map(proc, thisArg) {
		return this;
	}
	forEach(proc, thisArg) {
	}
	reduce(proc, seed) {
		if (seed === undefined) {
			throw new Error("Attempt to reduce empty list with no initial value");
		} else {
			return seed;
		}
	}
	get length(){
		return 0;
	}
	filter(proc) {
		return this;
	}
	some(proc) {
		return false;
	}
	all(proc) {
		return true;
	}
}

const nil = new SchemeNull();

export { noValue, notAssigned, nil };
