/*
 * Copyright (c) 2015, Yuichiro MORIGUCHI
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * * Neither the name of the Yuichiro MORIGUCHI nor the names of its contributors 
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Yuichiro MORIGUCHI BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var $mille = {};
var $env;

if(!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if(typeof this !== 'function') {
			throw 'Function.prototype.bind - what is trying to be bound is not callable';
	    }
		var aArgs, fToBind, fNOP, fBound;
		aArgs = Array.prototype.slice.call(arguments, 1),
		fToBind = this,
		fNOP    = function() {},
		fBound  = function() {
			return fToBind.apply(this instanceof fNOP ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
		};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}

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
Datum.prototype.keywordToString = function() {
	return ':' + this.name;
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

(function(M) {
	M.a = {};
	M.a.toArray = function(o) {
		var l, k, r;
		l = arguments.length > 1 ? arguments[1] : 0;
		r = arguments.length > 2 ? arguments[2].concat() : [];
		for(k = l; k < o.length; k += 1) {
			r.push(o[k]);
		}
		return r;
	};
	M.a.isArray = function(o) {
		return (o &&
				typeof o === 'object' &&
				o.constructor === Array);
	};
	M.a.fold = function(f, a, seed) {
		var k, r;
		r = seed;
		for(k = 0; k < a.length; k += 1) {
			r = f(a[k], r);
		}
		return r;
	};

	M.o = {};
	M.o.isFunction = function(o) {
		return (typeof o === 'function');
	};
	M.o.isString = function(o) {
		return (typeof o === 'string');
	};
	M.o.isNumber = function(o) {
		return (typeof o === 'number');
	};
	M.o.isInteger = function(o) {
		return (typeof o === 'number' &&
				isFinite(o) &&
				o > -9007199254740992 &&
				o < 9007199254740992 &&
				Math.floor(o) === o);
	};
	M.o.isObject = function(o) {
		return (o instanceof Object && !(o instanceof Array));
	};
	M.o.isRegex = function(o) {
		return o instanceof RegExp;
	};
	M.o.hasProperty = function(o) {
		return o instanceof Object;
	};
	M.o.error = function(e) {
		throw e;
	};
	M.o.mapEntries = function(o, f) {
		var v = null, r;
		r = [];
		for(v in o) {
			if(o.hasOwnProperty(v)) {
				r.push(f(v, o[v]));
			}
		}
		return r;
	};
	M.o.keys = function(o) {
		return M.o.mapEntries(o, function(k, v) {
			return k;
		});
	};
	M.o.values = function(o) {
		return M.o.mapEntries(o, function(k, v) {
			return v;
		});
	};
	M.o.entries = function(o) {
		return M.o.mapEntries(o, function(k, v) {
			return {
				key: k,
				value: v
			};
		});
	};

	M.r = {};
	M.r.isNaN = function(o) {
		return o !== o;
	};
	M.r.isFinite = function(o) {
		return isFinite(o);
	};
	M.r.isInfinite = function(o) {
		return o === Infinity || o === -Infinity;
	};
	M.r.hypot = function(x, y) {
		return Math.sqrt(x * x + y * y);
	};
	M.r.sinh = function(x) {
		return (Math.exp(x) - Math.exp(-x)) / 2;
	};
	M.r.cosh = function(x) {
		return (Math.exp(x) + Math.exp(-x)) / 2;
	};
	M.r.tanh = function(x) {
		return M.r.sinh(x) / M.r.cosh(x);
	};
	M.r.gcd = function(x, y) {
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

	M.f = {};
	M.f.K = function(x) {
		return x;
	};

	M.c = {};
	M.c.make = function(re, im) {
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
			return M.r.hypot(re, im);
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
			return M.r.isNaN(re) || M.r.isNaN(im);
		};
		that.isZero = function() {
			return iszero();
		};
		that.isOne = function() {
			return re === 1.0 && im === 0.0;
		};
		that.add = function(x) {
			return M.c.make(re + x.getReal(), im + x.getImag());
		};
		that.subtract = function(x) {
			return M.c.make(re - x.getReal(), im - x.getImag());
		};
		that.multiply = function(x) {
			return M.c.make(
					re * x.getReal() - im * x.getImag(),
					re * x.getImag() + im * x.getReal());
		};
		that.divide = function(x) {
			var mg;
			if(x.isZero()) {
				return M.c.make(NaN, NaN);
			} else {
				mg = x.getMagnitude2();
				return M.c.make(
						(re * x.getReal() + im * x.getImag()) / mg,
						(im * x.getReal() - re * x.getImag()) / mg);
			}
		};
		that.equals = function(x) {
			return re === x.getReal() && im === x.getImag();
		};
		that.exp = function() {
			return M.c.make(
					Math.exp(re) * Math.cos(b),
					Math.exp(re) * Math.sin(b));
		};
		that.log = function() {
			var r, t;
			if(iszero()) {
				return M.c.make(-Infinity, -Math.PI / 2);
			} else {
				r = M.r.hypot(re, im);
				t = Math.atan2(im, re);
				return M.c.make(Math.log(r), t);
			}
		};
		that.sin = function() {
			var a, b;
			if(re === 0.0) {
				return M.c.make(0.0, M.r.sinh(im));
			} else {
				a = Math.sin(re) * M.r.cosh(im);
				b = Math.cos(re) * M.r.sinh(im);
				return M.c.make(a, b);
			}
		};
		that.cos = function() {
			var a, b;
			if(re === 0.0) {
				return M.c.make(M.r.cosh(im), 0.0);
			} else {
				a = Math.cos(re) * M.r.cosh(im);
				b = -(Math.sin(re) * M.r.sinh(im));
				return M.c.make(a, b);
			}
		};
		that.tan = function() {
			var nm, dn;
			if(re === 0.0) {
				return M.c.make(0.0, M.r.tanh(im));
			} else if(im === Infinity) {
				nm = M.c.make(Math.tan(re), 1);
				dn = M.c.make(1, Math.tan(re));
				return nm.divide(dn);
			} else if(im === -Infinity) {
				nm = M.c.make(Math.tan(re), -1);
				dn = M.c.make(-1, -Math.tan(re));
				return nm.divide(dn);
			} else {
				return that.sin().div(that.cos());
			}
		};
		that.expt = function(z) {
			var r1, t1, rr, tr;
			if(iszero()) {
				return M.c.make(0, 0);
			} else if(z.isZero()) {
				return M.c.make(1, 0);
			} else if(that.isOne()) {
				return M.c.make(1, 0);
			} else if(z.isOne()) {
				return that;
			} else {
				r1 = M.r.hypot(re, im);
				t1 = Math.atan2(im, re);
				rr = z.getReal() * Math.log(r1) - t1 * z.getImag();
				tr = z.getImag() * Math.log(r1) + t1 * z.getReal();
				return M.c.make(
						Math.exp(rr) * Math.cos(tr),
						Math.exp(rr) * Math.sin(tr));
			}
		};
		that.sqrt = function() {
			if(re >= 0 && im === 0.0) {
				return M.c.make(Math.sqrt(re), 0,0);
			} else {
				return that.expt(M.c.make(0.5, 0));
			}
		};
		that.asin = function() {
			var z1, z2, z3;
			if(im === 0.0 && re >= -1.0 && re <= 1.0) {
				return M.c.make(Math.asin(re), 0.0);
			} else if(re === Infinity) {
				if(y <= 0) {
					return M.c.make(Math.PI / 2, re);
				} else {
					return M.c.make(Math.PI / 2, -re);
				}
			} else if(re === -Infinity) {
				if(y <= 0) {
					return M.c.make(-Math.PI / 2, re);
				} else {
					return M.c.make(-Math.PI / 2, -re);
				}
			} else if(im === Infinity || im === -Infinity) {
				return M.c.make(0, im);
			} else {
				z1 = M.c.I.multiply(that);
				z2 = M.c.ONE.subtract(that.multiply(that)).sqrt();
				z3 = z1.add(z2).log();
				return M.c.make(z3.getImag(), -z3.getReal());
			}
		};
		that.acos = function() {
			if(im === 0.0 && x >= -1.0 && x <= 1.0) {
				return M.c.make(Math.acos(x), 0);
			} else {
				return M.c.HALFPI.subtract(that.asin());
			}
		};
		that.atan = function() {
			var z1, z2, z3;
			if(im === 0.0) {
				return M.c.make(Math.atan(re), 0.0);
			} else if(im === Infinity || im === -Infinity) {
				if(re === Infinity || re === -Infinity) {
					return M.c.NaN;
				} else if(im > 0) {
					return M.c.make(Math.PI / 2);
				} else {
					return M.c.make(-Math.PI / 2);
				}
			} else if(re === 0.0 && im === 1.0) {
				return M.c.make(0, Infinity);
			} else if(re === 0.0 && im === -1.0) {
				return M.c.make(0, -Infinity);
			} else {
				z1 = M.c.ONE.add(M.c.I.multiply(that));
				z2 = M.c.ONE.subtract(M.c.I.multiply(that));
				z3 = z1.log().subtract(z2.log());
				return z3.divide(M.c.TWO_I);
			}
		};
		return that;
	};
	M.c.HALFPI = M.c.make(Math.PI / 2);
	M.c.TWO_I = M.c.make(0, 2);
	M.c.ZERO = M.c.make(0, 0);
	M.c.ONE = M.c.make(1, 0);
	M.c.I = M.c.make(0, 1);
	M.c.NaN = M.c.make(NaN, NaN);
	M.c.isComplex = function(o) {
		return M.datumTypeOf(o, 'complex');
	};
	M.c.toComplex = function(o) {
		if(M.o.isNumber(o)) {
			return M.c.make(o, 0);
		} else {
			return o;
		}
	};
	M.c.equals = function(z, w) {
		if(M.o.isComplex(z) && M.o.isComplex(w)) {
			return (z.getReal() == w.getReal() &&
					z.getImag() == w.getImag());
		} else {
			return z === w;
		}
	};
	M.c.isNaN = function(o) {
		if(M.o.isNumber(o)) {
			return M.r.isNaN(o);
		} else if(M.c.isComplex(o)) {
			return (M.r.isNaN(o.getReal()) ||
					M.r.isNaN(o.getImag()));
		} else {
			return false;
		}
	};
	M.c.isFinite = function(o) {
		if(M.o.isNumber(o)) {
			return M.r.isFinite(o);
		} else if(M.c.isComplex(o)) {
			return (M.r.isFinite(o.getReal()) &&
					M.r.isFinite(o.getImag()));
		} else {
			return false;
		}
	};
	M.c.isInfinite = function(o) {
		if(M.o.isNumber(o)) {
			return M.r.isInfinite(o);
		} else if(M.c.isComplex(o)) {
			return (M.r.isInfinite(o.getReal()) ||
					M.r.isInfinite(o.getImag()));
		} else {
			return false;
		}
	};
	M.c.getReal = function(z) {
		return M.o.isNumber(z) ? z : z.getReal();
	};
	M.c.getImag = function(z) {
		return M.o.isNumber(z) ? 0 : z.getImag();
	};
	M.c.magnitude = function(z) {
		return M.o.isNumber(z) ? Math.abs(z) : z.getMagnitude();
	};
	M.c.angle = function(z) {
		if(!M.o.isNumber(z)) {
			return z.getAngle();
		} else if(z >= 0) {
			return 0;
		} else {
			return Math.PI;
		}
	};
	M.c.add = function(z, w) {
		var o, p;
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return z + w;
		}
		o = M.c.toComplex(z);
		p = M.c.toComplex(w);
		return o.add(p);
	};
	M.c.subtract = function(z, w) {
		var o, p;
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return z - w;
		}
		o = M.c.toComplex(z);
		p = M.c.toComplex(w);
		return o.subtract(p);
	};
	M.c.multiply = function(z, w) {
		var o, p;
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return z * w;
		}
		o = M.c.toComplex(z);
		p = M.c.toComplex(w);
		return o.multiply(p);
	};
	M.c.divide = function(z, w) {
		var o, p;
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return z / w;
		}
		o = M.c.toComplex(z);
		p = M.c.toComplex(w);
		return o.divide(p);
	};
	M.c.equals = function(z, w) {
		var o, p;
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return z === w;
		}
		o = M.c.toComplex(z);
		p = M.c.toComplex(w);
		return o.equals(p);
	};
	M.c.notEquals = function(z, w) {
		return !M.c.equals(z, w);
	};
	M.c.exp = function(z) {
		if(M.o.isNumber(z)) {
			return Math.exp(z);
		} else {
			return z.exp();
		}
	};
	M.c.log = function(z) {
		if(M.o.isNumber(z) && z > 0) {
			return Math.log(z);
		} else {
			return z.log();
		}
	};
	M.c.sin = function(z) {
		if(M.o.isNumber(z)) {
			return Math.sin(z);
		} else {
			return z.sin();
		}
	};
	M.c.cos = function(z) {
		if(M.o.isNumber(z)) {
			return Math.sin(z);
		} else {
			return z.cos();
		}
	};
	M.c.tan = function(z) {
		if(M.o.isNumber(z)) {
			return Math.tan(z);
		} else {
			return z.tan();
		}
	};
	M.c.expt = function(z, w) {
		if(M.o.isNumber(z) && M.o.isNumber(w)) {
			return Math.pow(z, w);
		} else {
			return z.expt(w);
		}
	};
	M.c.sqrt = function(z) {
		if(M.o.isNumber(z) && z >= 0.0) {
			return Math.sqrt(z);
		} else {
			return z.sqrt();
		}
	};
	M.c.asin = function(z) {
		if(M.o.isNumber(z) && z >= -1.0 && z <= 1.0) {
			return Math.asin(z);
		} else {
			return z.asin();
		}
	};
	M.c.acos = function(z) {
		if(M.o.isNumber(z) && z >= -1.0 && z <= 1.0) {
			return Math.acos(z);
		} else {
			return z.acos();
		}
	};
	M.c.atan = function(z) {
		if(M.o.isNumber(z)) {
			return Math.atan(z);
		} else {
			return z.atan();
		}
	};

	M.datumTypeOf = function(o, typ) {
		return ((o instanceof Datum) && o.typ() === typ);
	};

	M.createMemo = function() {
		return {
			index: [],
			value: []
		};
	};
	M.searchMemo = function(memo, o) {
		var i;
		for(i = 0; i < memo.index.length; i++) {
			if(memo.index[i] === o) {
				return memo.value[i];
			}
		}
		return undefined;
	};
	M.setMemo = function(memo, o, v) {
		var i;
		for(i = 0; i < memo.index.length; i++) {
			if(memo.index[i] === o) {
				memo.value[i] = v;
			}
		}
		memo.index.push(o);
		memo.value.push(v);
	};
	M.walkPair = function(that, memo, count) {
		var c, v = M.searchMemo(memo, that);
		if(v === -1) {
			M.setMemo(memo, that, count);
			return count + 1;
		} else if(v > 0) {
			return count;
		} else if(M.isPair(that)) {
			M.setMemo(memo, that, -1);
			c = M.walkPair(that.car, memo, count);
			c = M.walkPair(that.cdr, memo, c);
			return c;
		} else {
			return count;
		}
	};
	M.cellToString = function(that, memo, memoout) {
		var o = that, ret, i, v;
		if(M.isAtom(o)) {
			return o.toString();
		} else if(M.isNull(o)) {
			return '()';
		} else {
			v = M.searchMemo(memo, o);
			if(v === undefined || v === -1) {
				ret = '(';
			} else if(M.searchMemo(memoout, o)) {
				return '#' + v + '#';
			} else {
				M.setMemo(memoout, o, true);
				ret = '#' + v + '=(';
			}

			for(i = 0; true; i++) {
				if(M.isAtom(o)) {
					if(i > 0) {
						ret += ' ';
					}
					ret += '. ' + o.toString() + ')';
					return ret;
				} else if(M.isNull(o)) {
					ret += ')';
					return ret;
				} else {
					if(i > 0) {
						ret += ' ';
					}
					ret += M.cellToString(o.car, memo, memoout);
					o = o.cdr;
					if(M.searchMemo(memoout, o)) {
						ret += ' . #' + M.searchMemo(memo, o) + '#)';
						return ret;
					}
				}
			}
		}
	};
	Datum.prototype.cellToString = function() {
		var memo = M.createMemo(), memoout = M.createMemo();
		M.walkPair(this, memo, 1);
		return M.cellToString(this, memo, memoout);
	};

	M.cons = function(c, d) {
		var diese;
		diese = new Datum('cell');
		diese.car = c;
		diese.cdr = d;
		diese.isNull = function() {
			return diese.car === null;
		};
		return diese;
	};
	M.nil = M.cons(null, null);
	M.isNull = function(o) {
		return (M.datumTypeOf(o, 'cell') && o.isNull());
	};
	M.isPair = function(o) {
		return (M.datumTypeOf(o, 'cell') && !o.isNull());
	};
	M.isAtom = function(o) {
		return !M.datumTypeOf(o, 'cell');
	};
	M.car = function(o) {
		if(M.datumTypeOf(o, 'cell') && o.car !== null) {
			return o.car;
		} else {
			M.o.error('Not cons: ' + o);
		}
	};
	M.cdr = function(o) {
		if(M.datumTypeOf(o, 'cell') && o.cdr !== null) {
			return o.cdr;
		} else {
			M.o.error('Not cons: ' + o);
		}
	};
	M.setCar = function(o, x) {
		if(M.datumTypeOf(o, 'cell') && o.car !== null) {
			o.car = x;
			return undefined;
		} else {
			M.o.error('Not cons: ' + o);
		}
	};
	M.setCdr = function(o, x) {
		if(M.datumTypeOf(o, 'cell') && o.car !== null) {
			o.cdr = x;
			return undefined;
		} else {
			M.o.error('Not cons: ' + o);
		}
	};
	M.listToCell = function(o) {
		var k, c, d, r = undefined;

		if(!M.a.isArray(o)) {
			return o;
		} else if(o.length > 0) {
			for(k = 0; k < o.length; k += 1) {
				d = M.cons(M.listToCell(o[k]), M.nil);
				if(r === undefined) {
					r = d;
				} else {
					c.cdr = d;
				}
				c = d;
			}
			return r;
		} else {
			return M.nil;
		}
	};
	M.cellToList = function(l, notproper) {
		var a = [], p;

		p = notproper !== undefined ? notproper : function(l) {
			M.o.error('Not proper list: ' + l);
		};
		while(true) {
			if(!M.datumTypeOf(l, 'cell')) {
				return p(l);
			} else if(l.isNull()) {
				return a;
			} else {
				a.push(M.cellToList(l.car, function(l) { return l; }));
				l = l.cdr;
			}
		}
	};
	M.shallowCellToList = function(l, notproper) {
		var a = [], p;

		p = notproper !== undefined ? notproper : function(l) {
			M.o.error('Not proper list: ' + l);
		};
		while(true) {
			if(!M.datumTypeOf(l, 'cell')) {
				return p(l);
			} else if(l.isNull()) {
				return a;
			} else {
				a.push(l.car);
				l = l.cdr;
			}
		}
	};

	M.trampoline = function(f) {
		return new Trampoline(f);
	};
	M.closure = function(e, that, f) {
		return function() {
			var env = M.newenv(e, that);
			return f.apply(that, M.a.toArray(arguments, 0, [env]));
		};
	};
	M.applya = function(o, a, diese) {
		var ce = diese === undefined ? null : diese;
		if(M.o.isFunction(o)) {
			return o.apply(ce, a);
		}
	};
	M.apply = function(o, diese) {
		var a;
		a = M.a.toArray(arguments, 1);
		return M.applya(o, a, diese);
	};
	M.applyCell = function(o, l, diese) {
		var a;
		a = M.cellToList(l);
		return M.applya(o, a, diese);
	};
	M.newenv = function(e, that) {
		var diese = {}, vars = {}, findObjectChain, setObjectChain;
		findObjectChain = function(diese, a, n) {
			var r = diese, i, x;
			x = n === undefined ? 0 : n;
			for(i = x; i < a.length; i++) {
				if((r = r[a[i]]) === undefined) {
					return r;
				}
			}
			return r;
		};
		setObjectChain = function(diese, a, n) {
			var r = diese, i, x;
			x = n === undefined ? 0 : n;
			for(i = x; i < a.length - 1; i++) {
				if(!M.o.hasProperty(r = r[a[i]])) {
					return r;
				}
			}
			return r;
		};
		diese.find = function(v) {
			var x, a;
			a = v.split('.');
			if(vars['$' + a[0]] !== undefined) {
				return findObjectChain(vars['$' + a[0]], a, 1);
			} else if(e !== undefined && e !== null) {
				return e.find(v);
			} else {
				if((x = findObjectChain(that, a)) !== undefined) {
					return x;
				} else if((x = findObjectChain(
						M.global, a)) !== undefined) {
					return x;
				} else {
					M.o.error('Unbound: ' + v);
				}
			}
		};
		diese.bind = function(v, o) {
			vars['$' + v] = o;
		};
		diese.set = function(v, o) {
			var a, r, i;
			a = v.split('.');
			if(vars['$' + a[0]] !== undefined) {
				if(a.length === 1) {
					vars['$' + a[0]] = o;
				} else {
					r = setObjectChain(vars['$' + a[0]], a, 1);
					if(!M.o.hasProperty(r)) {
						M.o.error('Undefined Symbol ' + v);
					} else {
						r[a[a.length - 1]] = o;
					}
				}
			} else if(e !== undefined && e !== null) {
				e.set(v, o);
			} else if(M.o.hasProperty(r = setObjectChain(that, a))) {
				r[a[a.length - 1]] = o;
			} else if(M.o.hasProperty(r = setObjectChain(that, a))) {
				r[a[a.length - 1]] = o;
			} else {
				M.o.error('Undefined Symbol ' + v);
			}
		};
		diese.apply = function(v, a) {
			var x;
			x = diese.find(v);
			if(M.o.isFunction(x)) {
				return x.apply(null, a);
			} else {
				M.o.error('Found no functions');
			}
		};
		diese.applySymbol = function(v, a) {
			var pt = /(.+)\.([^.]+)/.exec(v), o, f;
			if(pt === null) {
				M.o.error('not object pattern');
			}
			o = diese.find(pt[1]);
			f = o[pt[2]];
			if(M.o.isFunction(f)) {
				return f.apply(o, a);
			} else {
				M.o.error('Found no functions');
			}
		};
		diese.call = function(v) {
			return diese.apply(v, M.a.toArray(arguments, 1));
		};
		diese.closure = function(f) {
			return M.closure(diese, that, f);
		};
		return diese;
	};
	M.applyObject = function(x, obj) {
		var f, z;
		if(M.o.isFunction(f = obj[x])) {
			z = f.apply(obj, M.a.toArray(arguments, 2));
			return z;
		} else {
			M.o.error('undefined property: ' + x);
		}
	};
	M.getGlobal = function() {
		M.global = this;
	};
	M.getGlobal();

	M.checkNumber = function(x) {
		if(!M.isComplex(x)) {
			M.o.error('the type of the object is not number:' + x);
		}
	};
	M.checkReal = function(x) {
		if(!M.o.isNumber(x)) {
			M.o.error('the type of the object is not real number:' + x);
		}
	};
	M.checkNonnegativeReal = function(x) {
		if(!M.o.isNumber(x) || x < 0) {
			M.o.error('the type of the object is not non-negative real number:' + x);
		}
	};
	M.checkInteger = function(x) {
		if(!M.o.isInteger(x)) {
			M.o.error('the type of the object is not integer:' + x);
		}
	};
	M.checkNaturalNumber = function(x, zero) {
		if(!M.o.isInteger(x) || x < zero) {
			M.o.error('the type of the object is not natural number:' + x);
		}
	};
	M.checkString = function(x) {
		if(!M.o.isString(x)) {
			M.o.error('the type of the object is not string:' + x);
		}
	};
	M.checkLength = function(x, l) {
		if(l < 0 || l >= x.length) {
			M.o.error('Argument out of range:' + l);
		}
	};
	M.checkVector = function(x) {
		if(!M.a.isArray(x)) {
			M.o.error('the type of the object is not vector:' + x);
		}
	};
	M.checkList = function(x) {
		if(!M.isPair(x) && !M.isNull(x)) {
			M.o.error('the type of the object is not list:' + x);
		}
	};
	M.checkInteger = function(x) {
		if(!M.o.isInteger(x)) {
			M.o.error('the type of the object is not integer:' + x);
		}
	};
	M.checkZero = function(x) {
		if(x === 0) {
			M.o.error('divide by zero');
		}
	};
	M.checkObject = function(x) {
		if(!M.o.isObject(x)) {
			M.o.error('the type of the object is not object:' + x);
		}
	};
	M.checkSymbol = function(x) {
		if(!M.datumTypeOf(x, 'symbol')) {
			M.o.error('the type of the object is not symbol:' + x);
		}
	};
	M.checkCharacter = function(x) {
		if(!M.o.isInteger(x) || x < 0 || x > 65535) {
			M.o.error('the type of the object is not character:' + x);
		}
	};
	M.checkFunction = function(x) {
		if(!M.o.isFunction(x)) {
			M.o.error('the type of the object is not function:' + x);
		}
	};
	M.checkPromise = function(x) {
		if(!M.datumTypeOf(x, 'promise')) {
			M.o.error('the type of the object is not promise:' + x);
		}
	};
	M.checkRegex = function(x) {
		if(!M.o.isRegex(x)) {
			M.o.error('the type of the object is not regexp:' + x);
		}
	};

	M.compare = function(f, check) {
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
	M.compareNumber = function(f) {
		return M.compare(f, M.checkReal);
	};
	M.eq = M.compare(function(x, y) { return x === y; });
	M.eqv = M.compare(function(x, y) {
		if(M.c.isComplex(x) && M.c.isComplex(y)) {
			return M.c.equals(x, y);
		} else {
			return x === y;
		}
	});
	M.arith1 = function(f, d) {
		return function() {
			var k, v = d;
			for(k = 0; k < arguments.length; k++) {
				M.checkNumber(arguments[k]);
				v = f(v, arguments[k]);
			}
			return v;
		};
	};
	M.arith2 = function(f, unary) {
		return function() {
			var k, v = undefined;
			if(arguments.length < 1) {
				M.o.error('Too few arguments');
			} else if(arguments.length === 1) {
				return unary(arguments[0]);
			} else {
				v = arguments[0];
				for(k = 1; k < arguments.length; k++) {
					M.checkNumber(arguments[k]);
					v = f(v, arguments[k]);
				}
			}
			return v;
		};
	};
	M.unary = function(f) {
		return function(x) {
			M.checkNumber(x);
			return f(x);
		};
	};

	M.substring = function(x, start, end) {
		M.checkString(x);
		M.checkInteger(start);
		M.checkInteger(end);
		return x.substring(start, end);
	};
	M.stringRef = function(x, k) {
		M.checkString(x);
		M.checkInteger(k);
		M.checkLength(x, k);
		return x.charCodeAt(k);
	};
	M.stringLength = function(x) {
		M.checkString(x);
		return x.length;
	};
	M.stringAppend = function() {
		var k, v = "";
		for(k = 0; k < arguments.length; k++) {
			//M.checkString(arguments[k]);
			v += arguments[k].toString();
		}
		return v;
	};
	M.isString = function(x) {
		return M.o.isString(x);
	};
	M.makeString = function(k, ch) {
		var c, i, ret = '';
		M.checkNaturalNumber(k, 0);
		if(ch !== undefined) {
			M.checkCharacter(ch);
		}
		c = String.fromCharCode(ch === undefined ? 32 : ch);
		for(i = 0; i < k; i++) {
			ret += c;
		}
		return ret;
	};
	M.string = function() {
		var i, ret = '';
		for(i = 0; i < arguments.length; i++) {
			M.checkCharacter(arguments[i]);
			ret += String.fromCharCode(arguments[i]);
		}
		return ret;
	};
	M.compareString = function(f) {
		return M.compare(f, M.checkString);
	};
	M.compareStringCi = function(f) {
		return M.compare(function(x, y) {
			var a = x.toUpperCase();
			var b = y.toUpperCase();
			return f(a, b);
		}, M.checkString);
	};
	M.stringToList = function(s) {
		var i, v, c, p, ret = undefined;
		M.checkString(s);
		for(i = 0; i < s.length; i++) {
			v = s.charCodeAt(i);
			c = M.cons(v, M.nil);
			if(ret === undefined) {
				ret = c;
			} else {
				p.cdr = c;
			}
			p = c;
		}
		return ret;
	};
	M.listToString = function(ls) {
		var i, v, ret = '';
		M.checkList(ls);
		v = M.cellToList(ls);
		for(i = 0; i < v.length; i++) {
			M.checkCharacter(v[i]);
			ret += String.fromCharCode(v[i]);
		}
		return ret;
	};

	M.symbols = {};
	M.getSymbol = function(s) {
		var v;
		v = M.symbols[s];
		if(v === undefined) {
			v = new Datum('symbol');
			v.name = s;
			M.symbols[s] = v;
		}
		return v;
	};
	M.isSymbol = function(o) {
		return M.datumTypeOf(o, 'symbol');
	};
	M.stringToSymbol = function(x) {
		M.checkString(x);
		return M.getSymbol(x);
	};
	M.symbolToString = function(x) {
		M.checkSymbol(x);
		return x.name;
	};

	M.keywords = {};
	M.getKeyword = function(s) {
		var v;
		v = M.keywords[s];
		if(v === undefined) {
			v = new Datum('keyword');
			v.name = s;
			M.keywords[s] = v;
		}
		return v;
	};
	M.isKeyword = function(o) {
		return M.datumTypeOf(o, 'keyword');
	};

	M.isVector = function(x) {
		return M.a.isArray(x);
	};
	M.makeVector = function(k, fill) {
		var r = [], i;
		for(i = 0; i < k; i++) {
			r.push(fill);
		}
		return r;
	};
	M.vector = function() {
		return M.a.toArray(arguments);
	};
	M.vectorLength = function(v) {
		M.checkVector(v);
		return v.length;
	};
	M.vectorRef = function(v, k) {
		M.checkVector(v);
		M.checkLength(v, k);
		return v[k];
	};
	M.vectorSet = function(v, k, o) {
		M.checkVector(v);
		M.checkLength(v, k);
		v[k] = o;
		return undefined;
	};
	M.vectorToList = function(v) {
		M.checkVector(v);
		return M.listToCell(v);
	};
	M.listToVector = function(l) {
		M.checkList(l);
		return M.cellToList(l);
	};
	M.vectorFill = function(v, fill) {
		var i;
		M.checkVector(v);
		for(i = 0; i < v.length; i++) {
			v[i] = fill;
		}
		return undefined;
	};

	M.numberToString = function(x) {
		M.checkNumber(x);
		return x.toString();
	};
	M.stringToNumber = function(x) {
		var p, r, a;
		M.checkString(x);
		p = /([\-+]?(?:[0-9]*\.[0-9]+|[0-9]+)(?:[eE][\-+]?[0-9]+)?)(?:([\-+](?:[0-9]*\.[0-9]+|[0-9]+)(?:[eE][\-+]?[0-9]+)?)i)?/;
		r = x.match(p);
		a = parseFloat(r[1]);
		if(r[0] === null) {
			return false;
		} else if(r[2] === undefined) {
			return a;
		} else {
			return M.c.make(a, parseFloat(r[2]));
		}
	};
	M.isProcedure = function(x) {
		return M.o.isFunction(x);
	};

	M.not = function(x) {
		return x === false ? true : false;
	};
	M.isBoolean = function(x) {
		return x === true || x === false;
	};

	M.isNumber = function(x) {
		return M.isComplex(x);
	};
	M.isReal = function(x) {
		return M.o.isNumber(x);
	};
	M.isInteger = function(x) {
		return M.o.isInteger(x);
	};
	M.isExact = function(x) {
		return M.o.isInteger(x);
	};
	M.isInexact = function(x) {
		return !M.isExact(x);
	};
	M.abs = function(x) {
		M.checkReal(x);
		return Math.abs(x);
	};
	M.quotient = function(x, y) {
		var n;
		M.checkInteger(x);
		M.checkInteger(y);
		M.checkZero(y);
		n = x / y;
		return n > 0 ? Math.floor(n) : Math.ceil(n);
	};
	M.remainder = function(x, y) {
		M.checkInteger(x);
		M.checkInteger(y);
		M.checkZero(y);
		return x % y;
	};
	M.modulo = function(x, y) {
		M.checkInteger(x);
		M.checkInteger(y);
		M.checkZero(y);
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
	M.gcd = function() {
		var a, i;
		if(arguments.length === 0) {
			return 0;
		} else {
			M.checkNumber(arguments[0]);
			a = arguments[0];
			for(i = 1; i < arguments.length; i++) {
				M.checkNumber(arguments[i]);
				a = M.r.gcd(a, arguments[i]);
			}
			return a;
		}
	};
	M.lcm = function() {
		var g, r = 1, i;
		g = M.gcd.apply(null, arguments);
		for(i = 0; i < arguments.length; i++) {
			r *= Math.abs(arguments[i]) / g;
		}
		return r * g;
	};
	M.floor = function(x) {
		M.checkReal(x);
		return Math.floor(x);
	};
	M.ceiling = function(x) {
		M.checkReal(x);
		return Math.ceil(x);
	};
	M.truncate = function(x) {
		M.checkReal(x);
		return x > 0 ? Math.floor(x) : Math.ceil(x);
	};
	M.round = function(x) {
		M.checkReal(x);
		return Math.round(x);
	};

	M.isObject = function(o) {
		return M.o.isObject(o);
	};
	M.objectRef = function(o, i) {
		M.checkObject(o);
		return o[i];
	};
	M.objectSet = function(o, i, x) {
		M.checkObject(o);
		o[i] = x;
		return undefined;
	};
	M.objectKeys = function(o) {
		M.checkObject(o);
		return M.listToCell(M.o.keys(o));
	};
	M.objectValues = function(o) {
		M.checkObject(o);
		return M.listToCell(M.o.values(o));
	};
	M.objectToList = function(o) {
		var a, i;
		if(M.a.isArray(o)) {
			a = [];
			for(i = 0; i < o.length; i++) {
				a[i] = M.objectToList(o[i]);
			}
			return M.listToCell(a);
		} else if(M.o.isObject(o)) {
			a = M.o.entries(o);
			for(i = 0; i < a.length; i++) {
				a[i] = M.cons(
						M.objectToList(a[i].key),
						M.objectToList(a[i].value));
			}
			return M.listToCell(a);
		} else {
			return o;
		}
	};

	M.isEqual = function(o, p) {
		var i, v = null;
		if(M.isPair(o)) {
			if(M.isPair(p)) {
				return (M.isEqual(o.car, p.car) &&
						M.isEqual(o.cdr, p.cdr));
			} else {
				return false;
			}
		} else if(M.isNull(o)) {
			return M.isNull(p);
		} else if(M.a.isArray(o)) {
			if(!M.a.isArray(p)) {
				return false;
			} else if(o.length !== p.length) {
				return false;
			} else {
				for(i = 0; i < o.length; i++) {
					if(!M.isEqual(o[i], p[i])) {
						return false;
					}
				}
				return true;
			}
		} else if(M.o.isObject(o)) {
			for(v in o) {
				if(!o.hasOwnProperty(v)) {
					// do nothing
				} else if(!p.hasOwnProperty(v)) {
					return false;
				} else if(!M.isEqual(o[v], p[v])) {
					return false;
				}
			}
			return true;
		} else {
			return o === p;
		}
	};

	M.isChar = function(o) {
		return M.o.isInteger(o) && o >= 0 && o < 65536;
	};
	M.charUpcase = function(c) {
		var x;
		M.checkCharacter(c);
		x = String.fromCharCode(c);
		x = x.toUpperCase();
		return x.charCodeAt(0);
	};
	M.charDowncase = function(c) {
		var x;
		M.checkCharacter(c);
		x = String.fromCharCode(c);
		x = x.toUpperCase();
		return x.charCodeAt(0);
	};
	M.compareCharacter = function(f) {
		return M.compare(f, M.checkCharacter);
	};
	M.compareCharacterCi = function(f) {
		return M.compare(function(x, y) {
			var a = M.charUpcase(x);
			var b = M.charUpcase(y);
			return f(a, b);
		}, M.checkCharacter);
	};
	M.charToInteger = function(o) {
		M.checkCharacter(o);
		return o;
	};
	M.integerToChar = function(o) {
		M.charToInteger(o);
		if(o < 0 || o > 65535) {
			M.o.error('character out of range:' + o);
		}
		return o;
	};
	M.isCharLowerCase = function(o) {
		M.checkCharacter(o);
		return M.charUpcase(o) !== o;
	};
	M.isCharUpperCase = function(o) {
		M.checkCharacter(o);
		return M.charDowncase(o) !== o;
	};
	M.isCharAlphabetic = function(o) {
		return M.isCharLowerCase(o) || M.isCharUpperCase(o);
	};
	M.regexmatch = function(r, o) {
		var x;
		M.checkCharacter(o);
		x = String.fromCharCode(o);
		return r.test(x);
	};
	M.regexWhitespace = /^[\u0009-\u000d\u001c-\u0020\u1680\u180e\u2000-\u2006\u2008-\u200b\u2028-\u2029\u205f\u3000]$/;
	M.isCharWhitespace = function(o) {
		return M.regexmatch(M.regexWhitespace, o);
	};
	M.regexNumeric = /^[\u0030-\u0039\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0b66-\u0b6f\u0be7-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f\u0e50-\u0e59\u0ed0-\u0ed9\u0f20-\u0f29\u1040-\u1049\u1369-\u1371\u17e0-\u17e9\u1810-\u1819\u1946-\u194f\uff10-\uff19]$/;
	M.isCharNumeric = function(o) {
		return M.regexmatch(M.regexNumeric, o);
	};

	M.isComplexOnly = function(o) {
		return M.c.isComplex(o);
	};
	M.isComplex = function(o) {
		return M.o.isNumber(o) || M.isComplexOnly(o);
	};
	M.isZero = function(o) {
		M.checkNumber(o);
		return o === 0.0;
	};
	M.isPositive = function(o) {
		M.checkNumber(o);
		return M.o.isNumber(o) && o > 0;
	};
	M.isNegative = function(o) {
		M.checkNumber(o);
		return M.o.isNumber(o) && o < 0;
	};
	M.isOdd = function(o) {
		M.checkNumber(o);
		return M.o.isInteger(o) && o % 2 == 1;
	};
	M.isEven = function(o) {
		M.checkNumber(o);
		return M.o.isInteger(o) && o % 2 == 0;
	};
	M.max = function() {
		var i, v, r = -Infinity;
		for(i = 0; i < arguments.length; i++) {
			v = arguments[i];
			M.checkReal(v);
			if(v > r) {
				r = v;
			}
		}
		return r;
	};
	M.min = function() {
		var i, v, r = Infinity;
		for(i = 0; i < arguments.length; i++) {
			v = arguments[i];
			M.checkReal(v);
			if(v < r) {
				r = v;
			}
		}
		return r;
	};
	M.exp = function(z) {
		M.checkNumber(z);
		return M.c.exp(z);
	};
	M.log = function(z) {
		M.checkNumber(z);
		return M.c.log(z);
	};
	M.sin = function(z) {
		M.checkNumber(z);
		return M.c.sin(z);
	};
	M.cos = function(z) {
		M.checkNumber(z);
		return M.c.cos(z);
	};
	M.tan = function(z) {
		M.checkNumber(z);
		return M.c.tan(z);
	};
	M.asin = function(z) {
		M.checkNumber(z);
		return M.c.asin(z);
	};
	M.acos = function(z) {
		M.checkNumber(z);
		return M.c.acos(z);
	};
	M.atan = function(z, y) {
		if(y === undefined) {
			M.checkNumber(z);
			return M.c.atan(z);
		} else {
			M.checkReal(z);
			M.checkReal(y);
			return Math.atan2(z, y);
		}
	};
	M.makeRectangular = function(x, y) {
		M.checkReal(x);
		M.checkReal(y);
		M.c.make(x, y);
	};
	M.makePolar = function(r, t) {
		M.checkNonnegativeReal(x);
		M.checkReal(y);
		M.c.make(r * Math.cos(t), r * Math.sin(t));
	};
	M.realPart = function(z) {
		M.checkNumber(z);
		return M.c.getReal(z);
	};
	M.imagPart = function(z) {
		M.checkNumber(z);
		return M.c.getImag(z);
	};
	M.magnitude = function(z) {
		M.checkNumber(z);
		return M.c.magnitude(z);
	};
	M.angle = function(z) {
		M.checkNumber(z);
		return M.c.angle(z);
	};

	M.makeValues = function(v) {
		var i, a;
		if(v.length === 0) {
			throw M.o.error('multivalue must have one datum');
		} else if(v.length === 1) {
			return v[0];
		} else {
			a = new Datum('multivalue');
			for(i = 0; i < v.length; i++) {
				a[i] = v[i];
				a['value' + i] = v[i];
			}
			a.length = v.length;
			return a;
		}
	};
	M.values = function() {
		return M.makeValues(M.a.toArray(arguments));
	};
	M.isMultivalue = function(o) {
		return M.datumTypeOf(o, 'multivalue');
	};
	M.callWithValues = function(producer, consumer) {
		var p, a;
		M.checkFunction(producer);
		M.checkFunction(consumer);
		p = producer.call(null);
		if(M.isMultivalue(p)) {
			a = M.a.toArray(p);
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

	M.delay = function(f) {
		var p;
		p = new Datum('promise');
		p.memorized = false;
		p.value = f;
		return p;
	};
	M.force = function(p) {
		M.checkPromise(p);
		if(!p.memorized) {
			p.value = p.value();
			p.memorized = true;
		}
		return p.value;
	};

	M.isRegex = function(o) {
		return M.o.isRegex(o);
	};
	M.regexReplace = function(re, dest, repl) {
		M.checkRegex(re);
		M.checkString(dest);
		M.checkString(repl);
		return dest.replace(re, repl);
	};
	M.regexToString = function(re) {
		M.checkRegex(re);
		return re.source;
	};
	M.stringToRegex = function(s, flags) {
		M.checkString(s);
		if(flags === undefined) {
			return new RegExp(s);
		} else {
			M.checkString(flags);
			return new RegExp(s, flags);
		}
	};
	M.rxmatchVector = function(re, dest) {
		var r;
		M.checkRegex(re);
		M.checkString(dest);
		r = re.exec(dest);
		if(r === null) {
			return false;
		} else {
			return r;
		}
	};
	M.rxmatch = function(re, dest) {
		var r;
		r = M.rxmatchVector(re, dest);
		return r ? M.makeValues(r) : r;
	};
	M.rxmatchList = function(re, dest) {
		var r;
		r = M.rxmatchVector(re, dest);
		return r ? M.listToCell(r) : r;
	};
	M.isMatchrx = function(re, dest) {
		M.checkRegex(re);
		M.checkString(dest);
		return re.test(dest);
	};

	M.isProcedure = function(o) {
		return M.o.isFunction(o);
	};
	M.isTruthy = function(o) {
		return !!o;
	};
	M.isFalsy = function(o) {
		return !o;
	};
	M.isNan = function(o) {
		return M.c.isNaN(o);
	};
	M.isFinite = function(o) {
		return M.c.isFinite(o);
	};
	M.isInfinite = function(o) {
		return M.c.isInfinite(o);
	};
	M.isUndefined = function(o) {
		return o === undefined;
	};
	M.isJsnull = function(o) {
		return o === null;
	};
	M.stringConcat = function() {
		var r = '', i;
		for(i = 0; i < arguments.length; i++) {
			r += arguments[i].toString();
		}
		return r;
	};
	M.newObject = function(o) {
		return new (o.bind.apply(o, M.a.toArray(arguments, 1, [null])))();
	};
	M.isInstance = function(o, c) {
		return o instanceof c;
	};
	M.objectJ = function(o) {
		if(o === undefined) {
			return {};
		} else {
			M.checkObject(o);
			return o;
		}
	};

	M.allDef = function(a, i) {
		var k;
		if(a.length > 0) {
			for(k = 0; k < a.length; k++) {
				if(i >= a[k].length) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	};
	M.minLength = function(a) {
		var r = 0;
		while(M.allDef(a, r)) {
			r++;
		}
		return r;
	};
	M.collectIndex = function(a, i) {
		var k, v = [];
		for(k = 0; k < a.length; k++) {
			v.push(a[k][i]);
		}
		return v;
	};
	M.vectorFold = function(kons, knil) {
		var a = M.a.toArray(arguments, 2), r = knil;
		M.checkFunction(kons);
		for(i = 0; M.allDef(a, i); i++) {
			r = kons.apply(null, [i, r].concat(M.collectIndex(a, i)));
		}
		return r;
	};
	M.vectorFoldRight = function(kons, knil) {
		var a = M.a.toArray(arguments, 2), r = knil;
		M.checkFunction(kons);
		for(i = M.minLength(a) - 1; i >= 0; i--) {
			r = kons.apply(null, [i, r].concat(M.collectIndex(a, i)));
		}
		return r;
	};
	M.vectorMap = function(f) {
		var a = M.a.toArray(arguments, 1), i, v = [];
		M.checkFunction(f);
		for(i = 0; M.allDef(a, i); i++) {
			v.push(f.apply(null, M.collectIndex(a, i)));
		}
		return v;
	};
	M.vectorMapS = function(f) {
		var a = M.a.toArray(arguments, 1), i, v;
		M.checkFunction(f);
		if(a.length > 0) {
			for(i = 0; M.allDef(a, i); i++) {
				v = f.apply(null, M.collectIndex(a, i));
				a[0][i] = v;
			}
			return a[0];
		} else {
			return [];
		}
	};
	M.vectorForEach = function(f) {
		var a = M.a.toArray(arguments, 1), i;
		M.checkFunction(f);
		for(i = 0; M.allDef(a, i); i++) {
			f.apply(null, M.collectIndex(a, i));
		}
		return undefined;
	};

	M.readString = function(s) {
		var o, p = 0;
		M.checkString(s);
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
	M.readStringAll = function(s) {
		var o, p = 0, r = [];
		M.checkString(s);
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
	M.evalbas = function($env, x) {
		var ls, lt, doLambda, r, i, fn;
		doLambda = function(lx) {
			var p, s;
			p = lx[1];
			s = [];
			while(true) {
				if(M.isNull(p)) {
					p = null;
					break;
				} else if(M.isSymbol(p)) {
					break;
				} else if(M.isAtom(p)) {
					M.o.error(p + " must be a symbol");
				} else if(M.isSymbol(p.car)) {
					s.push(p.car);
					p = p.cdr;
				} else {
					M.o.error(p.car + " must be a symbol");
				}
			}
			return $env.closure(function(e) {
				var r, i;
				for(i = 0; i < s.length; i++) {
					e.bind(s[i].toString(), arguments[i + 1]);
				}
				if(p !== null) {
					e.bind(p.toString(), M.listToCell(
							M.a.toArray(arguments, i + 1)));
				}
				for(i = 2; i < lx.length; i++) {
					r = M.evalbas(e, lx[i]);
				}
				return r;
			});
		};
		if(M.isPair(x)) {
			ls = M.shallowCellToList(x);
			if(ls[0] === M.getSymbol('if')) {
				if(ls.length === 3) {
					return M.evalbas($env, ls[1]) ?
							M.evalbas($env, ls[2]) : undefined;
				} else if(ls.length === 4) {
					return M.evalbas($env, ls[1]) ?
							M.evalbas($env, ls[2]) :
								M.evalbas($env, ls[3]);
				} else {
					M.o.error('malformed if');
				}
			} else if(ls[0] === M.getSymbol('lambda')) {
				return doLambda(ls);
			} else if(ls[0] === M.getSymbol('quote')) {
				if(ls.length === 2) {
					return ls[1];
				} else {
					M.o.error('malformed quote');
				}
			} else if(ls[0] === M.getSymbol('begin')) {
				for(i = 1; i < ls.length; i++) {
					r = M.evalbas($env, ls[i]);
				}
				return r;
			} else if(ls[0] === M.getSymbol('define')) {
				if(ls.length !== 3) {
					M.o.error('malformed define');
				} else if(!M.isSymbol(ls[1])) {
					M.o.error(ls[1] + ' must be a symbol');
				} else {
					$env.bind(ls[1].toString(), M.evalbas($env, ls[2]));
					return undefined;
				}
			} else if(ls[0] === M.getSymbol('set!')) {
				if(ls.length !== 3) {
					M.o.error('malformed set!');
				} else if(!M.isSymbol(ls[1])) {
					M.o.error(ls[1] + ' must be a symbol');
				} else {
					$env.set(ls[1].toString(),
							M.evalbas($env, ls[2]));
					return undefined;
				}
			} else if(ls[0] === M.getSymbol('delay')) {
				if(ls.length === 2) {
					return M.delay(function() {
						return M.evalbas($env,
								M.evalbas($env, ls[1]));
					});
				} else {
					M.o.error('malformed delay');
				}
			} else {
				r = ls[0];
				fn = function(lt) {
					var obj;
					for(i = 1; i < ls.length; i++) {
						if(M.isKeyword(ls[i])) {
							break;
						}
						lt.push(M.evalbas($env, ls[i]));
					}
					if(i < ls.length) {
						obj = {};
						for(; i + 1 < ls.length; i += 2) {
							if(!M.isKeyword(ls[i])) {
								break;
							}
							obj[ls[i].name] = M.evalbas($env, ls[i + 1]);
						}
						lt.push(obj);
					}
				};
				if(M.isSymbol(r) &&
						r.name.length > 1 && r.name.charAt(0) === '.') {
					lt = [r.name.substring(1, r.name.length)];
					fn(lt);
					return M.applyObject.apply(null, lt);
				} else if(M.isSymbol(r) && /.+\.[^.]+/.test(r.name)) {
					lt = [];
					fn(lt);
					return $env.applySymbol(r.name, lt);
				} else {
					r = M.evalbas($env, r);
					if(M.o.isFunction(r)) {
						lt = [];
						fn(lt);
						return r.apply(null, lt);
					} else {
						M.o.error(r + ' must be a function');
					}
				}
			}
		} else {
			if(M.isSymbol(x)) {
				return $env.find(x.toString());
			} else {
				return x;
			}
		}
	};

	M.genv = M.newenv(undefined, this);
	M.bindg = function(b, fn) {
		M.genv.bind(b, M.closure(M.genv, this, function(e) {
			return fn.apply(null, M.a.toArray(arguments, 1));
		}));
	};
	M.bindg('cons', M.cons);
	M.bindg('eq?', M.eq);
	M.bindg('eqv?', M.eqv);
	M.bindg('car', M.car);
	M.bindg('cdr', M.cdr);
	M.bindg('atom?', M.isAtom);
	M.bindg('null?', M.isNull);
	M.bindg('symbol?', M.isSymbol);
	M.bindg('error', M.o.error);
	M.bindg('set-car!', M.setCar);
	M.bindg('set-cdr!', M.setCdr);
	M.bindg('apply', M.applyCell);
	M.bindg('1+', M.unary(function(x) { return x + 1; }));
	M.bindg('1-', M.unary(function(x) { return x - 1; }));
	M.bindg('>', M.compareNumber(function(x, y) { return x > y; }));
	M.bindg('<', M.compareNumber(function(x, y) { return x < y; }));
	M.bindg('=', M.compare(M.c.equals, M.checkNumber));
	M.bindg('+', M.arith1(M.c.add, 0));
	M.bindg('-', M.arith2(M.c.subtract,
			function(x) { return M.c.subtract(0, x); }));
	M.bindg('*', M.arith1(M.c.multiply, 1));
	M.bindg('/', M.arith2(M.c.divide,
			function(x) { return M.c.divide(1, x); }));
	M.bindg('string?', M.o.isString);
	M.bindg('substring', M.substring);
	M.bindg('string-ref', M.stringRef);
	M.bindg('string-length', M.stringLength);
	M.bindg('string-append', M.stringAppend);
	M.bindg('string?', M.isString);
	M.bindg('make-string', M.makeString);
	M.bindg('string', M.string);
	M.bindg('string>?', M.compareString(function(x, y) { return x > y; }));
	M.bindg('string<?', M.compareString(function(x, y) { return x < y; }));
	M.bindg('string=?', M.compareString(function(x, y) { return x === y; }));
	M.bindg('string>=?', M.compareString(function(x, y) { return x >= y; }));
	M.bindg('string<=?', M.compareString(function(x, y) { return x <= y; }));
	M.bindg('string-ci>?', M.compareStringCi(function(x, y) { return x > y; }));
	M.bindg('string-ci<?', M.compareStringCi(function(x, y) { return x < y; }));
	M.bindg('string-ci=?', M.compareStringCi(function(x, y) { return x === y; }));
	M.bindg('string-ci>=?', M.compareStringCi(function(x, y) { return x >= y; }));
	M.bindg('string-ci<=?', M.compareStringCi(function(x, y) { return x <= y; }));
	M.bindg('string->list', M.stringToList);
	M.bindg('list->string', M.listToString);
	M.bindg('string->symbol', M.stringToSymbol);
	M.bindg('symbol->string', M.symbolToString);
	M.bindg('vector?', M.isVector);
	M.bindg('number->string', M.numberToString);

	M.bindg('make-vector', M.makeVector);
	M.bindg('vector-length', M.vectorLength);
	M.bindg('vector-ref', M.vectorRef);
	M.bindg('vector-set!', M.vectorSet);
	M.bindg('vector->list', M.vectorToList);
	M.bindg('list->vector', M.listToVector);
	M.bindg('vector-fill!', M.vectorFill);
	M.bindg('not', M.not);
	M.bindg('boolean?', M.isBoolean);

	M.bindg('>=', M.compareNumber(function(x, y) { return x >= y; }));
	M.bindg('<=', M.compareNumber(function(x, y) { return x <= y; }));
	M.bindg('number?', M.isNumber);
	M.bindg('real?', M.isReal);
	M.bindg('integer?', M.isInteger);
	M.bindg('exact?', M.isExact);
	M.bindg('inexact?', M.isInexact);
	M.bindg('abs', M.abs);
	M.bindg('remainder', M.remainder);
	M.bindg('quotient', M.quotient);
	M.bindg('modulo', M.modulo);
	M.bindg('gcd', M.gcd);
	M.bindg('lcm', M.lcm);
	M.bindg('floor', M.floor);
	M.bindg('ceiling', M.ceiling);
	M.bindg('truncate', M.truncate);
	M.bindg('round', M.round);

	M.bindg('object?', M.isObject);
	M.bindg('object-ref', M.objectRef);
	M.bindg('object-set!', M.objectSet);
	M.bindg('object-keys', M.objectKeys);
	M.bindg('object-values', M.objectValues);
	M.bindg('object->list', M.objectToList);

	M.bindg('char?', M.isChar);
	M.bindg('char>?', M.compareCharacter(function(x, y) { return x > y; }));
	M.bindg('char<?', M.compareCharacter(function(x, y) { return x < y; }));
	M.bindg('char=?', M.compareCharacter(function(x, y) { return x === y; }));
	M.bindg('char>=?', M.compareCharacter(function(x, y) { return x >= y; }));
	M.bindg('char<=?', M.compareCharacter(function(x, y) { return x <= y; }));
	M.bindg('char-ci>?', M.compareCharacterCi(function(x, y) { return x > y; }));
	M.bindg('char-ci<?', M.compareCharacterCi(function(x, y) { return x < y; }));
	M.bindg('char-ci=?', M.compareCharacterCi(function(x, y) { return x === y; }));
	M.bindg('char-ci>=?', M.compareCharacterCi(function(x, y) { return x >= y; }));
	M.bindg('char-ci<=?', M.compareCharacterCi(function(x, y) { return x <= y; }));
	M.bindg('char-alphabetic?', M.isCharAlphabetic);
	M.bindg('char-whitespace?', M.isCharWhitespace);
	M.bindg('char-numeric?', M.isCharNumeric);
	M.bindg('char-upper-case?', M.isCharUpperCase);
	M.bindg('char-lower-case?', M.isCharLowerCase);
	M.bindg('char->integer', M.charToInteger);
	M.bindg('integer->char', M.integerToChar);
	M.bindg('char-upcase', M.charUpcase);
	M.bindg('char-downcase', M.charDowncase);

	M.bindg('complex?', M.isComplex);
	M.bindg('zero?', M.isZero);
	M.bindg('positive?', M.isPositive);
	M.bindg('negative?', M.isNegative);
	M.bindg('odd?', M.isOdd);
	M.bindg('even?', M.isEven);
	M.bindg('max', M.max);
	M.bindg('min', M.min);
	M.bindg('exp', M.exp);
	M.bindg('log', M.log);
	M.bindg('sin', M.sin);
	M.bindg('cos', M.cos);
	M.bindg('tan', M.tan);
	M.bindg('asin', M.asin);
	M.bindg('acos', M.acos);
	M.bindg('atan', M.atan);
	M.bindg('make-rectangular', M.makeRectangular);
	M.bindg('make-polar', M.makePolar);
	M.bindg('real-part', M.realPart);
	M.bindg('imag-part', M.imagPart);
	M.bindg('magnitude', M.magnitude);
	M.bindg('angle', M.angle);
	M.bindg('string->number', M.stringToNumber);

	M.bindg('values', M.values);
	M.bindg('call-with-values', M.callWithValues);

	M.bindg('regex?', M.isRegex);
	M.bindg('regex-replace', M.regexReplace);
	M.bindg('regex->string', M.regexToString);
	M.bindg('string->regex', M.stringToRegex);
	M.bindg('rxmatch', M.rxmatch);
	M.bindg('rxmatch-list', M.rxmatchList);
	M.bindg('rxmatch-vector', M.rxmatchVector);
	M.bindg('matchrx?', M.isMatchrx);
	M.bindg('regexp?', M.isRegex);
	M.bindg('regexp-replace', M.regexReplace);
	M.bindg('regexp->string', M.regexToString);
	M.bindg('string->regexp', M.stringToRegex);

	M.bindg('force', M.force);
	M.bindg('procedure?', M.isProcedure);
	M.bindg('truthy?', M.isTruthy);
	M.bindg('falsy?', M.isFalsy);
	M.bindg('nan?', M.isNan);
	M.bindg('finite?', M.isFinite);
	M.bindg('infinite?', M.isInfinite);
	M.bindg('undefined?', M.isUndefined);
	M.bindg('jsnull?', M.isJsnull);
	M.bindg('++', M.stringConcat);
	M.bindg('new', M.newObject);
	M.bindg('instance?', M.isInstance);
	M.bindg('J', M.objectJ);
	M.bindg('equal?', M.isEqual);

	M.bindg('vector-fold', M.vectorFold);
	M.bindg('vector-fold-right', M.vectorFoldRight);
	M.bindg('vector-map', M.vectorMap);
	M.bindg('vector-map!', M.vectorMapS);
	M.bindg('vector-for-each', M.vectorForEach);

	M.bindg('read-string', M.readString);
	M.bindg('read-string-all', M.readStringAll);
}($mille));
$env = $mille.genv;
