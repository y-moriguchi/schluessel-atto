package net.morilib.lisp.atto;

public interface Appliable {

	/**
	 * 
	 * @param b
	 * @param args
	 * @return
	 */
	public Object apply(Callback b, Object... args);

}
