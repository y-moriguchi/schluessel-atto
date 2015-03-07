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
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Reader;

import net.morilib.lisp.atto.AttoParser;
import net.morilib.lisp.atto.AttoTraverser;
import net.morilib.lisp.atto.Environment;
import net.morilib.lisp.atto.LispAtto;
import net.morilib.lisp.atto.SimpleEngine;

/**
 * The main class of Schluessel Atto JS.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class LispAttoJS {

	//
	Environment macroenv;
	JSCallback jscall;

	/**
	 * The constructor of the class.
	 */
	public LispAttoJS() {
		try {
			// setup macro
			macroenv = new Environment();
			SimpleEngine.getInstance().init(macroenv);
			LispAtto.eval(SimpleEngine.getInstance(), macroenv,
					LispAttoJS.class.getResourceAsStream(
							"macro-atto.scm"));

			//
			jscall = new JSCallback(new PrintWriter(
					new OutputStreamWriter(System.out), true));
		} catch(IOException e) {
			throw new RuntimeException(e);
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

//		o = new Cell(Symbol.get("eval-macro"), new Cell(
//				new Cell(Symbol.QUOTE, new Cell(o, Cell.NIL)),
//				Cell.NIL));
//		o = AttoTraverser.traverse(SimpleEngine.getInstance(), macroenv, o);
		o = AttoTraverser.traverse(jscall, env, o);
		return o;
	}

	/**
	 * read-eval-print-loop of Schluessel Atto.
	 * 
	 * @param args the command line argument
	 * @throws Exception
	 */
	public static void main(String[] args) {
		LispAttoJS s = new LispAttoJS();
		Object o;
		Reader rd;

		rd = new InputStreamReader(System.in);
		System.out.print(" >");
		while(true) {
			try {
				if((o = AttoParser.read(rd)) == null) {
					System.exit(0);
				} else if(AttoParser.isInvaild(o)) {
					continue;
				} else {
					s.eval(new Environment(), o);
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
