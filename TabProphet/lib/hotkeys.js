var { hotkey } = require("sdk/hotkeys");
var { viewFor } = require("sdk/view/core");
var windows = require("sdk/windows").browserWindows;
var tabs = require("sdk/tabs");

var Hotkeys = function() {

	var self = this;
	var processAllTabsHotkey;

	this.onProcessAllTabs = function() {};

	this.startPorcessAllTabsHotkey = function(hotkeyCombo) {
		this.stopProcessAllTabsHotkey();
		processAllTabsHotkey = hotkey({
			combo: hotkeyCombo,
			onPress: function() {
				self.onProcessAllTabs();
			}
		});
	};

	this.stopProcessAllTabsHotkey = function() {
		if (processAllTabsHokeyExists()) {
			processAllTabsHotkey.destroy();
		}
		processAllTabsHotkey = undefined;
	};

	var processAllTabsHokeyExists = function() {
		if (processAllTabsHotkey === undefined) {
			return false;
		}
		return true;
	};

};

var WindowKeyPressListener = function(keyCode) {

	var self = this;
	var selectionKeyPressed = false;

	this.selectionToggleKeyCode = keyCode;

	this.onTabSelectionFinished = function() {};

	this.isSelectionKeyPressed = function() {
		return selectionKeyPressed;
	};

	var onKeyUp = function(event) {
		if (event.keyCode == selectionToggleKeyCode) {
			selectionKeyPressed = false;
			self.onTabSelectionFinished();
		}
	};

	var onKeyDown = function(event) {
		if (event.keyCode == selectionToggleKeyCode) {
			selectionKeyPressed = true;
		}
	}

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

}

var TabListener = function(windowKeyPressListener, onTabsSelected) {

	var selectedTabs = [];

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

	function processTab(tab) {
		var tabView = viewFor(tab);
		var index = selectedTabs.indexOf(tab);
		if (index > -1) {
			selectedTabs.splice(index, 1);
			tabView.style.color = tabView.style.previousColor;
		} else {
			selectedTabs.push(tab);
			tabView.style.previousColor = tabView.style.color;
			tabView.style.color = appPreferences.getSelectedTabColor();
		}
	};

	function onTabClick(tab) {
		console.log(windowKeyPressListener.isSelectionKeyPressed());
		if (windowKeyPressListener.isSelectionKeyPressed()) {
			console.log(processTab);
			processTab(tab);
		}
	};

	function processAllTabs() {
		for (let tab of tabs) {
			processTab(tab);
		}
		onTabsSelected(selectedTabs);
		clearAllSelection();
	};

	windowKeyPressListener.onTabSelectionFinished = function() {
		onTabsSelected(selectedTabs);
		clearAllSelection();
	};

	function clearAllSelection() {
		for (var i = 0 ; i < selectedTabs.length ; i++) {
			var tabView = viewFor(selectedTabs[i]);
			tabView.style.color = tabView.style.previousColor;
		}
		selectedTabs = [];
	};

};

exports.Hotkeys = Hotkeys;
exports.TabListener = TabListener;
exports.WindowKeyPressListener = WindowKeyPressListener;
