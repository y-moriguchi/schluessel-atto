/*
 * Copyright (c) 2015, Yuichiro MORIGUCHI
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * * Neither the name of the Yuichiro MORIGUCHI nor the names of its contributors 
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Yuichiro MORIGUCHI BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if(!$mille) {
	throw 'Mille core library required';
}

(function(M) {
	M.w = {};
	M.w.ajax = function(options) {
		var xhr, conv, ct;
		xhr = new XMLHttpRequest();
		conv = function() {
			if(options.dataXML) {
				return xhr.responseXML;
			} else {
				return xhr.responseText;
			}
		};
		xhr.onreadystatechange = function() {
			var t;
			if(xhr.readyState === 4) {
				if(xhr.status === 200) { // OK
					t = conv();
					options.success(t);
				} else {
					options.error(xhr, xhr.status, false);
				}
				options.complete(xhr, xhr.status, false);
			}
		};

		try {
			xhr.open(options.type, options.url);
			if(options.type === 'GET') {
				xhr.send();
			} else {
				ct = options.contentType ?
						options.contentType : 'application/x-www-form-urlencoded';
				xhr.setRequestHeader('Content-Type', ct);
				xhr.send(options.data);
			}
		} catch(e) {
			options.error(xhr, false, e);
			options.complete(xhr, null);
		}
		return true;
	};

	M.ajaxAny = function(url, success, error, type, parser, data) {
		var opts = {};

		opts.type = type;
		opts.url = url;
		opts.success = function(t) {
			var o = parser(t);
			success(o);
		};
		opts.error = error;
		opts.data = data;
		M.w.ajax(opts);
	};
	M.ajaxGet = function(url, success, error) {
		M.checkString(url);
		M.checkFunction(success);
		M.checkFunction(error);
		M.ajaxAny(url, success, error, 'GET', M.readString);
	};
	M.ajaxGetText = function(url, success, error) {
		M.checkString(url);
		M.checkFunction(success);
		M.checkFunction(error);
		M.ajaxAny(url, success, error, 'GET', M.f.K);
	};
	M.ajaxPost = function(url, data, success, error) {
		M.checkString(url);
		M.checkString(data);
		M.checkFunction(success);
		M.checkFunction(error);
		M.ajaxAny(url, success, error, 'POST', M.readString, data);
	};
	M.ajaxPostText = function(url, data, success, error) {
		M.checkString(url);
		M.checkString(data);
		M.checkFunction(success);
		M.checkFunction(error);
		M.ajaxAny(url, success, error, 'POST', M.f.K, data);
	};

	M.bindg('ajax-get', M.ajaxGet);
	M.bindg('ajax-get-text', M.ajaxGetText);
	M.bindg('ajax-post', M.ajaxPost);
	M.bindg('ajax-post-text', M.ajaxPostText);

	M.readMilia = function() {
		var x, i, j, p;
		x = document.getElementsByTagName("script");
		for(i = 0; i < x.length; i++) {
			if(x[i].type === 'text/x-schluessel-milia') {
				p = M.readStringAll(x[i].text);
				for(j = 0; j < p.length; j++) {
					M.eval($env, p[j]);
				}
			}
		}
	};
	if(window.addEventListener) {
	    window.addEventListener('load', M.readMilia, false);
	} else if(window.attachEvent) {
	    window.attachEvent('onload', M.readMilia);
	} else {
	    window.onload = M.readMilia;
	}
}($mille));
