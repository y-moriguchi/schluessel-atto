/*
 * Copyright 2014-2015 Yuichiro Moriguchi
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
if(!$mille) {
	throw 'Mille core library required';
}

$mille.w = {};
$mille.w.ajax = function(options) {
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

$mille.ajaxAny = function(url, success, error, type, parser, data) {
	var opts = {};

	opts.type = type;
	opts.url = url;
	opts.success = function(t) {
		var o = parser(t);
		success(o);
	};
	opts.error = error;
	opts.data = data;
	$mille.w.ajax(opts);
};
$mille.ajaxGet = function(url, success, error) {
	$mille.checkString(url);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'GET', $mille.readString);
};
$mille.ajaxGetText = function(url, success, error) {
	$mille.checkString(url);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'GET', $mille.f.K);
};
$mille.ajaxPost = function(url, data, success, error) {
	$mille.checkString(url);
	$mille.checkString(data);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'POST', $mille.readString, data);
};
$mille.ajaxPostText = function(url, data, success, error) {
	$mille.checkString(url);
	$mille.checkString(data);
	$mille.checkFunction(success);
	$mille.checkFunction(error);
	$mille.ajaxAny(url, success, error, 'POST', $mille.f.K, data);
};

$mille.bindg('ajax-get', $mille.ajaxGet);
$mille.bindg('ajax-get-text', $mille.ajaxGetText);
$mille.bindg('ajax-post', $mille.ajaxPost);
$mille.bindg('ajax-post-text', $mille.ajaxPostText);

$mille.readMilia = function() {
	var x, v, i;
	x = document.getElementsByTagName("script");
	for(i = 0; i < x.length; i++) {
		if(x[i].type === 'text/x-schluessel-milia') {
			$mille.eval($env, $mille.readString(x[i].text));
		}
	}
};
if(window.addEventListener) {
    window.addEventListener('load', $mille.readMilia, false);
} else if(window.attachEvent) {
    window.attachEvent('onload', $mille.readMilia);
} else {
    window.onload = $mille.readMilia;
}
