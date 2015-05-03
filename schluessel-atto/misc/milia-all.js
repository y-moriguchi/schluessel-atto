/*
 * Copyright 2014-2015 Yuichiro Moriguchi
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
			isFinite(o) &&
			o > -9007199254740992 &&
			o < 9007199254740992 &&
			Math.floor(o) === o);
};
$mille.o.isObject = function(o) {
	return (o instanceof Object && !(o instanceof Array));
};
$mille.o.error = function(e) {
	throw e;
};
$mille.o.mapEntries = function(o, f) {
	var v = null, r;
	r = [];
	for(v in o) {
		if(o.hasOwnProperty(v)) {
			r.push(f(v, o[v]));
		}
	}
	return r;
};
$mille.o.keys = function(o) {
	return $mille.o.mapEntries(o, function(k, v) {
		return k;
	});
};
$mille.o.values = function(o) {
	return $mille.o.mapEntries(o, function(k, v) {
		return v;
	});
};
$mille.o.entries = function(o) {
	return $mille.o.mapEntries(o, function(k, v) {
		return {
			key: k,
			value: v
		};
	});
};

$mille.r = {};
$mille.r.isNaN = function(o) {
	return o !== o;
};
$mille.r.isFinite = function(o) {
	return isFinite(o);
};
$mille.r.isInfinite = function(o) {
	return o === Infinity || o === -Infinity;
};
$mille.r.hypot = function(x, y) {
	return Math.sqrt(x * x + y * y);
};
$mille.r.sinh = function(x) {
	return (Math.exp(x) - Math.exp(-x)) / 2;
};
$mille.r.cosh = function(x) {
	return (Math.exp(x) + Math.exp(-x)) / 2;
};
$mille.r.tanh = function(x) {
	return $mille.r.sinh(x) / $mille.r.cosh(x);
};
$mille.r.gcd = function(x, y) {
	var a, b, c;
	if(x === 0 || y === 0) {
		return 0;
	} else {
		b = Math.abs(x > y ? x : y);
		c = Math.abs(x > y ? y : x);
		do {
			a = b;
			b = c;
			c = a - b * Math.floor(a / b);
		} while(c !== 0);
		return b;
	}
};

$mille.f = {};
$mille.f.K = function(x) {
	return x;
};

$mille.c = {};
$mille.c.make = function(re, im) {
	var that = new Datum('complex');
	var iszero = function() {
		return re === 0.0 && im === 0.0;
	};

	that.getReal = function() {
		return re;
	};
	that.getImag = function() {
		return im;
	};
	that.getMagnitude = function() {
		return $mille.r.hypot(re, im);
	};
	that.getMagnitude2 = function() {
		return re * re + im * im;
	};
	that.getAngle = function() {
		return Math.atan2(im, re);
	};
	that.isReal = function() {
		return im === 0.0;
	};
	that.isNaN = function() {
		return $mille.r.isNaN(re) || $mille.r.isNaN(im);
	};
	that.isZero = function() {
		return iszero();
	};
	that.isOne = function() {
		return re === 1.0 && im === 0.0;
	};
	that.add = function(x) {
		return $mille.c.make(re + x.getReal(), im + x.getImag());
	};
	that.subtract = function(x) {
		return $mille.c.make(re - x.getReal(), im - x.getImag());
	};
	that.multiply = function(x) {
		return $mille.c.make(
				re * x.getReal() - im * x.getImag(),
				re * x.getImag() + im * x.getReal());
	};
	that.divide = function(x) {
		var mg;
		if(x.isZero()) {
			return $mille.c.make(NaN, NaN);
		} else {
			mg = x.getMagnitude2();
			return $mille.c.make(
					(re * x.getReal() + im * x.getImag()) / mg,
					(im * x.getReal() - re * x.getImag()) / mg);
		}
	};
	that.equals = function(x) {
		return re === x.getReal() && im === x.getImag();
	};
	that.exp = function() {
		return $mille.c.make(
				Math.exp(re) * Math.cos(b),
				Math.exp(re) * Math.sin(b));
	};
	that.log = function() {
		var r, t;
		if(iszero()) {
			return $mille.c.make(-Infinity, -Math.PI / 2);
		} else {
			r = $mille.r.hypot(re, im);
			t = Math.atan2(im, re);
			return $mille.c.make(Math.log(r), t);
		}
	};
	that.sin = function() {
		var a, b;
		if(re === 0.0) {
			return $mille.c.make(0.0, $mille.r.sinh(im));
		} else {
			a = Math.sin(re) * $mille.r.cosh(im);
			b = Math.cos(re) * $mille.r.sinh(im);
			return $mille.c.make(a, b);
		}
	};
	that.cos = function() {
		var a, b;
		if(re === 0.0) {
			return $mille.c.make($mille.r.cosh(im), 0.0);
		} else {
			a = Math.cos(re) * $mille.r.cosh(im);
			b = -(Math.sin(re) * $mille.r.sinh(im));
			return $mille.c.make(a, b);
		}
	};
	that.tan = function() {
		var nm, dn;
		if(re === 0.0) {
			return $mille.c.make(0.0, $mille.r.tanh(im));
		} else if(im === Infinity) {
			nm = $mille.c.make(Math.tan(re), 1);
			dn = $mille.c.make(1, Math.tan(re));
			return nm.divide(dn);
		} else if(im === -Infinity) {
			nm = $mille.c.make(Math.tan(re), -1);
			dn = $mille.c.make(-1, -Math.tan(re));
			return nm.divide(dn);
		} else {
			return that.sin().div(that.cos());
		}
	};
	that.expt = function(z) {
		var r1, t1, rr, tr;
		if(iszero()) {
			return $mille.c.make(0, 0);
		} else if(z.isZero()) {
			return $mille.c.make(1, 0);
		} else if(that.isOne()) {
			return $mille.c.make(1, 0);
		} else if(z.isOne()) {
			return that;
		} else {
			r1 = $mille.r.hypot(re, im);
			t1 = Math.atan2(im, re);
			rr = z.getReal() * Math.log(r1) - t1 * z.getImag();
			tr = z.getImag() * Math.log(r1) + t1 * z.getReal();
			return $mille.c.make(
					Math.exp(rr) * Math.cos(tr),
					Math.exp(rr) * Math.sin(tr));
		}
	};
	that.sqrt = function() {
		if(re >= 0 && im === 0.0) {
			return $mille.c.make(Math.sqrt(re), 0,0);
		} else {
			return that.expt($mille.c.make(0.5, 0));
		}
	};
	that.asin = function() {
		var z1, z2, z3;
		if(im === 0.0 && re >= -1.0 && re <= 1.0) {
			return $mille.c.make(Math.asin(re), 0.0);
		} else if(re === Infinity) {
			if(y <= 0) {
				return $mille.c.make(Math.PI / 2, re);
			} else {
				return $mille.c.make(Math.PI / 2, -re);
			}
		} else if(re === -Infinity) {
			if(y <= 0) {
				return $mille.c.make(-Math.PI / 2, re);
			} else {
				return $mille.c.make(-Math.PI / 2, -re);
			}
		} else if(im === Infinity || im === -Infinity) {
			return $mille.c.make(0, im);
		} else {
			z1 = $mille.c.I.multiply(that);
			z2 = $mille.c.ONE.subtract(that.multiply(that)).sqrt();
			z3 = z1.add(z2).log();
			return $mille.c.make(z3.getImag(), -z3.getReal());
		}
	};
	that.acos = function() {
		if(im === 0.0 && x >= -1.0 && x <= 1.0) {
			return $mille.c.make(Math.acos(x), 0);
		} else {
			return $mille.c.HALFPI.subtract(that.asin());
		}
	};
	that.atan = function() {
		var z1, z2, z3;
		if(im === 0.0) {
			return $mille.c.make(Math.atan(re), 0.0);
		} else if(im === Infinity || im === -Infinity) {
			if(re === Infinity || re === -Infinity) {
				return $mille.c.NaN;
			} else if(im > 0) {
				return $mille.c.make(Math.PI / 2);
			} else {
				return $mille.c.make(-Math.PI / 2);
			}
		} else if(re === 0.0 && im === 1.0) {
			return $mille.c.make(0, Infinity);
		} else if(re === 0.0 && im === -1.0) {
			return $mille.c.make(0, -Infinity);
		} else {
			z1 = $mille.c.ONE.add($mille.c.I.multiply(that));
			z2 = $mille.c.ONE.subtract($mille.c.I.multiply(that));
			z3 = z1.log().subtract(z2.log());
			return z3.divide($mille.c.TWO_I);
		}
	};
	return that;
};
$mille.c.HALFPI = $mille.c.make(Math.PI / 2);
$mille.c.TWO_I = $mille.c.make(0, 2);
$mille.c.ZERO = $mille.c.make(0, 0);
$mille.c.ONE = $mille.c.make(1, 0);
$mille.c.I = $mille.c.make(0, 1);
$mille.c.NaN = $mille.c.make(NaN, NaN);
$mille.c.isComplex = function(o) {
	return $mille.datumTypeOf(o, 'complex');
};
$mille.c.toComplex = function(o) {
	if($mille.o.isNumber(o)) {
		return $mille.c.make(o, 0);
	} else {
		return o;
	}
};
$mille.c.equals = function(z, w) {
	if($mille.o.isComplex(z) && $mille.o.isComplex(w)) {
		return (z.getReal() == w.getReal() &&
				z.getImag() == w.getImag());
	} else {
		return z === w;
	}
};
$mille.c.isNaN = function(o) {
	if($mille.o.isNumber(o)) {
		return $mille.r.isNaN(o);
	} else if($mille.c.isComplex(o)) {
		return ($mille.r.isNaN(o.getReal()) ||
				$mille.r.isNaN(o.getImag()));
	} else {
		return false;
	}
};
$mille.c.isFinite = function(o) {
	if($mille.o.isNumber(o)) {
		return $mille.r.isFinite(o);
	} else if($mille.c.isComplex(o)) {
		return ($mille.r.isFinite(o.getReal()) &&
				$mille.r.isFinite(o.getImag()));
	} else {
		return false;
	}
};
$mille.c.isInfinite = function(o) {
	if($mille.o.isNumber(o)) {
		return $mille.r.isInfinite(o);
	} else if($mille.c.isComplex(o)) {
		return ($mille.r.isInfinite(o.getReal()) ||
				$mille.r.isInfinite(o.getImag()));
	} else {
		return false;
	}
};
$mille.c.getReal = function(z) {
	return $mille.o.isNumber(z) ? z : z.getReal();
};
$mille.c.getImag = function(z) {
	return $mille.o.isNumber(z) ? 0 : z.getImag();
};
$mille.c.magnitude = function(z) {
	return $mille.o.isNumber(z) ? Math.abs(z) : z.getMagnitude();
};
$mille.c.angle = function(z) {
	if(!$mille.o.isNumber(z)) {
		return z.getAngle();
	} else if(z >= 0) {
		return 0;
	} else {
		return Math.PI;
	}
};
$mille.c.add = function(z, w) {
	var o, p;
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return z + w;
	}
	o = $mille.c.toComplex(z);
	p = $mille.c.toComplex(w);
	return o.add(p);
};
$mille.c.subtract = function(z, w) {
	var o, p;
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return z - w;
	}
	o = $mille.c.toComplex(z);
	p = $mille.c.toComplex(w);
	return o.subtract(p);
};
$mille.c.multiply = function(z, w) {
	var o, p;
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return z * w;
	}
	o = $mille.c.toComplex(z);
	p = $mille.c.toComplex(w);
	return o.multiply(p);
};
$mille.c.divide = function(z, w) {
	var o, p;
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return z / w;
	}
	o = $mille.c.toComplex(z);
	p = $mille.c.toComplex(w);
	return o.divide(p);
};
$mille.c.equals = function(z, w) {
	var o, p;
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return z === w;
	}
	o = $mille.c.toComplex(z);
	p = $mille.c.toComplex(w);
	return o.equals(p);
};
$mille.c.notEquals = function(z, w) {
	return !$mille.c.equals(z, w);
};
$mille.c.exp = function(z) {
	if($mille.o.isNumber(z)) {
		return Math.exp(z);
	} else {
		return z.exp();
	}
};
$mille.c.log = function(z) {
	if($mille.o.isNumber(z) && z > 0) {
		return Math.log(z);
	} else {
		return z.log();
	}
};
$mille.c.sin = function(z) {
	if($mille.o.isNumber(z)) {
		return Math.sin(z);
	} else {
		return z.sin();
	}
};
$mille.c.cos = function(z) {
	if($mille.o.isNumber(z)) {
		return Math.sin(z);
	} else {
		return z.cos();
	}
};
$mille.c.tan = function(z) {
	if($mille.o.isNumber(z)) {
		return Math.tan(z);
	} else {
		return z.tan();
	}
};
$mille.c.expt = function(z, w) {
	if($mille.o.isNumber(z) && $mille.o.isNumber(w)) {
		return Math.pow(z, w);
	} else {
		return z.expt(w);
	}
};
$mille.c.sqrt = function(z) {
	if($mille.o.isNumber(z) && z >= 0.0) {
		return Math.sqrt(z);
	} else {
		return z.sqrt();
	}
};
$mille.c.asin = function(z) {
	if($mille.o.isNumber(z) && z >= -1.0 && z <= 1.0) {
		return Math.asin(z);
	} else {
		return z.asin();
	}
};
$mille.c.acos = function(z) {
	if($mille.o.isNumber(z) && z >= -1.0 && z <= 1.0) {
		return Math.acos(z);
	} else {
		return z.acos();
	}
};
$mille.c.atan = function(z) {
	if($mille.o.isNumber(z)) {
		return Math.atan(z);
	} else {
		return z.atan();
	}
};

function Datum(typ) {
	this.typ = function() {
		return typ;
	};
};
Datum.prototype.toString = function() {
	var f;
	f = this[this.typ() + 'ToString'];
	if(f === undefined) {
		return '#<' + this.typ() + '>';
	} else {
		return f.call(this);
	}
};
Datum.prototype.symbolToString = function() {
	return this.name;
};
Datum.prototype.complexToString = function() {
	if(this.getImag() > 0) {
		return this.getReal() + '+' + this.getImag() + 'i';
	} else if(this.getImag() < 0) {
		return this.getReal() + '' + this.getImag() + 'i';
	} else {
		return this.getReal() + '';
	}
};

$mille.datumTypeOf = function(o, typ) {
	return ((o instanceof Datum) && o.typ() === typ);
};

$mille.createMemo = function() {
	return {
		index: [],
		value: []
	};
};
$mille.searchMemo = function(memo, o) {
	var i;
	for(i = 0; i < memo.index.length; i++) {
		if(memo.index[i] === o) {
			return memo.value[i];
		}
	}
	return undefined;
};
$mille.setMemo = function(memo, o, v) {
	var i;
	for(i = 0; i < memo.index.length; i++) {
		if(memo.index[i] === o) {
			memo.value[i] = v;
		}
	}
	memo.index.push(o);
	memo.value.push(v);
};
$mille.walkPair = function(that, memo, count) {
	var c, v = $mille.searchMemo(memo, that);
	if(v === -1) {
		$mille.setMemo(memo, that, count);
		return count + 1;
	} else if(v > 0) {
		return count;
	} else if($mille.isPair(that)) {
		$mille.setMemo(memo, that, -1);
		c = $mille.walkPair(that.car, memo, count);
		c = $mille.walkPair(that.cdr, memo, c);
		return c;
	} else {
		return count;
	}
};
$mille.cellToString = function(that, memo, memoout) {
	var o = that, ret, i, v;
	if($mille.isAtom(o)) {
		return o.toString();
	} else if($mille.isNull(o)) {
		return '()';
	} else {
		v = $mille.searchMemo(memo, o);
		if(v === undefined || v === -1) {
			ret = '(';
		} else if($mille.searchMemo(memoout, o)) {
			return '#' + v + '#';
		} else {
			$mille.setMemo(memoout, o, true);
			ret = '#' + v + '=(';
		}

		for(i = 0; true; i++) {
			if($mille.isAtom(o)) {
				if(i > 0) {
					ret += ' ';
				}
				ret += '. ' + o.toString() + ')';
				return ret;
			} else if($mille.isNull(o)) {
				ret += ')';
				return ret;
			} else {
				if(i > 0) {
					ret += ' ';
				}
				ret += $mille.cellToString(o.car, memo, memoout);
				o = o.cdr;
				if($mille.searchMemo(memoout, o)) {
					ret += ' . #' + $mille.searchMemo(memo, o) + '#)';
					return ret;
				}
			}
		}
	}
};
Datum.prototype.cellToString = function() {
	var memo = $mille.createMemo(), memoout = $mille.createMemo();
	$mille.walkPair(this, memo, 1);
	return $mille.cellToString(this, memo, memoout);
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
$mille.shallowCellToList = function(l, notproper) {
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
			a.push(l.car);
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
		if(vars['$' + v] !== undefined) {
			return vars['$' + v];
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
		vars['$' + v] = o;
	};
	diese.set = function(v, o) {
		if(vars['$' + v] !== undefined) {
			vars['$' + v] = o;
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
			return x.apply(null, a);
		} else {
			$mille.o.error('Found no functions');
		}
	};
	diese.call = function(v) {
		return diese.apply(v, $mille.a.toArray(arguments, 1));
	};
	diese.closure = function(f) {
		return $mille.closure(e, that, f);
	};
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
	if(!$mille.isComplex(x)) {
		$mille.o.error('the type of the object is not number:' + x);
	}
};
$mille.checkReal = function(x) {
	if(!$mille.o.isNumber(x)) {
		$mille.o.error('the type of the object is not real number:' + x);
	}
};
$mille.checkNonnegativeReal = function(x) {
	if(!$mille.o.isNumber(x) || x < 0) {
		$mille.o.error('the type of the object is not non-negative real number:' + x);
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
$mille.checkObject = function(x) {
	if(!$mille.o.isObject(x)) {
		$mille.o.error('the type of the object is not object:' + x);
	}
};
$mille.checkSymbol = function(x) {
	if(!$mille.datumTypeOf(x, 'symbol')) {
		$mille.o.error('the type of the object is not symbol:' + x);
	}
};
$mille.checkCharacter = function(x) {
	if(!$mille.o.isInteger(x) || x < 0 || x > 65535) {
		$mille.o.error('the type of the object is not character:' + x);
	}
};
$mille.checkFunction = function(x) {
	if(!$mille.o.isFunction(x)) {
		$mille.o.error('the type of the object is not function:' + x);
	}
};
$mille.checkPromise = function(x) {
	if(!$mille.datumTypeOf(x, 'promise')) {
		$mille.o.error('the type of the object is not promise:' + x);
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
	return $mille.compare(f, $mille.checkReal);
};
$mille.eq = $mille.compare(function(x, y) { return x === y; });
$mille.eqv = $mille.compare(function(x, y) {
	if($mille.c.isComplex(x) && $mille.c.isComplex(y)) {
		return $mille.c.equals(x, y);
	} else {
		return x === y;
	}
});
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
$mille.isString = function(x) {
	return $mille.o.isString(x);
};
$mille.makeString = function(k, ch) {
	var c, i, ret = '';
	$mille.checkNaturalNumber(k, 0);
	if(ch !== undefined) {
		$mille.checkCharacter(ch);
	}
	c = String.fromCharCode(ch === undefined ? 32 : ch);
	for(i = 0; i < k; i++) {
		ret += c;
	}
	return ret;
};
$mille.string = function() {
	var i, ret = '';
	for(i = 0; i < arguments.length; i++) {
		$mille.checkCharacter(arguments[i]);
		ret += String.fromCharCode(arguments[i]);
	}
	return ret;
};
$mille.compareString = function(f) {
	return $mille.compare(f, $mille.checkString);
};
$mille.compareStringCi = function(f) {
	return $mille.compare(function(x, y) {
		var a = x.toUpperCase();
		var b = y.toUpperCase();
		return f(a, b);
	}, $mille.checkString);
};
$mille.stringToList = function(s) {
	var i, v, c, p, ret = undefined;
	$mille.checkString(s);
	for(i = 0; i < s.length; i++) {
		v = s.charCodeAt(i);
		c = $mille.cons(v, $mille.nil);
		if(ret === undefined) {
			ret = c;
		} else {
			p.cdr = c;
		}
		p = c;
	}
	return ret;
};
$mille.listToString = function(ls) {
	var i, v, ret = '';
	$mille.checkList(ls);
	v = $mille.cellToList(ls);
	for(i = 0; i < v.length; i++) {
		$mille.checkCharacter(v[i]);
		ret += String.fromCharCode(v[i]);
	}
	return ret;
};

$mille.symbols = {};
$mille.getSymbol = function(s) {
	var v;
	v = $mille.symbols[s];
	if(v === undefined) {
		v = new Datum('symbol');
		v.name = s;
		$mille.symbols[s] = v;
	}
	return v;
};
$mille.isSymbol = function(o) {
	return $mille.datumTypeOf(o, 'symbol');
};
$mille.stringToSymbol = function(x) {
	$mille.checkString(x);
	return $mille.getSymbol(x);
};
$mille.symbolToString = function(x) {
	$mille.checkSymbol(x);
	return x.name;
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
	return $mille.isComplex(x);
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
	$mille.checkReal(x);
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
$mille.gcd = function() {
	var a, i;
	if(arguments.length === 0) {
		return 0;
	} else {
		$mille.checkNumber(arguments[0]);
		a = arguments[0];
		for(i = 1; i < arguments.length; i++) {
			$mille.checkNumber(arguments[i]);
			a = $mille.r.gcd(a, arguments[i]);
		}
		return a;
	}
};
$mille.lcm = function() {
	var g, r = 1, i;
	g = $mille.gcd.apply(null, arguments);
	for(i = 0; i < arguments.length; i++) {
		r *= Math.abs(arguments[i]) / g;
	}
	return r * g;
};
$mille.floor = function(x) {
	$mille.checkReal(x);
	return Math.floor(x);
};
$mille.ceiling = function(x) {
	$mille.checkReal(x);
	return Math.ceil(x);
};
$mille.truncate = function(x) {
	$mille.checkReal(x);
	return x > 0 ? Math.floor(x) : Math.ceil(x);
};
$mille.round = function(x) {
	$mille.checkReal(x);
	return Math.round(x);
};

$mille.isObject = function(o) {
	return $mille.o.isObject(o);
};
$mille.objectRef = function(o, i) {
	$mille.checkObject(o);
	return o[i];
};
$mille.objectSet = function(o, i, x) {
	$mille.checkObject(o);
	o[i] = x;
	return undefined;
};
$mille.objectKeys = function(o) {
	$mille.checkObject(o);
	return $mille.listToCell($mille.o.keys(o));
};
$mille.objectValues = function(o) {
	$mille.checkObject(o);
	return $mille.listToCell($mille.o.values(o));
};
$mille.objectToList = function(o) {
	var a, i;
	if($mille.a.isArray(o)) {
		a = [];
		for(i = 0; i < o.length; i++) {
			a[i] = $mille.objectToList(o[i]);
		}
		return $mille.listToCell(a);
	} else if($mille.o.isObject(o)) {
		a = $mille.o.entries(o);
		for(i = 0; i < a.length; i++) {
			a[i] = $mille.cons(
					$mille.objectToList(a[i].key),
					$mille.objectToList(a[i].value));
		}
		return $mille.listToCell(a);
	} else {
		return o;
	}
};

$mille.isEqual = function(o, p) {
	var i, v = null;
	if($mille.isPair(o)) {
		if($mille.isPair(p)) {
			return ($mille.isEqual(o.car, p.car) &&
					$mille.isEqual(o.cdr, p.cdr));
		} else {
			return false;
		}
	} else if($mille.isNull(o)) {
		return $mille.isNull(p);
	} else if($mille.a.isArray(o)) {
		if(!$mille.a.isArray(p)) {
			return false;
		} else if(o.length !== p.length) {
			return false;
		} else {
			for(i = 0; i < o.length; i++) {
				if(!$mille.isEqual(o[i], p[i])) {
					return false;
				}
			}
			return true;
		}
	} else if($mille.o.isObject(o)) {
		for(v in o) {
			if(!o.hasOwnProperty(v)) {
				// do nothing
			} else if(!p.hasOwnProperty(v)) {
				return false;
			} else if(!$mille.isEqual(o[v], p[v])) {
				return false;
			}
		}
		return true;
	} else {
		return o === p;
	}
};

$mille.isChar = function(o) {
	return $mille.o.isInteger(o) && o >= 0 && o < 65536;
};
$mille.charUpcase = function(c) {
	var x;
	$mille.checkCharacter(c);
	x = String.fromCharCode(c);
	x = x.toUpperCase();
	return x.charCodeAt(0);
};
$mille.charDowncase = function(c) {
	var x;
	$mille.checkCharacter(c);
	x = String.fromCharCode(c);
	x = x.toUpperCase();
	return x.charCodeAt(0);
};
$mille.compareCharacter = function(f) {
	return $mille.compare(f, $mille.checkCharacter);
};
$mille.compareCharacterCi = function(f) {
	return $mille.compare(function(x, y) {
		var a = $mille.charUpcase(x);
		var b = $mille.charUpcase(y);
		return f(a, b);
	}, $mille.checkCharacter);
};
$mille.charToInteger = function(o) {
	$mille.checkCharacter(o);
	return o;
};
$mille.integerToChar = function(o) {
	$mille.charToInteger(o);
	if(o < 0 || o > 65535) {
		$mille.o.error('character out of range:' + o);
	}
	return o;
};
$mille.isCharLowerCase = function(o) {
	$mille.checkCharacter(o);
	return $mille.charUpcase(o) !== o;
};
$mille.isCharUpperCase = function(o) {
	$mille.checkCharacter(o);
	return $mille.charDowncase(o) !== o;
};
$mille.isCharAlphabetic = function(o) {
	return $mille.isCharLowerCase(o) || $mille.isCharUpperCase(o);
};
$mille.regexmatch = function(r, o) {
	var x;
	$mille.checkCharacter(o);
	x = String.fromCharCode(o);
	return r.test(x);
};
$mille.regexWhitespace = /^[\u0009-\u000d\u001c-\u0020\u1680\u180e\u2000-\u2006\u2008-\u200b\u2028-\u2029\u205f\u3000]$/;
$mille.isCharWhitespace = function(o) {
	return $mille.regexmatch($mille.regexWhitespace, o);
};
$mille.regexNumeric = /^[\u0030-\u0039\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0b66-\u0b6f\u0be7-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f\u0e50-\u0e59\u0ed0-\u0ed9\u0f20-\u0f29\u1040-\u1049\u1369-\u1371\u17e0-\u17e9\u1810-\u1819\u1946-\u194f\uff10-\uff19]$/;
$mille.isCharNumeric = function(o) {
	return $mille.regexmatch($mille.regexNumeric, o);
};

$mille.isComplexOnly = function(o) {
	return $mille.c.isComplex(o);
};
$mille.isComplex = function(o) {
	return $mille.o.isNumber(o) || $mille.isComplexOnly(o);
};
$mille.isZero = function(o) {
	$mille.checkNumber(o);
	return o === 0.0;
};
$mille.isPositive = function(o) {
	$mille.checkNumber(o);
	return $mille.o.isNumber(o) && o > 0;
};
$mille.isNegative = function(o) {
	$mille.checkNumber(o);
	return $mille.o.isNumber(o) && o < 0;
};
$mille.isOdd = function(o) {
	$mille.checkNumber(o);
	return $mille.o.isInteger(o) && o % 2 == 1;
};
$mille.isEven = function(o) {
	$mille.checkNumber(o);
	return $mille.o.isInteger(o) && o % 2 == 0;
};
$mille.max = function() {
	var i, v, r = -Infinity;
	for(i = 0; i < arguments.length; i++) {
		v = arguments[i];
		$mille.checkReal(v);
		if(v > r) {
			r = v;
		}
	}
	return r;
};
$mille.min = function() {
	var i, v, r = Infinity;
	for(i = 0; i < arguments.length; i++) {
		v = arguments[i];
		$mille.checkReal(v);
		if(v < r) {
			r = v;
		}
	}
	return r;
};
$mille.exp = function(z) {
	$mille.checkNumber(z);
	return $mille.c.exp(z);
};
$mille.log = function(z) {
	$mille.checkNumber(z);
	return $mille.c.log(z);
};
$mille.sin = function(z) {
	$mille.checkNumber(z);
	return $mille.c.sin(z);
};
$mille.cos = function(z) {
	$mille.checkNumber(z);
	return $mille.c.cos(z);
};
$mille.tan = function(z) {
	$mille.checkNumber(z);
	return $mille.c.tan(z);
};
$mille.asin = function(z) {
	$mille.checkNumber(z);
	return $mille.c.asin(z);
};
$mille.acos = function(z) {
	$mille.checkNumber(z);
	return $mille.c.acos(z);
};
$mille.atan = function(z, y) {
	if(y === undefined) {
		$mille.checkNumber(z);
		return $mille.c.atan(z);
	} else {
		$mille.checkReal(z);
		$mille.checkReal(y);
		return Math.atan2(z, y);
	}
};
$mille.makeRectangular = function(x, y) {
	$mille.checkReal(x);
	$mille.checkReal(y);
	$mille.c.make(x, y);
};
$mille.makePolar = function(r, t) {
	$mille.checkNonnegativeReal(x);
	$mille.checkReal(y);
	$mille.c.make(r * Math.cos(t), r * Math.sin(t));
};
$mille.realPart = function(z) {
	$mille.checkNumber(z);
	return $mille.c.getReal(z);
};
$mille.imagPart = function(z) {
	$mille.checkNumber(z);
	return $mille.c.getImag(z);
};
$mille.magnitude = function(z) {
	$mille.checkNumber(z);
	return $mille.c.magnitude(z);
};
$mille.angle = function(z) {
	$mille.checkNumber(z);
	return $mille.c.angle(z);
};

$mille.values = function() {
	var i, a;
	if(arguments.length === 0) {
		throw $mille.o.error('multivalue must have one datum');
	} else if(arguments.length === 1) {
		return arguments[0];
	} else {
		a = new Datum('multivalue');
		for(i = 0; i < arguments.length; i++) {
			a[i] = arguments[i];
			a['value' + i] = arguments[i];
		}
		a.length = arguments.length;
		return a;
	}
};
$mille.isMultivalue = function(o) {
	return $mille.datumTypeOf(o, 'multivalue');
};
$mille.callWithValues = function(producer, consumer) {
	var p, a;
	$mille.checkFunction(producer);
	$mille.checkFunction(consumer);
	p = producer.call(null);
	if($mille.isMultivalue(p)) {
		a = $mille.a.toArray(p);
		return consumer.apply(null, a);
	} else {
		return consumer.call(null, p);
	}
};
Datum.prototype.multivalueToString = function() {
	var i, b = '';
	for(i = 0; i < this.length; i++) {
		if(b !== '') {
			b += '\n';
		}
		b += this[i];
	}
	return b;
};

$mille.delay = function(f) {
	var p;
	p = new Datum('promise');
	p.memorized = false;
	p.value = f;
	return p;
};
$mille.force = function(p) {
	$mille.checkPromise(p);
	if(!p.memorized) {
		p.value = p.value();
		p.memorized = true;
	}
	return p.value;
};

$mille.isProcedure = function(o) {
	return $mille.o.isFunction(o);
};
$mille.isTruthy = function(o) {
	return !!o;
};
$mille.isFalsy = function(o) {
	return !o;
};
$mille.isNan = function(o) {
	return $mille.c.isNaN(o);
};
$mille.isFinite = function(o) {
	return $mille.c.isFinite(o);
};
$mille.isInfinite = function(o) {
	return $mille.c.isInfinite(o);
};
$mille.isUndefined = function(o) {
	return o === undefined;
};
$mille.isJsnull = function(o) {
	return o === null;
};

$mille.readString = function(s) {
	var o, p = 0;
	$mille.checkString(s);
	o = new SExpression();
	o.parse(function () {
		if(p < s.length) {
			return s.charCodeAt(p++);
		} else if(p === s.length) {
			p++;
			return 1;
		} else {
			return null;
		}
	});
	return o._;
};
$mille.readStringAll = function(s) {
	var o, p = 0, r = [];
	$mille.checkString(s);
	while(p <= s.length) {
		o = new SExpression();
		o.parse(function () {
			if(p < s.length) {
				return s.charCodeAt(p++);
			} else if(p === s.length) {
				p++;
				return 1;
			} else {
				return null;
			}
		});
		r.push(o._);
		p = p > s.length ? p : p - 1;
	}
	return r;
};
$mille.evalbas = function($env, x) {
	var ls, lt, doLambda, r, i;
	doLambda = function(lx) {
		var p, s;
		p = lx[1];
		s = [];
		while(true) {
			if($mille.isNull(p)) {
				p = null;
				break;
			} else if($mille.isSymbol(p)) {
				break;
			} else if($mille.isAtom(p)) {
				$mille.o.error(p + " must be a symbol");
			} else if($mille.isSymbol(p.car)) {
				s.push(p.car);
				p = p.cdr;
			} else {
				$mille.o.error(p.car + " must be a symbol");
			}
		}
		return $env.closure(function(e) {
			var r, i;
			for(i = 0; i < s.length; i++) {
				e.bind(s[i].toString(), arguments[i + 1]);
			}
			if(p !== null) {
				e.bind(p.toString(), $mille.listToCell(
						$mille.a.toArray(arguments, i + 1)));
			}
			for(i = 2; i < lx.length; i++) {
				r = $mille.evalbas(e, lx[i]);
			}
			return r;
		});
	};
	if($mille.isPair(x)) {
		ls = $mille.shallowCellToList(x);
		if(ls[0] === $mille.getSymbol('if')) {
			if(ls.length === 3) {
				return $mille.evalbas($env, ls[1]) ?
						$mille.evalbas($env, ls[2]) : undefined;
			} else if(ls.length === 4) {
				return $mille.evalbas($env, ls[1]) ?
						$mille.evalbas($env, ls[2]) :
							$mille.evalbas($env, ls[3]);
			} else {
				$mille.o.error('malformed if');
			}
		} else if(ls[0] === $mille.getSymbol('lambda')) {
			return doLambda(ls);
		} else if(ls[0] === $mille.getSymbol('quote')) {
			if(ls.length === 2) {
				return ls[1];
			} else {
				$mille.o.error('malformed quote');
			}
		} else if(ls[0] === $mille.getSymbol('begin')) {
			for(i = 1; i < ls.length; i++) {
				r = $mille.evalbas($env, ls[i]);
			}
			return r;
		} else if(ls[0] === $mille.getSymbol('define')) {
			if(ls.length !== 3) {
				$mille.o.error('malformed define');
			} else if(!$mille.isSymbol(ls[1])) {
				$mille.o.error(ls[1] + ' must be a symbol');
			} else {
				$env.bind(ls[1].toString(), ls[2]);
				return undefined;
			}
		} else if(ls[0] === $mille.getSymbol('set!')) {
			if(ls.length !== 3) {
				$mille.o.error('malformed set!');
			} else if(!$mille.isSymbol(ls[1])) {
				$mille.o.error(ls[1] + ' must be a symbol');
			} else {
				$env.set(ls[1].toString(), ls[2]);
				return undefined;
			}
		} else if(ls[0] === $mille.getSymbol('delay')) {
			if(ls.length === 2) {
				return $mille.delay(function() {
					return $mille.evalbas($env, ls[1]);
				});
			} else {
				$mille.o.error('malformed delay');
			}
		} else {
			r = ls[0];
			if($mille.isSymbol(r) &&
					r.length > 1 && r.charAt(0) == '.') {
				lt = [r.substring(1, r.length)];
				for(i = 1; i < ls.length; i++) {
					lt.push($mille.evalbas($env, ls[i]));
				}
				return $mille.applyObject.apply(null, lt);
			} else {
				r = $mille.evalbas($env, r);
				if($mille.o.isFunction(r)) {
					lt = [];
					for(i = 1; i < ls.length; i++) {
						lt.push($mille.evalbas($env, ls[i]));
					}
					return r.apply(null, lt);
				} else {
					$mille.o.error(r + ' must be a function');
				}
			}
		}
	} else {
		if($mille.isSymbol(x)) {
			return $env.find(x.toString());
		} else {
			return x;
		}
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
$mille.bindg('eqv?', $mille.eqv);
$mille.bindg('car', $mille.car);
$mille.bindg('cdr', $mille.cdr);
$mille.bindg('atom?', $mille.isAtom);
$mille.bindg('null?', $mille.isNull);
$mille.bindg('symbol?', $mille.isSymbol);
$mille.bindg('error', $mille.o.error);
$mille.bindg('set-car!', $mille.setCar);
$mille.bindg('set-cdr!', $mille.setCdr);
$mille.bindg('apply', $mille.applyCell);
$mille.bindg('1+', $mille.unary(function(x) { return x + 1; }));
$mille.bindg('1-', $mille.unary(function(x) { return x - 1; }));
$mille.bindg('>', $mille.compareNumber(function(x, y) { return x > y; }));
$mille.bindg('<', $mille.compareNumber(function(x, y) { return x < y; }));
$mille.bindg('=', $mille.compare($mille.c.equals, $mille.checkNumber));
$mille.bindg('+', $mille.arith1($mille.c.add, 0));
$mille.bindg('-', $mille.arith2($mille.c.subtract,
		function(x) { return $mille.c.subtract(0, x); }));
$mille.bindg('*', $mille.arith1($mille.c.multiply, 1));
$mille.bindg('/', $mille.arith2($mille.c.divide,
		function(x) { return $mille.c.divide(1, x); }));
$mille.bindg('string?', $mille.o.isString);
$mille.bindg('substring', $mille.substring);
$mille.bindg('string-ref', $mille.stringRef);
$mille.bindg('string-length', $mille.stringLength);
$mille.bindg('string-append', $mille.stringAppend);
$mille.bindg('string?', $mille.isString);
$mille.bindg('make-string', $mille.makeString);
$mille.bindg('string', $mille.string);
$mille.bindg('string>?', $mille.compareString(function(x, y) { return x > y; }));
$mille.bindg('string<?', $mille.compareString(function(x, y) { return x < y; }));
$mille.bindg('string=?', $mille.compareString(function(x, y) { return x === y; }));
$mille.bindg('string>=?', $mille.compareString(function(x, y) { return x >= y; }));
$mille.bindg('string<=?', $mille.compareString(function(x, y) { return x <= y; }));
$mille.bindg('string-ci>?', $mille.compareStringCi(function(x, y) { return x > y; }));
$mille.bindg('string-ci<?', $mille.compareStringCi(function(x, y) { return x < y; }));
$mille.bindg('string-ci=?', $mille.compareStringCi(function(x, y) { return x === y; }));
$mille.bindg('string-ci>=?', $mille.compareStringCi(function(x, y) { return x >= y; }));
$mille.bindg('string-ci<=?', $mille.compareStringCi(function(x, y) { return x <= y; }));
$mille.bindg('string->list', $mille.stringToList);
$mille.bindg('list->string', $mille.listToString);
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

$mille.bindg('>=', $mille.compareNumber(function(x, y) { return x >= y; }));
$mille.bindg('<=', $mille.compareNumber(function(x, y) { return x <= y; }));
$mille.bindg('number?', $mille.isNumber);
$mille.bindg('real?', $mille.isReal);
$mille.bindg('integer?', $mille.isInteger);
$mille.bindg('exact?', $mille.isExact);
$mille.bindg('inexact?', $mille.isInexact);
$mille.bindg('abs', $mille.abs);
$mille.bindg('remainder', $mille.remainder);
$mille.bindg('quotient', $mille.quotient);
$mille.bindg('modulo', $mille.modulo);
$mille.bindg('gcd', $mille.gcd);
$mille.bindg('lcm', $mille.lcm);
$mille.bindg('floor', $mille.floor);
$mille.bindg('ceiling', $mille.ceiling);
$mille.bindg('truncate', $mille.truncate);
$mille.bindg('round', $mille.round);

$mille.bindg('object?', $mille.isObject);
$mille.bindg('object-ref', $mille.objectRef);
$mille.bindg('object-set!', $mille.objectSet);
$mille.bindg('object-keys', $mille.objectKeys);
$mille.bindg('object-values', $mille.objectValues);
$mille.bindg('object->list', $mille.objectToList);

$mille.bindg('char?', $mille.isChar);
$mille.bindg('char>?', $mille.compareCharacter(function(x, y) { return x > y; }));
$mille.bindg('char<?', $mille.compareCharacter(function(x, y) { return x < y; }));
$mille.bindg('char=?', $mille.compareCharacter(function(x, y) { return x === y; }));
$mille.bindg('char>=?', $mille.compareCharacter(function(x, y) { return x >= y; }));
$mille.bindg('char<=?', $mille.compareCharacter(function(x, y) { return x <= y; }));
$mille.bindg('char-ci>?', $mille.compareCharacterCi(function(x, y) { return x > y; }));
$mille.bindg('char-ci<?', $mille.compareCharacterCi(function(x, y) { return x < y; }));
$mille.bindg('char-ci=?', $mille.compareCharacterCi(function(x, y) { return x === y; }));
$mille.bindg('char-ci>=?', $mille.compareCharacterCi(function(x, y) { return x >= y; }));
$mille.bindg('char-ci<=?', $mille.compareCharacterCi(function(x, y) { return x <= y; }));
$mille.bindg('char-alphabetic?', $mille.isCharAlphabetic);
$mille.bindg('char-whitespace?', $mille.isCharWhitespace);
$mille.bindg('char-numeric?', $mille.isCharNumeric);
$mille.bindg('char-upper-case?', $mille.isCharUpperCase);
$mille.bindg('char-lower-case?', $mille.isCharLowerCase);
$mille.bindg('char->integer', $mille.charToInteger);
$mille.bindg('integer->char', $mille.integerToChar);
$mille.bindg('char-upcase', $mille.charUpcase);
$mille.bindg('char-downcase', $mille.charDowncase);

$mille.bindg('complex?', $mille.isComplex);
$mille.bindg('zero?', $mille.isZero);
$mille.bindg('positive?', $mille.isPositive);
$mille.bindg('negative?', $mille.isNegative);
$mille.bindg('odd?', $mille.isOdd);
$mille.bindg('even?', $mille.isEven);
$mille.bindg('max', $mille.max);
$mille.bindg('min', $mille.min);
$mille.bindg('exp', $mille.exp);
$mille.bindg('log', $mille.log);
$mille.bindg('sin', $mille.sin);
$mille.bindg('cos', $mille.cos);
$mille.bindg('tan', $mille.tan);
$mille.bindg('asin', $mille.asin);
$mille.bindg('acos', $mille.acos);
$mille.bindg('atan', $mille.atan);
$mille.bindg('make-rectangular', $mille.makeRectangular);
$mille.bindg('make-polar', $mille.makePolar);
$mille.bindg('real-part', $mille.realPart);
$mille.bindg('imag-part', $mille.imagPart);
$mille.bindg('magnitude', $mille.magnitude);
$mille.bindg('angle', $mille.angle);

$mille.bindg('values', $mille.values);
$mille.bindg('call-with-values', $mille.callWithValues);

$mille.bindg('force', $mille.force);
$mille.bindg('procedure?', $mille.isProcedure);
$mille.bindg('truthy?', $mille.isTruthy);
$mille.bindg('falsy?', $mille.isFalsy);
$mille.bindg('nan?', $mille.isNan);
$mille.bindg('finite?', $mille.isFinite);
$mille.bindg('infinite?', $mille.isInfinite);
$mille.bindg('undefined?', $mille.isUndefined);
$mille.bindg('jsnull?', $mille.isJsnull);
$mille.bindg('equal?', $mille.isEqual);

$mille.bindg('read-string', $mille.readString);
$mille.bindg('read-string-all', $mille.readStringAll);
$env = $mille.genv;
/*
 * Translated by Nina
 * This source code is under public domain
 */
/*
 * morilib Nina Version: 0.4.13.498
 *
 * Nina homepage:      http://nina.morilib.net/
 * Plugin update site: http://nina.morilib.net/update-site/
 */
/**
 */
/* @@@-PARSER-CODE-START-@@@ */
function SExpression() {
	this.__state = 0;
	this.__sts = [];
	this.__stk = [];
	this.__stv = [];
	this.__slen = 0;
	this._ = null;
	this._l = null;
	this._initlist = function() {
		this._l = [];
	};
	this._addlist = function(o) {
		this._l.push(o);
	};

	this.unread = null;
	this.yieldObject = null;
	this.befstream = null;
	this.exception = null;

	this.$buffer = null;
	this.$int = null;
	this.$num = null;

	this.__lookahead_state = 0;
	this.__lookahead_mark = -1;
	this.__lookahead = null;
	this.__lookahead_ptr = -1;
	this.__lookaheadw = null;
	this.__lookaheadw_ptr = -1;
	this.__lookahead_ok = true;
	this.ENGINE_exp = SExpression.ENGINE_exp;
	this.ENGINE_sExpression = SExpression.ENGINE_sExpression;
	this.ENGINE_value = SExpression.ENGINE_value;
	this._unreadl = null;
}

function SExpression_TokenException() {
}
SExpression.prototype._read1l = function(rd) {
	return rd();
}
	
SExpression.prototype._read1 = function(stream) {
	var c;

	if(this._unreadl != null) {
		c = this._unreadl;
		this._unreadl = null;
	} else if((c = this._read1l(stream)) == 13 && (c = this._read1l(stream)) != 10) {
		this._unreadl = c;
		c = 13;
	}
	return c;
}

SExpression.__SKIP__ = {};
SExpression.__DUM__  = {};

SExpression.prototype._read = function(rd) {
	var c;

	while(true) {
		if(false) {
		} else if(this.unread != null) {
			c = this.unread;
			this.unread = null;
			this.__logprint("Read unread: ", c);
		} else if(this.__lookahead_ptr >= 0) {
			if(this.__lookahead_ptr < this.__lookahead.length) {
				c = this.__lookahead[this.__lookahead_ptr++];
			} else {
				this.__lookahead = null;
				this.__lookahead_ptr = -1;
				c = this._read(rd);
			}
			this.__logprint("Read Lookahead: ", c);
		} else if((c = this._read1(rd)) != null) {
			this.__logprint("Read: ", c);
		} else {
			this.__logprint("Read end-of-file");
		}
		return c;
	}
}

SExpression.prototype._f_UNGET = function(c) {
	this.unread = c;
	this.__logprint("Set unread: ", c);
}

SExpression.prototype.__logprint = function(s, c) {
}

SExpression.prototype.__logopen = function() {
}

SExpression.prototype.__logclose = function() {
}

SExpression.prototype.__puttrace = function() {
}

SExpression.prototype._f_LOOKAHEAD = function(c) {
	if(this.__lookaheadw == null) {
		this.__lookahead_state = this.__state;
		this.__lookaheadw = [];
		this.__lookaheadw_ptr = 0;
		this.__lookaheadw[this.__lookaheadw_ptr++] = c;
	} else {
		this.__lookaheadw[this.__lookaheadw_ptr++] = c;
	}
}

SExpression.prototype.__copy_lookahead = function(p) {
	var a, k;

	if(this.__lookahead_ptr > 0) {
		a = [];
		for(k = 0; k < a.length; k++) {
			a[k] = this.__lookaheadw[k + this.__lookahead_ptr];
		}
		__lookahead = a;
	}

	if(this.__lookahead == null) {
		a = [];
	} else if(this.__lookaheadw_ptr < this.__lookahead.length - this.__lookahead_ptr) {
		a = this.__lookahead;
	} else {
		a = [];
	}

	for(k = 0; k < this.__lookaheadw_ptr; k++) {
		a[k] = this.__lookaheadw[k];
	}
	this.__lookahead = a;
	this.__lookahead_ptr = p;
	this.__lookaheadw = null;
	this.__lookaheadw_ptr = -1;
}

SExpression.prototype._f_LOOKAHEAD_COMMIT = function() {
	if(this.__lookahead_mark < 0) {
		this.__lookaheadw = null;
		this.__lookaheadw_ptr = -1;
	} else {
		this.__copy_lookahead(this.__lookahead_mark);
	}
	this.__lookahead_mark = -1;
	this.__logprint("Commit Lookahead");
}

SExpression.prototype._f_LOOKAHEAD_RB = function() {
	this.__copy_lookahead(0);
	this.__state = this.__lookahead_state;
	this.__lookahead_ok = false;
	this.__lookahead_mark = -1;
	this.__logprint("Rollback Lookahead");
}

SExpression.prototype._f_LOOKAHEAD_MARK = function() {
	this.__lookahead_mark = this.__lookaheadw_ptr;
}

SExpression.prototype._f_LOOKAHEAD_MARK_INIT = function() {
	this.__lookahead_mark = 0;
}


SExpression.ENGINE_exp = {};

SExpression.ENGINE_exp.step = function($this, __rd,  $c)  {
	var __l__ = $this.__lookahead_ok;

	$this.__lookahead_ok = true;
	switch($this.__state) {
	case 0:
		if($c !== null && ((__l__ && $c === 35))) {
				$this._f_LOOKAHEAD($c);
			$this.__state = 1;
			return 1;
			} else if($c !== null && (($c === 39))) {
			$this.__state = 2;
			return 1;
			} else if($c !== null && (($c === 1))) {
			$this.__state = 3;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 0;
			return 1;
			} else if($c !== null && (($c === 40))) {
				$this.initc();
			$this.__state = 4;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(5, $this.ENGINE_value);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 5:
		return 0;
	case 4:
		if($c !== null && (($c === 41))) {
			$this.__state = 6;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 4;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(7, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 7:
		if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 8;
			return 1;
		} else if($c === null) {
			$this.__state = 4;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 4;
			return 1;
		}
		return 0;
	case 8:
		if($c !== null && ((__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 9;
			return 1;
		}
		return 0;
	case 9:
		if($c !== null && ((__l__ && $c >= 0 && $c <= 2147483647))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 10;
			return 1;
		} else if($c === null) {
			$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 10;
			return 1;
		}
		return 0;
	case 10:
		if($c !== null && (($c === 46))) {
				$this._f_UNGET($c);$this.$buffer = '';
			$this.__state = 11;
			return 1;
		}
		return 0;
	case 11:
		if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 12;
			return 1;
		}
		return 0;
	case 12:
		if($c !== null && (($c >= 0 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c >= 33 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 14;
			return 1;
		} else if($c === null) {
			
			$this.__state = 13;
			return 1;
		}
		return 0;
	case 14:
		if($c !== null && (($c >= 0 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c >= 33 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 14;
			return 1;
		} else if($c === null) {
			
			$this.__state = 13;
			return 1;
		}
		return 0;
	case 13:
		if($c !== null) {
			$this.__stkpush(15, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 15:
		if($c !== null && (($c === 41))) {
			$this.__state = 16;
			return 1;
		}
		return 0;
	case 16:
		return 0;
	case 6:
		return 0;
	case 3:
		return 0;
	case 2:
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 2;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(17, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 17:
		return 0;
	case 1:
		if($c !== null && (($c === 40))) {
				$this._f_LOOKAHEAD_COMMIT();$this.initv();
			$this.__state = 18;
			return 1;
		}
		return 0;
	case 18:
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 18;
			return 1;
			} else if($c !== null && (($c === 41))) {
			$this.__state = 19;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(20, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 20:
		$this.__state = 18;
		return 1;
	case 19:
		return 0;
	}
	return 0;
}

SExpression.ENGINE_exp.accepted = function($this) {
	return ($this.__state === 17 ||
			$this.__state === 16 ||
			$this.__state === 19 ||
			$this.__state === 5 ||
			$this.__state === 6);
}

SExpression.ENGINE_exp.execaction = function($this,  $c) {
	switch($this.__state) {
	case 17:
		$this._ = $this.quote($this._);
		break;
	case 1:
		break;
	case 11:
		break;
	case 10:
		break;
	case 6:
		$this._ = $this.endc($mille.nil);
		break;
	case 9:
		break;
	case 19:
		$this._ = $this.endv();
		break;
	case 7:
		$this.addc($this._);
		break;
	case 16:
		$this._ = $this.endc($this._);
		break;
	case 20:
		$this.addv($this._);
		break;
	case 12:
		break;
	case 4:
		break;
	case 3:
		break;
	case 18:
		break;
	case 13:
		break;
	case 2:
		break;
	case 15:
		break;
	case 5:
		break;
	case 8:
		break;
	case 14:
		break;
	case 0:
		break;
	}
	return 1;
}

SExpression.ENGINE_exp.isend = function($this) {
	return ($this.__state === 20 ||
			$this.__state === 7 ||
			$this.__state === 9 ||
			$this.__state === 12 ||
			$this.__state === 14);
}

SExpression.ENGINE_exp.recover = function($this, e) {
		return -1;
}

SExpression.ENGINE_exp.deadState = function($this) {
	return -1;
}

SExpression.ENGINE_exp.stateSize = function($this) {
			return 21;
}

SExpression.ENGINE_exp.finallyState = function($this) {
	return -1;
}

SExpression.ENGINE_exp.dead = function($this) {
	return ($this.__state === 17 ||
			$this.__state === 16 ||
			$this.__state === 19 ||
			$this.__state === 3 ||
			$this.__state === 5 ||
			$this.__state === 6);
}

SExpression.ENGINE_exp.emptyTransition = function($this) {
	return ($this.__state === 20);
}

SExpression.ENGINE_exp.toString = function() {
	return "exp";
}

SExpression.ENGINE_sExpression = {};

SExpression.ENGINE_sExpression.step = function($this, __rd,  $c)  {
	var __l__ = $this.__lookahead_ok;

	$this.__lookahead_ok = true;
	switch($this.__state) {
	case 0:
		if($c !== null && (($c === 41))) {
			$this.__state = 1;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(2, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 2:
		if($c !== null && (($c === 59))) {
			$this.__state = 3;
			return 1;
			} else if($c !== null && (($c === 1) || ($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 2;
			return 1;
		}
		return 0;
	case 3:
		if($c !== null && (($c === 10))) {
			$this.__state = 2;
			return 1;
		} else if($c !== null) {
			$this.__state = 3;
			return 1;
		}
		return 0;
	case 1:
		return 0;
	}
	return 0;
}

SExpression.ENGINE_sExpression.accepted = function($this) {
	return ($this.__state === 2 ||
			$this.__state === 3);
}

SExpression.ENGINE_sExpression.execaction = function($this,  $c) {
	switch($this.__state) {
	case 3:
		break;
	case 1:
		break;
	case 0:
		break;
	case 2:
		break;
	}
	return 1;
}

SExpression.ENGINE_sExpression.isend = function($this) {
	return false;
}

SExpression.ENGINE_sExpression.recover = function($this, e) {
		return -1;
}

SExpression.ENGINE_sExpression.deadState = function($this) {
	return -1;
}

SExpression.ENGINE_sExpression.stateSize = function($this) {
			return 4;
}

SExpression.ENGINE_sExpression.finallyState = function($this) {
	return -1;
}

SExpression.ENGINE_sExpression.dead = function($this) {
	return ($this.__state === 1);
}

SExpression.ENGINE_sExpression.emptyTransition = function($this) {
	return false;
}

SExpression.ENGINE_sExpression.toString = function() {
	return "sExpression";
}

SExpression.ENGINE_value = {};

SExpression.ENGINE_value.step = function($this, __rd,  $c)  {
	var __l__ = $this.__lookahead_ok;

	$this.__lookahead_ok = true;
	switch($this.__state) {
	case 0:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 2;
			return 1;
			} else if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 3;
			return 1;
			} else if($c !== null && (($c === 1))) {
			$this.__state = 4;
			return 1;
			} else if($c !== null && (($c === 35))) {
			$this.__state = 5;
			return 1;
			} else if($c !== null && (($c === 34))) {
				$this.clearbuf();
			$this.__state = 6;
			return 1;
			} else if($c !== null && (($c === 59))) {
			$this.__state = 7;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 0;
			return 1;
		} else if($c !== null) {
			$this.clearbuf();
			$this.__state = 8;
			return 1;
		}
		return 0;
	case 8:
		if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 95) || ($c >= 97 && $c <= 2147483647))) {
			$this.__state = 8;
			return 1;
		} else if($c === null) {
			$this.__state = 9;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 9;
			return 1;
		}
		return 0;
	case 9:
		return 0;
	case 7:
		if($c !== null && (($c === 10))) {
			$this.__state = 0;
			return 1;
		} else if($c !== null) {
			$this.__state = 7;
			return 1;
		}
		return 0;
	case 6:
		if($c !== null && (($c === 92))) {
			$this.__state = 10;
			return 1;
			} else if($c !== null && (($c === 34))) {
			$this.__state = 11;
			return 1;
		} else if($c !== null) {
			$this.__state = 6;
			return 1;
		}
		return 0;
	case 11:
		return 0;
	case 10:
		if($c !== null) {
			$this.__state = 6;
			return 1;
		}
		return 0;
	case 5:
		if($c !== null && (($c === 92))) {
			$this.__state = 12;
			return 1;
			} else if($c !== null && (($c === 88) || ($c === 120))) {
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 65) || ($c >= 67 && $c <= 78) || ($c >= 80 && $c <= 87) || ($c >= 89 && $c <= 91) || ($c >= 93 && $c <= 95) || ($c === 97) || ($c >= 99 && $c <= 110) || ($c >= 112 && $c <= 119) || ($c >= 121 && $c <= 2147483647))) {
			$this.__state = 14;
			return 1;
			} else if($c !== null && (($c === 79) || ($c === 111))) {
			$this.__state = 15;
			return 1;
			} else if($c !== null && (($c === 66) || ($c === 98))) {
			$this.__state = 16;
			return 1;
		}
		return 0;
	case 16:
		if($c !== null && (($c >= 48 && $c <= 49))) {
			$this.__state = 17;
			return 1;
		}
		return 0;
	case 17:
		if($c !== null && (($c >= 48 && $c <= 49))) {
			$this.__state = 17;
			return 1;
		} else if($c === null) {
			$this.__state = 18;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 18;
			return 1;
		}
		return 0;
	case 18:
		return 0;
	case 15:
		if($c !== null && (($c >= 48 && $c <= 55))) {
			$this.__state = 19;
			return 1;
		}
		return 0;
	case 19:
		if($c !== null && (($c >= 48 && $c <= 55))) {
			$this.__state = 19;
			return 1;
		} else if($c === null) {
			$this.__state = 20;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 20;
			return 1;
		}
		return 0;
	case 20:
		return 0;
	case 14:
		if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 95) || ($c >= 97 && $c <= 2147483647))) {
			$this.__state = 14;
			return 1;
		} else if($c === null) {
			$this.__state = 21;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 21;
			return 1;
		}
		return 0;
	case 21:
		return 0;
	case 13:
		if($c !== null && (($c >= 48 && $c <= 57) || ($c >= 65 && $c <= 70) || ($c >= 97 && $c <= 102))) {
			$this.__state = 22;
			return 1;
		}
		return 0;
	case 22:
		if($c !== null && (($c >= 48 && $c <= 57) || ($c >= 65 && $c <= 70) || ($c >= 97 && $c <= 102))) {
			$this.__state = 22;
			return 1;
		} else if($c === null) {
			$this.__state = 23;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 23;
			return 1;
		}
		return 0;
	case 23:
		return 0;
	case 12:
		if($c !== null && (($c >= 65 && $c <= 90) || ($c >= 97 && $c <= 122))) {
			$this.__state = 24;
			return 1;
		} else if($c !== null) {
			$this.__state = 25;
			return 1;
		}
		return 0;
	case 25:
		return 0;
	case 24:
		if($c !== null && (($c >= 65 && $c <= 90) || ($c >= 97 && $c <= 122))) {
				$this.addch();
			$this.__state = 26;
			return 1;
		}
		return 0;
	case 26:
		if($c !== null && (($c >= 65 && $c <= 90) || ($c >= 97 && $c <= 122))) {
			$this.__state = 26;
			return 1;
		} else if($c === null) {
			$this.__state = 27;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 27;
			return 1;
		}
		return 0;
	case 27:
		return 0;
	case 4:
		return 0;
	case 3:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 28;
			return 1;
		}
		return 0;
	case 28:
		if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 29;
			return 1;
			} else if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 30;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 28;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
			} else if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	case 32:
		if($c !== null && ((__l__ && $c >= 0 && $c <= 2147483647))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 33;
			return 1;
		} else if($c === null) {
			$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 33;
			return 1;
		}
		return 0;
	case 33:
		if($c !== null && (($c === 46))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 34;
			return 1;
			} else if($c !== null && (($c === 43))) {
				$this.$buffer = '';
			$this.__state = 35;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
			} else if($c !== null && (($c === 45))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 35;
			return 1;
		}
		return 0;
	case 36:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 37;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 34;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		}
		return 0;
	case 38:
		if($c !== null && (($c === 105))) {
			$this.__state = 39;
			return 1;
			} else if($c !== null && (($c === 45))) {
			$this.__state = 40;
			return 1;
			} else if($c !== null && (($c === 43))) {
			$this.__state = 41;
			return 1;
		}
		return 0;
	case 41:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 42;
			return 1;
			} else if($c !== null && (($c === 43))) {
				$this.$buffer = '';
			$this.__state = 43;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 44;
			return 1;
			} else if($c !== null && (($c === 45))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 43;
			return 1;
		}
		return 0;
	case 44:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 45;
			return 1;
		}
		return 0;
	case 45:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 46;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 45;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		}
		return 0;
	case 47:
		if($c !== null && (($c === 105))) {
			$this.__state = 48;
			return 1;
		}
		return 0;
	case 48:
		return 0;
	case 46:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 49;
			return 1;
			} else if($c !== null && (($c === 43) || ($c === 45))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 50;
			return 1;
		}
		return 0;
	case 50:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 49;
			return 1;
		}
		return 0;
	case 49:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 49;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		}
		return 0;
	case 43:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 42;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 44;
			return 1;
		}
		return 0;
	case 42:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 46;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 42;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 44;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 47;
			return 1;
		}
		return 0;
	case 40:
		if($c !== null && (($c === 43))) {
				$this.$buffer = '';
			$this.__state = 51;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 52;
			return 1;
			} else if($c !== null && (($c === 45))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 51;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 53;
			return 1;
		}
		return 0;
	case 53:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 54;
			return 1;
		}
		return 0;
	case 54:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 54;
			return 1;
			} else if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 55;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		}
		return 0;
	case 56:
		if($c !== null && (($c === 105))) {
			$this.__state = 57;
			return 1;
		}
		return 0;
	case 57:
		return 0;
	case 55:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 58;
			return 1;
			} else if($c !== null && (($c === 43) || ($c === 45))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 59;
			return 1;
		}
		return 0;
	case 59:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 58;
			return 1;
		}
		return 0;
	case 58:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 58;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		}
		return 0;
	case 52:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 55;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 52;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 53;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 56;
			return 1;
		}
		return 0;
	case 51:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 52;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 53;
			return 1;
		}
		return 0;
	case 39:
		return 0;
	case 37:
		if($c !== null && (($c === 43) || ($c === 45))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 60;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 61;
			return 1;
		}
		return 0;
	case 61:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 61;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		}
		return 0;
	case 60:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 61;
			return 1;
		}
		return 0;
	case 35:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 34;
			return 1;
		}
		return 0;
	case 34:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 62;
			return 1;
		}
		return 0;
	case 62:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 62;
			return 1;
			} else if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 37;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 38;
			return 1;
		}
		return 0;
	case 31:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 63;
			return 1;
			} else if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 64;
			return 1;
		}
		return 0;
	case 64:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 65;
			return 1;
		}
		return 0;
	case 65:
		if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 66;
			return 1;
			} else if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 67;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 65;
			return 1;
		}
		return 0;
	case 67:
		if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	case 66:
		if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 68;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 69;
			return 1;
		}
		return 0;
	case 69:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 69;
			return 1;
			} else if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 67;
			return 1;
		}
		return 0;
	case 68:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 69;
			return 1;
		}
		return 0;
	case 63:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 63;
			return 1;
			} else if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 64;
			return 1;
			} else if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 66;
			return 1;
			} else if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 67;
			return 1;
		}
		return 0;
	case 30:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 70;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 71;
			return 1;
		}
		return 0;
	case 71:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 70;
			return 1;
		}
		return 0;
	case 70:
		if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 29;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 70;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
			} else if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	case 29:
		if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	case 2:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 3;
			return 1;
		}
		return 0;
	case 1:
		if($c !== null && ((__l__ && $c === 105))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 29;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 30;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
			} else if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 3;
			return 1;
			} else if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	}
	return 0;
}

SExpression.ENGINE_value.accepted = function($this) {
	return ($this.__state === 48 ||
			$this.__state === 18 ||
			$this.__state === 38 ||
			$this.__state === 21 ||
			$this.__state === 39 ||
			$this.__state === 20 ||
			$this.__state === 23 ||
			$this.__state === 25 ||
			$this.__state === 9 ||
			$this.__state === 57 ||
			$this.__state === 27 ||
			$this.__state === 11);
}

SExpression.ENGINE_value.execaction = function($this,  $c) {
	switch($this.__state) {
	case 10:
		$this.addbuf($c);
		break;
	case 41:
		break;
	case 5:
		$this.clearbuf();
		break;
	case 35:
		break;
	case 24:
		$this.ch = $c;
		break;
	case 12:
		break;
	case 33:
		break;
	case 37:
		break;
	case 58:
		break;
	case 59:
		break;
	case 26:
		$this.addbuf($c);
		break;
	case 60:
		break;
	case 50:
		break;
	case 63:
		break;
	case 64:
		break;
	case 7:
		break;
	case 3:
		break;
	case 21:
		$this._ = $this.sharp($this.buf);
		break;
	case 34:
		break;
	case 51:
		break;
	case 15:
		break;
	case 14:
		$this.addbuf($c);
		break;
	case 70:
		break;
	case 47:
		break;
	case 2:
		break;
	case 11:
		$this._ = $this.str($this.buf);
		break;
	case 8:
		$this.addbuf($c);
		break;
	case 67:
		break;
	case 39:
		$this._ = $mille.c.make(0, $this._);
		break;
	case 27:
		$this._ = $this.chrname($this.buf);
		break;
	case 45:
		break;
	case 17:
		$this.addbuf($c);
		break;
	case 54:
		break;
	case 61:
		break;
	case 36:
		break;
	case 6:
		$this.addbuf($c);
		break;
	case 30:
		break;
	case 31:
		break;
	case 16:
		break;
	case 71:
		break;
	case 9:
		$this._ = $this.sym($this.buf);
		break;
	case 66:
		break;
	case 56:
		break;
	case 22:
		$this.addbuf($c);
		break;
	case 57:
		$this._ = $mille.c.make($this._, -$this.$num);
		break;
	case 1:
		break;
	case 4:
		break;
	case 40:
		break;
	case 42:
		break;
	case 46:
		break;
	case 55:
		break;
	case 48:
		$this._ = $mille.c.make($this._, $this.$num);
		break;
	case 23:
		$this._ = parseInt($this.buf, 16);
		break;
	case 28:
		break;
	case 20:
		$this._ = parseInt($this.buf, 8);
		break;
	case 18:
		$this._ = parseInt($this.buf, 2);
		break;
	case 13:
		break;
	case 29:
		break;
	case 44:
		break;
	case 52:
		break;
	case 43:
		break;
	case 53:
		break;
	case 62:
		break;
	case 49:
		break;
	case 19:
		$this.addbuf($c);
		break;
	case 32:
		break;
	case 68:
		break;
	case 38:
		$this._ = $this.$num;
		break;
	case 65:
		break;
	case 0:
		break;
	case 25:
		$this._ = $c;
		break;
	case 69:
		break;
	}
	return 1;
}

SExpression.ENGINE_value.isend = function($this) {
	return ($this.__state === 32 ||
			$this.__state === 36 ||
			$this.__state === 8 ||
			$this.__state === 42 ||
			$this.__state === 14 ||
			$this.__state === 45 ||
			$this.__state === 17 ||
			$this.__state === 19 ||
			$this.__state === 49 ||
			$this.__state === 54 ||
			$this.__state === 22 ||
			$this.__state === 52 ||
			$this.__state === 58 ||
			$this.__state === 26 ||
			$this.__state === 62 ||
			$this.__state === 61);
}

SExpression.ENGINE_value.recover = function($this, e) {
		return -1;
}

SExpression.ENGINE_value.deadState = function($this) {
	return -1;
}

SExpression.ENGINE_value.stateSize = function($this) {
			return 72;
}

SExpression.ENGINE_value.finallyState = function($this) {
	return -1;
}

SExpression.ENGINE_value.dead = function($this) {
	return ($this.__state === 48 ||
			$this.__state === 18 ||
			$this.__state === 21 ||
			$this.__state === 4 ||
			$this.__state === 39 ||
			$this.__state === 20 ||
			$this.__state === 23 ||
			$this.__state === 25 ||
			$this.__state === 9 ||
			$this.__state === 57 ||
			$this.__state === 27 ||
			$this.__state === 11);
}

SExpression.ENGINE_value.emptyTransition = function($this) {
	return false;
}

SExpression.ENGINE_value.toString = function() {
	return "value";
}

SExpression.prototype.__stkpush = function(st, en) {
	this.__sts[this.__slen] = st;
	this.__stk[this.__slen] = en;
	this.__stv[this.__slen++] = [];
}

SExpression.prototype._parse = function(rd, x, rt, st) {
	var b = false;
	var c = x, a;
	var en;

	b = this.__stk[this.__slen - 1].accepted(this);
	if(rd == null) {
		throw new SExpression_TokenException("can not recurse");
	} else if(rt) {
		switch(this.__stk[this.__slen - 1].execaction(this, -2)) {
		case -1:
			this.__logprint("accept " + this.__stk[this.__slen - 1]);
			st[0] = -1;  return null;
		case -9:
			this.__logprint("match failed: begin");
			this._puttrace();
			st[0] = -9;  return null;
		case -91:
			this.__logprint("machine halted: begin");
			st[0] = -91;  return null;
		case -72:
			this.__logprint("machine halted: begin");
			st[0] = -72;  return null;
		case -85:
			this.__logprint("machine yielded: ", c);
			st[0] = -85;  return null;
		}
	}

	try {
		do {
			en = this.__stk[this.__slen - 1];
			if(c === SExpression.__SKIP__) {
				c = SExpression.__DUM__;
			} else if((a = en.step(this, rd, c)) > 0) {
				this.__logprint("transit to state " + this.__state + ": ", c);
				b = en.accepted(this);
				switch(en.execaction(this, c)) {
				case -1:
					this.__logprint("accept " + this.__stk[this.__slen - 1].toString());
					this._f_UNGET(c);
					st[0] = -1;  return null;
				case -9:
					this.__logprint("match failed: ", c);
					this.__puttrace();
					this._f_UNGET(c);
					st[0] = -9;  return null;
				case -91:
					this.__logprint("machine halted: ", c);
					st[0] = -91;  return null;
				case -72:
					this.__logprint("machine halted: ", c);
					st[0] = -72;  return null;
				case -85:
					this.__logprint("machine yielded: ", c);
					st[0] = -85;  return null;
				}
			} else if(a < 0) {
				this.__logprint("entering " + this.__stk[this.__slen - 1].toString());
				return c;
			} else if(b) {
				this.__logprint("accept " + this.__stk[this.__slen - 1].toString());
				this._f_UNGET(c);
				st[0] = -1;  return null;
			} else if(this.__lookaheadw_ptr >= 0) {
				this.__logprint("match failed: try lookahead: ", c);
				this._f_LOOKAHEAD(c);
				this._f_LOOKAHEAD_RB();
				b = en.accepted(this);
			} else if(c == null) {
				if(!b)  throw "TokenException";
				st[0] = -1;
				return null;
			} else {
				this.__logprint("match failed: ", c);
				this.__puttrace();
				this._f_UNGET(c);
				st[0] = -9;  return null;
			}

			if(this.__stk[this.__slen - 1].emptyTransition(this)) {
				// do nothing
			} else if(!this.__stk[this.__slen - 1].dead(this)) {
				c = this._read(rd);
			} else if(b) {
				this.__logprint("accept " + this.__stk[this.__slen - 1].toString());
				st[0] = -1;  return null;
			} else if(this.__lookaheadw_ptr >= 0) {
				this.__logprint("match failed: try lookahead: ", c);
				this._f_LOOKAHEAD_RB();
				b = en.accepted(this);
			} else if(c == null) {
				if(!b)  throw "TokenException";
				st[0] = -1;  return null;
			} else {
				this.__logprint("match failed: ", c);
				this.__puttrace();
				st[0] = -9;  return null;
			}
		} while(true);
	} catch(e) {
		this._f_UNGET(c);
		throw e;
	}
}

SExpression.prototype.execfinally = function() {
	var a, b;

	if((a = this.__stk[this.__slen - 1].finallyState(this)) >= 0) {
		b = this.__state;  this.__state = a;
		switch(this.__stk[this.__slen - 1].execaction(this, -2)) {
		case -91:
			this.__slen = 0;
			return true;
		case -72:
			this.__slen = 0;
			return false;
		}
		this.__state = b;
	}
	return null;
}

SExpression.prototype.getdeadstate = function() {
	return this.__stk[this.__slen - 1].deadState(this);
}

SExpression.prototype.getrecover = function(e) {
	return this.__stk[this.__slen - 1].recover(this, e);
}

SExpression.prototype.parse_generic = function(rd, entry) {
	var c = SExpression.__SKIP__;
	var b = false;
	var a = [];

	this.__logopen();
	try {
		if(this.__slen == 0) {
			b = true;
			this.__stkpush(0, entry);
		}

		ot: while(true) {
			try {
				if((c = this._parse(rd, c, b, a)) != null) {
					// do nothing
				} else if(a[0] == -9) {
					while((this.__state = this.getdeadstate()) < 0) {
						if((b = this.execfinally()) != null)  break ot;
						if(this.__slen-- <= 1) {
							throw new SExpression_TokenException();
						}
					}
					c = SExpression.__SKIP__;
				} else if(a[0] == -91) {
					if((b = this.execfinally()) != null)  break;
					this.__slen = 0;
					b = true;  break;
				} else if(a[0] == -72) {
					if((b = this.execfinally()) != null)  break;
					this.__slen = 0;
					b = false;  break;
				} else if(a[0] == -85) {
					return false;
				} else if(this.__slen > 1) {
					if((b = this.execfinally()) != null)  break;
					this.__state = this.__sts[--this.__slen];
					c = SExpression.__SKIP__;
				} else {
					if((b = this.execfinally()) != null)  break;
					b = this.__stk[--this.__slen].accepted(this);
					break;
				}
			} catch(e) {
				this.exception = e;
				if(this.__slen <= 0)  throw e;
				while((this.__state = this.getrecover(e)) < 0) {
					if((b = this.execfinally()) != null)  return b;
					if(this.__slen-- <= 1)  throw e;
				}
			}
			b = true;
		}
		if(!b)  throw new SExpression_TokenException();
		return b;
	} finally {
		this.__logclose();
	}
}

SExpression.prototype.parse = function(rd) {
	return this.parse_generic(rd, this.ENGINE_sExpression);
}

SExpression.prototype.setStream = function(rd) {
	if(this.befstream != null) {
		throw "IllegalStateException";
	}
	this.yieldObject = this.befstream = rd;
}

SExpression.prototype.parseNext = function() {
	var o;

	if(this.befstream == null) {
		throw "IllegalStateException";
	} else if(this.yieldObject == null) {
		return null;
	} else if(this.parse(this.befstream, this.ENGINE_sExpression)) {
		if(this.yieldObject == null)  throw "NullPointerException";
		o = this.yieldObject;  this.yieldObject = null;
		return o;
	} else {
		if(this.yieldObject == null)  throw "NullPointerException";
		return this.yieldObject;
	}
}

SExpression.parseAll = function(rd) {
	return new SExpression().parse(rd);
}

SExpression.parseStream = function(stream) {
	return SExpression.parseAll(function () {
		var c;

		c = stream.read();
		return c < 0 ? null : c;
	});
}

SExpression.parseString = function(s) {
	var p = 0;

	return SExpression.parseAll(function () {
		return p < s.length ? s.charCodeAt(p++) : null;
	});
}

SExpression.parseStdin = function() {
	return SExpression.parseStream(
			new java.io.InputStreamReader(java.lang.System['in']));
}

function puts(s) {
	java.lang.System['out'].println(s);
}
/* @@@-PARSER-CODE-END-@@@ */
SExpression.sharpHash = {
	't': true,
	'f': false
};
SExpression.charnameHash = {
	'newline': '\n'.charCodeAt(0),
	'space':   ' '.charCodeAt(0)
};
SExpression.prototype.initc = function() {
	if(this.sstack === undefined) {
		this.sstack = [];
	}
	this.sstack.push({
		exp: undefined,
		ptr: undefined
	});
};
SExpression.prototype.addc = function(x) {
	var s = this.sstack.pop();
	if(s.exp === undefined) {
		s.exp = s.ptr = $mille.cons(x, $mille.nil);
	} else {
		s.ptr.cdr = $mille.cons(x, $mille.nil);
		s.ptr = s.ptr.cdr;
	}
	this.sstack.push(s);
};
SExpression.prototype.endc = function(x) {
	var s = this.sstack.pop();
	if(s.exp === undefined) {
		return $mille.nil;
	} else {
		s.ptr.cdr = x;
		return s.exp;
	}
};
SExpression.prototype.initv = function() {
	if(this.sstack === undefined) {
		this.sstack = [];
	}
	this.sstack.push([]);
};
SExpression.prototype.addv = function(x) {
	var s = this.sstack.pop();
	s.push(x);
	this.sstack.push(s);
};
SExpression.prototype.endv = function(x) {
	return this.sstack.pop();
};
SExpression.prototype.quote = function(x) {
	return $mille.cons($mille.getSymbol('quote'), $mille.cons(x, $mille.nil));
};
SExpression.prototype.clearbuf = function() {
	this.buf = '';
};
SExpression.prototype.addbuf = function(c) {
	this.buf += String.fromCharCode(c);
};
SExpression.prototype.str = function(s) {
	var c, i, r = '', b;
	for(i = 1; i < s.length; i++) {
		c = s.charAt(i);
		if(c !== '\\') {
			r += c;
		} else if(i + 1 === s.length) {
			$mille.o.error('Token exception');
		} else if((c = s.charAt(++i)) === '\\') {
			r += '\\\\';
		} else if(c === '\"') {
			r += '\"';
		} else if(c === 'a') {
			r += '\u0007';
		} else if(c === 'b') {
			r += '\b';
		} else if(c === 't') {
			r += '\t';
		} else if(c === 'n') {
			r += '\n';
		} else if(c === 'v') {
			r += '\u0008';
		} else if(c === 'f') {
			r += '\u000c';
		} else if(c === 'r') {
			r += '\r';
		} else if(c === 'x' || c === 'u') {
			b = '';
			while(++i < s.length) {
				c = s.charAt(i);
				if((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') ||
						(c >= 'A' && c <= 'F')) {
					b += c;
				} else {
					break;
				}
			}
			if(b.length === 0) {
				$mille.o.error('Token Exception');
			} else if((c = parseInt(b, 16)) > 0xffff) {
				$mille.o.error('invalid unicode');
			} else {
				r += String.fromCharCode(c);
			}
		} else {
			$mille.o.error('Invalid escape sequence');
		}
	}
	return r;
};
SExpression.prototype.sharp = function(b) {
	var x;
	if((x = SExpression.sharpHash[b]) !== undefined) {
		return x;
	} else {
		$mille.o.error('unknown sharp: ' + b);
	}
};
SExpression.prototype.chrname = function(b) {
	var x;
	if((x = SExpression.charnameHash[b]) !== undefined) {
		return x;
	} else {
		$mille.o.error('unknown character name: ' + b);
	}
};
SExpression.prototype.addch = function(b) {
	this.buf += String.fromCharCode(this.ch);
};
SExpression.prototype.sym = function(b) {
	return $mille.getSymbol(b);
};
$mille.macroenv = $mille.newenv($env, this);
$mille.macroenv.bind('macroenv',  $mille.cons( $mille.nil , $mille.nil ) )
$mille.macroenv.bind('pattern-id',  0.0 )
$mille.macroenv.bind('consf', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);return (((!(( $env.find('x')  )===false) ? (!(( $env.find('y')  )===false) ? $mille.apply( $env.find('cons')  , $env.find('x')  , $env.find('y')  ) :  $mille.nil ) :  false )));}))
$mille.macroenv.bind('cdrf', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(( $env.find('x')  )===false) ? $mille.apply( $env.find('cdr')  , $env.find('x')  ) :  false )));}))
$mille.macroenv.bind('ap2', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);return (((!(((!(( $env.find('x')  )===false) ?  $env.find('y')   :  false ))===false) ? (!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $env.find('y')   : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('y')  ))) :  false )));}))
$mille.macroenv.bind('pair?', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  false  : (!(($mille.apply( $env.find('atom?')  , $env.find('x')  ))===false) ?  false  :  true ))));}))
$mille.macroenv.bind('gen-sym-id',  0.0 )
$mille.macroenv.bind('gen-sym', $mille.closure($mille.macroenv, this, function($env) {return ((($env.set('gen-sym-id',$mille.apply( $env.find('1+')  , $env.find('gen-sym-id')  )), undefined)),($mille.apply( $env.find('string->symbol')  ,$mille.apply( $env.find('string-append')  , "#" , $env.find('gen-sym-id')  ))));}))
$mille.macroenv.bind('gen-sym?', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('eqv?')  ,$mille.apply( $env.find('string-ref')  ,$mille.apply( $env.find('symbol->string')  , $env.find('x')  ), 0.0 ), 35 ) :  false )));}))
$mille.macroenv.bind('memq', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('o', a0 === undefined ? null : a0);$env.bind('l', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('l')  ))===false) ?  false  : (!(($mille.apply( $env.find('eq?')  , $env.find('o')  ,$mille.apply( $env.find('car')  , $env.find('l')  )))===false) ?  $env.find('l')   : $mille.apply( $env.find('memq')  , $env.find('o')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ))))));}))
$mille.macroenv.bind('assq', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('lis', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('lis')  ))===false) ?  false  : (!(($mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('lis')  )), $env.find('x')  ))===false) ? $mille.apply( $env.find('car')  , $env.find('lis')  ) : $mille.apply( $env.find('assq')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('lis')  ))))));}))
$mille.macroenv.bind('symbol-scoped?', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? $mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('s', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('>')  ,$mille.apply( $env.find('string-length')  , $env.find('s')  ), 1.0 ))===false) ? $mille.apply( $env.find('eqv?')  ,$mille.apply( $env.find('string-ref')  , $env.find('s')  , 0.0 ), 58 ) :  false )));}),$mille.apply( $env.find('symbol->string')  , $env.find('x')  )) :  false )));}))
$mille.macroenv.bind('add-scope', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(((!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? (!(($mille.apply( $env.find('gen-sym?')  , $env.find('x')  ))===false) ?  true  : $mille.apply( $env.find('symbol-scoped?')  , $env.find('x')  )) :  true ))===false) ?  $env.find('x')   : $mille.apply( $env.find('string->symbol')  ,$mille.apply( $env.find('string-append')  , ":" , $env.find('pattern-id')  , "#" ,$mille.apply( $env.find('symbol->string')  , $env.find('x')  ))))));}))
$mille.macroenv.bind('remove-scope-string', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('eqv?')  ,$mille.apply( $env.find('string-ref')  , $env.find('x')  , $env.find('k')  ), 35 ))===false) ? $mille.apply( $env.find('substring')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ),$mille.apply( $env.find('string-length')  , $env.find('x')  )) : $mille.apply( $env.find('remove-scope-string')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  )))));}))
$mille.macroenv.bind('remove-scope', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(((!(($mille.apply( $env.find('gen-sym?')  , $env.find('x')  ))===false) ?  false  : $mille.apply( $env.find('symbol-scoped?')  , $env.find('x')  )))===false) ? $mille.apply( $env.find('string->symbol')  ,$mille.apply( $env.find('remove-scope-string')  ,$mille.apply( $env.find('symbol->string')  , $env.find('x')  ), 0.0 )) :  $env.find('x')  )));}))
$mille.macroenv.bind('remove-all-scope', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $env.find('x')   : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('remove-all-scope')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('remove-all-scope')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))) : $mille.apply( $env.find('remove-scope')  , $env.find('x')  )))));}))
$mille.macroenv.bind('compile-macro', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('...') ,$mille.apply( $env.find('car')  , $env.find('x')  )))===false) ? $mille.apply( $env.find('error')  , "ellipse" ) : (!(($mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )))===false) ? (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('...') ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))))===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  , $mille.getSymbol('...') ,$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))),$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )))) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )))) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))))) :  $env.find('x')  ))));}))
$mille.macroenv.bind('match-pattern-ellipse-vec', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3,a4) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);$env.bind('l', a3 === undefined ? null : a3);$env.bind('res', a4 === undefined ? null : a4);return (((!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , $env.find('l')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('consf')  ,$mille.apply( $env.find('match-pattern')  , $env.find('x')  ,$mille.apply( $env.find('vector-ref')  , $env.find('y')  , $env.find('k')  ), $env.find('res')  ),$mille.apply( $env.find('match-pattern-ellipse-vec')  , $env.find('x')  , $env.find('y')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('l')  , $env.find('res')  )))));}))
$mille.macroenv.bind('vec-ellipse?', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('l', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('<')  , $env.find('k')  ,$mille.apply( $env.find('1-')  , $env.find('l')  )))===false) ? $mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  )), $mille.getSymbol('...') ) :  false )));}))
$mille.macroenv.bind('match-pattern-vec', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3,a4) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);$env.bind('l', a3 === undefined ? null : a3);$env.bind('res', a4 === undefined ? null : a4);return (((!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , $env.find('l')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('vec-ellipse?')  , $env.find('x')  , $env.find('k')  , $env.find('l')  ))===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('match-pattern-ellipse-vec')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('k')  ), $env.find('y')  , $env.find('k')  , $env.find('l')  , $env.find('res')  ), $mille.nil ) : $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('match-pattern')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('k')  ),$mille.apply( $env.find('vector-ref')  , $env.find('y')  , $env.find('k')  ), $env.find('res')  ),$mille.apply( $env.find('match-pattern-vec')  , $env.find('x')  , $env.find('y')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('l')  , $env.find('res')  ))))));}))
$mille.macroenv.bind('match-pattern-ellipse', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);$env.bind('res', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('null?')  , $env.find('y')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('consf')  ,$mille.apply( $env.find('match-pattern')  , $env.find('x')  ,$mille.apply( $env.find('car')  , $env.find('y')  ), $env.find('res')  ),$mille.apply( $env.find('match-pattern-ellipse')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('y')  ), $env.find('res')  )))));}))
$mille.macroenv.bind('match-pattern', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);$env.bind('res', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ? (!(($mille.apply( $env.find('null?')  , $env.find('y')  ))===false) ?  $mille.nil  :  false ) : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? (!(((!(($mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))===false) ? $mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )), $mille.getSymbol('...') ) :  false ))===false) ? (!(($mille.apply( $env.find('pair?')  , $env.find('y')  ))===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('match-pattern-ellipse')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('x')  )), $env.find('y')  , $env.find('res')  ), $mille.nil ) : (!(($mille.apply( $env.find('null?')  , $env.find('y')  ))===false) ?  $mille.nil  :  false )) : (!(($mille.apply( $env.find('pair?')  , $env.find('y')  ))===false) ? $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('match-pattern')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('car')  , $env.find('y')  ), $env.find('res')  ),$mille.apply( $env.find('match-pattern')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ),$mille.apply( $env.find('cdr')  , $env.find('y')  ), $env.find('res')  )) :  false )) : (!(((!(($mille.apply( $env.find('vector?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('vector?')  , $env.find('y')  ) :  false ))===false) ? $mille.apply( $env.find('match-pattern-vec')  , $env.find('x')  , $env.find('y')  , 0.0 ,$mille.apply( $env.find('vector-length')  , $env.find('y')  ), $env.find('res')  ) : (!(($mille.apply( $env.find('string?')  , $env.find('x')  ))===false) ? (!(((!(($mille.apply( $env.find('string?')  , $env.find('y')  ))===false) ? $mille.apply( $env.find('eqv?')  , $env.find('x')  , $env.find('y')  ) :  false ))===false) ?  $mille.nil  :  false ) : (!(((!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('memq')  , $env.find('x')  , $env.find('res')  ) :  true ))===false) ? (!(($mille.apply( $env.find('eqv?')  , $env.find('x')  ,$mille.apply( $env.find('remove-scope')  , $env.find('y')  )))===false) ?  $mille.nil  :  false ) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  , $env.find('x')  , $env.find('y')  ), $mille.nil ))))))));}))
$mille.macroenv.bind('extract-idx2', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('k', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('e')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , 0.0 ))===false) ? $mille.apply( $env.find('car')  , $env.find('e')  ) : $mille.apply( $env.find('extract-idx2')  ,$mille.apply( $env.find('1-')  , $env.find('k')  ),$mille.apply( $env.find('cdr')  , $env.find('e')  ))))));}))
$mille.macroenv.bind('assoc-any?', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('s', a0 === undefined ? null : a0);$env.bind('a', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('s')  ))===false) ?  false  : (!(($mille.apply( $env.find('assq')  ,$mille.apply( $env.find('car')  , $env.find('s')  ), $env.find('a')  ))===false) ?  true  : $mille.apply( $env.find('assoc-any?')  ,$mille.apply( $env.find('cdr')  , $env.find('s')  ), $env.find('a')  )))));}))
$mille.macroenv.bind('next-idx?', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('s', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ?  false  : (!(($mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))===false) ? (!(($mille.apply( $env.find('assoc-any?')  , $env.find('s')  , $env.find('x')  ))===false) ?  true  : $mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))) : $mille.apply( $env.find('null?')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))))));}))
$mille.macroenv.bind('extract-idx', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('m', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('s', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('null?')  , $env.find('e')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('car')  , $env.find('e')  )))===false) ? $mille.apply( $env.find('extract-idx')  , $env.find('m')  ,$mille.apply( $env.find('cdr')  , $env.find('e')  ), $env.find('s')  ) : (!(($mille.apply( $env.find('next-idx?')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('e')  )), $env.find('s')  ))===false) ? $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('extract-idx2')  , $env.find('m')  ,$mille.apply( $env.find('car')  , $env.find('e')  )),$mille.apply( $env.find('extract-idx')  , $env.find('m')  ,$mille.apply( $env.find('cdr')  , $env.find('e')  ), $env.find('s')  )) : $mille.apply( $env.find('extract-idx')  , $env.find('m')  ,$mille.apply( $env.find('cdr')  , $env.find('e')  ), $env.find('s')  ))))));}))
$mille.macroenv.bind('extract-symbols-vec', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('l', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , $env.find('l')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('extract-symbols')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('k')  )),$mille.apply( $env.find('extract-symbols-vec')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('l')  )))));}))
$mille.macroenv.bind('extract-symbols', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('extract-symbols')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('extract-symbols')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))) : (!(($mille.apply( $env.find('vector?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('extract-symbols-vec')  , $env.find('x')  , 0.0 ,$mille.apply( $env.find('vector-length')  , $env.find('x')  )) : (!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('cons')  , $env.find('x')  , $mille.nil ) :  $mille.nil ))))));}))
$mille.macroenv.bind('replace-pattern-ellipse1', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);$env.bind('s', a3 === undefined ? null : a3);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('v')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('replace-pattern1')  , $env.find('x')  , $env.find('v')  ),$mille.apply( $env.find('replace-pattern-ellipse1')  , $env.find('x')  , $env.find('e')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('s')  )))));}),$mille.apply( $env.find('extract-idx')  , $env.find('k')  , $env.find('e')  , $env.find('s')  ))));}))
$mille.macroenv.bind('replace-pattern-ellipse', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);return (($mille.apply( $env.find('replace-pattern-ellipse1')  , $env.find('x')  , $env.find('e')  , $env.find('k')  ,$mille.apply( $env.find('extract-symbols')  , $env.find('x')  ))));}))
$mille.macroenv.bind('replace-pattern-ellipse-length1', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('e', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('s', a2 === undefined ? null : a2);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('v')  ))===false) ?  $env.find('k')   : $mille.apply( $env.find('replace-pattern-ellipse-length1')  , $env.find('e')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('s')  ))));}),$mille.apply( $env.find('extract-idx')  , $env.find('k')  , $env.find('e')  , $env.find('s')  ))));}))
$mille.macroenv.bind('replace-pattern-ellipse-length', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);return (($mille.apply( $env.find('replace-pattern-ellipse-length1')  , $env.find('e')  , $env.find('k')  ,$mille.apply( $env.find('extract-symbols')  , $env.find('x')  ))));}))
$mille.macroenv.bind('replace-pattern-vec-length', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('l', a2 === undefined ? null : a2);$env.bind('e', a3 === undefined ? null : a3);return (((!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , $env.find('l')  ))===false) ?  $env.find('k')   : (!(($mille.apply( $env.find('vec-ellipse?')  , $env.find('x')  , $env.find('k')  , $env.find('l')  ))===false) ? $mille.apply( $env.find('replace-pattern-ellipse-length')  , $env.find('x')  , $env.find('e')  , $env.find('k')  ) : $mille.apply( $env.find('replace-pattern-vec-length')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('l')  , $env.find('e')  )))));}))
$mille.macroenv.bind('replace-pattern-ellipse-vec1', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3,a4) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);$env.bind('s', a3 === undefined ? null : a3);$env.bind('z', a4 === undefined ? null : a4);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('v')  ))===false) ?  $env.find('z')   : (($mille.apply( $env.find('vector-set!')  , $env.find('z')  , $env.find('k')  ,$mille.apply( $env.find('replace-pattern1')  , $env.find('x')  , $env.find('v')  ))),($mille.apply( $env.find('replace-pattern-ellipse-vec1')  , $env.find('x')  , $env.find('e')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('s')  , $env.find('z')  ))))));}),$mille.apply( $env.find('extract-idx')  , $env.find('k')  , $env.find('e')  , $env.find('s')  ))));}))
$mille.macroenv.bind('replace-pattern-ellipse-vec', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);$env.bind('k', a2 === undefined ? null : a2);$env.bind('v', a3 === undefined ? null : a3);return (($mille.apply( $env.find('replace-pattern-ellipse-vec1')  , $env.find('x')  , $env.find('e')  , $env.find('k')  ,$mille.apply( $env.find('extract-symbols')  , $env.find('x')  ), $env.find('v')  )));}))
$mille.macroenv.bind('replace-pattern-vec1', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2,a3,a4) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('l', a2 === undefined ? null : a2);$env.bind('e', a3 === undefined ? null : a3);$env.bind('v', a4 === undefined ? null : a4);return (((!(($mille.apply( $env.find('eqv?')  , $env.find('k')  , $env.find('l')  ))===false) ?  $env.find('v')   : (!(($mille.apply( $env.find('vec-ellipse?')  , $env.find('x')  , $env.find('k')  , $env.find('l')  ))===false) ? $mille.apply( $env.find('replace-pattern-ellipse-vec')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('k')  ), $env.find('e')  , $env.find('k')  , $env.find('v')  ) : (($mille.apply( $env.find('vector-set!')  , $env.find('v')  , $env.find('k')  ,$mille.apply( $env.find('replace-pattern1')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('k')  ), $env.find('e')  ))),($mille.apply( $env.find('replace-pattern-vec1')  , $env.find('x')  ,$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('l')  , $env.find('e')  , $env.find('v')  )))))));}))
$mille.macroenv.bind('replace-pattern-vec', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($env.bind('l', $mille.apply( $env.find('replace-pattern-vec-length')  , $env.find('x')  , 0.0 ,$mille.apply( $env.find('vector-length')  , $env.find('x')  ), $env.find('e')  ))),($mille.apply( $env.find('replace-pattern-vec1')  , $env.find('x')  , 0.0 , $env.find('l')  , $env.find('e')  ,$mille.apply( $env.find('make-vector')  , $env.find('l')  ))));}))
$mille.macroenv.bind('replace-pattern1', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? (!(((!(($mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))===false) ? $mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )), $mille.getSymbol('...') ) :  false ))===false) ? $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('replace-pattern-ellipse')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('x')  )), $env.find('e')  , 0.0 ),$mille.apply( $env.find('replace-pattern1')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('replace-pattern1')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('e')  ),$mille.apply( $env.find('replace-pattern1')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  ))) : (!(($mille.apply( $env.find('vector?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('replace-pattern-vec')  , $env.find('x')  , $env.find('e')  ) : (!(($mille.apply( $env.find('assq')  , $env.find('x')  , $env.find('e')  ))===false) ? $mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('assq')  , $env.find('x')  , $env.find('e')  )) : $mille.apply( $env.find('add-scope')  , $env.find('x')  )))))));}))
$mille.macroenv.bind('replace-pattern', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return ((($env.set('pattern-id',$mille.apply( $env.find('1+')  , $env.find('pattern-id')  )), undefined)),($mille.apply( $env.find('replace-pattern1')  , $env.find('x')  , $env.find('e')  )));}))
$mille.macroenv.bind('add-local-env-lambda', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $env.find('e')   : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('gen-sym')  )),$mille.apply( $env.find('add-local-env-lambda')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )))));}))
$mille.macroenv.bind('add-local-env-letrec', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $env.find('e')   : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('gen-sym')  )),$mille.apply( $env.find('add-local-env-letrec')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )))));}))
$mille.macroenv.bind('replace-local-lambda', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply( $env.find('replace-local-vals')  , $env.find('x')  ,$mille.apply( $env.find('add-local-env-lambda')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('e')  ))));}))
$mille.macroenv.bind('replace-local-letrec', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply( $env.find('replace-local-vals')  , $env.find('x')  ,$mille.apply( $env.find('add-local-env-letrec')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('e')  ))));}))
$mille.macroenv.bind('replace-local-inst', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(((!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('lambda') ,$mille.apply( $env.find('remove-scope')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))))===false) ? (!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )))===false) ?  false  :  true ) :  false ))===false) ? $mille.apply( $env.find('cons')  , $mille.getSymbol('lambda') ,$mille.apply( $env.find('replace-local-lambda')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )) : (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('letrec') ,$mille.apply( $env.find('remove-scope')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))))===false) ? $mille.apply( $env.find('cons')  , $mille.getSymbol('letrec') ,$mille.apply( $env.find('replace-local-letrec')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('replace-local-vals')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('e')  ),$mille.apply( $env.find('replace-local-vals')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  ))))));}))
$mille.macroenv.bind('replace-local-vals', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('assq')  , $env.find('x')  , $env.find('e')  ))===false) ? $mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('assq')  , $env.find('x')  , $env.find('e')  )) : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('replace-local-inst')  , $env.find('x')  , $env.find('e')  ) :  $env.find('x')  )))));}))
$mille.macroenv.bind('extract-level', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('k', a1 === undefined ? null : a1);$env.bind('e', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? (!(($mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $mille.getSymbol('...') ))===false) ? $mille.apply( $env.find('extract-level')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ),$mille.apply( $env.find('1+')  , $env.find('k')  ), $env.find('e')  ) : $mille.apply( $env.find('ap2')  ,$mille.apply( $env.find('extract-level')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('k')  , $env.find('e')  ),$mille.apply( $env.find('extract-level')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('k')  , $env.find('e')  ))) : (!(($mille.apply( $env.find('symbol?')  , $env.find('x')  ))===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  , $env.find('x')  , $env.find('k')  ), $mille.nil ) :  $mille.nil )))));}))
$mille.macroenv.bind('eqv-assoc?', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('f', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('assq')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('f')  ))===false) ? $mille.apply( $env.find('eqv?')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('assq')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('f')  )),$mille.apply( $env.find('cdr')  , $env.find('x')  )) :  true )));}))
$mille.macroenv.bind('check-level-num?', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('e', a0 === undefined ? null : a0);$env.bind('f', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('e')  ))===false) ?  true  : (!(($mille.apply( $env.find('eqv-assoc?')  ,$mille.apply( $env.find('car')  , $env.find('e')  ), $env.find('f')  ))===false) ? $mille.apply( $env.find('check-level-num?')  ,$mille.apply( $env.find('cdr')  , $env.find('e')  ), $env.find('f')  ) :  false ))));}))
$mille.macroenv.bind('check-level?', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);return (($mille.apply( $env.find('check-level-num?')  ,$mille.apply( $env.find('extract-level')  , $env.find('x')  , 0.0 , $mille.nil ),$mille.apply( $env.find('extract-level')  , $env.find('y')  , 0.0 , $mille.nil ))));}))
$mille.macroenv.bind('check-level-and-cons', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('check-level?')  , $env.find('x')  , $env.find('y')  ))===false) ? $mille.apply( $env.find('cons')  , $env.find('x')  , $env.find('y')  ) : $mille.apply( $env.find('error')  , "level" ))));}))
$mille.macroenv.bind('eval-syntax-rules1', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))))===false) ?  true  : $mille.apply( $env.find('error')  , "syntax-rules" ))),($mille.apply( $env.find('check-level-and-cons')  ,$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('compile-macro')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))))));}))
$mille.macroenv.bind('eval-syntax-rules-list', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-syntax-rules1')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('eval-syntax-rules-list')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))))));}))
$mille.macroenv.bind('eval-syntax-rules', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('eval-syntax-rules-list')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )))));}))
$mille.macroenv.bind('eval-syntax-spec', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('syntax-rules') ,$mille.apply( $env.find('car')  , $env.find('x')  )))===false) ? $mille.apply( $env.find('eval-syntax-rules')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  )) : $mille.apply( $env.find('error')  , "error" ))));}))
$mille.macroenv.bind('find-env', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('e')  ))===false) ?  false  : (!(($mille.apply( $env.find('assq')  , $env.find('x')  ,$mille.apply( $env.find('car')  , $env.find('e')  )))===false) ? $mille.apply( $env.find('assq')  , $env.find('x')  ,$mille.apply( $env.find('car')  , $env.find('e')  )) : $mille.apply( $env.find('find-env')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('e')  ))))));}))
$mille.macroenv.bind('cons-env', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('a', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply( $env.find('cons')  , $env.find('a')  , $env.find('e')  )));}))
$mille.macroenv.bind('eval-replace-list', $mille.closure($mille.macroenv, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('s', a1 === undefined ? null : a1);$env.bind('l', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('null?')  , $env.find('l')  ))===false) ? $mille.apply( $env.find('error')  , "malformed" ) : $mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(( $env.find('v')  )===false) ? $mille.apply( $env.find('replace-local-vals')  ,$mille.apply( $env.find('replace-pattern')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('l')  )), $env.find('v')  ), $mille.nil ) : $mille.apply( $env.find('eval-replace-list')  , $env.find('x')  , $env.find('s')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  )))));}),$mille.apply( $env.find('match-pattern')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('l')  )), $env.find('x')  , $env.find('s')  )))));}))
$mille.macroenv.bind('eval-replace1', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(( $env.find('v')  )===false) ? $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-replace-list')  , $env.find('x')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('v')  )),$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('v')  ))),$mille.apply( $env.find('cdr')  , $env.find('v')  )) :  false )));}),$mille.apply( $env.find('cdrf')  ,$mille.apply( $env.find('find-env')  ,$mille.apply( $env.find('remove-scope')  ,$mille.apply( $env.find('car')  , $env.find('x')  )), $env.find('e')  )))));}))
$mille.macroenv.bind('eval-replace', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? $mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(( $env.find('v')  )===false) ? $mille.apply( $env.find('eval-macro1')  ,$mille.apply( $env.find('car')  , $env.find('v')  ),$mille.apply( $env.find('cdr')  , $env.find('v')  )) :  $env.find('x')  )));}),$mille.apply( $env.find('eval-replace1')  , $env.find('x')  , $env.find('e')  )) :  $env.find('x')  )));}))
$mille.macroenv.bind('eval-define-syntax!', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(( $env.find('v')  )===false) ? $mille.apply( $env.find('set-cdr!')  , $env.find('v')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-syntax-spec')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))), $env.find('e')  )) : $mille.apply( $env.find('set-car!')  , $env.find('e')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-syntax-spec')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))), $env.find('e')  )),$mille.apply( $env.find('car')  , $env.find('e')  ))))));}),$mille.apply( $env.find('find-env')  ,$mille.apply( $env.find('car')  , $env.find('x')  ), $env.find('e')  ))));}))
$mille.macroenv.bind('eval-let-syntax', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-syntax-spec')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))), $env.find('e')  )),$mille.apply( $env.find('eval-let-syntax')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  )))));}))
$mille.macroenv.bind('eval-letrec-syntax!', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  $env.find('e')   : (($mille.apply( $env.find('set-car!')  , $env.find('e')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  )),$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-syntax-spec')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('x')  )))), $env.find('e')  )),$mille.apply( $env.find('car')  , $env.find('e')  )))),($mille.apply( $env.find('eval-letrec-syntax!')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ), $env.find('e')  ))))));}))
$mille.macroenv.bind('eval-macro1', $mille.closure($mille.macroenv, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('e', a1 === undefined ? null : a1);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('v', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('pair?')  , $env.find('v')  ))===false) ? (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('define-syntax') ,$mille.apply( $env.find('car')  , $env.find('v')  )))===false) ? $mille.apply( $env.find('eval-define-syntax!')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  ), $env.find('e')  ) : (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('let-syntax') ,$mille.apply( $env.find('car')  , $env.find('v')  )))===false) ? $mille.apply( $env.find('cons')  , $mille.getSymbol('begin') ,$mille.apply( $env.find('eval-macro1')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  )),$mille.apply( $env.find('cons-env')  ,$mille.apply( $env.find('eval-let-syntax')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  )), $env.find('e')  ), $env.find('e')  ))) : (!(($mille.apply( $env.find('eq?')  , $mille.getSymbol('letrec-syntax') ,$mille.apply( $env.find('car')  , $env.find('v')  )))===false) ? $mille.apply( $env.find('cons')  , $mille.getSymbol('begin') ,$mille.apply( $env.find('eval-macro1')  ,$mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  )),$mille.apply( $env.find('eval-letrec-syntax!')  ,$mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  )),$mille.apply( $env.find('cons-env')  , $mille.nil , $env.find('e')  )))) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('eval-macro1')  ,$mille.apply( $env.find('car')  , $env.find('v')  ), $env.find('e')  ),$mille.apply( $env.find('eval-macro1')  ,$mille.apply( $env.find('cdr')  , $env.find('v')  ), $env.find('e')  ))))) :  $env.find('v')  )));}),$mille.apply( $env.find('eval-replace')  , $env.find('x')  , $env.find('e')  ))));}))
$mille.macroenv.bind('eval-macro', $mille.closure($mille.macroenv, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('remove-all-scope')  ,$mille.apply( $env.find('eval-macro1')  , $env.find('x')  , $env.find('macroenv')  ))));}))
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax and" +
		"		  (syntax-rules ()" +
		"		    ((_) #t)" +
		"		    ((_ e1) e1)" +
		"		    ((_ e1 e2 ...) (if e1 (and e2 ...) #f))))"
));
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax or" +
		"		  (syntax-rules ()" +
		"		    ((_) #f)" +
		"		    ((_ e1) e1)" +
		"		    ((_ e1 e2 ...)" +
		"		       (let ((x e1))" +
		"		         (if x x (or e2 ...))))))"
));
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax cond" +
		"		  (syntax-rules (else =>)" +
		"		    ((_ (else r1 r2 ...)) (begin r1 r2 ...))" +
		"		    ((_ (cd => r1))" +
		"		      (let ((tm cd)) (if tm (r1 tm))))" +
		"		    ((_ (cd => r1) c1 c2 ...)" +
		"		      (let ((tm cd))" +
		"		        (if tm" +
		"		            (r1 tm)" +
		"		            (cond c1 c2 ...))))" +
		"		    ((_ (cd)) test)" +
		"		    ((_ (cd) c1 c2 ...)" +
		"		      (let ((tm cd))" +
		"		        (if tm tm (cond c1 c2 ...))))" +
		"		    ((_ (cd r1 r2 ...))" +
		"		      (if cd (begin r1 r2 ...)))" +
		"		    ((_ (cd r1 r2 ...) c1 c2 ...)" +
		"		      (if cd" +
		"		          (begin r1 r2 ...)" +
		"		          (cond c1 c2 ...)))))"
));
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax case" +
		"		  (syntax-rules (else)" +
		"		    ((case (key ...) cs ...)" +
		"		      (let ((ak (key ...)))" +
		"		        (case ak cs ...)))" +
		"		    ((case key (else r1 ...)) (begin r1 ...))" +
		"		    ((case key ((atoms ...) r1 ...))" +
		"		      (if (memv key '(atoms ...))" +
		"		          (begin r1 ...)))" +
		"		    ((case key ((atoms ...) r1 ...) cl ...)" +
		"		      (if (memv key '(atoms ...))" +
		"		          (begin r1 ...)" +
		"		          (case key cl ...)))))"
));
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax let" +
		"		  (syntax-rules ()" +
		"		    ((let ((name val) ...)) (if #f #f))" +
		"		    ((let ((name val) ...) body1 body2 ...)" +
		"		      ((lambda (name ...) body1 body2 ...)" +
		"		         val ...))" +
		"		    ((let tag ((name val) ...) body1 body2 ...)" +
		"		      ((let ((tag (if #f #f)))" +
		"		        (set! tag (lambda (name ...) body1 body2 ...))" +
		"		        tag) val ...))))"
));
$mille.macroenv.call('eval-macro', $mille.readString(
		"(define-syntax let*" +
		"		  (syntax-rules ()" +
		"		    ((_ () e1 ...)" +
		"		     (let () e1 ...))" +
		"		    ((_ ((x1 v1) (x2 v2) ...) e1 ...)" +
		"		     (let ((x1 v1))" +
		"		       (let* ((x2 v2) ...) e1 ...)))))"
));
$mille.eval = function($env, x) {
	var o;
	o = $mille.macroenv.call('eval-macro', x);
	return $mille.evalbas($env, o);
};
$env.bind('eval', $mille.closure($mille.genv, this, $mille.eval));
$env.bind('caar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))));}))
$env.bind('cadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))));}))
$env.bind('cdar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('car')  , $env.find('x')  ))));}))
$env.bind('cddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ))));}))
$env.bind('caaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('caar')  , $env.find('x')  ))));}))
$env.bind('caadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cadr')  , $env.find('x')  ))));}))
$env.bind('cadar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdar')  , $env.find('x')  ))));}))
$env.bind('caddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cddr')  , $env.find('x')  ))));}))
$env.bind('cdaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('caar')  , $env.find('x')  ))));}))
$env.bind('cdadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cadr')  , $env.find('x')  ))));}))
$env.bind('cddar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdar')  , $env.find('x')  ))));}))
$env.bind('cdddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cddr')  , $env.find('x')  ))));}))
$env.bind('caaaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('caaar')  , $env.find('x')  ))));}))
$env.bind('caaadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('caadr')  , $env.find('x')  ))));}))
$env.bind('caadar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cadar')  , $env.find('x')  ))));}))
$env.bind('caaddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('caddr')  , $env.find('x')  ))));}))
$env.bind('cadaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdaar')  , $env.find('x')  ))));}))
$env.bind('cadadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdadr')  , $env.find('x')  ))));}))
$env.bind('caddar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cddar')  , $env.find('x')  ))));}))
$env.bind('cadddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('car')  ,$mille.apply( $env.find('cdddr')  , $env.find('x')  ))));}))
$env.bind('cdaaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('caaar')  , $env.find('x')  ))));}))
$env.bind('cdaadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('caadr')  , $env.find('x')  ))));}))
$env.bind('cdadar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cadar')  , $env.find('x')  ))));}))
$env.bind('cdaddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('caddr')  , $env.find('x')  ))));}))
$env.bind('cddaar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdaar')  , $env.find('x')  ))));}))
$env.bind('cddadr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdadr')  , $env.find('x')  ))));}))
$env.bind('cdddar', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cddar')  , $env.find('x')  ))));}))
$env.bind('cddddr', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply( $env.find('cdr')  ,$mille.apply( $env.find('cdddr')  , $env.find('x')  ))));}))
$env.bind('not', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(( $env.find('x')  )===false) ?  false  :  true )));}))
$env.bind('boolean?', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#1', a0 === undefined ? null : a0);return (((!(( $env.find('#1')  )===false) ?  $env.find('#1')   : $mille.apply( $env.find('eq?')  , $env.find('x')  , false ))));}),$mille.apply( $env.find('eq?')  , $env.find('x')  , true ))));}))
$env.bind('pair?', $mille.closure($env, this, function($env,a0) {$env.bind('x', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('x')  ))===false) ?  false  : (!(($mille.apply( $env.find('atom?')  , $env.find('x')  ))===false) ?  false  :  true ))));}))
//$env.bind('equal?', $mille.closure($env, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);return (($env.bind('vector-equal?', $mille.closure($env, this, function($env,a0,a1,a2) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('y', a1 === undefined ? null : a1);$env.bind('i', a2 === undefined ? null : a2);return (((!(($mille.apply( $env.find('=')  ,$mille.apply( $env.find('vector-length')  , $env.find('x')  ), $env.find('i')  ))===false) ? (( true )) : (!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('equal?')  ,$mille.apply( $env.find('vector-ref')  , $env.find('x')  , $env.find('i')  ),$mille.apply( $env.find('vector-ref')  , $env.find('y')  , $env.find('i')  ))))===false) ? (( false )) : (($mille.apply( $env.find('vector-equal?')  , $env.find('x')  , $env.find('y')  ,$mille.apply( $env.find('+')  , $env.find('i')  , 1.0 ))))))));}))),((!(($mille.apply( $env.find('eqv?')  , $env.find('x')  , $env.find('y')  ))===false) ? (( true )) : (!(($mille.apply( $env.find('pair?')  , $env.find('x')  ))===false) ? (((!(($mille.apply( $env.find('pair?')  , $env.find('y')  ))===false) ? (!(($mille.apply( $env.find('equal?')  ,$mille.apply( $env.find('car')  , $env.find('x')  ),$mille.apply( $env.find('car')  , $env.find('y')  )))===false) ? $mille.apply( $env.find('equal?')  ,$mille.apply( $env.find('cdr')  , $env.find('x')  ),$mille.apply( $env.find('cdr')  , $env.find('y')  )) :  false ) :  false ))) : (!(($mille.apply( $env.find('string?')  , $env.find('x')  ))===false) ? (((!(($mille.apply( $env.find('string?')  , $env.find('y')  ))===false) ? $mille.apply( $env.find('string=?')  , $env.find('x')  , $env.find('y')  ) :  false ))) : (!(($mille.apply( $env.find('vector?')  , $env.find('x')  ))===false) ? (((!(($mille.apply( $env.find('vector?')  , $env.find('y')  ))===false) ? (!(($mille.apply( $env.find('=')  ,$mille.apply( $env.find('vector-length')  , $env.find('x')  ),$mille.apply( $env.find('vector-length')  , $env.find('y')  )))===false) ? $mille.apply( $env.find('vector-equal?')  , $env.find('x')  , $env.find('y')  , 0.0 ) :  false ) :  false ))) : (( false ))))))));}))
$env.bind('member', $mille.closure($env, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('lis', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('lis')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('equal?')  , $env.find('x')  ,$mille.apply( $env.find('car')  , $env.find('lis')  )))===false) ? (( $env.find('lis')  )) : (($mille.apply( $env.find('member')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('lis')  ))))))));}))
$env.bind('assq', $mille.closure($env, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('lis', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('lis')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('lis')  ))))===false) ? (($mille.apply( $env.find('error')  ,$mille.apply( $env.find('get-default-message')  , "err.require.pair" )))) : (!(($mille.apply( $env.find('eq?')  ,$mille.apply( $env.find('caar')  , $env.find('lis')  ), $env.find('x')  ))===false) ? (($mille.apply( $env.find('car')  , $env.find('lis')  ))) : (($mille.apply( $env.find('assq')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('lis')  )))))))));}))
$env.bind('assv', $mille.closure($env, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('lis', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('lis')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('lis')  ))))===false) ? (($mille.apply( $env.find('error')  ,$mille.apply( $env.find('get-default-message')  , "err.require.pair" )))) : (!(($mille.apply( $env.find('eqv?')  ,$mille.apply( $env.find('caar')  , $env.find('lis')  ), $env.find('x')  ))===false) ? (($mille.apply( $env.find('car')  , $env.find('lis')  ))) : (($mille.apply( $env.find('assv')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('lis')  )))))))));}))
$env.bind('assoc', $mille.closure($env, this, function($env,a0,a1) {$env.bind('x', a0 === undefined ? null : a0);$env.bind('lis', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('lis')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('pair?')  ,$mille.apply( $env.find('car')  , $env.find('lis')  ))))===false) ? (($mille.apply( $env.find('error')  ,$mille.apply( $env.find('get-default-message')  , "err.require.pair" )))) : (!(($mille.apply( $env.find('equal?')  ,$mille.apply( $env.find('caar')  , $env.find('lis')  ), $env.find('x')  ))===false) ? (($mille.apply( $env.find('car')  , $env.find('lis')  ))) : (($mille.apply( $env.find('assoc')  , $env.find('x')  ,$mille.apply( $env.find('cdr')  , $env.find('lis')  )))))))));}))
$env.bind('list', $mille.closure($env, this, function($env) {var a = $mille.a.toArray(arguments,1);$env.bind('l',$mille.listToCell(a));return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#2', a0 === undefined ? null : a0);return ((($env.set('#2',$mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#3')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('#3')  ),$mille.apply( $env.find('#2')  ,$mille.apply( $env.find('cdr')  , $env.find('#3')  ))))));})), undefined)),( $env.find('#2')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l')  )));}))
$env.bind('length', $mille.closure($env, this, function($env,a0) {$env.bind('l', a0 === undefined ? null : a0);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return ((($env.set('#3',$mille.closure($env, this, function($env,a0,a1) {$env.bind('#4', a0 === undefined ? null : a0);$env.bind('#5', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('#4')  ))===false) ?  $env.find('#5')   : $mille.apply( $env.find('#3')  ,$mille.apply( $env.find('cdr')  , $env.find('#4')  ),$mille.apply( $env.find('1+')  , $env.find('#5')  )))));})), undefined)),( $env.find('#3')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l')  , 0.0 )));}))
$env.bind('list-ref', $mille.closure($env, this, function($env,a0,a1) {$env.bind('l', a0 === undefined ? null : a0);$env.bind('n', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('<')  , $env.find('n')  , 0.0 ))===false) ? $mille.apply( $env.find('error')  , "list-ref" ) : undefined)),((!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('pair?')  , $env.find('l')  )))===false) ? (($mille.apply( $env.find('error')  , "list-ref" ))) : (!(($mille.apply( $env.find('<=')  , $env.find('n')  , 0.0 ))===false) ? (($mille.apply( $env.find('car')  , $env.find('l')  ))) : (($mille.apply( $env.find('list-ref')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ),$mille.apply( $env.find('-')  , $env.find('n')  , 1.0 ))))))));}))
$env.bind('list-tail', $mille.closure($env, this, function($env,a0,a1) {$env.bind('l', a0 === undefined ? null : a0);$env.bind('n', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('<')  , $env.find('n')  , 0.0 ))===false) ? $mille.apply( $env.find('error')  , "list-tail" ) : undefined)),((!(($mille.apply( $env.find('<=')  , $env.find('n')  , 0.0 ))===false) ? (( $env.find('l')  )) : (!(($mille.apply( $env.find('not')  ,$mille.apply( $env.find('pair?')  , $env.find('l')  )))===false) ? (($mille.apply( $env.find('error')  , "list-tail" ))) : (($mille.apply( $env.find('list-tail')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ),$mille.apply( $env.find('-')  , $env.find('n')  , 1.0 ))))))));}))
//$env.bind('list->string', $mille.closure($env, this, function($env,a0) {$env.bind('l', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('l')  ))===false) ? (( "" )) : (($mille.apply( $env.find('string-append')  ,$mille.apply( $env.find('->string')  ,$mille.apply( $env.find('car')  , $env.find('l')  )),$mille.apply( $env.find('list->string')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ))))))));}))
$env.bind('append', $mille.closure($env, this, function($env) {var a = $mille.a.toArray(arguments,1);$env.bind('l',$mille.listToCell(a));return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#2', a0 === undefined ? null : a0);return ((($env.set('#2',$mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#3')  ))===false) ? (( $mille.nil )) : (!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('cdr')  , $env.find('#3')  )))===false) ? (($mille.apply( $env.find('car')  , $env.find('#3')  ))) : (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#5', a0 === undefined ? null : a0);return ((($env.set('#5',$mille.closure($env, this, function($env,a0) {$env.bind('#6', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#6')  ))===false) ? $mille.apply( $env.find('#2')  ,$mille.apply( $env.find('cdr')  , $env.find('#3')  )) : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('#6')  ),$mille.apply( $env.find('#5')  ,$mille.apply( $env.find('cdr')  , $env.find('#6')  ))))));})), undefined)),( $env.find('#5')  ));}),(!(( false )===false) ?  false  : undefined)),$mille.apply( $env.find('car')  , $env.find('#3')  ))))))));})), undefined)),( $env.find('#2')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l')  )));}))
$env.bind('reverse', $mille.closure($env, this, function($env,a0) {$env.bind('l', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('pair?')  , $env.find('l')  ))===false) ? $mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return ((($env.set('#3',$mille.closure($env, this, function($env,a0,a1) {$env.bind('#4', a0 === undefined ? null : a0);$env.bind('#5', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('#4')  ))===false) ?  $env.find('#5')   : $mille.apply( $env.find('#3')  ,$mille.apply( $env.find('cdr')  , $env.find('#4')  ),$mille.apply( $env.find('cons')  ,$mille.apply( $env.find('car')  , $env.find('#4')  ), $env.find('#5')  )))));})), undefined)),( $env.find('#3')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l')  , $mille.nil ) :  $env.find('l')  )));}))
$env.bind('memq', $mille.closure($env, this, function($env,a0,a1) {$env.bind('o', a0 === undefined ? null : a0);$env.bind('l', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('l')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('eq?')  , $env.find('o')  ,$mille.apply( $env.find('car')  , $env.find('l')  )))===false) ? (( $env.find('l')  )) : (($mille.apply( $env.find('memq')  , $env.find('o')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ))))))));}))
$env.bind('memv', $mille.closure($env, this, function($env,a0,a1) {$env.bind('o', a0 === undefined ? null : a0);$env.bind('l', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('l')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('eqv?')  , $env.find('o')  ,$mille.apply( $env.find('car')  , $env.find('l')  )))===false) ? (( $env.find('l')  )) : (($mille.apply( $env.find('memq')  , $env.find('o')  ,$mille.apply( $env.find('cdr')  , $env.find('l')  ))))))));}))
$env.bind('list?', $mille.closure($env, this, function($env,a0) {$env.bind('l', a0 === undefined ? null : a0);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return ((($env.set('#3',$mille.closure($env, this, function($env,a0,a1) {$env.bind('#4', a0 === undefined ? null : a0);$env.bind('#5', a1 === undefined ? null : a1);return (((!(($mille.apply( $env.find('null?')  , $env.find('#4')  ))===false) ? (( true )) : (!(($mille.apply( $env.find('memq')  , $env.find('#4')  , $env.find('#5')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('pair?')  , $env.find('#4')  ))===false) ? (($mille.apply( $env.find('#3')  ,$mille.apply( $env.find('cdr')  , $env.find('#4')  ),$mille.apply( $env.find('cons')  , $env.find('#4')  , $env.find('#5')  )))) : (( false )))))));})), undefined)),( $env.find('#3')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l')  , $mille.nil )));}))
$env.bind('map', $mille.closure($env, this, function($env,a0) {$env.bind('p', a0 === undefined ? null : a0);var a = $mille.a.toArray(arguments,2);$env.bind('l1',$mille.listToCell(a));return (($env.bind('cx', $mille.closure($env, this, function($env,a0,a1) {$env.bind('p', a0 === undefined ? null : a0);$env.bind('l2', a1 === undefined ? null : a1);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#2', a0 === undefined ? null : a0);return ((($env.set('#2',$mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#3')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('p')  ,$mille.apply( $env.find('car')  , $env.find('#3')  )),$mille.apply( $env.find('#2')  ,$mille.apply( $env.find('cdr')  , $env.find('#3')  ))))));})), undefined)),( $env.find('#2')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l2')  )));}))),($env.bind('n?', $mille.closure($env, this, function($env,a0) {$env.bind('l2', a0 === undefined ? null : a0);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#5', a0 === undefined ? null : a0);return ((($env.set('#5',$mille.closure($env, this, function($env,a0) {$env.bind('#6', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#6')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('car')  , $env.find('#6')  )))===false) ? (( true )) : (($mille.apply( $env.find('#5')  ,$mille.apply( $env.find('cdr')  , $env.find('#6')  ))))))));})), undefined)),( $env.find('#5')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l2')  )));}))),($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#8', a0 === undefined ? null : a0);return ((($env.set('#8',$mille.closure($env, this, function($env,a0) {$env.bind('#9', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('n?')  , $env.find('#9')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('apply')  , $env.find('p')  ,$mille.apply( $env.find('cx')  , $env.find('car')  , $env.find('#9')  )),$mille.apply( $env.find('#8')  ,$mille.apply( $env.find('cx')  , $env.find('cdr')  , $env.find('#9')  ))))));})), undefined)),( $env.find('#8')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l1')  )));}))
$env.bind('for-each', $mille.closure($env, this, function($env,a0) {$env.bind('p', a0 === undefined ? null : a0);var a = $mille.a.toArray(arguments,2);$env.bind('l1',$mille.listToCell(a));return (($env.bind('cx', $mille.closure($env, this, function($env,a0,a1) {$env.bind('p', a0 === undefined ? null : a0);$env.bind('l2', a1 === undefined ? null : a1);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#2', a0 === undefined ? null : a0);return ((($env.set('#2',$mille.closure($env, this, function($env,a0) {$env.bind('#3', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#3')  ))===false) ?  $mille.nil  : $mille.apply( $env.find('cons')  ,$mille.apply( $env.find('p')  ,$mille.apply( $env.find('car')  , $env.find('#3')  )),$mille.apply( $env.find('#2')  ,$mille.apply( $env.find('cdr')  , $env.find('#3')  ))))));})), undefined)),( $env.find('#2')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l2')  )));}))),($env.bind('n?', $mille.closure($env, this, function($env,a0) {$env.bind('l2', a0 === undefined ? null : a0);return (($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#5', a0 === undefined ? null : a0);return ((($env.set('#5',$mille.closure($env, this, function($env,a0) {$env.bind('#6', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('null?')  , $env.find('#6')  ))===false) ? (( false )) : (!(($mille.apply( $env.find('null?')  ,$mille.apply( $env.find('car')  , $env.find('#6')  )))===false) ? (( true )) : (($mille.apply( $env.find('#5')  ,$mille.apply( $env.find('cdr')  , $env.find('#6')  ))))))));})), undefined)),( $env.find('#5')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l2')  )));}))),($mille.apply($mille.apply($mille.closure($env, this, function($env,a0) {$env.bind('#8', a0 === undefined ? null : a0);return ((($env.set('#8',$mille.closure($env, this, function($env,a0) {$env.bind('#9', a0 === undefined ? null : a0);return (((!(($mille.apply( $env.find('n?')  , $env.find('#9')  ))===false) ?  $mille.nil  : (($mille.apply( $env.find('apply')  , $env.find('p')  ,$mille.apply( $env.find('cx')  , $env.find('car')  , $env.find('#9')  ))),($mille.apply( $env.find('#8')  ,$mille.apply( $env.find('cx')  , $env.find('cdr')  , $env.find('#9')  )))))));})), undefined)),( $env.find('#8')  ));}),(!(( false )===false) ?  false  : undefined)), $env.find('l1')  )));}))
/*
 * Copyright 2014-2015 Yuichiro Moriguchi
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
if(!$mille) {
	throw 'Mille core library required';
}

$mille.w = {};
$mille.w.ajax = function(options) {
	var xhr, conv, ct;
	xhr = new XMLHttpRequest();
	conv = function() {
		if(options.dataXML) {
			return xhr.responseXML;
		} else {
			return xhr.responseText;
		}
	};
	xhr.onreadystatechange = function() {
		var t;
		if(xhr.readyState === 4) {
			if(xhr.status === 200) { // OK
				t = conv();
				options.success(t);
			} else {
				options.error(xhr, xhr.status, false);
			}
			options.complete(xhr, xhr.status, false);
		}
	};

	try {
		xhr.open(options.type, options.url);
		if(options.type === 'GET') {
			xhr.send();
		} else {
			ct = options.contentType ?
					options.contentType : 'application/x-www-form-urlencoded';
			xhr.setRequestHeader('Content-Type', ct);
			xhr.send(options.data);
		}
	} catch(e) {
		options.error(xhr, false, e);
		options.complete(xhr, null);
	}
	return true;
};

$mille.ajaxAny = function(url, success, error, type, parser, data) {
	var opts = {};

	opts.type = type;
	opts.url = url;
	opts.success = function(t) {
		var o = parser(t);
		success(o);
	};
	opts.error = error;
	opts.data = data;
	$mille.w.ajax(opts);
};
$mille.ajaxGet = function(url, success, error) {
	$mille.checkString(url);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'GET', $mille.readString);
};
$mille.ajaxGetText = function(url, success, error) {
	$mille.checkString(url);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'GET', $mille.f.K);
};
$mille.ajaxPost = function(url, data, success, error) {
	$mille.checkString(url);
	$mille.checkString(data);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'POST', $mille.readString, data);
};
$mille.ajaxPostText = function(url, data, success, error) {
	$mille.checkString(url);
	$mille.checkString(data);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'POST', $mille.f.K, data);
};

$mille.bindg('ajax-get', $mille.ajaxGet);
$mille.bindg('ajax-get-text', $mille.ajaxGetText);
$mille.bindg('ajax-post', $mille.ajaxPost);
$mille.bindg('ajax-post-text', $mille.ajaxPostText);

$mille.readMilia = function() {
	var x, i, j, p;
	x = document.getElementsByTagName("script");
	for(i = 0; i < x.length; i++) {
		if(x[i].type === 'text/x-schluessel-milia') {
			p = $mille.readStringAll(x[i].text);
			for(j = 0; j < p.length; j++) {
				$mille.eval($env, p[j]);
			}
		}
	}
};
if(window.addEventListener) {
    window.addEventListener('load', $mille.readMilia, false);
} else if(window.attachEvent) {
    window.attachEvent('onload', $mille.readMilia);
} else {
    window.onload = $mille.readMilia;
}
