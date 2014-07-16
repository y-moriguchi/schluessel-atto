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
package net.morilib.lisp.atto;

import java.math.BigInteger;
import java.util.List;

public class SimpleEngine implements Callback {

	//
	private static final BigInteger MAXINT_1 =
			BigInteger.valueOf((long)Integer.MAX_VALUE + 1l);
	private static final BigInteger MININT_1 =
			BigInteger.valueOf((long)Integer.MIN_VALUE - 1l);
	static final SimpleEngine INSTANCE = new SimpleEngine();

	/**
	 * 
	 */
	public static final Appliable CONS = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 2) {
				return new Cell(args[0], args[1]);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable EQ = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 2) {
				return new Boolean(args[0] == args[1]);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable EQV = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 2) {
				return new Boolean(args[0].equals(args[1]));
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable CAR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Cell) {
				return ((Cell)args[0]).car;
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable CDR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Cell) {
				return ((Cell)args[0]).cdr;
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable ATOM = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return new Boolean(!(args[0] instanceof Cell));
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable NULL = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return new Boolean(args[0] == Cell.NIL);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable SYMBOL = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return new Boolean(args[0] instanceof Symbol);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable ERROR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				throw new IllegalArgumentException(args[0].toString());
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable SET_CAR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 2) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Cell) {
				((Cell)args[0]).car = args[1];
				return LispAtto.UNDEF;
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable SET_CDR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 2) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Cell) {
				((Cell)args[0]).cdr = args[1];
				return LispAtto.UNDEF;
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable APPLY = new Appliable() {

		public Object apply(Callback b, Object... args) {
			Object[] a;

			if(args.length != 2) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Appliable) {
				a = LispAtto.toArray(args[1]);
				return ((Appliable)args[0]).apply(b, a);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable INC = new Appliable() {

		public Object apply(Callback b, Object... args) {
			int x;

			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Integer) {
				x = ((Integer)args[0]).intValue();
				return x < Integer.MAX_VALUE ?
						Integer.valueOf(x + 1) : MAXINT_1;
			} else if(args[0] instanceof BigInteger) {
				return ((BigInteger)args[0]).add(BigInteger.ONE);
			} else if(args[0] instanceof Number) {
				return new Double(((Number)args[0]).doubleValue() + 1);
			} else {
				throw new IllegalArgumentException(args[0].toString());
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable DEC = new Appliable() {

		public Object apply(Callback b, Object... args) {
			int x;

			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Integer) {
				x = ((Integer)args[0]).intValue();
				return x > Integer.MIN_VALUE ?
						Integer.valueOf(x - 1) : MININT_1;
			} else if(args[0] instanceof BigInteger) {
				return ((BigInteger)args[0]).subtract(BigInteger.ONE);
			} else if(args[0] instanceof Number) {
				return new Double(((Number)args[0]).doubleValue() - 1);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable GT = new Appliable() {

		@SuppressWarnings({ "unchecked", "rawtypes" })
		public Object apply(Callback b, Object... args) {
			Comparable p = null;

			for(Object o : args) {
				try {
					if(!(o instanceof Comparable)) {
						throw new IllegalArgumentException();
					} else if(p == null) {
						p = (Comparable)o;
					} else if(p.compareTo((Comparable)args[1]) > 0) {
						p = (Comparable)o;
					} else {
						return Boolean.FALSE;
					}
				} catch(ClassCastException e) {
					throw new IllegalArgumentException();
				}
			}
			return Boolean.TRUE;
		}

	};

	/**
	 * 
	 */
	public static final Appliable LT = new Appliable() {

		@SuppressWarnings({ "unchecked", "rawtypes" })
		public Object apply(Callback b, Object... args) {
			Comparable p = null;

			for(Object o : args) {
				try {
					if(!(o instanceof Comparable)) {
						throw new IllegalArgumentException();
					} else if(p == null) {
						p = (Comparable)o;
					} else if(p.compareTo((Comparable)args[1]) < 0) {
						p = (Comparable)o;
					} else {
						return Boolean.FALSE;
					}
				} catch(ClassCastException e) {
					throw new IllegalArgumentException();
				}
			}
			return Boolean.TRUE;
		}

	};

	/**
	 * 
	 */
	public static final Appliable STRING = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return new Boolean(args[0] instanceof String);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable SUBSTRING = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 3) {
				throw new IllegalArgumentException();
			} else if(args[1] instanceof Integer &&
					args[2] instanceof Integer) {
				return args[0].toString().substring(
						((Integer)args[1]).intValue(),
						((Integer)args[2]).intValue());
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable STRING_REF = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 2) {
				throw new IllegalArgumentException();
			} else if(args[1] instanceof Integer) {
				return new Character(args[0].toString().charAt(
						((Integer)args[1]).intValue()));
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable STRING_LENGTH = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof String) {
				return new Integer(args[0].toString().length());
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable STRING_APPEND = new Appliable() {

		public Object apply(Callback b, Object... args) {
			StringBuffer a = new StringBuffer();

			for(Object o : args) {
				a.append(o.toString());
			}
			return a.toString();
		}

	};

	/**
	 * 
	 */
	public static final Appliable STRING_SYMBOL = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return Symbol.get(args[0].toString());
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable SYMBOL_STRING = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length != 1) {
				throw new IllegalArgumentException();
			} else if(args[0] instanceof Symbol) {
				return ((Symbol)args[0]).getName();
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/**
	 * 
	 */
	public static final Appliable VECTOR = new Appliable() {

		public Object apply(Callback b, Object... args) {
			if(args.length == 1) {
				return new Boolean(args[0] instanceof List);
			} else {
				throw new IllegalArgumentException();
			}
		}

	};

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#init(net.morilib.lisp.atto.Environment)
	 */
	@Override
	public void init(Environment env) {
		// pure lisp
		env.binds.put(Symbol.get("cons"),  CONS);
		env.binds.put(Symbol.get("eq?"),   EQ);
		env.binds.put(Symbol.get("car"),   CAR);
		env.binds.put(Symbol.get("cdr"),   CDR);
		env.binds.put(Symbol.get("atom?"), ATOM);

		// additional
		env.binds.put(Symbol.get("null?"),    NULL);
		env.binds.put(Symbol.get("symbol?"),  SYMBOL);
		env.binds.put(Symbol.get("error"),    ERROR);
		env.binds.put(Symbol.get("eqv?"),     EQV);
		env.binds.put(Symbol.get("set-car!"), SET_CAR);
		env.binds.put(Symbol.get("set-cdr!"), SET_CDR);
		env.binds.put(Symbol.get("apply"),    APPLY);

		// arithmetic
		env.binds.put(Symbol.get("1+"), INC);
		env.binds.put(Symbol.get("1-"), DEC);
		env.binds.put(Symbol.get(">"),  GT);
		env.binds.put(Symbol.get("<"),  LT);

		// string
		env.binds.put(Symbol.get("string?"),        STRING);
		env.binds.put(Symbol.get("substring"),      SUBSTRING);
		env.binds.put(Symbol.get("string-ref"),     STRING_REF);
		env.binds.put(Symbol.get("string-length"),  STRING_LENGTH);
		env.binds.put(Symbol.get("string-append"),  STRING_APPEND);
		env.binds.put(Symbol.get("string->symbol"), STRING_SYMBOL);
		env.binds.put(Symbol.get("symbol->string"), SYMBOL_STRING);

		// vector
		env.binds.put(Symbol.get("vector?"), VECTOR);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#apply(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object[])
	 */
	@Override
	public Object apply(Environment v, Object f, Object... args) {
		if(f instanceof Appliable) {
			return ((Appliable)f).apply(this, args);
		} else {
			throw new IllegalArgumentException(f.toString());
		}
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doIf(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doIf(Environment v, Object cond, Object dotrue) {
		return cond.equals(Boolean.FALSE) ?
				LispAtto.UNDEF : LispAtto.traverse(this, v, dotrue);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doIf(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doIf(Environment v, Object cond, Object dotrue,
			Object dofalse) {
		return cond.equals(Boolean.FALSE) ?
				LispAtto.traverse(this, v, dofalse) :
					LispAtto.traverse(this, v, dotrue);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doDefine(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doDefine(Environment v, Object sym, Object tobound) {
		if(sym instanceof Symbol) {
			v.binds.put((Symbol)sym,
					LispAtto.traverse(this, v, tobound));
			return LispAtto.UNDEF;
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doLambda(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object[])
	 */
	@Override
	public Object doLambda(Environment v, Object args, Object... body) {
		return new Closure(v, args, body);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doSet(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doSet(Environment v, Object sym, Object toset) {
		if(sym instanceof Symbol) {
			if(!v.set((Symbol)sym,
					LispAtto.traverse(this, v, toset))) {
				throw new IllegalArgumentException();
			}
			return LispAtto.UNDEF;
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doBegin(net.morilib.lisp.atto.Environment, java.lang.Object[])
	 */
	@Override
	public Object doBegin(Environment v, Object... body) {
		Object r = LispAtto.UNDEF;

		for(Object o : body) {
			r = LispAtto.traverse(this, v, o);
		}
		return r;
	}

}
