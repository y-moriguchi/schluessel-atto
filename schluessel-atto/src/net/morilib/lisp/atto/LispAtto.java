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

/**
 * The main class of Schluessel Atto.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class LispAtto {

	/**
	 * The object which represents undefined.
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
	 * The constructor of the class.
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

	//
	static BigInteger toBigInteger(Object o) {
		if(o instanceof Integer) {
			return BigInteger.valueOf(((Integer)o).intValue());
		} else if(o instanceof BigInteger) {
			return (BigInteger)o;
		} else if(o instanceof Double) {
			return null;
		} else {
			throw new IllegalArgumentException();
		}
	}

	//
	static Object toObject(BigInteger x) {
		if(x.compareTo(MAXINT) > 0 || x.compareTo(MININT) < 0) {
			return x;
		} else {
			return Integer.valueOf(x.intValue());
		}
	}

	/**
	 * convert the given list to an array.
	 * 
	 * @param o an object to be converted
	 * @return a converted array
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
	 * convert the given array to a cons cell.
	 * 
	 * @param objs an array to be converted
	 * @return a converted cons cell
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
	 * traverse an object by a visitor.
	 * 
	 * @param b a visitor to traverse
	 * @param v an environment
	 * @param o an object to be traversed
	 * @return an traversed object
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
	 * read and evaluate from the reader by a visitor.
	 * 
	 * @param b a visitor
	 * @param v an environment
	 * @param rd a reader to be read
	 * @return an evaluated object
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
	 * read and evaluate from the input stream by a visitor.
	 * 
	 * @param b a visitor
	 * @param v an environment
	 * @param rd a reader to be read
	 * @return an evaluated object
	 * @throws IOException
	 */
	public static Object eval(Callback b, Environment v,
			InputStream ins) throws IOException {
		return eval(b, v, new InputStreamReader(ins));
	}

	/**
	 * expand macros of an object and evaluate the expanded object.
	 * 
	 * @param p an object to be evaluated
	 * @return an evaluated object
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
	 * read from a reader, expand macros of an read object and evaluate the object.
	 * 
	 * @param rd a reader to be read
	 * @return an evaluated object
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
	 * read from an input stream, expand macros of an read object and evaluate the object.
	 * 
	 * @param in a reader to be read
	 * @return an evaluated object
	 * @throws IOException
	 */
	public Object eval(InputStream in) throws IOException {
		return eval(new InputStreamReader(in));
	}

	/**
	 * read-eval-print-loop of Schluessel Atto.
	 * 
	 * @param args the command line argument
	 * @throws Exception
	 */
	public static void main(String[] args) {
		LispAtto s = new LispAtto();
		Object o, p = UNDEF;
		Reader rd;

		rd = new InputStreamReader(System.in);
		System.out.print(" >");
		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					System.exit(0);
				} else if(o == AttoParser.INVALIDTOKEN) {
					continue;
				} else {
					p = s.eval(o);
					System.out.println(p);
				}
				System.out.print(" >");
			} catch(IOException e) {
				e.printStackTrace();
			} catch(IllegalArgumentException e) {
				e.printStackTrace();
			} catch(ArithmeticException e) {
				e.printStackTrace();
			}
		}
	}

}
