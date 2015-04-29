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
	var v, r;
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
	var a, b, c, d;
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
}
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
}
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
	}
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
	var i, v, c, p, ret;
	$mille.checkString(s);
	for(i = 0; i < s.length; i++) {
		v = s.charCodeAt(i);
		c = $mille.cons(v, $mille.nil)
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
$mille.checkSymbol = function(x) {
	$mille.checkSymbol(x);
};
$mille.stringToSymbol = function(x) {
	$mille.checkString(x);
	return $mille.getSymbol(x);
};
$mille.symbolToSymbol = function(x) {
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
}
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
}
$mille.objectValues = function(o) {
	$mille.checkObject(o);
	return $mille.listToCell($mille.o.values(o));
}
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
}

$mille.isEqual = function(o, p) {
	var i, v;
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
}
$mille.charUpcase = function(c) {
	var x;
	$mille.checkCharacter(c);
	x = String.fromCharCode(c);
	x = x.toUpperCase();
	return x.charCodeAt(0);
}
$mille.charDowncase = function(c) {
	var x;
	$mille.checkCharacter(c);
	x = String.fromCharCode(c);
	x = x.toUpperCase();
	return x.charCodeAt(0);
}
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
}
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
	return !o
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
$mille.bindg('equal?', $mille.isEqual);

$mille.bindg('read-string', $mille.readString);
$env = $mille.genv;
