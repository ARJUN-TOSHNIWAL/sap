/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/demo/demo_py_lazy/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});