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

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public final class SchemeAtto {

	/**
	 * 
	 */
	public static final Object UNDEF = new java.io.Serializable() {

		public String toString() {
			return "#<undef>";
		}

	};

	//
	static final BigInteger MAXINT =
			BigInteger.valueOf(Integer.MAX_VALUE);
	static final BigInteger MININT =
			BigInteger.valueOf(Integer.MIN_VALUE);

	/**
	 * 
	 * @param o
	 * @return
	 */
	public static Object[] toArray(Object o) {
		List<Object> l;
		Cell c;

		if(!(o instanceof Cell)) {
			throw new IllegalArgumentException();
		}

		l = new ArrayList<Object>();
		for(c = (Cell)o; c != Cell.NIL; c = (Cell)c.cdr) {
			l.add(c.car);
			if(!(c.cdr instanceof Cell)) {
				throw new IllegalArgumentException();
			}
		}
		return l.toArray(new Object[0]);
	}

	/**
	 * 
	 * @param objs
	 * @return
	 */
	public static Cell toList(Object... objs) {
		Cell l = null, a;

		if(objs.length > 0) {
			for(Object o : objs) {
				if(l != null) {
					a = new Cell(o, null);
					l.cdr = a;
					l = a;
				} else {
					l = new Cell(o, null);
				}
			}
			l.cdr = Cell.NIL;
			return l;
		} else {
			return Cell.NIL;
		}
	}

	/**
	 * 
	 * @param b
	 * @param v
	 * @param o
	 * @return
	 */
	public static Object traverse(Callback b, Environment v,
			Object o) {
		Object[] a, z;
		Object p;

		if(o instanceof Symbol) {
			if((p = v.find(o)) == null) {
				throw new IllegalArgumentException();
			} else {
				return p;
			}
		} else if(!(o instanceof Cell)) {
			return o;
		} else if((a = toArray(o))[0] == Symbol.IF) {
			if(a.length == 3) {
				return b.doIf(v, traverse(b, v, a[1]), a[2]);
			} else if(a.length == 4) {
				return b.doIf(v, traverse(b, v, a[1]), a[2], a[3]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.LAMBDA) {
			z = new Object[a.length - 2];
			for(int k = 2; k < a.length; k++) {
				z[k - 2] = a[k];
			}
			return b.doLambda(v, a[1], z);
		} else if(a[0] == Symbol.QUOTE) {
			if(a.length == 2) {
				return a[1];
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.DEFINE) {
			if(a.length == 3) {
				return b.doDefine(v, a[1], a[2]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.SET) {
			if(a.length == 3) {
				return b.doSet(v, a[1], a[2]);
			} else {
				throw new IllegalArgumentException();
			}
		} else {
			z = new Object[a.length - 1];
			for(int k = 1; k < a.length; k++) {
				z[k - 1] = traverse(b, v, a[k]);
			}
			return b.apply(v, traverse(b, v, a[0]), z);
		}
	}

	/**
	 * 
	 * @param b
	 * @param v
	 * @param rd
	 * @return
	 * @throws IOException
	 */
	public static Object eval(Callback b, Environment v,
			Reader rd) throws IOException {
		Object o, p = null;

		b.init(v);
		while((o = AttoParser.read(rd)) != null) {
			p = traverse(b, v, o);
		}
		return p;
	}

	/**
	 * 
	 * @param b
	 * @param v
	 * @param ins
	 * @return
	 * @throws IOException
	 */
	public static Object eval(Callback b, Environment v,
			InputStream ins) throws IOException {
		return eval(b, v, new InputStreamReader(ins));
	}

	/**
	 * 
	 * @param rd
	 */
	public static void repl(Reader rd) {
		Environment v = new Environment();
		Object o, p = null;

		SimpleEngine.INSTANCE.init(v);
		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					return;
				} else {
					p = traverse(SimpleEngine.INSTANCE, v, o);
					System.out.println(p);
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	/**
	 * 
	 * @param ins
	 */
	public static void repl(InputStream ins) {
		repl(new InputStreamReader(ins));
	}

	/**
	 * 
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) {
		repl(System.in);
	}

}
