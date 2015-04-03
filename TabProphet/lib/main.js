var { modelFor } = require("sdk/model/core");
var { viewFor } = require("sdk/view/core");
var { Style } = require('sdk/stylesheet/style');

var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");
var windowUtils = require("sdk/window/utils");
var { attachTo, detachFrom } = require('sdk/content/mod');

var shiftPressed = false;
var selectedTabs = [];
var shiftKeyCode = 16;

function regsiterOnTabClickEvent(tab) {
  var lowLevelTab = viewFor(tab);
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	}
  }
  lowLevelTab.addEventListener("click", clickClojure(tab));
}

for (let tab of tabs) {
	regsiterOnTabClickEvent(tab);
}
tabs.on("open", regsiterOnTabClickEvent);

function onTabClick(tab) {
	console.log(tab.url + " is activated");
	if (shiftPressed) {
		var tabView = viewFor(tab);
		var index = selectedTabs.indexOf(tab);
		if (index > -1) {
			selectedTabs.splice(index, 1);
			tabView.style.color = tabView.style.previousColor;
		} else {
			selectedTabs.push(tab);
			tabView.style.previousColor = tabView.style.color;
			tabView.style.color = 'blue';
		}
		flushToClipboard();
	}
}

function flushToClipboard() {
	var cliptext = '';
	for (i = 0; i < selectedTabs.length; i++) {
		cliptext += selectedTabs[i].url + '\n';
	}
	clipboard.set(cliptext);
}

function onKeyUp(event) {
	console.log("KEYUP " + event.keyCode);	
	if (event.keyCode == shiftKeyCode) {
		shiftPressed = false;
	}
}

function onKeyDown(event) {
	console.log("KEYDOWN " + event.keyCode);	
	if (event.keyCode == shiftKeyCode) {
		shiftPressed = true;
	}
}

var allWindows = windowUtils.windows(null, {includePrivate:true});
for (let window of allWindows) {
	attachKeyListeners(window);
}

allWindows.on('open', function(window) {
	console.log("Opened new window " + window);
	attachKeyListeners(window);
});

function attachKeyListeners(window) {
	window.addEventListener("keyup", onKeyUp, true);
	window.addEventListener("keydown", onKeyDown, true);
}