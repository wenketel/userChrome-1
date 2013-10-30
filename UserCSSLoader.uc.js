// ==UserScript==
// @name           UserCSSLoader
// @description    Stylish みたいなもの
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @include        main
// @compatibility  Firefox 4
// @version        0.0.1
// ==/UserScript==

/****** 使い方 ******

chrome フォルダに CSS フォルダが作成されるのでそこに .css をぶち込むだけ。
ファイル名が "xul-" で始まる物、".as.css" で終わる物は AGENT_SHEET で、それ以外は USER_SHEET で読み込む。
ファイルの内容はチェックしないので @namespace 忘れに注意。

メニューバーに CSS メニューが追加される
メニューを左クリックすると ON/OFF
          中クリックするとメニューを閉じずに ON/OFF
          右クリックするとエディタで開く

エディタは "view_source.editor.path" に指定されているものを使う
フォルダは "UserCSSLoader.FOLDER" にパスを入れれば変更可能

 **** 説明終わり ****/

(function(){

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services)
	Cu.import("resource://gre/modules/Services.jsm");

// 起動時に他の窓がある（２窓目の）場合は抜ける
let list = Services.wm.getEnumerator("navigator:browser");
while(list.hasMoreElements()){ if(list.getNext() != window) return; }

if (window.UCL) {
	window.UCL.destroy();
	delete window.UCL;
}

window.UCL = {
	get prefs() {
		delete this.prefs;
		return this.prefs = Services.prefs.getBranch("UserCSSLoader.")
	},
	get readCSS() {
		let obj = {};
		try {
			let s = this.prefs.getComplexValue("disabled_list", Ci.nsISupportsString).data.split("|");
			if (s.length) {
				// disabled_list にあるファイルの状態を "" にしておく
				s.forEach(function(n) obj[n] = "");
			}
		} catch(e) {}
		delete this.readCSS;
		return this.readCSS = obj;
	},
	get styleSheetServices(){
		delete this.styleSheetServices;
		return this.styleSheetServices = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
	},
	get FOLDER() {
		let aFolder;
		try {
			// UserCSSLoader.FOLDER があればそれを使う
			let folderPath = this.prefs.getCharPref("FOLDER");
			aFolder = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile)
			aFolder.initWithPath(folderPath);
		} catch (e) {
			aFolder = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
			aFolder.appendRelativePath("CSS");
		}
		if( !aFolder.exists() || !aFolder.isDirectory() ) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.FOLDER;
		return this.FOLDER = aFolder;
	},
	init: function() {
		var mainMenubar = document.getElementById("main-menubar");
		var menu = document.createElement("menu");
		menu.setAttribute("id", "usercssloader-menu");
		menu.setAttribute("label", "CSS");
		menu.setAttribute("accesskey", "C");

		var menupopup = menu.appendChild(document.createElement("menupopup"));
		menupopup.setAttribute("id", "usercssloader-menupopup");

		var menuitem = menupopup.appendChild(document.createElement("menuitem"));
		menuitem.setAttribute("id", "usercssloader-rebuild");
		menuitem.setAttribute("label", "Rebuild");
		menuitem.setAttribute("accesskey", "R");
		menuitem.setAttribute("oncommand", "UCL.importAll(true);");
		menupopup.appendChild(document.createElement("menuseparator"));

		mainMenubar.appendChild(menu);

		this.importAll();
		window.addEventListener("unload", this, false);
	},
	uninit: function() {
		var dis = [];
		for (let [name, state] in Iterator(this.readCSS)) {
			if (state == "disabled") dis.push(name);
		}
		let str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		str.data = dis.join("|");
		this.prefs.setComplexValue("disabled_list", Ci.nsISupportsString, str);
		window.removeEventListener("unload", this, false);
	},
	destroy: function() {
		var i = document.getElementById("usercssloader-menu");
		if (i) i.parentNode.removeChild(i);
		this.uninit();
	},
	handleEvent: function(event) {
		switch(event.type){
		case "unload":
			this.uninit();
			break;
		}
	},
	importAll: function(isForced) {
		let ext = /\.css$/i;
		let files = this.FOLDER.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

		while (files.hasMoreElements()) {
			let file = files.getNext().QueryInterface(Ci.nsIFile);
			if (!ext.test(file.leafName)) continue;

			let isEnable = this.readCSS[file.leafName] != "disabled" && this.readCSS[file.leafName] != "";
			this.setCSS(file, isEnable, isForced);
		}
	},
	setCSS: function(aFile, isEnable, isForced) {
		// CSS の読み込み、メニューの作成・チェックの変更を全てこの関数で行う
		var leafName = "";
		if (typeof aFile == "string") {
			// aFile がファイル名だった場合
			leafName = aFile;
			aFile = this.getFileFromLeafname(aFile);
		} else {
			leafName = aFile.leafName;
		}
		if (arguments.length == 1) {
			// 引数が 1 つだけだったら再読込と言う事に…
			isEnable = true;
			isForced = true;
		}

		var fileURL = Services.io.getProtocolHandler('file').QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
		var uri = makeURI(fileURL);
		var SHEET = /^xul-|\.as\.css$/i.test(aFile.leafName) ?
			Ci.nsIStyleSheetService.AGENT_SHEET : 
			Ci.nsIStyleSheetService.USER_SHEET ;

		if (this.styleSheetServices.sheetRegistered(uri, SHEET)) {
			// すでにこのファイルが読み込まれている場合
			if (!isEnable){
				// 読み込みを解除
				this.styleSheetServices.unregisterSheet(uri, SHEET);
			}
			else if (isForced) {
				// 解除後に登録し直す
				this.styleSheetServices.unregisterSheet(uri, SHEET);
				this.styleSheetServices.loadAndRegisterSheet(uri, SHEET);
			}
		} else {
			// このファイルは読み込まれていない
			if (isEnable) {
				// 読み込ませる
				this.styleSheetServices.loadAndRegisterSheet(uri, SHEET);
			}
		}

		var menuitem = document.getElementById("usercssloader-" + leafName);
		if (!menuitem) {
			menuitem = document.createElement("menuitem");
			menuitem.setAttribute("label", leafName);
			menuitem.setAttribute("id", "usercssloader-" + leafName);
			menuitem.setAttribute("class", "usercssloader-item");
			menuitem.setAttribute("type", "checkbox");
			menuitem.setAttribute("autocheck", "false");
			menuitem.setAttribute("oncommand", "UCL.toggle('"+ leafName +"');");
			menuitem.setAttribute("onclick", "UCL.itemClick(event);");
			document.getElementById("usercssloader-menupopup").appendChild(menuitem);
		}
		this.readCSS[leafName] = isEnable? "enabled" : "disabled";
		menuitem.setAttribute("checked", isEnable);
	},
	toggle: function(leafName) {
		this.setCSS(leafName, this.readCSS[leafName] != "enabled");
	},
	itemClick: function(event) {
		if (event.button == 0) return;

		event.preventDefault();
		event.stopPropagation();
		let label = event.currentTarget.getAttribute("label");

		if (event.button == 1) {
			this.toggle(label);
		}
		else if (event.button == 2) {
			let editor = Services.prefs.getCharPref("view_source.editor.path");
			if (!editor) return;
			try {
				closeMenus(event.target);
				var UI = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
				UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "Shift_JIS": "UTF-8";
				var path = this.getFileFromLeafname(label).path;
				path = UI.ConvertFromUnicode(path);
				var app = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
				app.initWithPath(editor);
				var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
				process.init(app);
				process.run(false, [path], 1);
			} catch(e) { }
		}
	},
	getFileFromLeafname: function(leafName) {
		let f = UCL.FOLDER.clone();
		f.QueryInterface(Ci.nsILocalFile);
		f.appendRelativePath(leafName);
		return f;
	},
};
UCL.init();
})();