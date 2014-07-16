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

public class LispAtto {

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

	//
	Environment macroenv;
	Environment env;

	/**
	 * 
	 */
	public LispAtto() {
		try {
			// setup macro
			macroenv = new Environment();
			SimpleEngine.INSTANCE.init(macroenv);
			eval(SimpleEngine.INSTANCE, macroenv,
					LispAtto.class.getResourceAsStream(
							"macro-atto.scm"));

			// setup environment
			env = new Environment();
			SimpleEngine.INSTANCE.init(env);
			eval(LispAtto.class.getResourceAsStream("lib.scm"));
		} catch(IOException e) {
			throw new RuntimeException(e);
		}
	}

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
		Cell l = null, r = Cell.NIL, a;

		if(objs.length > 0) {
			for(Object o : objs) {
				if(l != null) {
					a = new Cell(o, null);
					l.cdr = a;
					l = a;
				} else {
					r = l = new Cell(o, null);
				}
			}
			l.cdr = Cell.NIL;
		}
		return r;
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
				throw new IllegalArgumentException(
						"unbound symbol: " + o);
			} else {
				return p;
			}
		} else if(!(o instanceof Cell) || o == Cell.NIL) {
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
		} else if(a[0] == Symbol.BEGIN) {
			z = new Object[a.length - 1];
			for(int k = 1; k < a.length; k++) {
				z[k - 1] = a[k];
			}
			return b.doBegin(v, z);
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
	 * @param p
	 * @return
	 */
	public Object eval(Object p) {
		Object o = p;

		o = new Cell(Symbol.get("eval-macro"), new Cell(
				new Cell(Symbol.QUOTE, new Cell(o, Cell.NIL)),
				Cell.NIL));
		o = traverse(SimpleEngine.INSTANCE, macroenv, o);
//		System.out.println(o);
		o = traverse(SimpleEngine.INSTANCE, env, o);
		return o;
	}

	/**
	 * 
	 * @param rd
	 * @return
	 * @throws IOException
	 */
	public Object eval(Reader rd) throws IOException {
		Object o, p = UNDEF;

		while(true) {
			if((o = AttoParser.read(rd)) == null) {
				return p;
			} else {
				p = eval(o);
			}
		}
	}

	/**
	 * 
	 * @param in
	 * @return
	 * @throws IOException
	 */
	public Object eval(InputStream in) throws IOException {
		return eval(new InputStreamReader(in));
	}

	/**
	 * 
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) {
		LispAtto s = new LispAtto();
		Object o, p = UNDEF;
		Reader rd;

		rd = new InputStreamReader(System.in);
		while(true) {
			try {
				System.out.print(" >");
				if((o = AttoParser.read(rd)) == null) {
					System.exit(0);
				} else {
					p = s.eval(o);
					System.out.println(p);
				}
			} catch(IOException e) {
				e.printStackTrace();
			} catch(IllegalArgumentException e) {
				e.printStackTrace();
			}
		}
	}

}
