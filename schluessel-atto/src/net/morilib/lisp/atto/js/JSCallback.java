package net.morilib.lisp.atto.js;

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
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import net.morilib.lisp.atto.AttoTraverser;
import net.morilib.lisp.atto.Callback;
import net.morilib.lisp.atto.Cell;
import net.morilib.lisp.atto.Environment;
import net.morilib.lisp.atto.LispAtto;
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

	@Override
	public Object value(Environment env, Object o) {
		out.print(" ");
		if(o instanceof Number) {
			out.print(((Number)o).doubleValue());
		} else if(o.equals(LispAtto.UNDEF)) {
			out.print("undefined");
		} else if(o instanceof Symbol) {
			out.print('"');
			out.print(((Symbol)o).getName());
			out.print('"');
		} else if(o instanceof String) {
			out.print('"');
			out.print(o);
			out.print('"');
		} else if(o instanceof Boolean) {
			out.print(o);
		} else {
			out.print("#<object>");
		}
		out.print(" ");
		return this;
	}

	@Override
	public Object apply(Environment env, Object f, Object... args) {
		out.print("$mille.apply(");
		AttoTraverser.traverse(this, env, f);
		for(Object o : args) {
			out.print(',');
			AttoTraverser.traverse(this, env, o);
		}
		out.print(')');
		return this;
	}

	@Override
	public Object doIf(Environment env, Object cond, Object dotrue) {
		out.print('(');
		AttoTraverser.traverse(this, env, cond);
		out.print(" ? ");
		AttoTraverser.traverse(this, env, dotrue);
		out.print(" : undefined)");
		return this;
	}

	@Override
	public Object doIf(Environment env, Object cond, Object dotrue,
			Object dofalse) {
		out.print('(');
		AttoTraverser.traverse(this, env, cond);
		out.print(" ? ");
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
			out.print(");");
			return this;
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
	}

	private void toarray(int l, Symbol r) {
		out.print("var a = $mille.a.toArray(arguments,");
		out.print(l);
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

			out.print("$mille.closure($env, function($env");
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
			out.print("$mille.closure($env, function($env) {");
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
			out.print("(function() {");
			out.print("$env.set('");
			out.print(((Symbol)sym).getName());
			out.print("',");
			AttoTraverser.traverse(this, env, toset);
			out.print("); return undefined;");
			out.print("})()");
		} else {
			throw new IllegalArgumentException(sym.toString());
		}
		return this;
	}

	@Override
	public Object doBegin(Environment env, Object... body) {
		out.print("(function() {var ret;");
		for(Object o : body) {
			out.print("ret=(");
			AttoTraverser.traverse(this, env, o);
			out.print(");");
		}
		out.print(" return ret;})()");
		return this;
	}

}
