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
	private static final Cell CONTK = new Cell(Symbol.get("lambda"),
			new Cell(new Cell(Symbol.get("k"), Cell.NIL),
					new Cell(Symbol.get("k"), Cell.NIL)));

	//
	Environment macroenv;
	Environment env;
	Environment cps;
	private boolean init = false;

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

			// setup CPS
			cps = new Environment();
			SimpleEngine.INSTANCE.init(cps);
			eval(cps, LispAtto.class.getResourceAsStream("lib.scm"));
			eval(cps, LispAtto.class.getResourceAsStream("cps.scm"));
			init = true;

			// setup environment
			env = new Environment();
			SimpleEngine.INSTANCE.initCPS(env);
			eval(LispAtto.class.getResourceAsStream("lib.scm"));
		} catch(IOException e) {
			throw new RuntimeException(e);
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
			p = AttoTraverser.traverse(b, v, o);
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

	private Object cps(Object o) {
		Object p = o;

		p = new Cell(Symbol.get("quote"), new Cell(p, Cell.NIL));
		p = new Cell(Symbol.get("cps"), new Cell(p, Cell.NIL));
		return p;
	}

	/**
	 * expand macros of an object and evaluate the expanded object.
	 * 
	 * @param p an object to be evaluated
	 * @return an evaluated object
	 */
	public Object eval(Environment env, Object p) {
		Object o = p;

		o = new Cell(Symbol.get("eval-macro"), new Cell(
				new Cell(Symbol.QUOTE, new Cell(o, Cell.NIL)),
				Cell.NIL));
		o = AttoTraverser.traverse(SimpleEngine.INSTANCE, macroenv, o);
		if(!init) {
			// do nothing
		} else if(!(p instanceof Cell)) {
			// do nothing
		} else if(((Cell)p).car.equals(Symbol.get("define"))) {
			o = AttoTraverser.traverse(SimpleEngine.INSTANCE, cps, cps(o));
		} else {
			o = new Cell(Symbol.get("lambda"),
					new Cell(Cell.NIL, new Cell(o, Cell.NIL)));
			o = AttoTraverser.traverse(SimpleEngine.INSTANCE, cps, cps(o));
			o = new Cell(o, new Cell(CONTK, Cell.NIL));
		}
		o = AttoTraverser.traverse(SimpleEngine.INSTANCE, env, o);
		return o;
	}

	/**
	 * read from a reader, expand macros of an read object and evaluate the object.
	 * 
	 * @param rd a reader to be read
	 * @return an evaluated object
	 * @throws IOException
	 */
	public Object eval(Environment env,
			Reader rd) throws IOException {
		Object o, p = UNDEF;

		while(true) {
			if((o = AttoParser.read(rd)) == null) {
				return p;
			} else {
				p = eval(env, o);
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
	public Object eval(Environment env,
			InputStream in) throws IOException {
		return eval(env, new InputStreamReader(in));
	}

	/**
	 * expand macros of an object and evaluate the expanded object.
	 * 
	 * @param p an object to be evaluated
	 * @return an evaluated object
	 */
	public Object eval(Object p) {
		return eval(env, p);
	}

	/**
	 * read from a reader, expand macros of an read object and evaluate the object.
	 * 
	 * @param rd a reader to be read
	 * @return an evaluated object
	 * @throws IOException
	 */
	public Object eval(Reader rd) throws IOException {
		return eval(env, rd);
	}

	/**
	 * read from an input stream, expand macros of an read object and evaluate the object.
	 * 
	 * @param in a reader to be read
	 * @return an evaluated object
	 * @throws IOException
	 */
	public Object eval(InputStream in) throws IOException {
		return eval(env, in);
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
