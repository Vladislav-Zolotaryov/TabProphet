var { Hotkey } = require("sdk/hotkeys");
var windows = require("sdk/windows").browserWindows;
var { viewFor } = require("sdk/view/core");

var Hotkeys = function() {
	var self = this;
	var copyAllTabsHotkey;
	
	var copyAllTabsHokeyExists = function() {
		if (copyAllTabsHotkey === undefined) {
			return false;
		}
		return true;
	};
	
	this.onCopyAllTabs = function() {};
	
	this.startCopyAllTabsHotkey = function(hotkeyCombo) {
		this.stopCopyAllTabsHotkey();
		copyAllTabsHotkey = Hotkey({
			combo: hotkeyCombo,
			onPress: function() {
				self.onCopyAllTabs();
			}
		});
	};
	
	this.stopCopyAllTabsHotkey = function() {
		if (copyAllTabsHokeyExists()) {
			copyAllTabsHotkey.destroy();
		}
		copyAllTabsHotkey = undefined;
	};
};

var TabListener = function() {
	var self = this;
	var selectionKeyPressed = false;
	var shiftKeyCode = '16';
	var selectionToggleKeyCode = shiftKeyCode;
	
	this.onTabSelection = function() {};
	
	this.setSelectionToggleKey = function(key) {
		selectionToggleKeyCode = key;
	};
	
	this.isSelectionKeyPressed = function() {
		return selectionKeyPressed;
	};
	
	var onKeyUp = function(event) {
		if (event.keyCode == selectionToggleKeyCode) {
			selectionKeyPressed = false;
			self.onTabSelection();
		}
	};

	var onKeyDown = function(event) {
		if (event.keyCode == selectionToggleKeyCode) {
			selectionKeyPressed = true;
		}
	};

	var attachKeyListeners = function(window) {
		var windowView = viewFor(window);
		windowView.addEventListener("keyup", onKeyUp);
		windowView.addEventListener("keydown", onKeyDown);
	};

	var removeKeyListeners = function(window) {
		var windowView = viewFor(window);
		windowView.removeEventListener("keyup", onKeyUp);
		windowView.removeEventListener("keydown", onKeyDown);
	};
	
	windows.on('open', function(window) {
		attachKeyListeners(window);
	});

	windows.on('close', function(window) {
		removeKeyListeners(window);
	});
	
	for (let window of windows) {
		attachKeyListeners(window);
	}
};

exports.hotkeys = new Hotkeys();
exports.tabListener = new TabListener();
