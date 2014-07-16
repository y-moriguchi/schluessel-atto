package net.morilib.lisp.atto;

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
			if(p instanceof Symbol) {
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
	public Object apply(Callback b, Object... args) {
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
