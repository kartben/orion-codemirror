/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

define("orion/textview/textModel",["orion/textview/eventTarget"],function(e){function n(e,t){this._lastLineIndex=-1,this._text=[""],this._lineOffsets=[0],this.setText(e),this.setLineDelimiter(t)}var t=window.navigator.platform.indexOf("Win")!==-1;return n.prototype={find:function(e){this._text.length>1&&(this._text=[this._text.join("")]);var t=e.string,n=e.regex,r=t;!n&&t&&(r=t.replace(/([\\$\^*\/+?\.\(\)|{}\[\]])/g,"\\$&"));var i=null,s;if(r){var o=e.reverse,u=e.wrap,a=e.wholeWord,f=e.caseInsensitive,l=e.start||0,c=e.end,h=e.end!==undefined,p="";p.indexOf("g")===-1&&(p+="g"),f&&p.indexOf("i")===-1&&(p+="i"),a&&(r="\\b"+r+"\\b");var d=this._text[0],v,m,g=0;h&&(d=d.substring(l,c),g=l);var y=new RegExp(r,p);o?s=function(){var e=null;y.lastIndex=0;for(;;){m=y.lastIndex,v=y.exec(d);if(m===y.lastIndex)return null;if(!v)break;if(v.index<l)e={start:v.index+g,end:y.lastIndex+g};else{if(!u||e)break;l=d.length,e={start:v.index+g,end:y.lastIndex+g}}}return e&&(l=e.start),e}:(h||(y.lastIndex=l),s=function(){for(;;){m=y.lastIndex,v=y.exec(d);if(m===y.lastIndex)return null;if(v)return{start:v.index+g,end:y.lastIndex+g};if(m!==0&&u)continue;break}return null}),i=s()}return{next:function(){var e=i;return e&&(i=s()),e},hasNext:function(){return i!==null}}},getCharCount:function(){var e=0;for(var t=0;t<this._text.length;t++)e+=this._text[t].length;return e},getLine:function(e,t){var n=this.getLineCount();if(0<=e&&e<n){var r=this._lineOffsets[e];if(e+1<n){var i=this.getText(r,this._lineOffsets[e+1]);if(t)return i;var s=i.length,o;while((o=i.charCodeAt(s-1))===10||o===13)s--;return i.substring(0,s)}return this.getText(r)}return null},getLineAtOffset:function(e){var t=this.getCharCount();if(0<=e&&e<=t){var n=this.getLineCount();if(e===t)return n-1;var r,i,s=this._lastLineIndex;if(0<=s&&s<n){r=this._lineOffsets[s],i=s+1<n?this._lineOffsets[s+1]:t;if(r<=e&&e<i)return s}var o=n,u=-1;while(o-u>1){s=Math.floor((o+u)/2),r=this._lineOffsets[s],i=s+1<n?this._lineOffsets[s+1]:t;if(e<=r)o=s;else{if(e<i){o=s;break}u=s}}return this._lastLineIndex=o,o}return-1},getLineCount:function(){return this._lineOffsets.length},getLineDelimiter:function(){return this._lineDelimiter},getLineEnd:function(e,t){var n=this.getLineCount();if(0<=e&&e<n){if(e+1<n){var r=this._lineOffsets[e+1];if(t)return r;var i=this.getText(Math.max(this._lineOffsets[e],r-2),r),s=i.length,o;while((o=i.charCodeAt(s-1))===10||o===13)s--;return r-(i.length-s)}return this.getCharCount()}return-1},getLineStart:function(e){return 0<=e&&e<this.getLineCount()?this._lineOffsets[e]:-1},getText:function(e,t){e===undefined&&(e=0),t===undefined&&(t=this.getCharCount());if(e===t)return"";var n=0,r=0,i;while(r<this._text.length){i=this._text[r].length;if(e<=n+i)break;n+=i,r++}var s=n,o=r;while(r<this._text.length){i=this._text[r].length;if(t<=n+i)break;n+=i,r++}var u=n,a=r;if(o===a)return this._text[o].substring(e-s,t-u);var f=this._text[o].substring(e-s),l=this._text[a].substring(0,t-u);return f+this._text.slice(o+1,a).join("")+l},onChanging:function(e){return this.dispatchEvent(e)},onChanged:function(e){return this.dispatchEvent(e)},setLineDelimiter:function(e){e==="auto"&&(e=undefined,this.getLineCount()>1&&(e=this.getText(this.getLineEnd(0),this.getLineEnd(0,!0)))),this._lineDelimiter=e?e:t?"\r\n":"\n"},setText:function(e,t,n){e===undefined&&(e=""),t===undefined&&(t=0),n===undefined&&(n=this.getCharCount());if(t===n&&e==="")return;var r=this.getLineAtOffset(t),i=this.getLineAtOffset(n),s=t,o=n-t,u=i-r,a=e.length,f=0,l=this.getLineCount(),c=0,h=0,p=0,d=[];for(;;){c!==-1&&c<=p&&(c=e.indexOf("\r",p)),h!==-1&&h<=p&&(h=e.indexOf("\n",p));if(h===-1&&c===-1)break;c!==-1&&h!==-1?c+1===h?p=h+1:p=(c<h?c:h)+1:c!==-1?p=c+1:p=h+1,d.push(t+p),f++}var v={type:"Changing",text:e,start:s,removedCharCount:o,addedCharCount:a,removedLineCount:u,addedLineCount:f};this.onChanging(v);if(d.length===0){var m=this.getLineStart(r),g;i+1<l?g=this.getLineStart(i+1):g=this.getCharCount(),t!==m&&(e=this.getText(m,t)+e,t=m),n!==g&&(e+=this.getText(n,g),n=g)}var y=a-o;for(var b=r+u+1;b<l;b++)this._lineOffsets[b]+=y;var w=[r+1,u].concat(d);Array.prototype.splice.apply(this._lineOffsets,w);var E=0,S=0,x;while(S<this._text.length){x=this._text[S].length;if(t<=E+x)break;E+=x,S++}var T=E,N=S;while(S<this._text.length){x=this._text[S].length;if(n<=E+x)break;E+=x,S++}var C=E,k=S,L=this._text[N],A=this._text[k],O=L.substring(0,t-T),M=A.substring(n-C),_=[N,k-N+1];O&&_.push(O),e&&_.push(e),M&&_.push(M),Array.prototype.splice.apply(this._text,_),this._text.length===0&&(this._text=[""]);var D={type:"Changed",start:s,removedCharCount:o,addedCharCount:a,removedLineCount:u,addedLineCount:f};this.onChanged(D)}},e.EventTarget.addMixin(n.prototype),{TextModel:n}});