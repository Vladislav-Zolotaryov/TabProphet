var simplePrefs = require("sdk/simple-prefs");
var prefs = simplePrefs.prefs;

var Preferences = function() {

	var FieldPreference = function(defaultValue, tag, processor) {
		var preference = defaultValue;
		var valueProcessor = processor;
		var prefChangeCallBack = function(value) {};

		if (prefs[tag]) {
			preference = prefs[tag];
			if (valueProcessor) {
				preference = valueProcessor(preference);
			}
		}

		simplePrefs.on(tag, function(name) {
			preference = prefs[name];
			if (valueProcessor) {
				preference = valueProcessor(preference);
			}
			prefChangeCallBack(preference);
		});

		this.getPreference = function() {
			return preference;
		};

		this.setPreferenceChangeCallback = function(callback) {
			prefChangeCallBack = callback;
		};
	};

	var unescapeSpecial = function(string) {
		string = string.replace('\\n', '\n');
		string = string.replace('\\r', '\r');
		string = string.replace('\\t', '\t');
		return string;
	};

	var itemsDelimiterTag = 'itemsDelimiter';
	var itemsDelimiterPreference = new FieldPreference('\n', itemsDelimiterTag, unescapeSpecial);

	this.getItemsDelimiter = function() {
		return itemsDelimiterPreference.getPreference();
	};

	var startingClipboardDecoratorTag = 'startingClipboardDecorator';
	var startingClipboardDecoratorPreference = new FieldPreference('', startingClipboardDecoratorTag, unescapeSpecial);

	this.getStartingClipboardDecorator = function() {
		return startingClipboardDecoratorPreference.getPreference();
	};

	var endingClipboardDecoratorTag = 'endingClipboardDecorator';
	var endingClipboardDecoratorPreference = new FieldPreference('', endingClipboardDecoratorTag, unescapeSpecial);

	this.getEndingClipboardDecorator = function() {
		return endingClipboardDecoratorPreference.getPreference();
	};

	var selectedTabColorTag = 'selectedTabColor';
	var bluish = '#3366FF';
	var selectedTabColorPreference =  new FieldPreference(bluish, selectedTabColorTag);

	this.getSelectedTabColor = function() {
		return selectedTabColorPreference.getPreference();
	};

	var selectionToggleKeyCodeTag = 'selectionToggleKeyCode';
	var shiftKeyCode = '16';
	var selectionToggleKeyCodePreference = new FieldPreference(shiftKeyCode, selectionToggleKeyCodeTag);

	this.getSelectionToggleKeyCode = function() {
		return selectionToggleKeyCodePreference.getPreference();
	}

	this.setSelectionToggleKeyCodeChangeCallback = function(callback) {
		selectionToggleKeyCodePreference.setPreferenceChangeCallback(callback);
	};

	var formatCopyAllTabsHotkey = function() {
		return copyAllTabsModifierPreference.getPreference() + '-' + copyAllTabsCharacterPreference.getPreference();
	};

	this.getCopyAllTabsHotkey = formatCopyAllTabsHotkey;

	var onCopyAllTabsHotkeyChange = function() {};

	this.setCopyAllTabsHotkeyChangeCallback = function(callback) {
		onCopyAllTabsHotkeyChange = callback;
	};

	var copyAllTabsHotkeyChangeListener = function() {
		onCopyAllTabsHotkeyChange(formatCopyAllTabsHotkey());
	};

	var copyAllTabsCharacterTag = 'copyAllTabsCharacter';
	var copyAllTabsCharacterPreference = new FieldPreference('a', copyAllTabsCharacterTag);

	var copyAllTabsModifierTag = 'copyAllTabsModifier';
	var copyAllTabsModifierPreference = new FieldPreference('shift-alt', copyAllTabsModifierTag);

	copyAllTabsCharacterPreference.setPreferenceChangeCallback(copyAllTabsHotkeyChangeListener);
	copyAllTabsModifierPreference.setPreferenceChangeCallback(copyAllTabsHotkeyChangeListener);

	var copyAllTabsHotkeyStatusTag = 'copyAllTabsHotkeyStatus';
	var copyAllTabsHotkeyStatusPreference = new FieldPreference(true, copyAllTabsHotkeyStatusTag);

	this.setCopyAllTabsStatusChangeCallback = function(callback) {
		copyAllTabsHotkeyStatusPreference.setPreferenceChangeCallback(callback);
	};

	this.getCopyAllTabsHokeyStatus = function() {
		return copyAllTabsHotkeyStatusPreference.getPreference();
	};

	var copyItemFormatTag = 'copyItemFormat';

	this.CopyItemFormatSpecialTags = {
		URL : '${url}',
		INDEX : '${index}',
		TITLE : '${title}'
	};

	var copyItemFormatPreference = new FieldPreference(this.CopyItemFormatSpecialTags.URL, copyItemFormatTag);

	this.getCopyItemFormat = function () {
		return copyItemFormatPreference.getPreference();
	};

};

exports.preferences = new Preferences();
