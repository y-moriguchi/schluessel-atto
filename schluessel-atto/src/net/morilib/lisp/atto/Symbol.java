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

import java.util.HashMap;
import java.util.Map;

/**
 * A class represents symbols.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class Symbol {

	//
	static Symbol IF = new Symbol("if");
	static Symbol QUOTE = new Symbol("quote");
	static Symbol LAMBDA = new Symbol("lambda");
	static Symbol SET = new Symbol("set!");
	static Symbol DEFINE = new Symbol("define");
	static Symbol BEGIN = new Symbol("begin");

	//
	private static Map<String, Symbol> symbols =
			new HashMap<String, Symbol>();

	//
	static {
		symbols.put("if",     IF);
		symbols.put("quote",  QUOTE);
		symbols.put("lambda", LAMBDA);
		symbols.put("set!",   SET);
		symbols.put("define", DEFINE);
		symbols.put("begin",  BEGIN);
	}

	//
	String name;

	//
	private Symbol(String n) {
		name = n;
	}

	/**
	 * get a symbol which corresponds to the given string.
	 * 
	 * @param s a symbol name
	 * @return a symbol
	 */
	public static Symbol get(String s) {
		Symbol r;

		synchronized(Symbol.class) {
			if((r = symbols.get(s)) == null) {
				symbols.put(s, r = new Symbol(s));
			}
			return r;
		}
	}

	/**
	 * get the symbol name.
	 * 
	 * @return symbol name
	 */
	public String getName() {
		return name;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return name;
	}

}
