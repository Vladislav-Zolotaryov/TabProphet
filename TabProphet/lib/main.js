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
  var tabView = viewFor(tab);
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	}
  }
  tabView.addEventListener("click", clickClojure(tab));
  tab.on('ready', flushToClipboard);
}

for (let tab of tabs) {
	regsiterOnTabClickEvent(tab);
}
tabs.on("open", regsiterOnTabClickEvent);
tabs.on('ready', flushToClipboard);

function onTabClick(tab) {
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
	if (event.keyCode == shiftKeyCode) {
		shiftPressed = false;
	}
}

function onKeyDown(event) {
	if (event.keyCode == shiftKeyCode) {
		shiftPressed = true;
	}
}

var windows = require("sdk/windows").browserWindows;
for (let window of windows) {
	attachKeyListeners(window);
}

windows.on('open', function(window) {
	attachKeyListeners(window);
});

function attachKeyListeners(window) {
	var windowView = viewFor(window);
	windowView.addEventListener("keyup", onKeyUp, true);
	windowView.addEventListener("keydown", onKeyDown, true);
}