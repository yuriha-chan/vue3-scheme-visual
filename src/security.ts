const checkpoint = (x) => {
        if (x === Function || x === eval || x === setTimeout || x === setInterval) {
      	  throw new Error("Access to eval, Function, setTimetout, setInterval is not allowed for security reasons.");
        } else {
      	 return x;
        }
};
const checkKey = (x) => {
        if (x === 'constructor' || x === 'prototype' || x.startWith("__")) {
      	  throw new Error("Access to 'constructor', 'prototype' or property starting with '__' is prohibited for security reasons");
        } else {
      	  if (x instanceof Symbol) {
      		  return x.toString();
      	  }
      	  return x;
        }
};
const lockdown = (x) => {
  Object.freeze(Object);
  Object.freeze(Object.prototype);
  Object.freeze(Function);
  Object.freeze(Function.prototype);
  Object.freeze(Symbol);
  Object.freeze(Symbol.prototype);
  Object.freeze(Number);
  Object.freeze(Number.prototype);
  Object.freeze(BigInt);
  Object.freeze(BigInt.prototype);
  Object.freeze(Date);
  Object.freeze(Date.prototype);
  Object.freeze(Math);
};
const wrappedSetTimeout = (func, timeout) => {
        if (typeof func === "function") {
      	  return setTimeout(func, timeout);
        }
        throw new Error("The first argument passed to setTimeout function must be a function for security reasons");
};
const wrappedSetInterval = (func, timeout) => {
        if (typeof func === "function") {
      	  return setInterval(func, timeout);
        }
        throw new Error("The first argument passed to setInterval function must be a function for security reasons");
};
export {
	checkpoint,
	checkKey,
	lockdown,
	wrappedSetTimeout,
	wrappedSetInterval
};
