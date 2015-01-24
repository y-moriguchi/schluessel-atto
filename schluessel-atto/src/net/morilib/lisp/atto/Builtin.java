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
 * 
 */
public abstract class Builtin implements Appliable {

	/**
	 * 
	 * @param b
	 * @param args
	 * @return
	 */
	public abstract Object apply(Callback b, Object... args);

	/* (non-Javadoc)
	 * @see net.morilib.lisp.atto.Appliable#apply(net.morilib.lisp.atto.Callback, net.morilib.lisp.atto.Environment, java.lang.Object[])
	 */
	public Object apply(Callback b, Environment e, Object... args) {
		return apply(b, args);
	}

}
