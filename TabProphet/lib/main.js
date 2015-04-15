var { viewFor } = require("sdk/view/core");
var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");

var windows = require("sdk/windows").browserWindows;

var selectedTabs = [];
var selectedTabColor = 'blue';
var selectionKeyPressed = false;
var selectionToggleKeyCode = 16;
var urlsDelimiter = '\n';
var copyAllTabsHotkeyCombo = "control-alt-a";

function regsiterOnTabClickEvent(tab) {
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	}
  }
  var tabView = viewFor(tab);
  tabView.addEventListener("click", clickClojure(tab));
}

for (let tab of tabs) {
	regsiterOnTabClickEvent(tab);
}
tabs.on("open", regsiterOnTabClickEvent);

function onTabClick(tab) {
	if (selectionKeyPressed) {
		processTab(tab);
	}
}

function processTab(tab) {
	var tabView = viewFor(tab);
	var index = selectedTabs.indexOf(tab);
	if (index > -1) {
		selectedTabs.splice(index, 1);
		tabView.style.color = tabView.style.previousColor;
	} else {
		selectedTabs.push(tab);
		tabView.style.previousColor = tabView.style.color;
		tabView.style.color = selectedTabColor;
	}
}

function clearAllSelection() {
	for (var i = 0 ; i < selectedTabs.length ; i++) {
		var tabView = viewFor(selectedTabs[i]);
		tabView.style.color = tabView.style.previousColor;
	}
	selectedTabs = [];
}

function flushToClipboard() {
	var cliptext = '';
	for (i = 0; i < selectedTabs.length; i++) {
		cliptext += selectedTabs[i].url + urlsDelimiter;
	}
	clipboard.set(cliptext);
}

function copyTabsToClipboard() {
	flushToClipboard();
	clearAllSelection();
}

function onKeyUp(event) {
	if (event.keyCode == selectionToggleKeyCode) {
		selectionKeyPressed = false;
		copyTabsToClipboard();
	}
}

function onKeyDown(event) {
	if (event.keyCode == selectionToggleKeyCode) {
		selectionKeyPressed = true;
	}
}

for (let window of windows) {
	attachKeyListeners(window);
}

windows.on('open', function(window) {
	attachKeyListeners(window);
});

function attachKeyListeners(window) {
	var windowView = viewFor(window);
	windowView.addEventListener("keyup", onKeyUp);
	windowView.addEventListener("keydown", onKeyDown);
}

function copyAllTabs() {
	for (let tab of tabs) {
		processTab(tab);
	}
	copyTabsToClipboard();
}

var copyAllTabsHotkey = Hotkey({
  combo: copyAllTabsHotkeyCombo,
  onPress: function() {
	  copyAllTabs();
  }
});