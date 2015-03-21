/*
 * Copyright 2014 Yuichiro Moriguchi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var $mille = {};
var $env;

$mille.a = {};
$mille.a.toArray = function(o) {
	var l, k, r;
	l = arguments.length > 1 ? arguments[1] : 0;
	r = arguments.length > 2 ? arguments[2].concat() : [];
	for(k = l; k < o.length; k += 1) {
		r.push(o[k]);
	}
	return r;
};
$mille.a.isArray = function(o) {
	return (o &&
			typeof o === 'object' &&
			o.constructor === Array);
};
$mille.a.fold = function(f, a, seed) {
	var k, r;
	r = seed;
	for(k = 0; k < a.length; k += 1) {
		r = f(a[k], r);
	}
	return r;
};

$mille.o = {};
$mille.o.isFunction = function(o) {
	return (typeof o === 'function');
};
$mille.o.isString = function(o) {
	return (typeof o === 'string');
};
$mille.o.isNumber = function(o) {
	return (typeof o === 'number');
};
$mille.o.isInteger = function(o) {
	return (typeof o === 'number' &&
			isFinite(nVal) &&
			o > -9007199254740992 &&
			o < 9007199254740992 &&
			Math.floor(o) === o);
};
$mille.o.error = function(e) {
	throw e;
};

function Trampoline(f) {
	a = $mille.a.toArray(arguments, 1);
	this.thunk = function() {
		return f.apply(null, a);
	};
};
Trampoline.apply = function(o) {
	var r = o;
	while(r instanceof Trampoline) {
		r = o.thunk();
	}
	return r;
};

function Datum(typ) {
	this.typ = function() {
		return typ;
	};
};

$mille.datumTypeOf = function(o, typ) {
	return ((o instanceof Datum) && o.typ() === typ);
};
$mille.cons = function(c, d) {
	var diese;
	diese = new Datum('cell');
	diese.car = c;
	diese.cdr = d;
	diese.isNull = function() {
		return diese.car === null;
	};
	return diese;
};
$mille.nil = $mille.cons(null, null);
$mille.isNull = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && o.isNull());
};
$mille.isPair = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && !o.isNull());
};
$mille.isAtom = function(o) {
	return !$mille.datumTypeOf(o, 'cell');
};
$mille.car = function(o) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		return o.car;
	} else {
		$mille.o.error('Not cons: ' + o);
	}
};
$mille.cdr = function(o) {
	if($mille.datumTypeOf(o, 'cell') && o.cdr !== null) {
		return o.cdr;
	} else {
		$mille.o.error('Not cons: ' + o);
	}
};
$mille.setCar = function(o, x) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		o.car = x;
		return undefined;
	} else {
		$mille.o.error('Not cons: ' + o);
	}
};
$mille.setCdr = function(o, x) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		o.cdr = x;
		return undefined;
	} else {
		$mille.o.error('Not cons: ' + o);
	}
};
$mille.listToCell = function(o) {
	var k, c, d, r = undefined;

	if(!$mille.a.isArray(o)) {
		return o;
	} else if(o.length > 0) {
		for(k = 0; k < o.length; k += 1) {
			d = $mille.cons($mille.listToCell(o[k]), $mille.nil);
			if(r === undefined) {
				r = d;
			} else {
				c.cdr = d;
			}
			c = d;
		}
		return r;
	} else {
		return $mille.nil;
	}
};
$mille.cellToList = function(l, notproper) {
	var a = [], p;

	p = notproper !== undefined ? notproper : function(l) {
		$mille.o.error('Not proper list: ' + l);
	};
	while(true) {
		if(!$mille.datumTypeOf(l, 'cell')) {
			return p(l);
		} else if(l.isNull()) {
			return a;
		} else {
			a.push($mille.cellToList(l.car, function(l) { return l; }));
			l = l.cdr;
		}
	}
};

$mille.trampoline = function(f) {
	return new Trampoline(f);
};
$mille.closure = function(e, that, f) {
	return function() {
		var env = $mille.newenv(e, that);
		return f.apply(that, $mille.a.toArray(arguments, 0, [env]));
	};
};
$mille.applya = function(o, a) {
	if($mille.o.isFunction(o)) {
		return o.apply(null, a);
	}
};
$mille.apply = function(o) {
	var a;
	a = $mille.a.toArray(arguments, 1);
	return $mille.applya(o, a);
};
$mille.applyCell = function(o, l) {
	var a;
	a = $mille.cellToList(l);
	return $mille.applya(o, a);
};
$mille.findObjectChain = function(diese, a) {
	var r = diese, i;
	for(i = 0; i < a.length; i++) {
		if((r = r[a[i]]) === undefined) {
			return r;
		}
	}
	return r;
};
$mille.newenv = function(e, that) {
	var diese = {};
	var vars = {};
	diese.find = function(v) {
		var x, a;
		if(vars[v] !== undefined) {
			return vars[v];
		} else if(e !== undefined && e !== null) {
			return e.find(v);
		} else {
			a = v.split('.');
			if((x = $mille.findObjectChain(that, a)) !== undefined) {
				return x;
			} else if((x = $mille.findObjectChain(
					$mille.global, a)) !== undefined) {
				return x;
			} else {
				$mille.o.error('Unbound: ' + v);
			}
		}
	};
	diese.bind = function(v, o) {
		vars[v] = o;
	};
	diese.set = function(v, o) {
		if(vars[v] !== undefined) {
			vars[v] = o;
		} else if(e === undefined || e === null) {
			$mille.o.error('Undefined Symbol ' + v);
		} else {
			e.set(v, o);
		}
	};
	diese.apply = function(v, a) {
		var x;
		x = diese.find(v);
		if($mille.o.isFunction(x)) {
			x.apply(null, a);
		} else {
			$mille.o.error('Found no functions');
		}
	}
	diese.call = function(v) {
		diese.apply(v, $mille.a.toArray(arguments, 1));
	}
	return diese;
};
$mille.applyObject = function(x, obj) {
	var z = obj[x].apply(obj, $mille.a.toArray(arguments, 2));
	return z;
};
$mille.getGlobal = function() {
	$mille.global = this;
};
$mille.getGlobal();

$mille.checkNumber = function(x) {
	if(!$mille.o.isNumber(x)) {
		$mille.o.error('the type of the object is not number:' + x);
	}
};
$mille.checkInteger = function(x) {
	if(!$mille.o.isInteger(x)) {
		$mille.o.error('the type of the object is not integer:' + x);
	}
};
$mille.checkNaturalNumber = function(x, zero) {
	if(!$mille.o.isInteger(x) || x < zero) {
		$mille.o.error('the type of the object is not natural number:' + x);
	}
};
$mille.checkString = function(x) {
	if(!$mille.o.isString(x)) {
		$mille.o.error('the type of the object is not string:' + x);
	}
};
$mille.checkLength = function(x, l) {
	if(l < 0 || l >= x.length) {
		$mille.o.error('Argument out of range:' + l);
	}
};
$mille.checkVector = function(x) {
	if(!$mille.a.isArray(x)) {
		$mille.o.error('the type of the object is not vector:' + x);
	}
};
$mille.checkList = function(x) {
	if(!$mille.isPair(x) && !$mille.isNull(x)) {
		$mille.o.error('the type of the object is not list:' + x);
	}
};
$mille.checkInteger = function(x) {
	if(!$mille.o.isInteger(x)) {
		$mille.o.error('the type of the object is not integer:' + x);
	}
};
$mille.checkZero = function(x) {
	if(x === 0) {
		$mille.o.error('divide by zero');
	}
};

$mille.compare = function(f, check) {
	var cf;

	if(check === undefined) {
		cf = function(x) { return true; };
	} else {
		cf = check;
	}
	return function() {
		var k, v = null;
		for(k = 0; k < arguments.length; k++) {
			cf(arguments[k]);
			if(v === null || f(v, arguments[k])) {
				v = arguments[k];
			} else {
				return false;
			}
		}
		return true;		
	};
};
$mille.compareNumber = function(f) {
	return $mille.compare(f, $mille.checkNumber);
};
$mille.eq = $mille.compare(function(x, y) { return x === y; });
$mille.arith1 = function(f, d) {
	return function() {
		var k, v = d;
		for(k = 0; k < arguments.length; k++) {
			$mille.checkNumber(arguments[k]);
			v = f(v, arguments[k]);
		}
		return v;
	};
};
$mille.arith2 = function(f, unary) {
	return function() {
		var k, v = undefined;
		if(arguments.length < 1) {
			$mille.o.error('Too few arguments');
		} else if(arguments.length === 1) {
			return unary(arguments[0]);
		} else {
			v = arguments[0];
			for(k = 1; k < arguments.length; k++) {
				$mille.checkNumber(arguments[k]);
				v = f(v, arguments[k]);
			}
		}
		return v;
	};
};
$mille.unary = function(f) {
	return function(x) {
		$mille.checkNumber(x);
		return f(x);
	};
};

$mille.substring = function(x, start, end) {
	$mille.checkString(x);
	$mille.checkInteger(start);
	$mille.checkInteger(end);
	return x.substring(x, start, end);
};
$mille.stringRef = function(x, k) {
	$mille.checkString(x);
	$mille.checkInteger(k);
	$mille.checkLength(x, k);
	return x.charCodeAt(k);
};
$mille.stringLength = function(x) {
	$mille.checkString(x);
	return x.length;
};
$mille.stringAppend = function() {
	var k, v = "";
	for(k = 0; k < arguments.length; k++) {
		$mille.checkString(arguments[k]);
		v += arguments[k];
	}
	return v;
};

$mille.checkSymbol = function(x) {
	$mille.checkString(x);
};
$mille.stringToSymbol = function(x) {
	$mille.checkString(x);
	return x;
};
$mille.symbolToSymbol = function(x) {
	$mille.checkSymbol(x);
	return x;
};

$mille.isVector = function(x) {
	return $mille.a.isArray(x);
};
$mille.makeVector = function(k, fill) {
	var r = [], i;
	for(i = 0; i < k; i++) {
		r.push(fill);
	}
	return r;
};
$mille.vector = function() {
	return $mille.a.toArray(arguments);
};
$mille.vectorLength = function(v) {
	$mille.checkVector(v);
	return v.length;
};
$mille.vectorRef = function(v, k) {
	$mille.checkVector(v);
	$mille.checkLength(v, k);
	return v[k];
};
$mille.vectorSet = function(v, k, o) {
	$mille.checkVector(v);
	$mille.checkLength(v, k);
	v[k] = o;
	return undefined;
};
$mille.vectorToList = function(v) {
	$mille.checkVector(v);
	return $mille.listToCell(v);
};
$mille.listToVector = function(l) {
	$mille.checkList(l);
	return $mille.cellToList(l);
};
$mille.vectorFill = function(v, fill) {
	var i;
	$mille.checkVector(v);
	for(i = 0; i < v.length; i++) {
		v[i] = fill;
	}
	return undefined;
};

$mille.numberToString = function(x) {
	$mille.checkNumber(x);
	return x.toString();
};
$mille.isProcedure = function(x) {
	return $mille.o.isFunction(x);
};

$mille.not = function(x) {
	return x === false ? true : false;
};
$mille.isBoolean = function(x) {
	return x === true || x === false;
};

$mille.isNumber = function(x) {
	return $mille.o.isNumber(x);
};
$mille.isReal = function(x) {
	return $mille.o.isNumber(x);
};
$mille.isInteger = function(x) {
	return $mille.o.isInteger(x);
};
$mille.isExact = function(x) {
	return $mille.o.isInteger(x);
};
$mille.isInexact = function(x) {
	return !$mille.isExact(x);
};
$mille.abs = function(x) {
	return Math.abs(x);
};
$mille.quotient = function(x, y) {
	var n;
	$mille.checkInteger(x);
	$mille.checkInteger(y);
	$mille.checkZero(y);
	n = x / y;
	return n > 0 ? Math.floor(n) : Math.ceil(n);
};
$mille.remainder = function(x, y) {
	$mille.checkInteger(x);
	$mille.checkInteger(y);
	$mille.checkZero(y);
	return x % y;
};
$mille.modulo = function(x, y) {
	$mille.checkInteger(x);
	$mille.checkInteger(y);
	$mille.checkZero(y);
	if(x === 0) {
		return 0;
	} else if(x > 0 && y > 0) {
		return x % y;
	} else if(x < 0 && y < 0) {
		return -((-x) % (-y));
	} else if(x < 0 && y > 0) {
		return (x % y) + y;
	} else {
		return (x % y) - y;
	}
};

$mille.genv = $mille.newenv(undefined, this);
$mille.bindg = function(b, fn) {
	$mille.genv.bind(b, $mille.closure($mille.genv, this, function(e) {
		return fn.apply(null, $mille.a.toArray(arguments, 1));
	}));
};
$mille.bindg('cons', $mille.cons);
$mille.bindg('eq?', $mille.eq);
$mille.bindg('eqv?', $mille.eq);
$mille.bindg('car', $mille.car);
$mille.bindg('cdr', $mille.cdr);
$mille.bindg('atom?', $mille.isAtom);
$mille.bindg('null?', $mille.isNull);
$mille.bindg('symbol?', $mille.o.isString);
$mille.bindg('error', $mille.o.error);
$mille.bindg('set-car!', $mille.setCar);
$mille.bindg('set-cdr!', $mille.setCdr);
$mille.bindg('apply', $mille.applyCell);
$mille.bindg('1+', $mille.unary(function(x) { return x + 1; }));
$mille.bindg('1-', $mille.unary(function(x) { return x - 1; }));
$mille.bindg('>', $mille.compareNumber(function(x, y) { return x > y; }));
$mille.bindg('<', $mille.compareNumber(function(x, y) { return x < y; }));
$mille.bindg('=', $mille.compareNumber(function(x, y) { return x === y; }));
$mille.bindg('+', $mille.arith1(function(x, y) { return x + y; }, 0));
$mille.bindg('-', $mille.arith2(function(x, y) { return x - y; },
		function(x) { return -x; }));
$mille.bindg('*', $mille.arith1(function(x, y) { return x * y; }, 1));
$mille.bindg('/', $mille.arith2(function(x, y) { return x / y; },
		function(x) { return 1 / x; }));
$mille.bindg('string?', $mille.o.isString);
$mille.bindg('substring', $mille.substring);
$mille.bindg('string-ref', $mille.stringRef);
$mille.bindg('string-length', $mille.stringLength);
$mille.bindg('string-append', $mille.stringAppend);
$mille.bindg('string->symbol', $mille.stringToSymbol);
$mille.bindg('symbol->string', $mille.symbolToString);
$mille.bindg('vector?', $mille.isVector);
$mille.bindg('number->string', $mille.numberToString);

$mille.bindg('make-vector', $mille.makeVector);
$mille.bindg('vector-length', $mille.vectorLength);
$mille.bindg('vector-ref', $mille.vectorRef);
$mille.bindg('vector-set!', $mille.vectorSet);
$mille.bindg('vector->list', $mille.vectorToList);
$mille.bindg('list->vector', $mille.listToVector);
$mille.bindg('vector-fill!', $mille.vectorFill);
$mille.bindg('not', $mille.not);
$mille.bindg('boolean?', $mille.isBoolean);
$mille.bindg('number?', $mille.isNumber);
$mille.bindg('real?', $mille.isReal);
$mille.bindg('integer?', $mille.isInteger);
$mille.bindg('exact?', $mille.isExact);
$mille.bindg('inexact?', $mille.isInexact);
$mille.bindg('abs', $mille.abs);
$mille.bindg('remainder', $mille.remainder);
$mille.bindg('quotient', $mille.quotient);
$mille.bindg('modulo', $mille.modulo);
$env = $mille.genv;
