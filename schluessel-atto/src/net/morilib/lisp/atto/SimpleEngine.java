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

public class SimpleEngine implements Callback {

	//
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

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#init(net.morilib.lisp.atto.Environment)
	 */
	@Override
	public void init(Environment env) {
		env.binds.put(Symbol.CONS, CONS);
		env.binds.put(Symbol.CAR,  CAR);
		env.binds.put(Symbol.CDR,  CDR);
		env.binds.put(Symbol.EQ,   EQ);
		env.binds.put(Symbol.ATOM, ATOM);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#apply(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object[])
	 */
	@Override
	public Object apply(Environment v, Object f, Object... args) {
		if(f instanceof Appliable) {
			return ((Appliable)f).apply(this, args);
		} else {
			throw new IllegalArgumentException();
		}
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doIf(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doIf(Environment v, Object cond, Object dotrue) {
		return cond.equals(Boolean.FALSE) ?
				SchemeAtto.UNDEF : SchemeAtto.traverse(this, v, dotrue);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doIf(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doIf(Environment v, Object cond, Object dotrue,
			Object dofalse) {
		return cond.equals(Boolean.FALSE) ?
				SchemeAtto.traverse(this, v, dofalse) :
					SchemeAtto.traverse(this, v, dotrue);
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Callback#doDefine(net.morilib.lisp.atto.Environment, java.lang.Object, java.lang.Object)
	 */
	@Override
	public Object doDefine(Environment v, Object sym, Object tobound) {
		if(sym instanceof Symbol) {
			v.binds.put((Symbol)sym,
					SchemeAtto.traverse(this, v, tobound));
			return SchemeAtto.UNDEF;
		} else {
			throw new IllegalArgumentException();
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
		if(v.find(sym) == null) {
			throw new IllegalArgumentException();
		}
		return doDefine(v, sym, toset);
	}

}
