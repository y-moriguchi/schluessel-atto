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
 * A class represents keywords.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class Keyword {

	//
	private static Map<String, Keyword> keywords =
			new HashMap<String, Keyword>();

	//
	String name;

	//
	private Keyword(String n) {
		name = n;
	}

	/**
	 * get a symbol which corresponds to the given string.
	 * 
	 * @param s a symbol name
	 * @return a symbol
	 */
	public static Keyword get(String s) {
		Keyword r;

		synchronized(Keyword.class) {
			if((r = keywords.get(s)) == null) {
				keywords.put(s, r = new Keyword(s));
			}
			return r;
		}
	}

	/**
	 * get the keyword name.
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
		return ":" + name;
	}

}
