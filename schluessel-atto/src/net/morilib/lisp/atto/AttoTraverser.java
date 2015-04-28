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
public final class AttoTraverser {

	/**
	 * traverse an object by a visitor.
	 * 
	 * @param b a visitor to traverse
	 * @param v an environment
	 * @param o an object to be traversed
	 * @return an traversed object
	 */
	public static Object traverse(Callback b, Environment v,
			Object o) {
		Object[] a, z;
	
		if(o instanceof Symbol) {
			return b.find(v, o);
		} else if(o instanceof AttoParser.StringWrapper) {
			return b.value(v, ((AttoParser.StringWrapper)o).wrap);
		} else if(!(o instanceof Cell) || o == Cell.NIL) {
			return b.value(v, o);
		} else if((a = AttoUtils.toArray(o))[0] == Symbol.IF) {
			if(a.length == 3) {
				return b.doIf(v, a[1], a[2]);
			} else if(a.length == 4) {
				return b.doIf(v, a[1], a[2], a[3]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.LAMBDA) {
			z = new Object[a.length - 2];
			for(int k = 2; k < a.length; k++) {
				z[k - 2] = a[k];
			}
			return b.doLambda(v, a[1], z);
		} else if(a[0] == Symbol.QUOTE) {
			if(a.length == 2) {
				return b.value(v, a[1]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.BEGIN) {
			z = new Object[a.length - 1];
			for(int k = 1; k < a.length; k++) {
				z[k - 1] = a[k];
			}
			return b.doBegin(v, z);
		} else if(a[0] == Symbol.DEFINE) {
			if(a.length == 3) {
				return b.doDefine(v, a[1], a[2]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.SET) {
			if(a.length == 3) {
				return b.doSet(v, a[1], a[2]);
			} else {
				throw new IllegalArgumentException();
			}
		} else if(a[0] == Symbol.DELAY) {
			if(a.length == 2) {
				return b.doDelay(v, a[1]);
			} else {
				throw new IllegalArgumentException();
			}
		} else {
			z = new Object[a.length - 1];
			for(int k = 1; k < a.length; k++) {
				z[k - 1] = a[k];
			}
			return b.apply(v, a[0], z);
		}
	}

}
