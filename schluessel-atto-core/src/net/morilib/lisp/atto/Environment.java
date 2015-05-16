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
 * A class of environments of Schluessel Atto.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class Environment {

	//
	Environment root;
	Map<Symbol, Object> binds = new HashMap<Symbol, Object>();

	/**
	 * 
	 */
	public Environment() {}

	/**
	 * 
	 * @param root
	 */
	public Environment(Environment root) {
		this.root = root;
	}

	/**
	 * find an object which is bound by the given symbol.
	 * 
	 * @param sym the bounding symbol
	 * @return a bounded object, null if any object is not bound.
	 */
	public Object find(Object sym) {
		Object o;

		if((o = binds.get(sym)) != null) {
			return o;
		} else if(root != null) {
			return root.find(sym);
		} else {
			return null;
		}
	}

	/**
	 * set an object which is bound by the given symbol.
	 * 
	 * @param sym the bounding symbol
	 * @param val an object to set
	 * @return true if the object is set
	 */
	public boolean set(Symbol sym, Object val) {
		if(val == null) {
			throw new NullPointerException();
		} else if(binds.containsKey(sym)) {
			binds.put(sym, val);
			return true;
		} else if(root != null) {
			return root.set(sym, val);
		} else {
			return false;
		}
	}

}
