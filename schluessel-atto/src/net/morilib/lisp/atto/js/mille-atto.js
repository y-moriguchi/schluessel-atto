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
		return diese.car === null;
	}
	return diese;
};
$mille.nil = $mille.cons(null, null);
$mille.isNull = function(o) {
	return ($mille.datumTypeOf(o, 'cell') && o.isNull());
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

$mille.genv = $mille.newenv();
$mille.bindg = function(b, fn) {
	$mille.genv.bind(b, $mille.closure($mille.genv, fn));
}
$mille.bindg('cons', $mille.cons);
$mille.bindg('car', $mille.car);
$mille.bindg('cdr', $mille.cdr);
$mille.bindg('null?', $mille.isNull);
