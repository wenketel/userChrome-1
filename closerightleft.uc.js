/*
 * close right / left tabs
 */

// left
(function(){
	var item = document.createElement('menuitem');
	item.setAttribute('label', '\u5de6\u306e\u30bf\u30d6\u3092\u3059\u3079\u3066\u9589\u3058\u308b');
	item.setAttribute('accesskey', '1');
	item.addEventListener('command', function(){
		var tabs = gBrowser.mTabContainer.childNodes;
		var pos;
		for(var i = 0; i < tabs.length; i++){
			if(tabs[i] == document.popupNode){
				pos = i;
				break;
			}
		}
		for(var i = pos - 1; 0 <= i; i--){
			gBrowser.removeTab(tabs[i]);
		}
	}, false);
	setTimeout(function(){
		gBrowser.mStrip.childNodes[1].appendChild(item);
	}, 0);
})();

// right
(function(){
	var item = document.createElement('menuitem');
	item.setAttribute('label', '\u53f3\u306e\u30bf\u30d6\u3092\u3059\u3079\u3066\u9589\u3058\u308b');
	item.setAttribute('accesskey', '2');
	item.addEventListener('command', function(){
		var tabs = gBrowser.mTabContainer.childNodes;
		for(var i = tabs.length - 1; tabs[i] != document.popupNode; i--){
		    gBrowser.removeTab(tabs[i]);
		}
	}, false);
	setTimeout(function(){
		gBrowser.mStrip.childNodes[1].appendChild(item);
	}, 0);
})();
