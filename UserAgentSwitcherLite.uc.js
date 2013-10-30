// ==UserScript==
// @name           User Agent Switcher Lite
// @version        1.0
// @description    Like User Agent Switcher extention.
// @author         Shinya
// @homepage       http://www.code-404.net/articles/browsers/user-agent-switcher-lite
// @namespace      http://www.code-404.net/
// @compatibility  Firefox 2.0 3.0
// @include        chrome://browser/content/browser.xul
// @Note
// ==/UserScript==
(function(){
  var locale = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  locale = locale.getCharPref("general.useragent.locale");
  var userAgent = [
	{
	  label: "Android OS 2",
	  accesskey: "I",
	  agent: "Mozilla/5.0 (Linux; U; Android 2.3.3; ja-jp; SC-02B Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
	},
	{
	  label: "Andoroid M : Galaxy Tab(SC-01C)",
	  accesskey: "M",
	  agent: "Mozilla/5.0 (Linux; U; Android 2.2; ja-jp; SC-01C Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
	},
	{
	  label: "Andoroid L : GALAXY Tab 10.1 LTE(SC-01D)",
	  accesskey: "S",
	  agent: "Mozilla/5.0_(Linux; U; Android_3.2; ja-jp; SC-01D_Build/MASTER)AppleWebKit/534.13_(KHTML,_like_Gecko)_Version/4.0_Safari/534.13"
	},
	{
	  label: "separator",
	},
	{
	  label: "iPhone OS 5",
	  accesskey: "N",
	  agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3"
	},
	{
	  label: "iPad OS 5",
	  accesskey: "O",
	  agent: "Mozilla/5.0 (iPad; CPU OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3"
	},
	{
	  label: "separator",
	},
	{
	  label: "DoCoMo SH901iC",
	  accesskey: "C",
	  agent: "DoCoMo/2.0 SH901iC(c100;TB;W24H12)"
	},
	{
	  label: locale.indexOf("ja") == -1 ? "EZweb" : "EZweb (WAP 2.0/XHTML-MP\u5bfe\u5fdc\u6a5f)",
	  accesskey: "E",
	  agent: "KDDI-KC31 UP.Browser/6.2.0.5 (GUI) MMP/2.0"
	},
	{
	  label: locale.indexOf("ja") == -1 ? "Vodafone live!" : "Vodafone live! (\u65b03G)",
	  accesskey: "V",
	  agent: "Mozilla/5.0 (Linux; U; Android 2.3.3; ja-jp; SC-02B Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
	},
	{
	  label: "Air EDGE PHONE",
	  accesskey: "A",
	  agent: "Mozilla/3.0(DDIPOCKET;JRC/AH-J3001V,AH-J3002V/1.0/0100/c50)CNF/2.0"
	},
	{
	  label: 'H"',
	  accesskey: "H",
	  agent: "PDXGW/1.0 (TX=8;TY=6;GX=96;GY=64;C=G2;G=B2;GI=0)"
	},
	{
	  label: locale.indexOf("ja") == -1 ? "ASTEL" : "ASTEL \u30c9\u30c3\u30c8i",
	  accesskey: "J",
	  agent: "ASTEL/1.0/J-0511.00/c10/smel"
	},
	{
	  label: "separator",
	},
	{
	  label: "Google",
	  accesskey: "G",
	  agent: "Googlebot/2.1 (+http://www.google.com/bot.html)"
	},
	{
	  label: "Yahoo!",
	  accesskey: "Y",
	  agent: "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)"
	},
	{
	  label: "MSN",
	  accesskey: "B",
	  agent: "msnbot/0.11 (+http://search.msn.com/msnbot.htm)"
	},
  ];

  init: {
	var menuPopup = document.getElementById("menu_ToolsPopup");
	var separator = document.getElementById("sanitizeSeparator");

	var menu = document.createElement("menu");
	menu.id = "ua-switcher-lite";
	menu.setAttribute("label", "User Agent Switcher Lite");
	menu.setAttribute("accesskey", "U");
	menuPopup.insertBefore(menu, separator);

	menuPopup = document.createElement("menupopup");
	menu.appendChild(menuPopup);

	// Default
	var menuItem = document.createElement("menuitem");
	menuItem.setAttribute("label", locale.indexOf("ja") == -1 ? "Default" : "\u30c7\u30d5\u30a9\u30eb\u30c8");
	menuItem.setAttribute("accesskey", "D");
	menuItem.setAttribute("type", "radio");
	menuItem.id = "ua-switcher-lite-default";
	menuItem.culMenu = {agent: false};
	menuItem.addEventListener("command", setUserAgent, false);
	menuPopup.appendChild(menuItem);

	// Separator
	menuItem = document.createElement("menuseparator");
	menuItem.id = "ua-switcher-lite-sep-default";
	menuPopup.appendChild(menuItem);


	for (var i = 0; menu = userAgent[i]; i++) {
	  if (menu.label == "separator") {
		menuItem = document.createElement("menuseparator");
	  }
	  else {
		menuItem = document.createElement("menuitem");
		menuItem.setAttribute("label", menu.label);
		if ("accesskey" in menu) menuItem.setAttribute("accesskey", menu.accesskey);
		menuItem.setAttribute("type", "radio");
		menuItem.culMenu = menu;
		menuItem.addEventListener("command", setUserAgent, false);
	  }
	  menuItem.id = "ua-switcher-lite-" + i;
	  menuPopup.appendChild(menuItem);
	}

	document.getElementById("ua-switcher-lite").addEventListener("popupshowing", function(){
	  setUserAgentDisplay(menuPopup)
	}, false);
  }

  function setDefault(){

  }

  function setUserAgent(aEvent){
	var pref = Components.classes["@mozilla.org/preferences;1"]
	  .getService(Components.interfaces.nsIPrefBranch);

	// デフォルトを選んだら項目を削除
	if(!aEvent.target.culMenu.agent){
	  pref.clearUserPref("general.useragent.override");
	  return;
	}

	var nsISupportsString = Components.interfaces.nsISupportsWString ||
	  Components.interfaces.nsISupportsString;
	var ua = (Components.classes["@mozilla.org/supports-wstring;1"]) ?
	  Components.classes['@mozilla.org/supports-wstring;1']
		.createInstance(nsISupportsString) :
	  Components.classes['@mozilla.org/supports-string;1']
		.createInstance(nsISupportsString);
	ua.data = aEvent.target.culMenu.agent;

	// 項目に値を設定
	pref.setComplexValue("general.useragent.override", nsISupportsString, ua);
  }

  function setUserAgentDisplay(menuPopup) {
	var menu = menuPopup.childNodes;

	var pref = Components.classes["@mozilla.org/preferences;1"]
	  .getService(Components.interfaces.nsIPrefBranch);

	var nsISupportsString = Components.interfaces.nsISupportsWString ||
	  Components.interfaces.nsISupportsString;

	// general.useragent.overrideが存在するか
	var ua;
	try{
	  ua = pref.getComplexValue("general.useragent.override", nsISupportsString).data;
	}catch(e){
	  ua;
	}

	// 無ければデフォルト
	if(!ua){
	  menu[0].setAttribute("checked", true);
	  return;
	}

	// 設定値にチェック
	for(var i = 0; i < menu.length; i++){
	  if(!menu[i].culMenu) continue; // 区切り
	  if(menu[i].culMenu.agent == ua) {
		menu[i].setAttribute("checked", true);
		break;
	  }
	}
  }
})();