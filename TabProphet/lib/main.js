var preferences = require("sdk/simple-prefs").prefs;
var { viewFor } = require("sdk/view/core");
var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");

var windows = require("sdk/windows").browserWindows;
var selectedTabs = [];
var selectionKeyPressed = false;

var copyAllTabsHotkeyCombo = "control-alt-a";
var urlsDelimiter = '\n';
if (preferences['urlsDelimiter']) {
	urlsDelimiter = unescapeSpecial(preferences['urlsDelimiter']);
}
require("sdk/simple-prefs").on('urlsDelimiter', function(name) { 
	urlsDelimiter = unescapeSpecial(preferences[name]); 
});

var startingClipboardDecorator = '';
if (preferences['startingClipboardDecorator']) {
	startingClipboardDecorator = unescapeSpecial(preferences['startingClipboardDecorator']);
}
require("sdk/simple-prefs").on('startingClipboardDecorator', function(name) { 
	startingClipboardDecorator = unescapeSpecial(preferences[name]); 
});

var endingClipboardDecorator = '';
if (preferences['endingClipboardDecorator']) {
	endingClipboardDecorator = unescapeSpecial(preferences['endingClipboardDecorator']);
}
require("sdk/simple-prefs").on('endingClipboardDecorator', function(name) { 
	endingClipboardDecorator = unescapeSpecial(preferences[name]); 
});

var selectedTabColor = '#3366FF';
if (preferences['selectedTabColor']) {
	selectedTabColor = preferences['selectedTabColor'];
}
require("sdk/simple-prefs").on('selectedTabColor', function(name) { 
	selectedTabColor = preferences[name]; 
});

var selectionToggleKeyCode = '16';
if (preferences['selectionToggleKeyCode']) {
	selectionToggleKeyCode = preferences['selectionToggleKeyCode'];
}
require("sdk/simple-prefs").on('selectionToggleKeyCode', function(name) {
	selectionToggleKeyCode = preferences[name]; 
});

function unescapeSpecial(string) {
	string = string.replace('\\n', '\n');
	string = string.replace('\\r', '\r');
	string = string.replace('\\t', '\t');
	return string;
}

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
	var urls = [];
	for (i = 0; i < selectedTabs.length; i++) {
		urls.push(selectedTabs[i].url);
	}
	var cliptext = '';
	cliptext = urls.join(urlsDelimiter);
	if (urls.length > 0) {
		cliptext = startingClipboardDecorator + cliptext;
		cliptext += endingClipboardDecorator;
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
	windowView.addEventListener("keyup", onKeyUp, true);
	windowView.addEventListener("keydown", onKeyDown, true);
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