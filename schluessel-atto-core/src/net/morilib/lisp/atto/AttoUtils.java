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

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public final class AttoUtils {

	//
	static final BigInteger MAXINT =
			BigInteger.valueOf(Integer.MAX_VALUE);
	static final BigInteger MININT =
			BigInteger.valueOf(Integer.MIN_VALUE);

	//
	static BigInteger toBigInteger(Object o) {
		if(o instanceof Integer) {
			return BigInteger.valueOf(((Integer)o).intValue());
		} else if(o instanceof BigInteger) {
			return (BigInteger)o;
		} else if(o instanceof Double) {
			return null;
		} else {
			throw new IllegalArgumentException();
		}
	}

	//
	static Object toObject(BigInteger x) {
		if(x.compareTo(MAXINT) > 0 || x.compareTo(MININT) < 0) {
			return x;
		} else {
			return Integer.valueOf(x.intValue());
		}
	}

	/**
	 * convert the given list to an array.
	 * 
	 * @param o an object to be converted
	 * @return a converted array
	 */
	public static Object[] toArray(Object o) {
		List<Object> l;
		Cell c;

		if(!(o instanceof Cell)) {
			throw new IllegalArgumentException();
		}

		l = new ArrayList<Object>();
		for(c = (Cell)o; c != Cell.NIL; c = (Cell)c.cdr) {
			l.add(c.car);
			if(!(c.cdr instanceof Cell)) {
				throw new IllegalArgumentException();
			}
		}
		return l.toArray(new Object[0]);
	}

	/**
	 * convert the given array to a cons cell.
	 * 
	 * @param objs an array to be converted
	 * @return a converted cons cell
	 */
	public static Cell toList(Object... objs) {
		Cell l = null, r = Cell.NIL, a;

		if(objs.length > 0) {
			for(Object o : objs) {
				if(l != null) {
					a = new Cell(o, null);
					l.cdr = a;
					l = a;
				} else {
					r = l = new Cell(o, null);
				}
			}
			l.cdr = Cell.NIL;
		}
		return r;
	}

}
