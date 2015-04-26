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
			} else if($c !== null && (($c === 40))) {
				$this.initc();
			$this.__state = 2;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 0;
			return 1;
			} else if($c !== null && (($c === 39))) {
			$this.__state = 3;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(4, $this.ENGINE_value);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 4:
		return 0;
	case 3:
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 3;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(5, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 5:
		return 0;
	case 2:
		if($c !== null && (($c === 41))) {
			$this.__state = 6;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 2;
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
			$this.__state = 2;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 2;
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
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c >= 0 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c >= 33 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 14;
			return 1;
		} else if($c === null) {
			
			$this.__state = 14;
			return 1;
		}
		return 0;
	case 14:
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
	case 13:
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c >= 0 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c >= 33 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 14;
			return 1;
		} else if($c === null) {
			
			$this.__state = 14;
			return 1;
		}
		return 0;
	case 6:
		return 0;
	case 1:
		if($c !== null && (($c === 40))) {
				$this._f_LOOKAHEAD_COMMIT();$this.initv();
			$this.__state = 17;
			return 1;
		}
		return 0;
	case 17:
		if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 17;
			return 1;
			} else if($c !== null && (($c === 41))) {
			$this.__state = 18;
			return 1;
		} else if($c !== null) {
			$this.__stkpush(19, $this.ENGINE_exp);
			$this.__state = 0;
			return -1;
		}
		return 0;
	case 19:
		$this.__state = 17;
		return 1;
	case 18:
		return 0;
	}
	return 0;
}

SExpression.ENGINE_exp.accepted = function($this) {
	return ($this.__state === 16 ||
			$this.__state === 18 ||
			$this.__state === 4 ||
			$this.__state === 5 ||
			$this.__state === 6);
}

SExpression.ENGINE_exp.execaction = function($this,  $c) {
	switch($this.__state) {
	case 12:
		break;
	case 14:
		break;
	case 4:
		break;
	case 7:
		$this.addc($this._);
		break;
	case 6:
		$this._ = $this.endc($mille.nil);
		break;
	case 17:
		break;
	case 3:
		break;
	case 5:
		$this._ = $this.quote($this._);
		break;
	case 9:
		break;
	case 10:
		break;
	case 2:
		break;
	case 1:
		break;
	case 15:
		break;
	case 18:
		$this._ = $this.endv();
		break;
	case 16:
		$this._ = $this.endc($this._);
		break;
	case 19:
		$this.addv($this._);
		break;
	case 11:
		break;
	case 0:
		break;
	case 13:
		break;
	case 8:
		break;
	}
	return 1;
}

SExpression.ENGINE_exp.isend = function($this) {
	return ($this.__state === 19 ||
			$this.__state === 7 ||
			$this.__state === 9 ||
			$this.__state === 12 ||
			$this.__state === 13);
}

SExpression.ENGINE_exp.recover = function($this, e) {
		return -1;
}

SExpression.ENGINE_exp.deadState = function($this) {
	return -1;
}

SExpression.ENGINE_exp.stateSize = function($this) {
			return 20;
}

SExpression.ENGINE_exp.finallyState = function($this) {
	return -1;
}

SExpression.ENGINE_exp.dead = function($this) {
	return ($this.__state === 16 ||
			$this.__state === 18 ||
			$this.__state === 4 ||
			$this.__state === 5 ||
			$this.__state === 6);
}

SExpression.ENGINE_exp.emptyTransition = function($this) {
	return ($this.__state === 19);
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
		if($c !== null && (($c === 1))) {
			$this.__state = 3;
			return 1;
		}
		return 0;
	case 3:
		return 0;
	case 1:
		return 0;
	}
	return 0;
}

SExpression.ENGINE_sExpression.accepted = function($this) {
	return ($this.__state === 3);
}

SExpression.ENGINE_sExpression.execaction = function($this,  $c) {
	switch($this.__state) {
	case 0:
		break;
	case 2:
		break;
	case 3:
		break;
	case 1:
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
	return ($this.__state === 1 ||
			$this.__state === 3);
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
		if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 2;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 3;
			return 1;
			} else if($c !== null && (($c >= 9 && $c <= 10) || ($c === 32))) {
			$this.__state = 0;
			return 1;
			} else if($c !== null && (($c === 35))) {
			$this.__state = 4;
			return 1;
			} else if($c !== null && (($c === 34))) {
				$this.clearbuf();
			$this.__state = 5;
			return 1;
			} else if($c !== null && (($c === 59))) {
			$this.__state = 6;
			return 1;
		} else if($c !== null) {
			$this.clearbuf();
			$this.__state = 7;
			return 1;
		}
		return 0;
	case 7:
		if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 95) || ($c >= 97 && $c <= 2147483647))) {
			$this.__state = 7;
			return 1;
		} else if($c === null) {
			$this.__state = 8;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 8;
			return 1;
		}
		return 0;
	case 8:
		return 0;
	case 6:
		if($c !== null && (($c === 10))) {
			$this.__state = 0;
			return 1;
		} else if($c !== null) {
			$this.__state = 6;
			return 1;
		}
		return 0;
	case 5:
		if($c !== null && (($c === 34))) {
			$this.__state = 9;
			return 1;
			} else if($c !== null && (($c === 92))) {
				$this._f_UNGET($c);$this.$buffer = '';
			$this.__state = 10;
			return 1;
		} else if($c !== null) {
			$this.__state = 5;
			return 1;
		}
		return 0;
	case 10:
		if($c !== null && (($c === 92))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 11;
			return 1;
		}
		return 0;
	case 11:
		if($c !== null && (($c >= 0 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 12;
			return 1;
		} else if($c === null) {
			
			$this.__state = 12;
			return 1;
		}
		return 0;
	case 12:
		if($c !== null) {
			$this.__state = 5;
			return 1;
		}
		return 0;
	case 9:
		return 0;
	case 4:
		if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 65) || ($c >= 67 && $c <= 78) || ($c >= 80 && $c <= 87) || ($c >= 89 && $c <= 91) || ($c >= 93 && $c <= 95) || ($c === 97) || ($c >= 99 && $c <= 110) || ($c >= 112 && $c <= 119) || ($c >= 121 && $c <= 2147483647))) {
			$this.__state = 13;
			return 1;
			} else if($c !== null && (($c === 66) || ($c === 98))) {
			$this.__state = 14;
			return 1;
			} else if($c !== null && (($c === 92))) {
				$this._f_UNGET($c);$this.$buffer = '';
			$this.__state = 15;
			return 1;
			} else if($c !== null && (($c === 79) || ($c === 111))) {
			$this.__state = 16;
			return 1;
			} else if($c !== null && (($c === 88) || ($c === 120))) {
			$this.__state = 17;
			return 1;
		}
		return 0;
	case 17:
		if($c !== null && (($c >= 48 && $c <= 57) || ($c >= 65 && $c <= 70) || ($c >= 97 && $c <= 102))) {
			$this.__state = 18;
			return 1;
		}
		return 0;
	case 18:
		if($c !== null && (($c >= 48 && $c <= 57) || ($c >= 65 && $c <= 70) || ($c >= 97 && $c <= 102))) {
			$this.__state = 18;
			return 1;
		} else if($c === null) {
			$this.__state = 19;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 19;
			return 1;
		}
		return 0;
	case 19:
		return 0;
	case 16:
		if($c !== null && (($c >= 48 && $c <= 55))) {
			$this.__state = 20;
			return 1;
		}
		return 0;
	case 20:
		if($c !== null && (($c >= 48 && $c <= 55))) {
			$this.__state = 20;
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
	case 15:
		if($c !== null && (($c === 92))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 22;
			return 1;
		}
		return 0;
	case 22:
		if($c !== null && (($c >= 0 && $c <= 2147483647))) {
				$this._f_UNGET($c);
			$this.__state = 23;
			return 1;
		} else if($c === null) {
			
			$this.__state = 23;
			return 1;
		}
		return 0;
	case 23:
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
	case 14:
		if($c !== null && (($c >= 48 && $c <= 49))) {
			$this.__state = 28;
			return 1;
		}
		return 0;
	case 28:
		if($c !== null && (($c >= 48 && $c <= 49))) {
			$this.__state = 28;
			return 1;
		} else if($c === null) {
			$this.__state = 29;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 29;
			return 1;
		}
		return 0;
	case 29:
		return 0;
	case 13:
		if($c !== null && (($c === 0) || ($c >= 2 && $c <= 8) || ($c >= 11 && $c <= 31) || ($c === 33) || ($c >= 36 && $c <= 38) || ($c >= 42 && $c <= 43) || ($c >= 45 && $c <= 58) || ($c >= 60 && $c <= 95) || ($c >= 97 && $c <= 2147483647))) {
			$this.__state = 13;
			return 1;
		} else if($c === null) {
			$this.__state = 30;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);
			$this.__state = 30;
			return 1;
		}
		return 0;
	case 30:
		return 0;
	case 3:
		if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 2;
			return 1;
		}
		return 0;
	case 2:
		if($c !== null && ((__l__ && $c === 46))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 1;
			return 1;
			} else if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 2;
			return 1;
			} else if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	case 32:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 33;
			return 1;
			} else if($c !== null && ((__l__ && $c === 43) || (__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 34;
			return 1;
		}
		return 0;
	case 34:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 33;
			return 1;
		}
		return 0;
	case 33:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 33;
			return 1;
			} else if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
		}
		return 0;
	case 31:
		if($c !== null && ((__l__ && $c >= 0 && $c <= 2147483647))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 35;
			return 1;
		} else if($c === null) {
			$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 35;
			return 1;
		}
		return 0;
	case 35:
		if($c !== null && (($c === 46))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
			} else if($c !== null && (($c === 43))) {
				$this.$buffer = '';
			$this.__state = 37;
			return 1;
			} else if($c !== null && (($c === 45))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 37;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 38;
			return 1;
		}
		return 0;
	case 38:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 38;
			return 1;
			} else if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 39;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
			return 1;
		}
		return 0;
	case 40:
		if($c !== null && ((__l__ && $c === 45))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 41;
			return 1;
			} else if($c !== null && (($c === 43))) {
			$this.__state = 42;
			return 1;
			} else if($c !== null && (($c === 105))) {
			$this.__state = 43;
			return 1;
		}
		return 0;
	case 43:
		return 0;
	case 42:
		if($c !== null && (($c === 43))) {
				$this.$buffer = '';
			$this.__state = 44;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 45;
			return 1;
			} else if($c !== null && (($c === 45))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 44;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer = '';$this.$buffer += String.fromCharCode($c);
			$this.__state = 46;
			return 1;
		}
		return 0;
	case 46:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 47;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 45;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 46;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		}
		return 0;
	case 48:
		if($c !== null && (($c === 105))) {
			$this.__state = 49;
			return 1;
		}
		return 0;
	case 49:
		return 0;
	case 47:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 50;
			return 1;
			} else if($c !== null && (($c === 43) || ($c === 45))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 51;
			return 1;
		}
		return 0;
	case 51:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 50;
			return 1;
		}
		return 0;
	case 50:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 50;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		}
		return 0;
	case 45:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 52;
			return 1;
		}
		return 0;
	case 52:
		if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 47;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 52;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 48;
			return 1;
		}
		return 0;
	case 44:
		if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 45;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 46;
			return 1;
		}
		return 0;
	case 41:
		if($c !== null && ((__l__ && $c >= 0 && $c <= 2147483647))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 42;
			return 1;
		} else if($c === null) {
			$this._f_LOOKAHEAD_COMMIT();
			$this.__state = 42;
			return 1;
		}
		return 0;
	case 39:
		if($c !== null && (($c === 43) || ($c === 45))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 53;
			return 1;
			} else if($c !== null && (($c >= 48 && $c <= 57))) {
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
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
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
	case 37:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 38;
			return 1;
			} else if($c !== null && (($c === 46))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 36;
			return 1;
		}
		return 0;
	case 36:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 55;
			return 1;
		}
		return 0;
	case 55:
		if($c !== null && (($c >= 48 && $c <= 57))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 55;
			return 1;
			} else if($c !== null && (($c === 69) || ($c === 101))) {
				$this.$buffer += String.fromCharCode($c);
			$this.__state = 39;
			return 1;
		} else if($c === null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
			return 1;
		} else if($c !== null) {
			$this._f_UNGET($c);$this.$num=parseFloat($this.$buffer);
			$this.__state = 40;
			return 1;
		}
		return 0;
	case 1:
		if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 56;
			return 1;
		}
		return 0;
	case 56:
		if($c !== null && ((__l__ && $c === 1) || (__l__ && $c >= 9 && $c <= 10) || (__l__ && $c === 32) || (__l__ && $c >= 34 && $c <= 35) || (__l__ && $c >= 39 && $c <= 41) || (__l__ && $c === 44) || (__l__ && $c === 59) || (__l__ && $c === 96))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 31;
			return 1;
			} else if($c !== null && ((__l__ && $c >= 48 && $c <= 57))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 56;
			return 1;
			} else if($c !== null && ((__l__ && $c === 69) || (__l__ && $c === 101))) {
				$this._f_LOOKAHEAD($c);$this._f_LOOKAHEAD_MARK_INIT();
			$this.__state = 32;
			return 1;
		}
		return 0;
	}
	return 0;
}

SExpression.ENGINE_value.accepted = function($this) {
	return ($this.__state === 49 ||
			$this.__state === 19 ||
			$this.__state === 21 ||
			$this.__state === 25 ||
			$this.__state === 8 ||
			$this.__state === 43 ||
			$this.__state === 9 ||
			$this.__state === 40 ||
			$this.__state === 27 ||
			$this.__state === 29 ||
			$this.__state === 30);
}

SExpression.ENGINE_value.execaction = function($this,  $c) {
	switch($this.__state) {
	case 25:
		$this._ = $c;
		break;
	case 6:
		break;
	case 31:
		break;
	case 32:
		break;
	case 17:
		break;
	case 33:
		break;
	case 34:
		break;
	case 41:
		break;
	case 43:
		$this._ = $mille.c.make(0, $this._);
		break;
	case 27:
		$this._ = $this.chrname($this.buf);
		break;
	case 37:
		break;
	case 44:
		break;
	case 22:
		break;
	case 14:
		break;
	case 4:
		$this.clearbuf();
		break;
	case 11:
		break;
	case 46:
		break;
	case 12:
		break;
	case 40:
		$this._ = $this.$num;
		break;
	case 7:
		$this.addbuf($c);
		break;
	case 45:
		break;
	case 28:
		$this.addbuf($c);
		break;
	case 35:
		break;
	case 56:
		break;
	case 10:
		break;
	case 55:
		break;
	case 26:
		$this.addbuf($c);
		break;
	case 53:
		break;
	case 30:
		$this._ = $this.sharp($this.buf);
		break;
	case 42:
		break;
	case 5:
		$this.addbuf($c);
		break;
	case 15:
		break;
	case 9:
		$this._ = $t.buf;
		break;
	case 39:
		break;
	case 47:
		break;
	case 29:
		$this._ = parseInt($this.buf, 2);
		break;
	case 13:
		$this.addbuf($c);
		break;
	case 1:
		break;
	case 2:
		break;
	case 51:
		break;
	case 52:
		break;
	case 48:
		break;
	case 3:
		break;
	case 8:
		$this._ = $this.sym($this.buf);
		break;
	case 38:
		break;
	case 54:
		break;
	case 21:
		$this._ = parseInt($this.buf, 8);
		break;
	case 23:
		break;
	case 20:
		$this.addbuf($c);
		break;
	case 49:
		$this._ = $mille.c.make($this._, $this.$num);
		break;
	case 19:
		$this._ = parseInt($this.buf, 16);
		break;
	case 50:
		break;
	case 18:
		$this.addbuf($c);
		break;
	case 16:
		break;
	case 0:
		break;
	case 24:
		$this.ch = $c;
		break;
	case 36:
		break;
	}
	return 1;
}

SExpression.ENGINE_value.isend = function($this) {
	return ($this.__state === 38 ||
			$this.__state === 7 ||
			$this.__state === 41 ||
			$this.__state === 11 ||
			$this.__state === 46 ||
			$this.__state === 13 ||
			$this.__state === 50 ||
			$this.__state === 18 ||
			$this.__state === 55 ||
			$this.__state === 20 ||
			$this.__state === 54 ||
			$this.__state === 22 ||
			$this.__state === 52 ||
			$this.__state === 26 ||
			$this.__state === 28 ||
			$this.__state === 31);
}

SExpression.ENGINE_value.recover = function($this, e) {
		return -1;
}

SExpression.ENGINE_value.deadState = function($this) {
	return -1;
}

SExpression.ENGINE_value.stateSize = function($this) {
			return 57;
}

SExpression.ENGINE_value.finallyState = function($this) {
	return -1;
}

SExpression.ENGINE_value.dead = function($this) {
	return ($this.__state === 49 ||
			$this.__state === 19 ||
			$this.__state === 21 ||
			$this.__state === 25 ||
			$this.__state === 8 ||
			$this.__state === 43 ||
			$this.__state === 9 ||
			$this.__state === 27 ||
			$this.__state === 29 ||
			$this.__state === 30);
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
