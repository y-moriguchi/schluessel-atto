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

public interface Callback {

	/**
	 * 
	 * @param env
	 */
	public void init(Environment env);

	/**
	 * 
	 * @param env
	 * @param f
	 * @param args
	 * @return
	 */
	public Object apply(Environment env, Object f, Object... args);

	/**
	 * 
	 * @param env
	 * @param cond
	 * @param dotrue
	 * @return
	 */
	public Object doIf(Environment env, Object cond, Object dotrue);

	/**
	 * 
	 * @param env
	 * @param cond
	 * @param dotrue
	 * @param dofalse
	 * @return
	 */
	public Object doIf(Environment env, Object cond, Object dotrue,
			Object dofalse);

	/**
	 * 
	 * @param env
	 * @param sym
	 * @param tobound
	 * @return
	 */
	public Object doDefine(Environment env, Object sym, Object tobound);

	/**
	 * 
	 * @param env
	 * @param args
	 * @param body
	 * @return
	 */
	public Object doLambda(Environment env, Object args, Object... body);

	/**
	 * 
	 * @param env
	 * @param sym
	 * @param toset
	 * @return
	 */
	public Object doSet(Environment env, Object sym, Object toset);

	/**
	 * 
	 * @param env
	 * @param body
	 * @return
	 */
	public Object doBegin(Environment env, Object... body);

}
