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
 * An interface of the visitor of Schluessel Atto evaluator.
 * 
 * @author Yuichiro MORIGUCHI
 */
public interface Callback {

	/**
	 * Initialize the given environment.
	 * 
	 * @param env an environment
	 */
	public void init(Environment env);

	/**
	 * Initialize the given environment for continuation-passing style.
	 * 
	 * @param env an environment
	 */
	public void initCPS(Environment env);

	/**
	 * 
	 * @param env
	 * @param o
	 * @return
	 */
	public Object find(Environment env, Object o);

	/**
	 * 
	 * @param env
	 * @param o
	 * @return
	 */
	public Object value(Environment env, Object o);

	/**
	 * This will be called if the evaluator applies.
	 * 
	 * @param env  an environment
	 * @param f    an appliable object
	 * @param args arguments
	 * @return the result which this method is called
	 */
	public Object apply(Environment env, Object f, Object... args);

	/**
	 * This will be called if the evaluator processes the if special-form.
	 * 
	 * @param env    an environment
	 * @param cond   a condition
	 * @param dotrue an object which will be executed if the condition is true
	 * @return the result which this method is called
	 */
	public Object doIf(Environment env, Object cond, Object dotrue);

	/**
	 * This will be called if the evaluator processes the if special-form.
	 * 
	 * @param env     an environment
	 * @param cond    a condition
	 * @param dotrue  an object which will be executed if the condition is true
	 * @param dofalse an object which will be executed if the condition is false
	 * @return the result which this method is called
	 */
	public Object doIf(Environment env, Object cond, Object dotrue,
			Object dofalse);

	/**
	 * This will be called if the evaluator processed the define special-form.
	 * 
	 * @param env an environment
	 * @param sym a symbol to bound
	 * @param tobound an object to be bound
	 * @return the result which this method is called
	 */
	public Object doDefine(Environment env, Object sym, Object tobound);

	/**
	 * This will be called if the evaluator processed the lambda special-form.
	 * 
	 * @param env an environment
	 * @param args arguments of this procedure
	 * @param body the body of this procedure
	 * @return the result which this method is called
	 */
	public Object doLambda(Environment env, Object args, Object... body);

	/**
	 * This will be called if the evaluator processed the set! special-form.
	 * 
	 * @param env an environment
	 * @param sym a symbol to set
	 * @param toset an object to be set
	 * @return the result which this method is called
	 */
	public Object doSet(Environment env, Object sym, Object toset);

	/**
	 * This will be called if the evaluator processed the begin special-form.
	 * 
	 * @param env an environment
	 * @param body the body of this procedure
	 * @return the result which this method is called
	 */
	public Object doBegin(Environment env, Object... body);

	/**
	 * This will be called if the evaluator processed the delay special-form.
	 * 
	 * @param env an environment
	 * @param a
	 * @return the result which this method is called
	 */
	public Object doDelay(Environment env, Object a);

}
