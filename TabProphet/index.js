var { viewFor } = require("sdk/view/core");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");

var hotkeys = require("./lib/hotkeys").hotkeys;
var tabListener = require("./lib/hotkeys").tabListener;
var myPreferences = require("./lib/preferences").preferences;

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
	};
  };
  var tabView = viewFor(tab);
  tabView.addEventListener("click", clickClojure(tab));
}

function removeOnTabClickEvent(tab) {
  var clickClojure = function(tab) { 
	return function() {
		onTabClick(tab);
	};
  };
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

function formatCopyItem(tabItem) {
	var result = myPreferences.getCopyItemFormat();
	result = result.replace(myPreferences.CopyItemFormatSpecialTags.INDEX, tabItem.index);
	result = result.replace(myPreferences.CopyItemFormatSpecialTags.URL, tabItem.url);
	result = result.replace(myPreferences.CopyItemFormatSpecialTags.TITLE, tabItem.title);
	return result;
}

function flushToClipboard() {
	if (selectedTabs.length === 0) {
		return;
	}
	var urls = [];
	for (i = 0; i < selectedTabs.length; i++) {
		urls.push(formatCopyItem(selectedTabs[i]));
	}
	var joinedItems = urls.join(myPreferences.getItemsDelimiter());
	var cliptext;
	if (urls.length == 1) {
		cliptext = joinedItems;
	} else if (urls.length > 1) {
		cliptext = myPreferences.getStartingClipboardDecorator();
	        cliptext += joinedItems;
		cliptext += myPreferences.getEndingClipboardDecorator();
	}
	if (cliptext) {
		clipboard.set(cliptext);
	}
}

function copyTabsToClipboard() {
	flushToClipboard();
	clearAllSelection();
}
