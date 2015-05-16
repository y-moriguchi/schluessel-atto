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
public class CPSWrapper implements Appliable {

	//
	private Appliable direct;

	/**
	 * 
	 * @param d
	 */
	public CPSWrapper(Appliable d) {
		direct = d;
	}

	@Override
	public Object apply(Callback b, Environment e, Object... args) {
		Appliable a;
		Object[] c;
		Object r;

		a = (Appliable)args[0];
		c = new Object[args.length - 1];
		System.arraycopy(args, 1, c, 0, c.length);
		r = direct.apply(b, e, c);
		return a.apply(b, e, r);
	}

}
