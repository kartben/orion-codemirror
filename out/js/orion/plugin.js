/*******************************************************************************
 * @license
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

(function(){var e=this;e.define||(e.define=function(t){e.orion=e.orion||{},e.orion.PluginProvider=t(),e.eclipse=e.orion,delete e.define})})(),define([],function(){function e(e){function u(e){o&&(typeof ArrayBuffer=="undefined"&&(e=JSON.stringify(e)),o===self?o.postMessage(e):o.postMessage(e,"*"))}function a(){var e=[];for(var i=0;i<n.length;i++)e.push({serviceId:i,names:n[i].names,methods:n[i].methods,properties:n[i].properties});return{headers:t||{},services:e,conditions:r}}function f(e,t){return t&&t instanceof XMLHttpRequest?{status:t.status,statusText:t.statusText}:t}function l(e){return function(t){if(i){var n={serviceId:e,method:"dispatchEvent",params:[t]};u(n)}}}function c(e){if(e.source!==o)return;var t=typeof e.data!="string"?e.data:JSON.parse(e.data);if(typeof t.cancel=="string"){var r=s[t.id];r&&(delete s[t.id],r.cancel&&r.cancel(t.cancel));return}var i=t.serviceId,a=t.method,c=t.params,h=n[i],p=h.implementation,d=p[a],v;a==="addEventListener"?(v=c[0],h.listeners[v]=h.listeners[v]||l(i),c=[v,h.listeners[v]]):a==="removeEventListener"&&(v=c[0],c=[v,h.listeners[v]],delete h.listeners[v]);var m={id:t.id,result:null,error:null};try{var g=d.apply(p,c);g&&typeof g.then=="function"?(s[t.id]=g,g.then(function(e){delete s[t.id],m.result=e,u(m)},function(e){s[t.id]&&(delete s[t.id],m.error=e?JSON.parse(JSON.stringify(e,f)):e,u(m))},function(){u({requestId:t.id,method:"progress",params:Array.prototype.slice.call(arguments)})})):(m.result=g,u(m))}catch(y){m.error=y?JSON.parse(JSON.stringify(y,f)):y,u(m)}}var t=e,n=[],r=[],i=!1,s={},o=null;this.updateHeaders=function(e){if(i)throw new Error("Cannot update headers. Plugin Provider is connected");t=e},this.registerService=function(e,t,r){if(i)throw new Error("Cannot register service. Plugin Provider is connected");typeof e=="string"&&(e=[e]);var s=null,o=[];for(s in t)typeof t[s]=="function"&&o.push(s);var u=n.length;n[u]={names:e,methods:o,implementation:t,properties:r||{},listeners:{}}},this.registerServiceProvider=this.registerService,this.registerCondition=function(e,t){if(i)throw new Error("Cannot register condition. Plugin Provider is connected");r.push({name:e,properties:t})},this.connect=function(e,t){if(i){e&&e();return}if(typeof window=="undefined")o=self;else if(window!==window.parent)o=window.parent;else{if(window.opener===null){t&&t("No valid plugin target");return}o=window.opener}addEventListener("message",c,!1);var n={method:"plugin",params:[a()]};u(n),i=!0,e&&e()},this.disconnect=function(){i&&(removeEventListener("message",c),o=null,i=!1)}}return e});