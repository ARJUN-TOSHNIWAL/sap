sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/ui/table/Table"
], function (Controller,JSONModel,IconTabBar,IconTabFilter,Table) {
	"use strict";

	return Controller.extend("com.demo.demo_py_lazy.controller.home", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.demo.demo_py_lazy.view.home
		 */
		onInit: function () {
			this.oIcontabBar = this.getView().byId("idWorkBookTabs");
			this.oRows = [];
			this.oCols = [];
			this.oViewModel = this._createViewModel();
			this.getView().setModel(this.oViewModel, "oViewModel");
		},
		onAfterRendering: function(){
			this.oViewModel.setProperty("/busy",false);	
		},
		_createViewModel: function () {
			return new JSONModel({
				"DataSourceType": "FileUpload",
				"busy": true
			});
		},
		handleUploadComplete: function (oEvent) {
			debugger;
			var oRawRespone = oEvent.getParameter("responseRaw");
			var oData = JSON.parse(oRawRespone)
			var oMLModel = new JSONModel();
			oMLModel.setData(oData);
			this.getView().setModel(oMLModel, "oMLModel");

			this._setBindingRows();
			this._createBindingColumns();

		},
		_clearAllContent: function(oSource){
			for (var i=0; i < oSource.getItems().length ; i++){
				oSource.getItems()[i].removeAllContent();
			}
		},
		onIconTabBarSelect: function(oEvent){
			debugger;
			
			this.oViewModel.setProperty("/busy",true);	
			var oSource = oEvent.getSource();
			this._clearAllContent(oSource);
			oSource.removeAllContent();
			var oKey = oEvent.getSource().getSelectedKey();
			var iNthWorkBook = oKey.substring(8);
			var oWorker = new Worker("util/parseCSV.js");
			oWorker.postMessage({"file":this.oFile,"nthChunk":iNthWorkBook,"chunkSize":this.oChunkSize,"cols":this.oCols}); // Start the worker
			
				oWorker.onmessage = function (event) {
				// console.log(event.data);
				debugger;
				if (event.data.type === "E") {
					debugger;
					console.log(event.data.msg);
				} else if (event.data.type === "I") {
					debugger;
					console.log(event.data.msg)
				} else if (event.data.type === "C") {
					debugger;
					
					alert("Done");
					console.log(event.data.msg);

				} else {
					console.log("Message Received");
					
					if (event.data.msg.df_rows) {
						this.oRows = event.data.msg.df_rows;
					}
					if (event.data.msg.df_cols) {
						this.oCols = event.data.msg.df_cols;
					}
					
					if (event.data.msg.no_of_rows) {
						this.iRowCount = event.data.msg.no_of_rows;
					}

					var oMLModel = new JSONModel();
					oMLModel.setData({
						"df_cols": this.oCols,
						"df_rows": this.oRows
					});
					this.getView().setModel(oMLModel, "oMLModel");

					this.oDFTable = new sap.ui.table.Table();
					oSource.getItems()[iNthWorkBook].addContent(this.oDFTable);
				
					this._setBindingRows();
					this._createBindingColumns();
					this.oViewModel.setProperty("/busy",false);	
					
					this.oRows = [];
					
				
				}

			}.bind(this);
			
		},
		onFileUploadChange: function (oEvent) {
			debugger;
			var iNthWorkBook = 0;
			this.getView().setBusy(true);
			this.oIcontabBar.removeAllItems();
			this.oFile = oEvent.getParameter("files")[0];
			this.oFileSize = this.oFile.size;
			this.oChunkSize = 1024 * 1024 * 8  ; // bytes
			var iNoOfIconTabBar= this.oFileSize / this.oChunkSize;
			
			for (var i = 0 ; i < iNoOfIconTabBar ; i++){
				iNthWorkBook = i;
				var oIconTabFilter = new IconTabFilter({
						key: "WorkBook" + i,
						text: "WorkBook" + i
					});
				this.oIcontabBar.addItem(oIconTabFilter);
			}
			//var oEvent = new sap.ui.base.Event("select",this.oIcontabBar,{"key":"WorkBook0","item":this.oIcontabBar.getItems()[0]});
    		//this.onIconTabBarSelect(oEvent);
    		this.oIcontabBar.setSelectedItem(this.oIcontabBar.getItems()[0]);
			this.getView().setBusy(false);
		},
		_setBindingRows: function () {
			this.oDFTable.bindRows({
				path: "oMLModel" + ">/df_rows"
			});
		},
		_createBindingColumns: function () {
			this.oDFTable.bindColumns({
				path: "oMLModel" + ">/df_cols",
				factory: this._createColumns.bind(this)
			});
		},
		_createColumns: function (id, oContext) {
			var colName = oContext.getProperty("column");
			var oColumn = new sap.ui.table.Column({
				label: colName,
				width: '140px',
				tooltip: colName,
				filterProperty:colName,
				sortProperty:colName,
				template: this._getRows(colName)
			});
			return oColumn;
		},
		_getRows: function (col) {
			var oControl = null;
			oControl = new sap.m.Label({
				text: "{oMLModel" + ">" + col + "}"
			});
			return oControl;
		},
		onColumnSelect: function (oEvent) {

		}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.demo.demo_py_lazy.view.home
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.demo.demo_py_lazy.view.home
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.demo.demo_py_lazy.view.home
		 */
		//	onExit: function() {
		//
		//	}

	});

});