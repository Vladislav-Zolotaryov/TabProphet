var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");
var windowUtils = require("sdk/window/utils");

var shiftPressed = false;
var selectedTabs = [];

function onOpen(tab) {
	console.log(tab.url + " is open");
	tab.on("activate", logActivate);
}

function logActivate(tab) {
	console.log(tab.url + " is activated");
	if (shiftPressed) {
		selectedTabs.push(tab);
		
		tab.style.color = 'red';
		
		console.log("Added " + Object.keys(tab));
		var cliptext = '';
		for (i = 0; i < selectedTabs.length; i++) {
			cliptext += selectedTabs[i].url + '\n';
		}
		clipboard.set(cliptext);
	}
}
tabs.on("open", onOpen);


function onKeyUp(event) {
	console.log(event.keyCode);	
	if (event.keyCode == 16) {
		shiftPressed = false;
	}
}

function onKeyDown(event) {
	console.log(event.keyCode);	
	if (event.keyCode == 16) {
		shiftPressed = true;
	}
}

windowUtils.windows()[0].addEventListener("keyup", onKeyUp, true);
windowUtils.windows()[0].addEventListener("keydown", onKeyDown, true);
