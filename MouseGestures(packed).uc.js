//==UserScript==
// @name         Advanced Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace    http://www.xuldev.org/
// @description  Lightweight customizable mouse gestures.
// @include      main
// @author       Raqbgxue + Gomita
// @version      10.1.17 (folk from original 9.5.18)
// @homepage     http://www.xuldev.org/misc/ucjs.php
// @homepage     http://d.hatena.ne.jp/raqbgxue/20090624/1245848856
// @note         Ctrl+(right-click-up) => Reset Gesture
//==/UserScript==
var ucjsMouseGestures={
// options
enableWheelGestures: true,
enableRockerGestures: true,
enablePopupGestures: true,

_lastX: 0,
_lastY: 0,
_directionChain: '',
_isMouseDownL: false,
_isMouseDownR: false,
_hideFireContext: false, //for windows
_shouldFireContext: false, //for linux

POPUP_ID: 'GesturePopup',
GESTURES:{
	'L':{name:'History Back',cmd:function(){document.getElementById("Browser:Back").doCommand();}},
	'R':{name:'History Forward',cmd:function(){document.getElementById("Browser:Forward").doCommand();}},
	//'LUL':{name:'Fast Backward',cmd:function(){if(gBrowser.sessionHistory.index>0)gBrowser.gotoIndex(0);}},
	//'RUR':{name:'Fast Forward',cmd:function(){var nav=gBrowser.webNavigation;nav.gotoIndex(nav.sessionHistory.count-1);}},
	//'RUR':{name:'Search For Selection', cmd:function(){const t=getBrowserSelection().toString();if(t){var b=document.getElementById('searchbar').textbox;b.value=t;b.onTextEntered();}}},
	'RUR':{name:'Search For Selection', cmd:function(){const t=getBrowserSelection().toString();if(t){document.getElementById('searchbar').textbox.value=t;gBrowser.loadOneTab("http://www.google.co.jp/search?hl=ja&ie=utf-8&oe=utf-8&q="+t,null,null,null,false,false);}}},
	'UD':{name:'Reload',cmd:function(){document.getElementById("Browser:Reload").doCommand();}},
	'UDU':{name:'Reload Skip Cache',cmd:function(){document.getElementById("Browser:ReloadSkipCache").doCommand();}},
	'DURD':{name:'Home',cmd:function(){document.getElementById("Browser:Home").doCommand();}},
	'DRUDL':{name:'Go to yahoo.co.jp',cmd:function(){const URL="http://www.yahoo.co.jp";const IN_NEW_TAB=false;if(IN_NEW_TAB){gBrowser.loadOneTab(URL,null,null,null,false,false);}else{gBrowser.loadURI(URL);}}},
	'LDRUL':{name:'Go to google.co.jp',cmd:function(){const URL="http://www.google.co.jp";const IN_NEW_TAB=false;if(IN_NEW_TAB){gBrowser.loadOneTab(URL,null,null,null,false,false);}else{gBrowser.loadURI(URL);}}},
	'ULU':{name:'Go Up Directory',cmd:function(){var uri=gBrowser.currentURI;if(uri.path=="/")return;var pathList=uri.path.split("/");if(!pathList.pop())pathList.pop();loadURI(uri.prePath+pathList.join("/")+"/");}},
	'RDU':{name:'Minimize Window',cmd:function(){window.minimize();}},
	'RUD':{name:'Maximize or Resore Window',cmd:function(){window.windowState==1?window.restore():window.maximize();}},
	'DRU':{name:'Close Window',cmd:function(){BrowserCloseTabOrWindow();}},
	'URD':{name:'Full Screen',cmd:function(){document.getElementById("View:FullScreen").doCommand();}},
	'DU':{name:'Undo Tab',cmd:function(){document.getElementById('History:UndoCloseTab').doCommand();}},
	'LR':{name:'Open New Tab',cmd:function(){document.getElementById("cmd_newNavigatorTab").doCommand();document.getElementById("searchbar").focus();goDoCommand('cmd_selectAll');}},
	'DR':{name:'Close Tab',cmd:function(){gBrowser.removeCurrentTab();}},
	'RL':{name:'Duplicate Tab',cmd:function(){openNewTabWith(gBrowser.currentURI.spec,null,null,null,false);}},
	'L<R':{name:'Previous Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(-1,true);}},
	'UL':{name:'Previous Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(-1,true);}},
	'L>R':{name:'Next Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(+1,true);}},
	'UR':{name:'Next Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(+1,true);}},
	'LU':{name:'Scroll Top',cmd:function(){goDoCommand("cmd_scrollTop");}},
	'LD':{name:'Scroll Bottom',cmd:function(){goDoCommand("cmd_scrollBottom");}},
	'U':{name:'Page Up',cmd:function(){goDoCommand("cmd_scrollPageUp");}},
	'D':{name:'Page Down',cmd:function(){goDoCommand("cmd_scrollPageDown");}},
	'LDR':{name:'Show/Hide Upper Toolbars',cmd:function(){var menubar=document.getElementById("toolbar-menubar");var bmToolbar=document.getElementById("PersonalToolbar");menubar.collapsed=!menubar.collapsed;if(!bmToolbar.collapsed)bmToolbar.collapsed=true;}},
	'RUL':{name:'Show/Hide Statusbar',cmd:function(){document.getElementById("cmd_toggleTaskbar").doCommand();}},
	'DLR':{name:'Show/Hide Bookmarks Sidebar',cmd:function(){toggleSidebar("viewBookmarksSidebar");}},
	'DL':{name:'Show/Hide BookmarksToolbar',cmd:function(){var bmToolbar=document.getElementById("PersonalToolbar");bmToolbar.collapsed=!bmToolbar.collapsed;}},
	'RD':{name:'[Popup] Search Engines',cmd:function(self,event){self._buildPopup(event,"WebSearchPopup");}},
	'RU':{name:'[Popup] All Tabs',cmd:function(self,event){self._buildPopup(event,"AllTabsPopup");}},
	'W+':{name:'[Popup] Closed Tabs',cmd:function(self,event){self._buildPopup(event,"ClosedTabsPopup");}},
	'W-':{name:'[Popup] Histories',cmd:function(self,event){self._buildPopup(event,"HistoryPopup");}},
	'RDR':{name:'Eijiro',cmd:function(){const TERM=getBrowserSelection().toString();const URL="http://eow.alc.co.jp/"+TERM+"/UTF-8/";if(TERM)gBrowser.loadOneTab(URL,null,null,null,false,false);}},
	'RDRD':{name:'Excite Translation (en>ja)',cmd:function(){const FROM="EN",TO="JA";const DOMAIN="www.excite.co.jp";const URL="http://"+DOMAIN+"/world/english/web/?wb_url=%URL%&wp_lp="+FROM+TO;var curURL=gBrowser.currentURI.spec;if(curURL.indexOf(ExciteDOMAIN)!=-1)BrowserReload();else gBrowser.loadURI(URL.replace("%URL%",encodeURIComponent(curURL)));}},
	'DLU':{name:'Restart Firefox',cmd:function(){const nsIAppStartup=Components.interfaces.nsIAppStartup;var os=Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);var cancelQuit=Components.classes["@mozilla.org/supports-PRBool;1"].createInstance(Components.interfaces.nsISupportsPRBool);os.notifyObservers(cancelQuit,"quit-application-requested",null);if(cancelQuit.data)return;os.notifyObservers(null,"quit-application-granted",null);var wm=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);var windows=wm.getEnumerator(null);while(windows.hasMoreElements()){var win=windows.getNext();if(("tryToClose"in win)&&!win.tryToClose())return;}Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(nsIAppStartup.eRestart|nsIAppStartup.eAttemptQuit);}},
	'RDL':{name:'Clear Privacy Infomation',cmd:function(){setTimeout(function(){ document.getElementById("Tools:Sanitize").doCommand();},0);}},
	'DRDR':{name:'[Noscript] Allow All This Page Temporarily',cmd:function(){noscriptOverlay.allowPage(true);}},
	'DRD':{name:'[Noscript] Allow Page Temporarily',cmd:function(){noscriptOverlay.allowPage();}},
	'DLD':{name:'[Noscript] Revoke Page Temporarily',cmd:function(){noscriptOverlay.revokeTemp();}},
},

init:function(){var self=this;var events=["mousedown","mousemove","mouseup","contextmenu"];if(this.enableRockerGestures)events.push("draggesture");if(this.enableWheelGestures)events.push("DOMMouseScroll");function registerEvents(aAction,eventArray){eventArray.forEach(function(aType){getBrowser().mPanelContainer[aAction+"EventListener"](aType,self,aType=="contextmenu");});};registerEvents("add",events);window.addEventListener("unload",function(){registerEvents("remove",events);},false);},handleEvent:function(event){switch(event.type){case"mousedown":if(event.button==2){this._isMouseDownR=true;this._hideFireContext=false;this._startGesture(event);}
if(this.enableRockerGestures){if(event.button==2&&this._isMouseDownL){this._isMouseDownR=false;this._shouldFireContext=false;this._hideFireContext=true;this._directionChain="L>R";this._stopGesture(event);}else if(event.button==0){this._isMouseDownL=true;if(this._isMouseDownR){this._isMouseDownL=false;this._shouldFireContext=false;this._hideFireContext=true;this._directionChain="L<R";this._stopGesture(event);}}}
break;case"mousemove":if(this._isMouseDownR){this._hideFireContext=true;this._progressGesture(event);}
break;case"mouseup":if(event.ctrlKey&&event.button==2){this._isMouseDownL=false;this._isMouseDownR=false;this._shouldFireContext=false;this._hideFireContext=false;this._directionChain='';event.preventDefault();XULBrowserWindow.statusTextField.label="Reset Gesture";break;}
if(this._isMouseDownR&&event.button==2){if(this._directionChain)this._shouldFireContext=false;this._isMouseDownR=false;this._stopGesture(event);if(this._shouldFireContext&&!this._hideFireContext){this._shouldFireContext=false;this._displayContextMenu(event);}}else if(this.enableRockerGestures&&event.button==0&&this._isMouseDownL){this._isMouseDownL=false;this._shouldFireContext=false;}else if(this.enablePopupGestures&&(event.button==0||event.button==1)&&event.target.localName=='menuitem'){this._isMouseDownL=false;this._shouldFireContext=false;var popup=document.getElementById(this.POPUP_ID);var activeItem=event.target;switch(popup.getAttribute("gesturecommand")){case"WebSearchPopup":var selText=popup.getAttribute("selectedtext");var engine=activeItem.engine;if(!engine)break;var submission=engine.getSubmission(selText,null);if(!submission)break;document.getElementById('searchbar').textbox.value=selText;gBrowser.loadOneTab(submission.uri.spec,null,null,submission.postData,null,false);break;case"ClosedTabsPopup":undoCloseTab(activeItem.index);break;case"HistoryPopup":gBrowser.webNavigation.gotoIndex(activeItem.index);break;case"AllTabsPopup":gBrowser.selectedTab=gBrowser.mTabs[activeItem.index];break;}
popup.hidePopup();}
break;case"popuphiding":var popup=document.getElementById(this.POPUP_ID);popup.removeEventListener("popuphiding",this,true);document.documentElement.removeEventListener("mouseup",this,true);while(popup.hasChildNodes())popup.removeChild(popup.lastChild);break;case"contextmenu":if(this._isMouseDownL||this._isMouseDownR||this._hideFireContext){event.preventDefault();event.stopPropagation();this._shouldFireContext=true;this._hideFireContext=false;}
break;case"DOMMouseScroll":if(this.enableWheelGestures&&this._isMouseDownR){event.preventDefault();event.stopPropagation();this._shouldFireContext=false;this._hideFireContext=true;this._directionChain="W"+(event.detail>0?"+":"-");this._stopGesture(event);}
break;case"draggesture":this._isMouseDownL=false;break;}},_displayContextMenu:function(event){var evt=event.originalTarget.ownerDocument.createEvent("MouseEvents");evt.initMouseEvent("contextmenu",true,true,event.originalTarget.defaultView,0,event.screenX,event.screenY,event.clientX,event.clientY,false,false,false,false,2,null);event.originalTarget.dispatchEvent(evt);},_startGesture:function(event){this._lastX=event.screenX;this._lastY=event.screenY;this._directionChain="";},_progressGesture:function(event){var x=event.screenX,y=event.screenY;var lastX=this._lastX,lastY=this._lastY;var subX=x-lastX,subY=y-lastY;var distX=(subX>0?subX:(-subX)),distY=(subY>0?subY:(-subY));var direction;if(distX<10&&distY<10)return;if(distX>distY)direction=subX<0?"L":"R";else direction=subY<0?"U":"D";var dChain=this._directionChain;if(direction!=dChain.charAt(dChain.length-1)){dChain+=direction;this._directionChain+=direction;var gesture=this.GESTURES[dChain];XULBrowserWindow.statusTextField.label="Gesture: "+dChain+(gesture?' ('+gesture.name+')':'');}
this._lastX=x;this._lastY=y;},_stopGesture:function(event){try{if(dChain=this._directionChain)this.GESTURES[dChain].cmd(this,event);XULBrowserWindow.statusTextField.label="";}catch(e){XULBrowserWindow.statusTextField.label='Unknown Gesture: '+dChain;}
this._directionChain="";},_buildPopup:function(event,gestureCmd){if(!this.enablePopupGestures)return;var popup=document.getElementById(this.POPUP_ID);if(!popup){popup=document.createElement("popup");popup.id=this.POPUP_ID;}
document.getElementById("mainPopupSet").appendChild(popup);popup.setAttribute("gesturecommand",gestureCmd);switch(gestureCmd){case"WebSearchPopup":var searchSvc=Cc["@mozilla.org/browser/search-service;1"].getService(Ci.nsIBrowserSearchService);var engines=searchSvc.getVisibleEngines({});if(engines.length<1)throw"No search engines installed.";for(var i=engines.length-1;i>=0;--i){var engine=engines[i];var menuitem=document.createElement("menuitem");menuitem.setAttribute("label",engine.name);menuitem.setAttribute("class","menuitem-iconic");if(engine.iconURI)menuitem.setAttribute("src",engine.iconURI.spec);popup.insertBefore(menuitem,popup.firstChild);menuitem.engine=engine;}
popup.setAttribute("selectedtext",getBrowserSelection().toString());break;case"ClosedTabsPopup":try{if(!gPrefService.getBoolPref("browser.sessionstore.enabled"))throw"Session Restore feature is disabled.";}catch(e){}
var ss=Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);if(ss.getClosedTabCount(window)==0)throw"No restorable tabs in this window.";var undoItems=eval("("+ss.getClosedTabData(window)+")");for(var i=0,LEN=undoItems.length;i<LEN;i++){var menuitem=popup.appendChild(document.createElement("menuitem"));menuitem.setAttribute("label",undoItems[i].title);menuitem.setAttribute("class","menuitem-iconic bookmark-item");menuitem.index=i;var iconURL=undoItems[i].image;if(iconURL)menuitem.setAttribute("image",iconURL);}
break;case"HistoryPopup":var sessionHistory=gBrowser.webNavigation.sessionHistory;if(sessionHistory.count<1)throw"No back/forward history for this tab.";var curIdx=sessionHistory.index;for(var i=0,shc=sessionHistory.count;i<shc;i++){var entry=sessionHistory.getEntryAtIndex(i,false);if(!entry)continue;var menuitem=document.createElement("menuitem");popup.insertBefore(menuitem,popup.firstChild);menuitem.setAttribute("label",entry.title);try{var iconURL=Cc["@mozilla.org/browser/favicon-service;1"].getService(Ci.nsIFaviconService).getFaviconForPage(entry.URI).spec;menuitem.style.listStyleImage="url("+iconURL+")";}catch(e){}
menuitem.index=i;if(i==curIdx){menuitem.style.listStyleImage="";menuitem.setAttribute("type","radio");menuitem.setAttribute("checked","true");menuitem.className="unified-nav-current";activeItem=menuitem;}else{menuitem.className=i<curIdx?"unified-nav-back menuitem-iconic":"unified-nav-forward menuitem-iconic";}}
break;case"AllTabsPopup":var tabs=gBrowser.mTabs;if(tabs.length<1)return;for(var i=0,LEN=tabs.length;i<LEN;i++){var menuitem=popup.appendChild(document.createElement("menuitem"));var tab=tabs[i];menuitem.setAttribute("class","menuitem-iconic bookmark-item");menuitem.setAttribute("label",tab.label);menuitem.setAttribute("crop",tab.getAttribute("crop"));menuitem.setAttribute("image",tab.getAttribute("image"));menuitem.index=i;if(tab.selected)activeItem=menuitem;}
break;}
document.popupNode=null;document.tooltipNode=null;popup.addEventListener("popuphiding",this,true);popup.openPopup(null,"",event.clientX,event.clientY,false,false);document.documentElement.addEventListener("mouseup",this,true);},};ucjsMouseGestures.init();
