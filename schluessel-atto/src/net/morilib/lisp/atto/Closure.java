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

/**
 * A class of closures in Schluessel Atto.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class Closure implements Appliable {

	//
	private Environment env;
	private Object args;
	private Object[] body;

	//
	Closure(Environment env, Object args, Object... body) {
		this.env = env;
		this.args = args;
		this.body = new Object[body.length];
		System.arraycopy(body, 0, this.body, 0, body.length);
	}

	//
	private void _bind(Callback b, Environment e1, Object... as) {
		Object[] a;
		Object p = args;

		for(int k = 0; p != Cell.NIL; k++) {
			if(as[k] == null) {
				throw new NullPointerException();
			} else if(p instanceof Symbol) {
				a = new Object[as.length - k];
				System.arraycopy(as, k, a, 0, as.length - k);
				e1.binds.put((Symbol)p, LispAtto.toList(a));
				return;
			} else if(!(p instanceof Cell)) {
				throw new IllegalArgumentException();
			} else if(k >= as.length) {
				throw new IllegalArgumentException();
			} else if(((Cell)p).car instanceof Symbol) {
				e1.binds.put((Symbol)((Cell)p).car, as[k]);
				p = ((Cell)p).cdr;
			} else {
				throw new IllegalArgumentException();
			}
		}
	}

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Appliable#apply(net.morilib.lisp.atto.Callback, java.lang.Object[])
	 */
	public Object apply(Callback b, Environment e, Object... args) {
		Object r = Cell.NIL;
		Environment e1;

		e1 = new Environment(env);
		_bind(b, e1, args);
		for(Object o : body) {
			r = LispAtto.traverse(b, e1, o);
		}
		return r;
	}

}
