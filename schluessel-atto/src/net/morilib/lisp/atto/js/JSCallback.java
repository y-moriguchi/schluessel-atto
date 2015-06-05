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
package net.morilib.lisp.atto.js;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import net.morilib.lisp.atto.AttoParser;
import net.morilib.lisp.atto.AttoTraverser;
import net.morilib.lisp.atto.Callback;
import net.morilib.lisp.atto.Cell;
import net.morilib.lisp.atto.Environment;
import net.morilib.lisp.atto.Keyword;
import net.morilib.lisp.atto.LispAtto;
import net.morilib.lisp.atto.RegexWrapper;
import net.morilib.lisp.atto.Symbol;

/**
 * 
 */
public class JSCallback implements Callback {

	//
	PrintWriter out;

	public JSCallback(PrintWriter writer) {
		out = writer;
	}

	@Override
	public void init(Environment env) {
	}

	@Override
	public void initCPS(Environment env) {
	}

	@Override
	public Object find(Environment env, Object o) {
		if(o instanceof Symbol) {
			out.print(" ");
			out.print("$env.find('");
			out.print(((Symbol)o).getName());
			out.print("')");
			out.print(" ");
		} else {
			value(env, o);
		}
		out.print(" ");
		return this;
	}

	private void printstr(String s) {
		for(int i = 0; i < s.length(); i++) {
			char c = s.charAt(i);

			if(c == '\"') {
				out.print("\\\"");
			} else if(c == '\'') {
				out.print("\\'");
			} else if(c == '\\') {
				out.print("\\\\");
			} else if(c == '\b') {
				out.print("\\b");
			} else if(c == '\t') {
				out.print("\\t");
			} else if(c == '\n') {
				out.print("\\n");
			} else if(c == '\f') {
				out.print("\\f");
			} else if(c == '\r') {
				out.print("\\r");
			} else if(c < ' ' || c >= 0x7f) {
				out.format("\\u%4d", (int)c);
			} else {
				out.print(c);
			}
		}
	}

	@SuppressWarnings("rawtypes")
	@Override
	public Object value(Environment env, Object o) {
		out.print(" ");
		if(o instanceof Number) {
			out.print(((Number)o).doubleValue());
		} else if(o.equals(LispAtto.UNDEF)) {
			out.print("undefined");
		} else if(o instanceof Symbol) {
			out.print("$mille.getSymbol('");
			out.print(((Symbol)o).getName());
			out.print("')");
		} else if(o instanceof String) {
			out.print('"');
			printstr((String)o);
			out.print('"');
		} else if(o instanceof Boolean) {
			out.print(o);
		} else if(o instanceof Character) {
			out.print((int)((Character)o).charValue());
		} else if(o.equals(Cell.NIL)) {
			out.print("$mille.nil");
		} else if(o instanceof java.util.List) {
			java.util.List l = (java.util.List)o;

			out.print("[");
			for(int i = 0; i < l.size(); i++) {
				if(i > 0) {
					out.print(",");
				}
				value(env, l.get(i));
			}
			out.print("]");
		} else if(o instanceof Cell) {
			out.print("$mille.cons(");
			value(env, ((Cell)o).car);
			out.print(",");
			value(env, ((Cell)o).cdr);
			out.print(")");
		} else if(o instanceof Double[]) {
			out.print("$mille.c.make(");
			out.print(((Double[])o)[0]);
			out.print(",");
			out.print(((Double[])o)[1]);
			out.print(")");
		} else if(o instanceof RegexWrapper) {
			out.print("(/");
			out.print(((RegexWrapper)o).getRegex());
			out.print("/");
			out.print(((RegexWrapper)o).getFlags());
			out.print(")");
		} else if(o instanceof Keyword) {
			out.print("$mille.getKeyword('");
			out.print(((Keyword)o).getName());
			out.print("')");
		} else if(o == AttoParser.NULL) {
			out.print("(null)");
		} else {
			out.print("#<object>");
		}
		out.print(" ");
		return this;
	}

	private String getKeyword(Object o) {
		if(o instanceof Keyword) {
			return ((Keyword)o).getName();
		} else {
			return null;
		}
	}

	private void outapplyargs(Environment env, Object... args) {
		String s, d = "";
		int i;

		for(i = 0; i < args.length; i++) {
			if(getKeyword(args[i]) != null) {
				break;
			}
			out.print(',');
			AttoTraverser.traverse(this, env, args[i]);
		}

		if(i < args.length) {
			out.print(",{");
			for(; i < args.length; i += 2) {
				s = getKeyword(args[i]);
				if(i + 1 >= args.length || s == null) {
					break;
				}
				out.print(d);
				out.print(s);
				out.print(':');
				AttoTraverser.traverse(this, env, args[i + 1]);
				d = ",";
			}
			out.print('}');
		}
	}

	@Override
	public Object apply(Environment env, Object f, Object... args) {
		String s;
		if(args.length >= 1 && f instanceof Symbol &&
				(s = ((Symbol)f).getName()).length() >= 2 &&
				s.startsWith(".")) {
			out.print("$mille.applyObject('");
			out.print(s.substring(1));
			out.print("'");
			outapplyargs(env, args);
			out.print(')');
		} else if(f instanceof Symbol &&
				((Symbol)f).getName().indexOf('.') > 0) {
			out.print("$env.applySymbol('");
			out.print(((Symbol)f).getName());
			out.print("'");
			outapplyargs(env, args);
			out.print(')');
		} else {
			out.print("$mille.apply(");
			AttoTraverser.traverse(this, env, f);
			outapplyargs(env, args);
			out.print(')');
		}
		return this;
	}

	@Override
	public Object doIf(Environment env, Object cond, Object dotrue) {
		out.print("(!((");
		AttoTraverser.traverse(this, env, cond);
		out.print(")===false) ? ");
		AttoTraverser.traverse(this, env, dotrue);
		out.print(" : undefined)");
		return this;
	}

	@Override
	public Object doIf(Environment env, Object cond, Object dotrue,
			Object dofalse) {
		out.print("(!((");
		AttoTraverser.traverse(this, env, cond);
		out.print(")===false) ? ");
		AttoTraverser.traverse(this, env, dotrue);
		out.print(" : ");
		AttoTraverser.traverse(this, env, dofalse);
		out.print(')');
		return this;
	}

	@Override
	public Object doDefine(Environment env, Object sym, Object tobound) {
		if(sym instanceof Symbol) {
			out.print("$env.bind('");
			out.print(((Symbol)sym).getName());
			out.print("', ");
			AttoTraverser.traverse(this, env, tobound);
			out.print(")");
			return this;
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
	}

	private void toarray(int l, Symbol r) {
		out.print("var a = $mille.a.toArray(arguments,");
		out.print(l + 1);
		out.print(");");
		out.print("$env.bind('");
		out.print(r.getName());
		out.print("',$mille.listToCell(a));");
	}

	@Override
	public Object doLambda(Environment env, Object args, Object... body) {
		if(args instanceof Cell) {
			List<Symbol> l = new ArrayList<Symbol>();
			Object o = args;
			Symbol r = null;

			while(true) {
				if(Cell.NIL.equals(o)) {
					break;
				} else if(o instanceof Cell) {
					if(((Cell)o).car instanceof Symbol) {
						l.add((Symbol)((Cell)o).car);
						o = ((Cell)o).cdr;
					} else {
						throw new IllegalArgumentException(
								((Cell)o).car.toString());
					}
				} else if(o instanceof Symbol) {
					r = (Symbol)o;
					break;
				} else {
					throw new IllegalArgumentException(o.toString());
				}
			}

			out.print("$mille.closure($env, this, function($env");
			for(int i = 0; i < l.size(); i++) {
				out.print(',');
				out.print("a");
				out.print(i);
			}
			out.print(") {");
			for(int i = 0; i < l.size(); i++) {
				out.print("$env.bind('");
				out.print(l.get(i).getName());
				out.print("', a");
				out.print(i);
				out.print(" === undefined ? null : a");
				out.print(i);
				out.print(");");
			}

			if(r != null) {
				toarray(l.size(), r);
			}
		} else if(args instanceof Symbol) {
			out.print("$mille.closure($env, this, function($env) {");
			toarray(0, (Symbol)args);
		} else {
			throw new IllegalArgumentException(args.toString());
		}
		out.print("return ");
		doBegin(env, body);
		out.print(";})");
		return this;
	}

	@Override
	public Object doSet(Environment env, Object sym, Object toset) {
		if(sym instanceof Symbol) {
			out.print("($env.set('");
			out.print(((Symbol)sym).getName());
			out.print("',");
			AttoTraverser.traverse(this, env, toset);
			out.print("), undefined)");
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
		return this;
	}

	@Override
	public Object doBegin(Environment env, Object... body) {
		out.print("(");
		for(int i = 0; i < body.length; i++) {
			if(i > 0) {
				out.print(',');
			}
			out.print("(");
			AttoTraverser.traverse(this, env, body[i]);
			out.print(")");
		}
		out.print(")");
		return this;
	}

	@Override
	public Object doDelay(Environment env, Object a) {
		out.print("$mille.delay(function(){return(");
		AttoTraverser.traverse(this, env, a);
		out.print(");})");
		return null;
	}

}
