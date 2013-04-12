/*global console define require window*/
var registerPlugin;
require(['orion/plugin', 'orion/EventTarget', 'orion/textview/textModel', 'orion/editor/mirror', 'orioncodemirror/mirrorTextModel', 'orioncodemirror/highlighter', 'requirejs/domReady!'],
	function(PluginProvider, EventTarget, mTextModel, mMirror, mMirrorTextModel, mHighlighter, document) {
		// Invert 1:1 map
		function invert(obj) {
			var result = {};
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					var arr = obj[key];
					if (arr instanceof Array) {
						for (var i=0; i < arr.length; i++) {
							var val = arr[i];
							result[val] = key;
						}
					} else {
						result[arr] = key;
					}
				}
			}
			return result;
		}

		var modes = ["clike", "clojure", "coffeescript", "css", "diff", "groovy", "haskell", "htmlmixed", "javascript", "jinja2", "lua", "markdown", "ntriples", "pascal", "perl", "php", "plsql", "python", "r", "rst", "ruby", "rust", "scheme", "smalltalk", "sparql", "stex", "tiddlywiki", "velocity", "xml", "xmlpure", "yaml"];
		// Orion's content type IDs are MIME-like but don't match CodeMirror's exactly, so we map them.
		var mime2ContentType = {
			"application/xml": "application/xml", // orion
			"text/x-java": "text/x-java-source", // orion
			"text/javascript": "application/javascript" // orion
		};
		var contentType2Mime = invert(mime2ContentType);
		var mime2Ext = {
			"text/x-csrc": ["c", "C", "h"],
			"text/x-c++src": ["cc", "cpp", "c++"],
			"text/x-clojure": ["clj"],
			"text/x-coffeescript": ["coffee"],
			"text/x-csharp": ["cs"],
			"text/css": ["css"],
			"text/x-diff": ["diff", "patch"],
			"text/x-groovy": ["groovy"],
			"text/x-haskell": ["hs"],
			"text/html": ["html", "htm"],
			"text/x-java": ["java"],
			"text/javascript": ["js"],
			"application/json": ["json"],
			"jinja2": [],
			"text/x-lua": ["lua"],
			"text/x-markdown": ["md"],
			"text/n-triples": ["nt"],
			"text/x-pascal": ["pascal", "p"],
			"text/x-perl": ["pl"],
			"text/x-php": ["php", "php3", "php4", "php5"],
			"application/x-httpd-php": ["phtml"],
			"text/x-plsql": ["sql"],
			"text/x-python": ["py"],
			"text/x-rsrc": ["r"],
			"text/x-rst": ["rst"],
			"text/x-ruby": ["rb"],
			"text/x-rust": ["rs", "rc"],
			"text/x-scheme": ["scm", "ss"],
			"text/x-stsrc": ["sm"],
			"application/x-sparql-query": ["spk"],
			"text/stex": [],
			"text/x-tiddlywiki": [],
			"text/velocity": [],
	//		"text/xml": ["xml"],
			"application/xml": ["xml"],
			"text/x-yaml": ["yaml", "yml"]
		};
		
		function getMimeForContentTypeId(contentTypeId) {
			return contentType2Mime[contentTypeId] || contentTypeId;
		}
		function getContentTypeIdForMime(mime) {
			return mime2ContentType[mime];
		}

		// Important: the modes we are about to load need the 'window.CodeMirror' object.
		// TODO replace this with a RequireJS 2 "shim" config
		var globalCodeMirror = window.CodeMirror = new mMirror.Mirror();
		require(['codemirror2-compressed/modes-compressed'], function(mModes) {
			function getMimes(modes) {
				return globalCodeMirror.listMIMEs().filter(
					function(mime) {
						var mname = globalCodeMirror._getModeName(mime);
						return modes.indexOf(mname) !== -1;
					});
			}
			// Create Orion content types for modes
			function getContentTypes(modes) {
				return getMimes(modes).map(function(mime) {
					return {
						id: getContentTypeIdForMime(mime) || mime,
						extension: mime2Ext[mime],
						"extends": "text/plain"
					};
				});
			}
			function createForm() {
				var list = document.getElementById("modelist");
				modes.forEach(function(mode) {
					var li = document.createElement("li");
					var label = document.createElement("div");
					var modeNode = document.createElement("a");
					modeNode.href = "http://codemirror.net/mode/" + mode + "/";
					modeNode.innerHTML = mode;
					label.appendChild(modeNode);
					li.appendChild(label);
					list.appendChild(li);
				});
			}
			
			function errback(e) {
				if (typeof console === "object" && console) {
					console.log("orion-codemirror: Couldn't install plugin: " + e);
				}
			}
			
			// Register plugin
			(function() {
				var modeSet = modes; // modeSet to install
				try {
					var model = new mMirrorTextModel.MirrorTextModel();
					var highlighter = new mHighlighter.Highlighter(model, globalCodeMirror);
					var contentTypes = getContentTypes(modeSet);
					
					var provider = new PluginProvider();
					provider.registerService("orion.edit.model", 
						{	
							onModelChanging: function(modelChangingEvent) {
								model.onTargetModelChanging(modelChangingEvent);
							},
							onScroll: function(scrollEvent) {
								highlighter.setViewportIndex(scrollEvent.topIndex);
							}
						},
						{ types: ["ModelChanging", "Scroll"],
						  contentType: contentTypes
						});
					
					// Register editor associations for installed modes
					provider.registerService("orion.file.contenttype", {},
						{	contentTypes: contentTypes
						});
					provider.registerService("orion.navigate.openWith", {},
						{	editor: "orion.editor",
							contentType: contentTypes.map(function(ct) { return ct.id; })
						});
			
					var highlighterServiceImpl = {
						setContentType: function(contentType) {
							var mime = getMimeForContentTypeId(contentType.id);
							if (mime) {
								highlighter.setMode(mime);
							} else {
								console.log("Missing MIME in content type " + contentType.id);
							}
						}
					};
					// Turn the service impl into an event emitter
					EventTarget.attach(highlighterServiceImpl);
					provider.registerService("orion.edit.highlighter",
						highlighterServiceImpl,
						{ type: "highlighter",
						  contentType: contentTypes
						});
					highlighter.addEventListener("StyleReady", function(styleReadyEvent) {
						styleReadyEvent.type = "orion.edit.highlighter.styleReady";
						highlighterServiceImpl.dispatchEvent(styleReadyEvent);
					});
					
					provider.connect(function(e){
		//				console.log("orion-codemirror: connected. Supported modes: [" + modeSet.join(",") + "]");
					}, errback);
				} catch (e) {
					errback(e);
				}
				
				createForm();
				document.getElementById("url").value =  window.location.href;
			}());
		});
});