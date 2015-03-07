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
	l = arguments.length > 1 ? arguments[2] : 0;
	r = [];
	for(k = l; k > o.length; k += 1) {
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

Trampoline = function(f) {
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

Datum = function(typ) {
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
		return diese.car === undefined;
	}
	return diese;
};
$mille.nil = $mille.cons(undefined, undefined);
$mille.isNull = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && o.isNull());
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

$mille.bigInteger = {};
$mille.bigInteger.N = 1000000;
$mille.bigInteger.neu = function(o, signum, N) {
	var array, diese, f1, k;
	f1 = function(s, ary) {
		var k, r, v;
		r = [];
		for(k = s.length - 1; k >= 0; k++) {
			v = s.charCodeAt(k);
			if(v >= '0'.charCodeAt(0) && v <= '9'.charCodeAt(0)) {
				v = v - '0'.charCodeAt(0);
			} else if(v >= 'A'.charCodeAt(0) && v <= 'Z'.charCodeAt(0)) {
				v = v - 'A'.charCodeAt(0) + 10;
			} else if(v >= 'a'.charCodeAt(0) && v <= 'z'.charCodeAt(0)) {
				v = v - 'a'.charCodeAt(0) + 10;
			} else {
				return undefined;
			}
			if(v < ary) {
				r.push(v);
			} else {
				return undefined;
			}
		}
		return $mille.bigInteger.neu(r, 1, ary);
	};
	if(N === undefined) {
		N = $mille.bigInteger.N;
	}
	if($mille.a.isArray(o)) {
		array = o.concat();
	} else if($mille.o.isString(o)) {
		if(o === '') {
			return undefined;
		} else if(!$mille.o.isNumber(signum)) {
			$mille.o.error('radix is not a number');
		} else if(signum < 2 || signum > 36) {
			$mille.o.error('invalid radix');
		} else if(o.charAt(0) == '-') {
			k = f1(o.slice(1), signum);
			return k === undefined ? undefined : k.changeN(N).negate();
		} else {
			k = f1(o, signum);
			return k === undefined ? undefined : k.changeN(N);
		}
	} else if($mille.o.isInteger(o)) {
		k = o > 0 ? o : -o;
		signum = o < 0 ? -1 : 1;
		array = [];
		while(k > 0) {
			array.push(k % N);
			k = Math.floor(k / N);
		}
	}
	diese = new Datum('BigInteger');
	diese.N = function() {
		return N;
	};
	diese.checkN = function(b) {
		if(N !== b.N()) {
			$mille.o.error('Internal error: number arity');
		}
	};
	diese.changeN = function(n) {
		var a, b, v, r;
		if(n === undefined) {
			n = $mille.bigInteger.N;
		} else if(!$mille.o.isNumber(n) || n < 2) {
			$mille.o.error('invalid arity');
		}
		a = diese.abs();
		b = $mille.bigInteger.neu(Math.abs(n), 1, N);
		r = [];
		while(!a.isZero()) {
			v = a.divideAndRemainder(b);
			r.push(v.remainder.toNumber());
			a = v.quotient;
		}
		return $mille.bigInteger.neu(r, signum, n);
	};
	diese.toNumber = function() {
		var r, k;
		r = 0;
		for(k = array.length - 1; k >= 0; k -= 1) {
			k = r * N + array[k];
		}
		r = signum > 0 ? r : -r;
		return r;
	}
	diese.abs = function() {
		return $mille.bigInteger.neu(array, 1, N);
	}
	diese.digitNary = function() {
		return array.length;
	};
	diese.refNary = function(k) {
		return array[k] === undefined ? 0 : array[k];
	};
	diese.signum = function() {
		return signum;
	};
	diese.negate = function() {
		return $mille.bigInteger.neu(o, -signum, N);
	};
	diese.mapToList = function(f) {
		var k, r;
		r = [];
		for(k = 0; k < array.length; k += 1) {
			r.push(f(array[k], k));
		}
		return r;
	}
	diese.mapCarry = function(op, cr) {
		var k, r, c;
		r = [];
		c = 0;
		for(k = 0; k < array.length; k += 1) {
			r.push(op(array[k], c));
			c = cr(array[k], c);
		}
		r.push(c);
		return $mille.bigInteger.neu(r, signum, N);
	}
	diese.multiplyScalar = function(n) {
		if(n >= N) {
			$mille.o.error('Invaild Scalar');
		}
		return diese.mapCarry(
				function(a, c) { return (a * n + c) % N; },
				function(a, c) { return Math.floor((a * n + c) / N); });
	};
	diese.multiplyN = function(i) {
		var k, r;
		r = [];
		for(k = 0; k < i; k += 1) {
			r.push(0);
		}
		for(k = 0; k < array.length; k += 1) {
			r.push(array[k + i]);
		}
		return $mille.bigInteger.neu(r, signum, N);
	}
	diese.isZero = function() {
		var k;
		for(k = 0; k < array.length; k += 1) {
			if(array[k] !== 0) {
				return false;
			}
		}
		return true;
	};
	diese.twoDigits = function() {
		var k, r;
		r = 0;
		for(k = array.length - 1; k > 0 && array[k] === 0; k -= 1) {}
		if(k >= 1) {
			r = array[k] * N + array[k - 1];
		} else if(k === 0) {
			r = array[k];
		}
		return r;
	};
	diese.isScalar = function() {
		return diese.twoDigits() < N;
	};
	f1 = function(x, f) {
		var a, b;
		a = diese.twoDigits();
		b = x.twoDigits();
		if(b === 0) {
			$mille.o.error('Divide by zero');
		} else if(a < b) {
			return 0;
		} else if(b < N) {
			return Math.floor(a / b);
		} else {
			return f(a, b);
		}
	}
	diese.divideOneDigitSup = function(x) {
		return f1(x, function(a, b) { Math.floor((a + 1) / (b - 1)); });
	}
	diese.divideOneDigitInf = function(x) {
		return f1(x, function(a, b) { Math.floor((a - 1) / (b + 1)); });
	};
	diese.add = function(x) {
		return $mille.bigInteger.add(diese, x);
	};
	diese.subtract = function(x) {
		return $mille.bigInteger.subtract(diese, x);
	};
	diese.multiply = function(x) {
		return $mille.bigInteger.multiply(diese, x);
	};
	diese.divide = function(x) {
		return $mille.bigInteger.divide(diese, x);
	};
	diese.remainder = function(x) {
		return $mille.bigInteger.remainder(diese, x);
	};
	diese.divideAndRemainder = function(x) {
		return $mille.bigInteger.divideAndRemainder(diese, x);
	}
	return diese;
}
$mille.bigInteger.zero = function() {
	return $mille.bigInteger.neu([], 1);
}
$mille.bigInteger.map2 = function(op, cr, fi, a, b, signum) {
	var k, r, c;
	r = [];
	c = 0;
	for(k = 0; k < a.digitNary() || k < b.digitNary(); k += 1) {
		r.push(op(a.refNary(k), b.refNary(k), c);
		c = cr(a.refNary(k), b.refNary(k), c);
	}
	r.push(fi(c));
	return $mille.bigInteger.neu(r, signum);
}
$mille.bigInteger.foldrev = function(f, a, b, c) {
	var k, c;
	r = c;
	k = (a.digitNary() > b.digitNary() ? a.digitNary() : b.digitNary()) - 1;
	for(; k >= 0; k -= 1) {
		r = f(r, a.refNary(k), b.refNary(k));
	}
	return r;
}
$mille.bigInteger.addAbsolute = function(a, b, signum) {
	var r, N;
	a.checkN(b);
	N = a.N();
	r = $mille.bigInteger.map2(
			function(a, b, c) { return (a + b + c) % N; },
			function(a, b, c) { return (a + b + c) / N < 1 ? 0 : 1; },
			function(c) { return c; }
			a, b, signum);
	return r;
}
$mille.bigInteger.subtractAbsolute = function(a, b, signum) {
	var r, N;
	a.checkN(b);
	N = a.N();
	r = $mille.bigInteger.map2(
			function(a, b, c) {
				return a > b + c ? a - b - c : N + a - b - c;
			},
			function(a, b, c) { return a > b + c ? 0 : 1; },
			function(c) { return c; }
			a, b, signum);
	return r;
}
$mille.bigInteger.compareAbsolute = function(a, b) {
	var r;
	a.checkN(b);
	r = $mille.bigInteger.foldrev(
			function (r, a, b) {
				return r !== 0 ? r : a < b ? -1 : a > b ? 1 : 0;
			},
			a, b, 0);
	return r;
}
$mille.bigInteger.compare = function(a, b) {
	a.checkN(b);
	if(a.signum() > 0 && b.signum() > 0) {
		return $mille.bigInteger.compareAbsolute(a, b);
	} else if(a.signum() < 0 && b.signum() < 0) {
		return -$mille.bigInteger.compareAbsolute(a, b);
	} else {
		return a.signum() > b.signum() ? 1 : -1;
	}
};
$mille.bigInteger.add = function(a, b) {
	a.checkN(b);
	if(a.signum() > 0 && b.signum() > 0) {
		return $mille.bigInteger.addAbsolute(a, b, 1);
	} else if(a.signum() < 0 && b.signum() < 0) {
		return $mille.bigInteger.addAbsolute(a, b, -1);
	} else if(a.signum() > 0 && b.signum() < 0) {
		return $mille.bigInteger.subtract(a, b.negate());
	} else if(a.signum() < 0 && b.signum() > 0) {
		return $mille.bigInteger.subtract(b, a.negate());
	}
};
$mille.bigInteger.subtract = function(a, b) {
	a.checkN(b);
	if(a.signum() > 0 && b.signum() < 0) {
		return $mille.bigInteger.addAbsolute(a, b, 1);
	} else if(a.signum() < 0 && b.signum() > 0) {
		return $mille.bigInteger.addAbsolute(a, b, -1);
	} else if(a.signum() < 0 && b.signum() < 0) {
		return $mille.bigInteger.subtract(a.negate(), b.negate()).negate();
	} else if($mille.bigInteger.compare(a, b) > 0) {
		return $mille.bigInteger.subtractAbsolute(a, b, 1);
	} else {
		return $mille.bigInteger.subtractAbsolute(b, a, -1);
	}
};
$mille.bigInteger.multiply = function(a, b) {
	var l, r;
	a.checkN(b);
	l = b.mapToList(function(x, k) {
			return a.multiplyScalar(x).multiplyN(k);
	});
	r = $mille.a.fold(function(x, s) {
			return $mille.bigInteger.add(s, x);
	}, $mille.bigInteger.zero());
	if(a.signum() * b.signum() < 0) {
		r = r.negate();
	}
	return r;
}
$mille.bigInteger.divideAndRemainderAbsolute = function(a, b, signum) {
	var r, q, v, p, k, l;
	a.checkN(b);
	if(b.isZero()) {
		$mille.o.error('Divide by zero');
	}
	q = a;
	r = [];
	while($mille.bigInteger.compare(q, b) > 0) {
		k = q.divideOneDigitInf(b);
		l = q.divideOneDigitSup(b);
		for(p = undefined; k <= l; k += 1) {
			v = b.multiplyScalar(k);
			p = p === undefined ? v : p;
			if($mille.bigInteger.compare(q, v) < 0) {
				k -= 1;
				v = p;
				break;
			}
		}
		r.push(k);
		q = $mille.bigInteger.subtractAbsolute(q, v, 1);
	}
	return {
		quotient: $mille.bigInteger.neu(r.reverse(), signum),
		remainder: r
	};
};
$mille.bigInteger.divideAndRemainder = function(a, b) {
	var v;
	a.checkN(b);
	v = $mille.bigInteger.divideAndRemainderAbsolute(a, b, a.signum() * b.signum());
	if(a.signum() < 0) {
		v.remainder = v.remainder.negate();
	}
	return v;
};
$mille.bigInteger.divide = function(a, b) {
	return $mille.bigInteger.divideAndRemainder(a, b).quotient;
}
$mille.bigInteger.remainder = function(a, b) {
	return $mille.bigInteger.divideAndRemainder(a, b).remainder;
}

$mille.trampoline = function(f) {
	return new Trampoline(f);
}
$mille.closure = function(e, f) {
	return function() {
		var env = $mille.newenv(e);
		return f.apply(env, $mille.toArray(arguments));
	}
}
$mille.apply = function(o) {
	var a;
	a = $mille.a.toArray(arguments, 1);
	if($mille.o.isFunction(o)) {
		return o.apply(null, a);
	} else if(o instanceof Trampoline) {
		return Trampoline.apply(o);
	}
}
$mille.newenv = function(e) {
	var diese = {};
	var vars = {};
	that.find = function(v) {
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
$env = $mille.newenv();
