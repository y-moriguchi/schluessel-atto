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
package net.morilib.lisp.atto.js;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import net.morilib.lisp.atto.AttoParser;
import net.morilib.lisp.atto.AttoTraverser;
import net.morilib.lisp.atto.Cell;
import net.morilib.lisp.atto.Environment;
import net.morilib.lisp.atto.LispAtto;
import net.morilib.lisp.atto.SimpleEngine;
import net.morilib.lisp.atto.Symbol;

/**
 * The main class of Schluessel Atto JS.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class LispAttoJS {

	//
	Environment macroenv;
	JSCallback jscall;
	PrintWriter pw;

	/**
	 * The constructor of the class.
	 */
	public LispAttoJS(Writer wr) {
		try {
			// setup macro
			macroenv = new Environment();
			SimpleEngine.getInstance().init(macroenv);
			LispAtto.eval(SimpleEngine.getInstance(), macroenv,
					LispAttoJS.class.getResourceAsStream(
							"macro-atto.scm"));
			readmacro();

			//
			pw = new PrintWriter(wr, true);
			jscall = new JSCallback(pw);
		} catch(IOException e) {
			throw new RuntimeException(e);
		}
	}

	private void readmacro() {
		Reader rd = new InputStreamReader(
				LispAttoJS.class.getResourceAsStream("macro-lib.scm"));
		Object o;

		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					return;
				} else if(AttoParser.isInvaild(o)) {
					continue;
				} else {
					o = new Cell(Symbol.get("eval-macro"), new Cell(
							new Cell(Symbol.QUOTE, new Cell(o, Cell.NIL)),
							Cell.NIL));
					AttoTraverser.traverse(SimpleEngine.getInstance(),
							macroenv, o);
				}
			} catch(IOException e) {
				throw new RuntimeException(e);
			} catch(IllegalArgumentException e) {
				throw new RuntimeException(e);
			} catch(ArithmeticException e) {
				throw new RuntimeException(e);
			}
		}
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
		o = AttoTraverser.traverse(SimpleEngine.getInstance(),
				macroenv, o);
		o = AttoTraverser.traverse(jscall, env, o);
		pw.flush();
		return o;
	}

	private static void loadJs(String load,
			ScriptEngineManager mn, ScriptEngine en) {
		try {
			en.eval(new InputStreamReader(
					LispAttoJS.class.getResourceAsStream(load)));
		} catch(ScriptException e1) {
			throw new RuntimeException(e1);
		}
	}

	/**
	 * 
	 * @param rd
	 * @param out
	 * @throws IOException
	 */
	public static void outputJS(Reader rd,
			PrintWriter out) throws IOException {
		LispAttoJS s;
		Object o;
		StringWriter sw;

		while(true) {
			if((o = AttoParser.read(rd)) == null) {
				return;
			} else if(AttoParser.isInvaild(o)) {
				continue;
			} else {
				sw = new StringWriter();
				s = new LispAttoJS(sw);
				s.eval(new Environment(), o);
				out.println(sw.toString());
			}
		}
	}

	/**
	 * read-eval-print-loop of Schluessel Atto.
	 * 
	 * @param args the command line argument
	 * @throws Exception
	 */
	public static void main(String[] args) {
		LispAttoJS s;
		Object o;
		Reader rd;
		StringWriter sw;
		ScriptEngineManager mn;
		ScriptEngine en;
		InputStream is;
		String pr;

		mn = new ScriptEngineManager();
		en = mn.getEngineByName("javascript");
		loadJs("mille-atto.js", mn, en);

		if(args.length > 0) {
			pr = "";
			is = LispAttoJS.class.getResourceAsStream("lib.scm");
		} else {
			loadJs("lib.js", mn, en);
			pr = " >";
			is = System.in;
		}

		rd = new InputStreamReader(is);
		System.out.print(pr);
		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					System.exit(0);
				} else if(AttoParser.isInvaild(o)) {
					continue;
				} else {
					String js;
					Object r;

					sw = new StringWriter();
					s = new LispAttoJS(sw);
					s.eval(new Environment(), o);
					js = sw.toString();
					if(args.length > 0) {
						System.out.println(js);
					} else {
						r = en.eval(js);
						System.out.println(r);
					}
				}
				System.out.print(pr);
			} catch(IOException e) {
				e.printStackTrace();
			} catch(IllegalArgumentException e) {
				e.printStackTrace();
			} catch(ArithmeticException e) {
				e.printStackTrace();
			} catch(ScriptException e) {
				e.printStackTrace();
			}
		}
	}

}
