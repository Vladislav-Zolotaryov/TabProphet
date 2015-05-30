var { viewFor } = require("sdk/view/core");
var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");
var simplePrefs = require("sdk/simple-prefs");
var preferences = simplePrefs.prefs;

var windows = require("sdk/windows").browserWindows;
var selectedTabs = [];
var selectionKeyPressed = false;

var shiftKeyCode = '16';

var copyAllTabsHotkeyStatusTag = 'copyAllTabsHotkeyStatus';
var copyAllTabsHotkeyStatus = true;
if (preferences[copyAllTabsHotkeyStatusTag]) {
	copyAllTabsHotkeyStatus = preferences[copyAllTabsHotkeyStatusTag];
}
simplePrefs.on(copyAllTabsHotkeyStatusTag, function(name) { 
	copyAllTabsHotkeyStatus = preferences[name];
	recreateCopyAllTabsHotkey();
});

var urlsDelimiterTag = 'urlsDelimiter';
var urlsDelimiter = '\n';
if (preferences[urlsDelimiterTag]) {
	urlsDelimiter = unescapeSpecial(preferences[urlsDelimiterTag]);
}
simplePrefs.on(urlsDelimiterTag, function(name) { 
	urlsDelimiter = unescapeSpecial(preferences[name]); 
});

var startingClipboardDecoratorTag = 'startingClipboardDecorator';
var startingClipboardDecorator = '';
if (preferences[startingClipboardDecoratorTag]) {
	startingClipboardDecorator = unescapeSpecial(preferences[startingClipboardDecoratorTag]);
}
simplePrefs.on(startingClipboardDecoratorTag, function(name) { 
	startingClipboardDecorator = unescapeSpecial(preferences[name]); 
});

var endingClipboardDecoratorTag = 'endingClipboardDecorator';
var endingClipboardDecorator = '';
if (preferences[endingClipboardDecoratorTag]) {
	endingClipboardDecorator = unescapeSpecial(preferences[endingClipboardDecoratorTag]);
}
simplePrefs.on(endingClipboardDecoratorTag, function(name) { 
	endingClipboardDecorator = unescapeSpecial(preferences[name]); 
});


var selectedTabColorTag = 'selectedTabColor';
var selectedTabColor = '#3366FF';
if (preferences[selectedTabColorTag]) {
	selectedTabColor = preferences[selectedTabColorTag];
}
simplePrefs.on(selectedTabColorTag, function(name) { 
	selectedTabColor = preferences[name]; 
});

var selectionToggleKeyCodeTag = 'selectionToggleKeyCode';
var selectionToggleKeyCode = shiftKeyCode;
if (preferences[selectionToggleKeyCodeTag]) {
	selectionToggleKeyCode = preferences[selectionToggleKeyCodeTag];
}
simplePrefs.on(selectionToggleKeyCodeTag, function(name) {
	selectionToggleKeyCode = preferences[name]; 
});


var copyAllTabsCharacterTag = 'copyAllTabsCharacter';
var copyAllTabsCharacter = 'a';

if (preferences[copyAllTabsCharacterTag]) {
	copyAllTabsCharacter = preferences[copyAllTabsCharacterTag];
}
simplePrefs.on(copyAllTabsCharacterTag, function(name) {
	copyAllTabsCharacter = preferences[name];
	recreateCopyAllTabsHotkey();
});


var copyAllTabsModifierTag = 'copyAllTabsModifier';
var copyAllTabsModifier = 'shift-alt';

if (preferences[copyAllTabsModifierTag]) {
	copyAllTabsModifier = preferences[copyAllTabsModifierTag];
}
simplePrefs.on(copyAllTabsModifierTag, function(name) {
	copyAllTabsModifier = preferences[name];
	recreateCopyAllTabsHotkey();
});

var copyAllTabsHotkey = createCopyAllTabsHotkey(formatCopyAllTabsHotkey());

function formatCopyAllTabsHotkey() {
	return copyAllTabsModifier + '-' + copyAllTabsCharacter;
}


function unescapeSpecial(string) {
	string = string.replace('\\n', '\n');
	string = string.replace('\\r', '\r');
	string = string.replace('\\t', '\t');
	return string;
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
	if (selectedTabs.length == 0) {
		return;
	}
	var urls = [];
	for (i = 0; i < selectedTabs.length; i++) {
		urls.push(selectedTabs[i].url);
	}
	var cliptext = '';
	cliptext = urls.join(urlsDelimiter);
	if (urls.length > 1) {
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

windows.on('close', function(window) {
	removeKeyListeners(window);
});

function attachKeyListeners(window) {
	var windowView = viewFor(window);
	windowView.addEventListener("keyup", onKeyUp);
	windowView.addEventListener("keydown", onKeyDown);
}

function removeKeyListeners(window) {
	var windowView = viewFor(window);
	windowView.removeEventListener("keyup", onKeyUp);
	windowView.removeEventListener("keydown", onKeyDown);
}

function copyAllTabs() {
	for (let tab of tabs) {
		processTab(tab);
	}
	copyTabsToClipboard();
}

function recreateCopyAllTabsHotkey() {
	if (copyAllTabsHotkey !== undefined) {
		copyAllTabsHotkey.destroy();
	}
	copyAllTabsHotkey = createCopyAllTabsHotkey(formatCopyAllTabsHotkey());
}

function createCopyAllTabsHotkey(copyHotkey) {
	if (!copyAllTabsHotkeyStatus) {
		return undefined;
	}
    return Hotkey({
		combo: copyHotkey,
		onPress: function() {
			copyAllTabs();
		}
	});
}