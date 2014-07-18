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
 * A class of the cons cell.
 * 
 * @author Yuichiro MORIGUCHI
 */
public class Cell {

	/**
	 * The nil object.
	 */
	public static Cell NIL = new Cell(null, null) {

		public String toString() {
			return "()";
		}

	};

	/**
	 * the car part of the cell.
	 */
	public Object car;

	/**
	 * the cdr part of the cell.
	 */
	public Object cdr;

	//
	Cell(Object a, Object d) {
		car = a;
		cdr = d;
	}

	//
	private void _put(StringBuffer b, Object o) {
		if(o instanceof String) {
			b.append('"').append(o).append('"');
		} else {
			b.append(o);
		}
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		StringBuffer b = new StringBuffer();
		String d = "(";
		Cell c = this;

		while(c != NIL) {
			b.append(d);
			_put(b, c.car);
			if(c.cdr instanceof Cell) {
				c = (Cell)c.cdr;
				d = " ";
			} else {
				b.append(" . ");
				_put(b, c.cdr);
				break;
			}
		}
		return b.append(")").toString();
	}

}
