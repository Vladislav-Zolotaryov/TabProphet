var { viewFor } = require("sdk/view/core");
var clipboard = require("sdk/clipboard");

var appPreferences = require("./lib/preferences").preferences;
var Hotkeys = require("./lib/hotkeys").Hotkeys;

var TabListener = require("./lib/hotkeys").TabListener;
var WindowKeyPressListener = require("./lib/hotkeys").WindowKeyPressListener;

/*appPreferences.setSelectionToggleKeyCodeChangeCallback(function(value) {
	tabCopyListener.setSelectionToggleKey(value);
});

appPreferences.setCopyAllTabsHotkeyChangeCallback(function(value) {
	if (appPreferences.getCopyAllTabsHokeyStatus()) {
		hotkeys.startCopyAllTabsHotkey(value);
	}
});

appPreferences.setCopyAllTabsStatusChangeCallback(function(value) {
	if (value) {
		hotkeys.startCopyAllTabsHotkey(appPreferences.getCopyAllTabsHotkey());
	} else {
		hotkeys.stopCopyAllTabsHotkey();
	}
});

hotkeys.startCopyAllTabsHotkey(appPreferences.getCopyAllTabsHotkey());
hotkeys.onCopyAllTabs = copyAllTabs;
tabCopyListener.onTabSelection = copyTabsToClipboard;
*/

copyKeyWindowListener = new WindowKeyPressListener(appPreferences.getSelectionToggleKeyCode());
copyKeyTabListener = new TabListener(copyKeyWindowListener, flushToClipboard);

function formatCopyItem(tabItem) {
	var result = appPreferences.getCopyItemFormat();
	result = result.replace(appPreferences.CopyItemFormatSpecialTags.INDEX, tabItem.index);
	result = result.replace(appPreferences.CopyItemFormatSpecialTags.URL, tabItem.url);
	result = result.replace(appPreferences.CopyItemFormatSpecialTags.TITLE, tabItem.title);
	return result;
}

function flushToClipboard() {
	if (selectedTabs.length === 0) {
		return;
	}

	var formattedItems = [];
	for (i = 0; i < selectedTabs.length; i++) {
		formattedItems.push(formatCopyItem(selectedTabs[i]));
	}

	var joinedItems = formattedItems.join(appPreferences.getItemsDelimiter());
	var cliptext;
	if (formattedItems.length == 1) {
		cliptext = joinedItems;
	} else if (formattedItems.length > 1) {
		cliptext = appPreferences.getStartingClipboardDecorator();
	    cliptext += joinedItems;
		cliptext += appPreferences.getEndingClipboardDecorator();
	}

	if (cliptext) {
		clipboard.set(cliptext);
	}
}
