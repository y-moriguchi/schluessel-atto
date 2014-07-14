package net.morilib.lisp.atto;

import java.util.HashMap;
import java.util.Map;

public class Environment {

	//
	Environment root;
	Map<Symbol, Object> binds = new HashMap<Symbol, Object>();

	//
	Environment() {}

	//
	Environment(Environment root) {
		this.root = root;
	}

	/**
	 * 
	 * @param sym
	 * @return
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

}
