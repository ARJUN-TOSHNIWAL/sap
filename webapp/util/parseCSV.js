"use strict";

self.addEventListener("message", function (e) {
	debugger;
	var oColData = [];
	var file = e.data.file;
	var nthChunk = e.data.nthChunk;
	var chunkSize = e.data.chunkSize;
	var offset = chunkSize * nthChunk;
	var cols = e.data.cols;
	var bFirstBlob = false;
	var fileSize = file.size;

	var message = {
		"type": "",
		"msg": ""
	};

	function processData(csv) {
		var noOfRow = "";
		var delimiter = ",";
		var allTextLines = csv.split(/\r\n|\n|\r/);

		var oRowData = [];
		for (var i = 0; i < allTextLines.length; i++) {
			var data = allTextLines[i].split(delimiter);

			var jRowData = {};

			/**
			 * If i=0 , the data will be column header
			 * */
			if(oColData){
				oColData = cols;
			}
			if (bFirstBlob && i === 0) {
				for (var j = 0; j < data.length; j++) {
					oColData.push({
						"column": data[j]
					});
				}
			} else {
				for (var j = 0; j < data.length; j++) {
					jRowData[oColData[j]["column"]] = data[j];
					noOfRow = j;
				}
				oRowData.push(jRowData);
			}

		}
		
		var tableData = {
			"df_cols": oColData,
			"df_rows": oRowData,
			"no_of_rows":noOfRow
		};

		message.type = "S";
		message.msg = tableData;
		self.postMessage(message);
		bFirstBlob = false;
		
	}
	
	function chunkCallBack(csv) {
		if (csv) {
			processData(csv);
		}
	}
	
	function errorHandler(evt) {
		if (evt.target.error.name === "NotReadableError") {
			message.type = "E";
			message.msg = "NotReadableError!"
			self.postMessage(message);
		}
	}


	function readEventHandler(evt) {
		if (evt.target.error === null) {
			chunkCallBack(evt.target.result); // callback for handling read chunk
			message.type = "C";
			message.msg = "Done reading file!";
			self.postMessage(message);
			return;
		} else {
			message.type = "E";
			message.msg = "Read error: " + evt.target.error
			self.postMessage(message);
			return;
		}

	}

	function chunkReaderBlock(_offset, length, _file) {
		var r = new FileReader();
		if(_offset === 0){
			bFirstBlob = true;
		}
		var blob = _file.slice(_offset, length + _offset);
		r.onload = readEventHandler;
		r.onerror = errorHandler;
		r.readAsText(blob);
	}


	function parseFile(file) {
		var self = this; // we need a reference to the current object
		// now let's start the read with the first block
		chunkReaderBlock(offset, chunkSize, file);
	}
	
	parseFile(file);
}, false);