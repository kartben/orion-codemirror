/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

define(["orion/Deferred"],function(e){function t(){this._namedListeners={}}return t.prototype={dispatchEvent:function(t){if(!t.type)throw new Error("unspecified type");var n=this._namedListeners[t.type];if(!n){var r=new e;return r.resolve(),r}var i=[];return n.forEach(function(e){try{var n=typeof e=="function"?e(t):e.handleEvent(t);n&&typeof n.then=="function"&&i.push(n)}catch(r){typeof console!="undefined"&&console.log(r)}}),e.all(i,function(e){typeof console!="undefined"&&console.log(e)})},addEventListener:function(e,t){if(typeof t=="function"||t.handleEvent)this._namedListeners[e]=this._namedListeners[e]||[],this._namedListeners[e].push(t)},removeEventListener:function(e,t){var n=this._namedListeners[e];if(n)for(var r=0;r<n.length;r++)if(n[r]===t){n.length===1?delete this._namedListeners[e]:n.splice(r,1);break}}},t.prototype.constructor=t,t.attach=function(e){var n=new t;e.dispatchEvent=n.dispatchEvent.bind(n),e.addEventListener=n.addEventListener.bind(n),e.removeEventListener=n.removeEventListener.bind(n)},t});