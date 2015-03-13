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
}
$mille.a.fold = function(f, a, seed) {
	var k, r;
	r = seed;
	for(k = 0; k < a.length; k += 1) {
		r = f(a[k], r);
	}
	return r;
}

$mille.o = {};
$mille.o.isFunction = function(o) {
	return (typeof o === 'function');
};
$mille.o.isString = function(o) {
	return (typeof o === 'string');
}
$mille.o.isNumber = function(o) {
	return (typeof o === 'number');
}
$mille.o.isInteger = function(o) {
	return (typeof o === 'number' &&
			isFinite(nVal) &&
			o > -9007199254740992 &&
			o < 9007199254740992 &&
			Math.floor(o) === o);
}
$mille.o.error = function(e) {
	throw e;
}

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
	}
	return diese;
};
$mille.nil = $mille.cons(null, null);
$mille.isNull = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && o.isNull());
}
$mille.isPair = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && !o.isNull());
}
$mille.isAtom = function(o) {
	return !$mille.datumTypeOf(o, 'cell');
}
$mille.car = function(o) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		return o.car;
	} else {
		$mille.o.error('Not cons');
	}
}
$mille.cdr = function(o) {
	if($mille.datumTypeOf(o, 'cell') && o.cdr !== null) {
		return o.cdr;
	} else {
		$mille.o.error('Not cons');
	}
}
$mille.setCar = function(o, x) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		o.car = x;
		return undefined;
	} else {
		$mille.o.error('Not cons');
	}
}
$mille.setCdr = function(o, x) {
	if($mille.datumTypeOf(o, 'cell') && o.car !== null) {
		o.cdr = x;
		return undefined;
	} else {
		$mille.o.error('Not cons');
	}
}
$mille.listToCell = function(o) {
	var k, c, d;
	if(!$mille.a.isArray(o)) {
		return o;
	} else if(o.length > 0) {
		for(k = 0; k < o.length; k += 1) {
			d = $mille.cons($mille.listToCell(o[k]), $mille.nil);
			if(c !== undefined) {
				c.cdr = d;
			}
		}
		return c;
	} else {
		return $mille.nil;
	}
};
$mille.cellToList = function(l, notproper) {
	var a = [], p;
	p = notproper !== undefined ? notproper : function(l, p) {
		$mille.o.error('Not proper list');
	};
	while(true) {
		if(!(l instanceof Cell)) {
			return p(a, p);
		} else if(l.isNull()) {
			return a;
		} else {
			a.push(cellToList(a.car));
			l = l.cdr;
		}
	}
};

$mille.trampoline = function(f) {
	return new Trampoline(f);
}
$mille.closure = function(e, f) {
	return function() {
		var env = $mille.newenv(e);
		return f.apply(null, $mille.a.toArray(arguments, 0, [env]));
	}
}
$mille.applya = function(o, a) {
	if($mille.o.isFunction(o)) {
		return o.apply(null, a);
	} else if(o instanceof Trampoline) {
		return Trampoline.apply(o);
	}
}
$mille.apply = function(o) {
	var a;
	a = $mille.a.toArray(arguments, 1);
	return $mille.applya(o, a);
}
$mille.applyCell = function(o, l) {
	var a;
	a = $mille.cellToList(l);
	return $mille.applya(o, a);
}
$mille.newenv = function(e) {
	var diese = {};
	var vars = {};
	diese.find = function(v) {
		if(vars[v] !== undefined) {
			return vars[v];
		} else if(e === undefined || e === null) {
			return undefined;
		} else {
			return e.find(v);
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
	return diese;
}

$mille.checkNumber = function(x) {
	if(!$mille.o.isNumber(x)) {
		$mille.o.error('the type of the object is not number:' + x);
	}
}
$mille.checkInteger = function(x) {
	if(!$mille.o.isInteger(x)) {
		$mille.o.error('the type of the object is not integer:' + x);
	}
}
$mille.checkNaturalNumber = function(x, zero) {
	if(!$mille.o.isInteger(x) || x < zero) {
		$mille.o.error('the type of the object is not natural number:' + x);
	}
}
$mille.checkString = function(x) {
	if(!$mille.o.isString(x)) {
		$mille.o.error('the type of the object is not string:' + x);
	}
}

$mille.compare = function(f, check) {
	if(check === undefined) {
		cf = function(x) { return true; }
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
	}
}
$mille.compareNumber = function(f) {
	return $mille.compare(f, $mille.checkNumber);
}
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
}
$mille.arith2 = function(f, unary) {
	return function() {
		var k, v;
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
}
$mille.unary = function(f) {
	return function(x) {
		$mille.checkNumber(x);
		return f(x);
	};
}

$mille.checkStringLength = function(x, l) {
	if(l >= x.length) {
		$mille.o.error('Argument out of range');
	}
}
$mille.substring = function(x, start, end) {
	$mille.checkString(x);
	$mille.checkInteger(start);
	$mille.checkInteger(end);
	return x.substring(x, start, end);
}
$mille.stringRef = function(x, k) {
	$mille.checkString(x);
	$mille.checkInteger(k);
	$mille.checkStringLength(x, k);
	return x.charCodeAt(k);
}
$mille.stringLength = function(x) {
	$mille.checkString(x);
	return x.length;
}
$mille.stringAppend = function() {
	var k, v = "";
	for(k = 0; k < arguments.length; k++) {
		$mille.checkString(arguments[k]);
		v += arguments[k];
	}
	return v;
}

$mille.checkSymbol = function(x) {
	$mille.checkString(x);
}
$mille.stringToSymbol = function(x) {
	$mille.checkString(x);
	return x;
}
$mille.symbolToSymbol = function(x) {
	$mille.checkSymbol(x);
	return x;
}

$mille.isVector = function(x) {
	return $mille.a.isArray(x);
}
$mille.numberToString = function(x) {
	$mille.checkNumber(x);
	return x.toString();
}

$mille.genv = $mille.newenv();
$mille.bindg = function(b, fn) {
	$mille.genv.bind(b, $mille.closure($mille.genv, function($e) {
		return fn.apply(null, $mille.a.toArray(arguments, 1));
	}));
}
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
$mille.bindg('vector', $mille.isVector);
$mille.bindg('number->string', $mille.numberToString);
$env = $mille.genv;
