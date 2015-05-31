var { viewFor } = require("sdk/view/core");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");

var hotkeys = require("hotkeys").hotkeys;
var tabListener = require("hotkeys").tabListener;
var myPreferences = require("preferences").preferences;

myPreferences.setSelectionToggleKeyCodeChangeCallback(function(value) {
	tabListener.setSelectionToggleKey(value);
});

myPreferences.setCopyAllTabsHotkeyChangeCallback(function(value) {
	if (myPreferences.getCopyAllTabsHokeyStatus()) {
		hotkeys.startCopyAllTabsHotkey(value);
	}
});

myPreferences.setCopyAllTabsStatusChangeCallback(function(value) {
	if (value) {
		hotkeys.startCopyAllTabsHotkey(myPreferences.getCopyAllTabsHotkey());
	} else {
		hotkeys.stopCopyAllTabsHotkey();
	}
});

hotkeys.startCopyAllTabsHotkey(myPreferences.getCopyAllTabsHotkey());
hotkeys.onCopyAllTabs = copyAllTabs;

tabListener.onTabSelection = copyTabsToClipboard;

function copyAllTabs() {
	for (let tab of tabs) {
		processTab(tab);
	}
	copyTabsToClipboard();
}

function addOnTabClickEvent(tab) {
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	}
  }
  var tabView = viewFor(tab);
  tabView.addEventListener("click", clickClojure(tab));
}

function removeOnTabClickEvent(tab) {
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	}
  }
  var tabView = viewFor(tab);
  tabView.removeEventListener("click", clickClojure(tab));
}

for (let tab of tabs) {
	addOnTabClickEvent(tab);
}

tabs.on("open", addOnTabClickEvent);
tabs.on("close", removeOnTabClickEvent);

function onTabClick(tab) {
	if (tabListener.isSelectionKeyPressed()) {
		processTab(tab);
	}
}

var selectedTabs = [];

function processTab(tab) {
	var tabView = viewFor(tab);
	var index = selectedTabs.indexOf(tab);
	if (index > -1) {
		selectedTabs.splice(index, 1);
		tabView.style.color = tabView.style.previousColor;
	} else {
		selectedTabs.push(tab);
		tabView.style.previousColor = tabView.style.color;
		tabView.style.color = myPreferences.getSelectedTabColor();
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
	if (selectedTabs.length == 0) {
		return;
	}
	var urls = [];
	for (i = 0; i < selectedTabs.length; i++) {
		urls.push(selectedTabs[i].url);
	}
	var cliptext = '';
	cliptext = urls.join(myPreferences.getUrlsDelimiter());
	if (urls.length > 1) {
		cliptext = myPreferences.getStartingClipboardDecorator() + cliptext;
		cliptext += myPreferences.getEndingClipboardDecorator();
	}
	clipboard.set(cliptext);
}

function copyTabsToClipboard() {
	flushToClipboard();
	clearAllSelection();
}