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

import java.io.Reader;
import java.math.BigInteger;

/**
 * 
 * @author Yuichiro MORIGUCHI
 */
public class AttoParser   {

	/* @@@-PARSER-CODE-START-@@@ */
	static class TokenException extends RuntimeException {
	}

	static abstract class Engine {
		abstract int step(Object c) throws java.io.IOException;
		abstract boolean accepted();
		abstract boolean isDead();
		abstract boolean isEmptyTransition();
		abstract int execaction(Object c);
		abstract boolean isend();
		abstract int recover(Exception e);
		abstract int deadState();
		abstract int stateSize();
		abstract int finallyState();
	}
	static final Object INVALIDTOKEN = new Object();
	private static final Object NINA_BEGIN = new Object();
	private static final int NINA_EOF = -1;
	private static final int NINA_ACCEPT = -8;
	private static final int NINA_FAIL = -9;
	private static final int NINA_HALT_ACCEPT = -91;
	private static final int NINA_HALT_REJECT = -72;
	private static final int NINA_YIELD = -85;
	private static final int NINA_STACKLEN = 72;
	static final int NINA_DISCARDSTATE = 0x40000000;
	static final int INITIAL = 0;
	static final int INDENT = 1;

	private int STATE;
	private int[] __sts = new int[NINA_STACKLEN];
	private Engine[] __stk = new Engine[NINA_STACKLEN];
	private Object[][] __stv = new Object[NINA_STACKLEN][];
	private int __slen = 0;
	private Object unread = null;

	Object _;
	java.util.List<Object> _l;
	Object yieldObject;
	Throwable exception;

	StringBuffer $buffer;
	int $int;
	java.math.BigInteger $bigint;
	Number $num;

	java.util.Stack<java.io.Reader> streamStack =
			new java.util.Stack<java.io.Reader>();

	void _initlist() {
		_l = new java.util.ArrayList<Object>();
	}

	void _addlist(Object x) {
		_l.add(x);
	}


private int _unreadl = -1;

	void INCLUDE(java.io.Reader rd) {
		streamStack.push(rd);
	}

	void INCLUDE(String name) throws java.io.IOException {
		java.io.InputStream ins;

		ins = new java.io.FileInputStream(name);
		INCLUDE(new java.io.InputStreamReader(ins));
	}

	int _read1l() throws java.io.IOException {
		int c;

		while(streamStack.size() > 0) {
			if((c = streamStack.peek().read()) >= 0) {
				return c;
			} else if(streamStack.size() > 1) {
				streamStack.pop().close();
			} else {
				streamStack.pop();
			}
		}
		return NINA_EOF;
	}

	int lexer_step(int $c) {
		switch(STATE) {
		case 0:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c == 9) {
				STATE = 2;
				return 1;
			} else if($c == '\n') {
				STATE = 2;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == ' ') {
				STATE = 2;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c == '"') {
				STATE = 3;
				return 1;
			} else if($c == '#') {
				STATE = 4;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c == '\'') {
				STATE = 5;
				return 1;
			} else if($c == '(') {
				STATE = 6;
				return 1;
			} else if($c == ')') {
				STATE = 6;
				return 1;
			} else if($c == '*') {
				STATE = 1;
				return 1;
			} else if($c == '+') {
				STATE = 7;
				return 1;
			} else if($c == ',') {
				STATE = 8;
				return 1;
			} else if($c == '-') {
				STATE = 7;
				return 1;
			} else if($c == '.') {
				STATE = 9;
				return 1;
			} else if($c == '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 10;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c == ';') {
				STATE = 11;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c == '`') {
				STATE = 5;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 11:
			if($c >= 0 && $c <= 9) {
				STATE = 11;
				return 1;
			} else if($c >= 11 && $c <= 2147483647) {
				STATE = 11;
				return 1;
			}
			return 0;
		case 10:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c == '-') {
				STATE = 1;
				return 1;
			} else if($c == '.') {
				STATE = 12;
				return 1;
			} else if($c == '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 10;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= 'D') {
				STATE = 1;
				return 1;
			} else if($c == 'E') {
				STATE = 13;
				return 1;
			} else if($c >= 'F' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 'd') {
				STATE = 1;
				return 1;
			} else if($c == 'e') {
				STATE = 13;
				return 1;
			} else if($c >= 'f' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 13:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c == '*') {
				STATE = 1;
				return 1;
			} else if($c == '+') {
				STATE = 14;
				return 1;
			} else if($c == '-') {
				STATE = 14;
				return 1;
			} else if($c >= '.' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 15;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 15:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 15;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 14:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 15;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 12:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 16;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 16:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 16;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= 'D') {
				STATE = 1;
				return 1;
			} else if($c == 'E') {
				STATE = 13;
				return 1;
			} else if($c >= 'F' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 'd') {
				STATE = 1;
				return 1;
			} else if($c == 'e') {
				STATE = 13;
				return 1;
			} else if($c >= 'f' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 9:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 16;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 8:
			if($c == '@') {
				STATE = 17;
				return 1;
			}
			return 0;
		case 17:
			return 0;
		case 7:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c == '-') {
				STATE = 1;
				return 1;
			} else if($c == '.') {
				STATE = 12;
				return 1;
			} else if($c == '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 18;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 18:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c == '-') {
				STATE = 1;
				return 1;
			} else if($c == '.') {
				STATE = 12;
				return 1;
			} else if($c == '/') {
				STATE = 1;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 18;
				return 1;
			} else if($c == ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= 'D') {
				STATE = 1;
				return 1;
			} else if($c == 'E') {
				STATE = 13;
				return 1;
			} else if($c >= 'F' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 'd') {
				STATE = 1;
				return 1;
			} else if($c == 'e') {
				STATE = 13;
				return 1;
			} else if($c >= 'f' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		case 6:
			return 0;
		case 5:
			return 0;
		case 4:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c == '(') {
				STATE = 20;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= 'A') {
				STATE = 19;
				return 1;
			} else if($c == 'B') {
				STATE = 21;
				return 1;
			} else if($c >= 'C' && $c <= 'N') {
				STATE = 19;
				return 1;
			} else if($c == 'O') {
				STATE = 22;
				return 1;
			} else if($c >= 'P' && $c <= 'W') {
				STATE = 19;
				return 1;
			} else if($c == 'X') {
				STATE = 23;
				return 1;
			} else if($c >= 'Y' && $c <= '[') {
				STATE = 19;
				return 1;
			} else if($c == '\\') {
				STATE = 24;
				return 1;
			} else if($c >= ']' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c == 'a') {
				STATE = 19;
				return 1;
			} else if($c == 'b') {
				STATE = 21;
				return 1;
			} else if($c >= 'c' && $c <= 'n') {
				STATE = 19;
				return 1;
			} else if($c == 'o') {
				STATE = 22;
				return 1;
			} else if($c >= 'p' && $c <= 'w') {
				STATE = 19;
				return 1;
			} else if($c == 'x') {
				STATE = 23;
				return 1;
			} else if($c >= 'y' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 24:
			if($c >= 0 && $c <= 8) {
				STATE = 25;
				return 1;
			} else if($c >= 9 && $c <= '\n') {
				STATE = 26;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 25;
				return 1;
			} else if($c == ' ') {
				STATE = 26;
				return 1;
			} else if($c == '!') {
				STATE = 25;
				return 1;
			} else if($c >= '"' && $c <= '#') {
				STATE = 26;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 25;
				return 1;
			} else if($c >= '\'' && $c <= ')') {
				STATE = 26;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 25;
				return 1;
			} else if($c == ',') {
				STATE = 26;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 25;
				return 1;
			} else if($c == ';') {
				STATE = 26;
				return 1;
			} else if($c >= '<' && $c <= '@') {
				STATE = 25;
				return 1;
			} else if($c >= 'A' && $c <= 'Z') {
				STATE = 27;
				return 1;
			} else if($c >= '[' && $c <= '_') {
				STATE = 25;
				return 1;
			} else if($c == '`') {
				STATE = 26;
				return 1;
			} else if($c >= 'a' && $c <= 'z') {
				STATE = 27;
				return 1;
			} else if($c >= '{' && $c <= 2147483647) {
				STATE = 25;
				return 1;
			}
			return 0;
		case 27:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '@') {
				STATE = 19;
				return 1;
			} else if($c >= 'A' && $c <= 'Z') {
				STATE = 28;
				return 1;
			} else if($c >= '[' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 'z') {
				STATE = 28;
				return 1;
			} else if($c >= '{' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 28:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '@') {
				STATE = 19;
				return 1;
			} else if($c >= 'A' && $c <= 'Z') {
				STATE = 28;
				return 1;
			} else if($c >= '[' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 'z') {
				STATE = 28;
				return 1;
			} else if($c >= '{' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 26:
			return 0;
		case 25:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 23:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 29;
				return 1;
			} else if($c == ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '@') {
				STATE = 19;
				return 1;
			} else if($c >= 'A' && $c <= 'F') {
				STATE = 29;
				return 1;
			} else if($c >= 'G' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 'f') {
				STATE = 29;
				return 1;
			} else if($c >= 'g' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 29:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c >= '0' && $c <= '9') {
				STATE = 29;
				return 1;
			} else if($c == ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '@') {
				STATE = 19;
				return 1;
			} else if($c >= 'A' && $c <= 'F') {
				STATE = 29;
				return 1;
			} else if($c >= 'G' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 'f') {
				STATE = 29;
				return 1;
			} else if($c >= 'g' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 22:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c >= '0' && $c <= '7') {
				STATE = 30;
				return 1;
			} else if($c >= '8' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 30:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c >= '0' && $c <= '7') {
				STATE = 30;
				return 1;
			} else if($c >= '8' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 21:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c == '0') {
				STATE = 31;
				return 1;
			} else if($c == '1') {
				STATE = 31;
				return 1;
			} else if($c >= '2' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 31:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= '/') {
				STATE = 19;
				return 1;
			} else if($c == '0') {
				STATE = 31;
				return 1;
			} else if($c == '1') {
				STATE = 31;
				return 1;
			} else if($c >= '2' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 20:
			return 0;
		case 19:
			if($c >= 0 && $c <= 8) {
				STATE = 19;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 19;
				return 1;
			} else if($c == '!') {
				STATE = 19;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 19;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 19;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 19;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 19;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 19;
				return 1;
			}
			return 0;
		case 3:
			if($c >= 0 && $c <= '!') {
				STATE = 3;
				return 1;
			} else if($c == '"') {
				STATE = 32;
				return 1;
			} else if($c >= '#' && $c <= '[') {
				STATE = 3;
				return 1;
			} else if($c == '\\') {
				STATE = 33;
				return 1;
			} else if($c >= ']' && $c <= 2147483647) {
				STATE = 3;
				return 1;
			}
			return 0;
		case 33:
			if($c >= 0 && $c <= 2147483647) {
				STATE = 3;
				return 1;
			}
			return 0;
		case 32:
			return 0;
		case 2:
			if($c == 9) {
				STATE = 2;
				return 1;
			} else if($c == '\n') {
				STATE = 2;
				return 1;
			} else if($c == ' ') {
				STATE = 2;
				return 1;
			}
			return 0;
		case 1:
			if($c >= 0 && $c <= 8) {
				STATE = 1;
				return 1;
			} else if($c >= 11 && $c <= 31) {
				STATE = 1;
				return 1;
			} else if($c == '!') {
				STATE = 1;
				return 1;
			} else if($c >= '$' && $c <= '&') {
				STATE = 1;
				return 1;
			} else if($c >= '*' && $c <= '+') {
				STATE = 1;
				return 1;
			} else if($c >= '-' && $c <= ':') {
				STATE = 1;
				return 1;
			} else if($c >= '<' && $c <= '_') {
				STATE = 1;
				return 1;
			} else if($c >= 'a' && $c <= 2147483647) {
				STATE = 1;
				return 1;
			}
			return 0;
		}
		return 0;
	}

	boolean lexer_accepted() {
		return (STATE == 1 ||
				STATE == 2 ||
				STATE == 5 ||
				STATE == 6 ||
				STATE == 7 ||
				STATE == 8 ||
				STATE == 9 ||
				STATE == 10 ||
				STATE == 11 ||
				STATE == 12 ||
				STATE == 13 ||
				STATE == 14 ||
				STATE == 15 ||
				STATE == 17 ||
				STATE == 16 ||
				STATE == 19 ||
				STATE == 18 ||
				STATE == 21 ||
				STATE == 20 ||
				STATE == 23 ||
				STATE == 22 ||
				STATE == 25 ||
				STATE == 24 ||
				STATE == 27 ||
				STATE == 26 ||
				STATE == 29 ||
				STATE == 28 ||
				STATE == 31 ||
				STATE == 30 ||
				STATE == 32);
	}

	Object lexer_gettoken(StringBuffer b) {
		String $$ = b.toString();

		switch(STATE) {
		case 11:
			// State7      
return null;
		case 14:
			// State11               
return Symbol.get($$);
		case 27:
			// State25        
return ch1($$);
		case 1:
			// State11               
return Symbol.get($$);
		case 24:
			// State6         
return shp($$);
		case 10:
			// State12         
return _int($$);
		case 15:
			// State13        
return dbl($$);
		case 25:
			// State23        
return ch1($$);
		case 8:
			// State20           
return MT.get($$);
		case 13:
			// State11               
return Symbol.get($$);
		case 19:
			// State6         
return shp($$);
		case 29:
			// State34        
return hex($$);
		case 6:
			// State27   
return $$;
		case 22:
			// State6         
return shp($$);
		case 26:
			// State23        
return ch1($$);
		case 32:
			// State2         
return str($$);
		case 16:
			// State13        
return dbl($$);
		case 12:
			// State11               
return Symbol.get($$);
		case 20:
			// State10   
return $$;
		case 9:
			// State27   
return $$;
		case 5:
			// State20           
return MT.get($$);
		case 2:
			// State9      
return null;
		case 21:
			// State6         
return shp($$);
		case 18:
			// State13        
return dbl($$);
		case 7:
			// State11               
return Symbol.get($$);
		case 17:
			// State21       
return MT.UNS;
		case 30:
			// State36        
return oct($$);
		case 28:
			// State24        
return chn($$);
		case 23:
			// State6         
return shp($$);
		case 31:
			// State32        
return bin($$);
		default:  return null;
		}
	}

	boolean lexer_isdead() {
return (false || STATE == 6 || STATE == 26 || STATE == 32 || STATE == 20 || STATE == 5 || STATE == 17);
	}

	int _read1ul() throws java.io.IOException {
		int c;

		if(_unreadl == -1) {
			c = _read1l();
		} else {
			c = _unreadl;
			_unreadl = -1;
		}
		return c;
	}

	Object _read1() throws java.io.IOException {
		StringBuffer b = new StringBuffer();
		Object o = null;
		boolean f;
		int a;
		int s;

		s = STATE;  STATE = 0;
		f = lexer_accepted();
		while(o == null) {
			if((a = _read1ul()) == -1) {
				o = lexer_gettoken(b);
				break;
			} else if(lexer_step(a) == 0) {
				if(f) {
					_unreadl = a;
					o = lexer_gettoken(b);
					b = new StringBuffer();
					STATE = 0;
					f = lexer_accepted();
				} else {
					o = INVALIDTOKEN;  break;
				}
			} else {
				b.appendCodePoint(a);
				if(f = lexer_accepted()) {
					if(lexer_isdead()) {
						o = lexer_gettoken(b);
						b = new StringBuffer();
						STATE = 0;
						f = lexer_accepted();
					}
				} else if(lexer_isdead()) {
					o = INVALIDTOKEN;  break;
				}
			}
		}
		STATE = s;
		return o;
	}

	private Object _read() throws java.io.IOException {
		Object c;

		while(true) {
			if(unread != null) {

				c = unread;
				unread = null;
				__logprint("Read unread: ", c);
			} else if((c = _read1()) != null) {
				__logprint("Read: ", c);
			} else {
				__logprint("Read end-of-file");
			}
			return c;
		}
	}

	void UNGET(Object c) {
		unread = c;
		__logprint("Set unread: ", c);
	}

	void __sleep(int m) {
		try {
			Thread.sleep(m);
		} catch(InterruptedException e) {
			throw new RuntimeException(e);
		}
	}

	private void __logprint(String s, Object c) {
	}

	private void __logopen() {
	}

	private void __logprint(String s) {
	}

	private void __logclose() {
	}

	private void __puttrace() {
	}


	private int AttoParser_step(Object  $c)  throws java.io.IOException {
		switch(STATE) {
		case 0:
			if($c == null) {
				STATE = 1;
				return 1;
			} else if($c != null) {
				UNGET($c);
				STATE = 1;
				return 1;
			}
		case 1:
			if(Character.valueOf('(').equals($c)) {
			} else if("(".equals($c)) {
				STATE = 2;
				return 1;
			} else if("#(".equals($c)) {
				STATE = 3;
				return 1;
			} else if($c instanceof MT) {
				STATE = 4;
				return 1;
			} else if($c instanceof Object) {
				STATE = 5;
				return 1;
			}
			return 0;
		case 5:
			return 0;
		case 4:
				STATE = 6;
				return 1;
		case 6:
			if($c != null) {
				__stkpush(7, ENGINE_AttoParser);
				STATE = 0;
				return NINA_ACCEPT;
			}
			return 0;
		case 7:
				STATE = 8;
				return 1;
		case 8:
			return 0;
		case 3:
			if(Character.valueOf(')').equals($c)) {
			} else if(")".equals($c)) {
				STATE = 9;
				return 1;
			} else if($c == null) {
				STATE = 10;
				return 1;
			} else if($c != null) {
				UNGET($c);
				STATE = 10;
				return 1;
			}
		case 10:
			if($c != null) {
				__stkpush(11, ENGINE_AttoParser);
				STATE = 0;
				return NINA_ACCEPT;
			}
			return 0;
		case 11:
				STATE = 12;
				return 1;
		case 12:
			if(Character.valueOf(')').equals($c)) {
			} else if(")".equals($c)) {
				STATE = 13;
				return 1;
			} else if($c == null) {
				STATE = 10;
				return 1;
			} else if($c != null) {
				UNGET($c);
				STATE = 10;
				return 1;
			}
		case 13:
			return 0;
		case 9:
			return 0;
		case 2:
			if(Character.valueOf(')').equals($c)) {
			} else if(")".equals($c)) {
				STATE = 14;
				return 1;
			} else if($c == null) {
				STATE = 15;
				return 1;
			} else if($c != null) {
				UNGET($c);
				STATE = 15;
				return 1;
			}
		case 15:
			if($c != null) {
				__stkpush(16, ENGINE_AttoParser);
				STATE = 0;
				return NINA_ACCEPT;
			}
			return 0;
		case 16:
				STATE = 17;
				return 1;
		case 17:
			if(Character.valueOf(')').equals($c)) {
			} else if(")".equals($c)) {
				STATE = 18;
				return 1;
			} else if(Character.valueOf('.').equals($c)) {
			} else if(".".equals($c)) {
				STATE = 19;
				return 1;
			} else if($c == null) {
				STATE = 15;
				return 1;
			} else if($c != null) {
				UNGET($c);
				STATE = 15;
				return 1;
			}
		case 19:
			if($c != null) {
				__stkpush(20, ENGINE_AttoParser);
				STATE = 0;
				return NINA_ACCEPT;
			}
			return 0;
		case 20:
			if(Character.valueOf(')').equals($c)) {
			} else if(")".equals($c)) {
				STATE = 21;
				return 1;
			}
			return 0;
		case 21:
			return 0;
		case 18:
			return 0;
		case 14:
			return 0;
		}
		return 0;
	}

	private boolean AttoParser_accepted() {
		return (STATE == 0 ||
				STATE == 1 ||
				STATE == 18 ||
				STATE == 21 ||
				STATE == 5 ||
				STATE == 8 ||
				STATE == 9 ||
				STATE == 13 ||
				STATE == 14);
	}

	@SuppressWarnings("unchecked")
	int AttoParser_execaction(Object  $c) {
		switch(STATE) {
		case 12:
			// State9        
			((java.util.List<Object>)(__stv[__slen - 1][3])).add(_);
			break;
		case 9:
			// State38         
			_ = vec(((java.util.List<Object>)(__stv[__slen - 1][3])));
			break;
		case 16:
			break;
		case 3:
			// vec                                      
			(__stv[__slen - 1][3]) = new java.util.ArrayList<Object>();
			break;
		case 14:
			// State37      
			_ = Cell.NIL;
			break;
		case 13:
			// State10         
			_ = vec(((java.util.List<Object>)(__stv[__slen - 1][3])));
			break;
		case 0:
			break;
		case 15:
			break;
		case 20:
			break;
		case 4:
			// meta      
			(__stv[__slen - 1][4]) = $c;
			break;
		case 8:
			// State17             
			_ = mta(((MT)(__stv[__slen - 1][4])), _);
			break;
		case 5:
			// State19     
			_ = unw($c);
			break;
		case 18:
			// State6          
			_ = lst(((java.util.List<Object>)(__stv[__slen - 1][2])));
			break;
		case 19:
			break;
		case 7:
			break;
		case 11:
			break;
		case 1:
			// State8   
			_ = null;
			break;
		case 2:
			// lst                                      
			(__stv[__slen - 1][2]) = new java.util.ArrayList<Object>();
			break;
		case 21:
			// State13            
			_ = lst(((java.util.List<Object>)(__stv[__slen - 1][2])), _);
			break;
		case 6:
			break;
		case 10:
			break;
		case 17:
			// State5        
			((java.util.List<Object>)(__stv[__slen - 1][2])).add(_);
			break;
		}
		return 1;
	}

	boolean AttoParser_isend() {
		return (STATE == 17 ||
				STATE == 0 ||
				STATE == 16 ||
				STATE == 2 ||
				STATE == 3 ||
				STATE == 4 ||
				STATE == 7 ||
				STATE == 11 ||
				STATE == 12);
	}

	private final Engine ENGINE_AttoParser = new Engine() {

		int step(Object c) throws java.io.IOException {
			return AttoParser_step(c);
		}

		boolean accepted() {
			return AttoParser_accepted();
		}

		int execaction(Object c) {
			return AttoParser_execaction(c);
		}

		boolean isend() {
			return AttoParser_isend();
		}

		int recover(Exception e) {
			return -1;
		}

		int deadState() {
			return -1;
		}

		int stateSize() {
			return 22;
		}

		int finallyState() {
			return -1;
		}

		boolean isDead() {
		return (STATE == 18 ||
				STATE == 21 ||
				STATE == 5 ||
				STATE == 8 ||
				STATE == 9 ||
				STATE == 13 ||
				STATE == 14);
		}

		boolean isEmptyTransition() {
		return (STATE == 16 ||
				STATE == 4 ||
				STATE == 7 ||
				STATE == 11);
		}

		public String toString() {
			return "AttoParser";
		}

	};

	void __stkpush(int st, Engine en) {
		Object[][] c;
		Engine[] b;
		int[] a;

		if(__slen >= __sts.length) {
			a = new int[__sts.length * 2];
			b = new Engine[__stk.length * 2];
			c = new Object[__stk.length * 2][];
			System.arraycopy(__sts, 0, a, 0, __sts.length);
			System.arraycopy(__stk, 0, b, 0, __stk.length);
			System.arraycopy(__stv, 0, c, 0, __stv.length);
			__sts = a;
			__stk = b;
			__stv = c;
		}
		__sts[__slen] = st;
		__stk[__slen] = en;
		__stv[__slen++] = new Object[en.stateSize()];
	}

	private Object _parse(Object x, Boolean rt, boolean skip,
			int[] st) throws java.io.IOException {
		boolean b = false, p = skip;
		Object c = x;
		Engine en;
		int a;

		b = __stk[__slen - 1].accepted();
		if(rt.booleanValue()) {
			switch(__stk[__slen - 1].execaction(NINA_BEGIN)) {
			case NINA_ACCEPT:
				__logprint("accept " + __stk[__slen - 1]);
				st[0] = NINA_ACCEPT;  return null;
			case NINA_FAIL:
				__logprint("match failed: begin");
				__puttrace();
				st[0] = NINA_FAIL;  return null;
			case NINA_HALT_ACCEPT:
				__logprint("machine halted: begin");
				st[0] = NINA_HALT_ACCEPT;  return null;
			case NINA_HALT_REJECT:
				__logprint("machine halted: begin");
				st[0] = NINA_HALT_REJECT;  return null;
			case NINA_YIELD:
				__logprint("machine yielded: ", c);
				st[0] = NINA_YIELD;  return null;
			}
		}

		try {
			do {
				en = __stk[__slen - 1];
				if(p) {
					p = false;
				} else if((a = en.step(c)) > 0) {
					__logprint("transit to state " + STATE + ": ", c);
					b = en.accepted();
					switch(en.execaction(c)) {
					case NINA_ACCEPT:
						__logprint("accept " + __stk[__slen - 1]);
						UNGET(c);
						st[0] = NINA_ACCEPT;  return null;
					case NINA_FAIL:
						__logprint("match failed: ", c);
						__puttrace();
						UNGET(c);
						st[0] = NINA_FAIL;  return null;
					case NINA_HALT_ACCEPT:
						__logprint("machine halted: ", c);
						st[0] = NINA_HALT_ACCEPT;  return null;
					case NINA_HALT_REJECT:
						__logprint("machine halted: ", c);
						st[0] = NINA_HALT_REJECT;  return null;
					case NINA_YIELD:
						__logprint("machine yielded: ", c);
						st[0] = NINA_YIELD;  return null;
					}
				} else if(a < 0) {
					__logprint("entering " + __stk[__slen - 1]);
					return c;
				} else if(b) {
					__logprint("accept " + __stk[__slen - 1]);
					UNGET(c);
					st[0] = NINA_ACCEPT;  return null;
				} else if(c == null) {
					if(!b)  throw new TokenException();
					st[0] = NINA_ACCEPT;  return null;
				} else {
					__logprint("match failed: ", c);
					__puttrace();
					UNGET(c);
					st[0] = NINA_FAIL;  return null;
				}

				if(__stk[__slen - 1].isEmptyTransition()) {
					// do nothing
				} else if(!__stk[__slen - 1].isDead()) {
					c = _read();
				} else if(b) {
					__logprint("accept " + __stk[__slen - 1]);
					st[0] = NINA_ACCEPT;  return null;
				} else {
					__logprint("match failed: ", c);
					__puttrace();
					st[0] = NINA_FAIL;  return null;
				}
			} while(true);
		} catch(RuntimeException e) {
			UNGET(c);
			throw e;
		}
	}

	private Boolean execfinally() {
		int a, b;

		if((a = __stk[__slen - 1].finallyState()) >= 0) {
			b = STATE;  STATE = a;
			switch(__stk[__slen - 1].execaction(NINA_BEGIN)) {
			case NINA_HALT_ACCEPT:
				__slen = 0;
				return Boolean.TRUE;
			case NINA_HALT_REJECT:
				__slen = 0;
				return Boolean.FALSE;
			}
			STATE = b;
		}
		return null;
	}

	private int getdeadstate() {
		return __stk[__slen - 1].deadState();
	}

	private int getrecover(Exception e) {
		return __stk[__slen - 1].recover(e);
	}

	boolean parse(Engine entry) throws java.io.IOException {
		Boolean b = Boolean.FALSE;
		int[] a = new int[1];
		boolean skip = true;
		Object c = 0;

		__logopen();
		try {
			if(__slen == 0) {
				b = Boolean.TRUE;
				__stkpush(0, entry);
			}

			ot: while(true) {
				try {
					if((c = _parse(c, b, skip, a)) != null) {
						skip = false;
					} else if(a[0] == NINA_FAIL) {
						while((STATE = getdeadstate()) < 0) {
							if((b = execfinally()) != null)  break ot;
							if(__slen-- <= 1) {
								throw new TokenException();
							}
						}
						skip = true;
					} else if(a[0] == NINA_HALT_ACCEPT) {
						if((b = execfinally()) != null)  break;
						__slen = 0;
						b = Boolean.TRUE;  break;
					} else if(a[0] == NINA_HALT_REJECT) {
						if((b = execfinally()) != null)  break;
						__slen = 0;
						b = Boolean.FALSE;  break;
					} else if(a[0] == NINA_YIELD) {
						return false;
					} else if(__slen > 1) {
						if((b = execfinally()) != null)  break;
						STATE = __sts[--__slen];
						skip = true;
					} else {
						if((b = execfinally()) != null)  break;
						b = new Boolean(__stk[--__slen].accepted());
						break;
					}
				} catch(RuntimeException e) {
					exception = e;
					if(__slen <= 0)  throw e;
					while((STATE = getrecover(e)) < 0) {
						if((b = execfinally()) != null)  return b;
						if(__slen-- <= 1)  throw e;
					}
				}
				b = Boolean.TRUE;
			}
			if(!b.booleanValue())  throw new TokenException();
			return b.booleanValue();
		} finally {
			__logclose();
		}
	}

	boolean parse(java.io.Reader rd) throws java.io.IOException {
		streamStack.push(rd);
		return parse(ENGINE_AttoParser);
	}

	static boolean parseAll(java.io.Reader rd) throws java.io.IOException {
		AttoParser o = new AttoParser();

		return o.parse(rd);
	}

	void setStream(java.io.Reader rd) {
		if(streamStack.size() == 0) {
			throw new IllegalStateException();
		}
		yieldObject = rd;
		streamStack.push(rd);
	}

	Object parseNext() throws java.io.IOException {
		Object o;

		if(streamStack.size() == 0) {
			throw new IllegalStateException();
		} else if(yieldObject == null) {
			return null;
		} else if(parse(ENGINE_AttoParser)) {
			if(yieldObject == null)  throw new NullPointerException();
			o = yieldObject;  yieldObject = null;
			return o;
		} else {
			if(yieldObject == null)  throw new NullPointerException();
			return yieldObject;
		}
	}

	boolean parse(java.io.InputStream rd) throws java.io.IOException {
		return parse(new java.io.InputStreamReader(rd));
	}

	static boolean parseAll(
			java.io.InputStream rd) throws java.io.IOException {
		return parseAll(new java.io.InputStreamReader(rd));
	}

	/* @@@-PARSER-CODE-END-@@@ */
	private static enum MT {

		QUOTE("quote"), BQ("quasiquote"), UNQ("unquote"),
		UNS("unquote-splicing");

		private String name;

		private MT(String s) {
			name = s;
		}

		private static MT get(String s) {
			if(s.equals("'")) {
				return QUOTE;
			} else if(s.equals("`")) {
				return BQ;
			} else if(s.equals(",")) {
				return UNQ;
			} else if(s.equals(",@")) {
				return UNS;
			} else {
				throw new RuntimeException();
			}
		}

	}

	private static Character ch1(String s) {
		return Character.valueOf(s.charAt(2));
	}

	private static Character chn(String s) {
		String x = s.substring(2);

		if(x.equals("newline")) {
			return Character.valueOf('\n');
		} else if(x.equals("space")) {
			return Character.valueOf(' ');
		} else {
			throw new TokenException();
		}
	}

	private static Object str(String s) {
		StringBuffer b = new StringBuffer();
		int c;

		for(int k = 1; k < s.length() - 1; k++) {
			c = s.charAt(k);
			if(c != '\\') {
				b.append((char)c);
			} else if(k == s.length() - 2) {
				b.append('\\');
			} else if(s.charAt(++k) != 'u') {
				switch(s.charAt(k)) {
				case '"':  case '\\':  case '/':
					b.append(s.charAt(k));
					break;
				case 'b':  b.append('\b');  break;
				case 'f':  b.append('\f');  break;
				case 'n':  b.append('\n');  break;
				case 'r':  b.append('\r');  break;
				case 't':  b.append('\t');  break;
				default:   throw new TokenException();
				}
			} else if(k < s.length() - 4) {
				try {
					b.append((char)Integer.parseInt(
							s.substring(k, k + 3), 16));
					k += 3;
				} catch(NumberFormatException e) {
					throw new TokenException();
				}
			} else {
				throw new TokenException();
			}
		}
		return b.toString();
	}

	private static Object shp(String s) {
		String x = s.substring(1);

		if(x.equals("t")) {
			return Boolean.TRUE;
		} else if(x.equals("f")) {
			return Boolean.FALSE;
		} else {
			throw new TokenException();
		}
	}

	private static Double dbl(String s) {
		return Double.valueOf(s);
	}

	private static Object toint(BigInteger x) {
		if(x.compareTo(SchemeAtto.MAXINT) > 0 ||
				x.compareTo(SchemeAtto.MININT) < 0) {
			return x;
		} else {
			return Integer.valueOf(x.intValue());
		}
	}

	private static Object bin(String s) {
		return toint(new BigInteger(s.substring(2), 2));
	}

	private static Object oct(String s) {
		return toint(new BigInteger(s.substring(2), 8));
	}

	private static Object _int(String s) {
		return toint(new BigInteger(s));
	}

	private static Object hex(String s) {
		return toint(new BigInteger(s.substring(2), 16));
	}

	private static Object unw(Object o) {
		return o;
	}

	private static Object mta(MT m, Object o) {
		return new Cell(Symbol.get(m.name), new Cell(o, Cell.NIL));
	}

	private static Object lst(java.util.List<Object> l, Object d) {
		Cell r, c;

		if(l.size() > 0) {
			r = c = null;
			for(Object o : l) {
				if(r == null) {
					r = c = new Cell(null, null);
				} else {
					c.cdr = new Cell(null, null);
					c = (Cell)c.cdr;
				}
				c.car = o;
			}
			c.cdr = d;
			return r;
		} else {
			return d;
		}
	}

	private static Object lst(java.util.List<Object> l) {
		return lst(l, Cell.NIL);
	}

	private static Object vec(java.util.List<Object> l) {
		return l;
	}

	/**
	 * 
	 * @return
	 * @throws java.io.IOException
	 */
	public static Object read(Reader rd) throws java.io.IOException {
		AttoParser p;

		p = new AttoParser();
		p.parse(rd);
		return p._;
	}

}
