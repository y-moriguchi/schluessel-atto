/*
 * Copyright 2014-2015 Yuichiro Moriguchi
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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import net.morilib.lisp.atto.AttoParser;
import net.morilib.lisp.atto.AttoTraverser;
import net.morilib.lisp.atto.Cell;
import net.morilib.lisp.atto.Environment;
import net.morilib.lisp.atto.LispAtto;
import net.morilib.lisp.atto.ReaderException;
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
	boolean basic;

	/**
	 * The constructor of the class.
	 */
	public LispAttoJS(Writer wr, boolean basic) {
		try {
			this.basic = basic;

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

		if(!basic) {
			o = new Cell(Symbol.get("eval-macro"), new Cell(
					new Cell(Symbol.QUOTE, new Cell(o, Cell.NIL)),
					Cell.NIL));
			o = AttoTraverser.traverse(SimpleEngine.getInstance(),
					macroenv, o);
		}
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
				s = new LispAttoJS(sw, false);
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
	public static void repl() {
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
		loadJs("sExpression.js", mn, en);
		loadJs("macro-atto.js", mn, en);
		loadJs("milia-lib.js", mn, en);

		pr = " >";
		is = System.in;
		rd = new InputStreamReader(is);
		System.out.print(pr);
		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					return;
				} else if(AttoParser.isInvaild(o)) {
					continue;
				} else {
					String js;
					Object r;

					sw = new StringWriter();
					s = new LispAttoJS(sw, false);
					s.eval(new Environment(), o);
					js = sw.toString();
					js = "(function(x){return x?x.toString():x}(" + js +"))";
					r = en.eval(js);
					System.out.println(r);
				}
			} catch(IOException e) {
				System.err.println("IO error");
				e.printStackTrace();
				return;
			} catch(IllegalArgumentException e) {
				System.err.println("Runtime error");
				e.printStackTrace();
			} catch(ArithmeticException e) {
				System.err.println("Arithmetic error");
				e.printStackTrace();
			} catch(ScriptException e) {
				System.err.println("JavaScript error");
				e.printStackTrace();
			}
			System.out.print(pr);
		}
	}

	private static final Pattern SUFFIX =
			Pattern.compile("(.*)\\.[^\\.]+");

	/**
	 * 
	 * @param args the command line argument
	 * @throws Exception
	 */
	public static boolean compile(String infile, String outfile,
			boolean basic) {
		PrintWriter pw = null; 
		LineNumberReader rd = null;
		StringWriter sw;
		LispAttoJS s;
		String js;
		Object o;

		try {
			rd = new LineNumberReader(new InputStreamReader(
					new FileInputStream(infile)));
			pw = new PrintWriter(new BufferedWriter(
					new OutputStreamWriter(
							new FileOutputStream(outfile))));
			while(true) {
				if((o = AttoParser.read(rd)) == null) {
					return true;
				} else if(!AttoParser.isInvaild(o)) {
					sw = new StringWriter();
					s  = new LispAttoJS(sw, basic);
					s.eval(new Environment(), o);
					js = sw.toString();
					pw.println(js);
				}
			}
		} catch(ReaderException e) {
			System.err.format("Reader error: %s(%d)\n", infile,
					rd.getLineNumber());
			return false;
		} catch(IOException e) {
			System.err.format("IO error: %s\n", infile);
			e.printStackTrace();
			return false;
		} finally {
			if(rd != null) {
				try {
					rd.close();
				} catch (IOException e) {
					System.err.format("IO error: %s", infile);
					e.printStackTrace();
					return false;
				}
			}
			if(pw != null) {
				pw.close();
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
		Matcher m;
		String of;
		File f;
		int r = 0;
		boolean basic = false;

		if(args.length > 0) {
			for(int i = 0; i < args.length; i++) {
				if(args[i].equals("-b")) {
					basic = true;
				} else {
					if((m = SUFFIX.matcher(args[i])).matches()) {
						of = m.group(1) + ".js";
					} else {
						of = args[i] + ".js";
					}
	
					if(!compile(args[i], of, basic)) {
						f = new File(of);
						f.delete();
						r = 2;
					}
				}
			}
		} else {
			repl();
		}
		System.exit(r);
	}

}
