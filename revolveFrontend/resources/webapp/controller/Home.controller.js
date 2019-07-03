sap.ui.define([
	"Revolve/revolveFrontend/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/suite/ui/commons/ChartContainer',
	'sap/suite/ui/commons/ChartContainerContent',
	'sap/ui/core/ws/WebSocket',
	'sap/m/MessageToast',
	'sap/m/Popover',
	'sap/ui/core/Fragment',
	'sap/viz/ui5/controls/VizFrame',
	'sap/viz/ui5/controls/VizSlider',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Filter'
], function(BaseController, JSONModel, FlattenedDataset, FeedItem, ChartFormatter, Format, ChartContainer, ChartContainerContent,
	WebSocket, MessageToast, Popover, Fragment, VizFrame, VizSlider, FilterOperator, Filter) {
	"use strict";

	return BaseController.extend("Revolve.revolveFrontend.controller.Home", {

		webSocket: null,
		webSocketUrl: 'wss://REV01:Revolve19@90.236.222.149:30054/1/workspaces/default/projects/revolve_hello_world/publisher?mode=duplex',

		onInit: function() {

			var oRouter = this.getRouter();
			oRouter.getRoute("home").attachPatternMatched(this.onHomeRouteMatched, this);

			this.InitChart("idVizFrameFL", "idPopOverFL", "chartPanelFL");
			this.InitChart("idVizFrameRL", "idPopOverRL", "chartPanelRL");
			this.InitChart("idVizFrameFR", "idPopOverFR", "chartPanelFR");
			this.InitChart("idVizFrameRR", "idPopOverRR", "chartPanelRR");

		},

		InitChart: function(vizFrame, popOver, chartPanel) {
			var oView = this.getView();
			var oVizFrame = oView.byId(vizFrame);

			var oPopOver = this.getView().byId(popOver);
			oPopOver.connect(oVizFrame.getVizUid());

			oPopOver.setFormatString({
				"Value": ChartFormatter.DefaultPattern.STANDARDFLOAT
			});

			var oChartContainerContent = new ChartContainerContent({
				icon: "sap-icon://line-chart-time-axis",
				title: "vizFrame Line Chart Sample",
				content: [oVizFrame]
			});

			var oChartContainer = new ChartContainer({
				content: [oChartContainerContent]
			});

			oChartContainer.setShowFullScreen(true);
			oChartContainer.setAutoAdjustHeight(true);

			var oChartPanel = oView.byId(chartPanel);
			oChartPanel.addContent(oVizFrame);
		},

		onHomeRouteMatched: function() {
			/*global onChangeRun, onChangeSensor, onChangeDate */
			/*eslint no-undef: "error"*/

			var AAAAA = "/measurement.xsodata/TSMeasurements?$format=json&$top=100&$filter=seriesIdentifierId eq 'AAAAA'";
			var BBBBB = "/measurement.xsodata/TSMeasurements?$format=json&$top=100&$filter=seriesIdentifierId eq 'BBBBB'";
			var distinctModel = "/measurement.xsodata/TSMeasurements?$format=json&$apply=groupby(seriesIdentifierId)&top=10&$count=true";

			//var run = onChangeRun();
			//var sensor = onChangeSensor();
			//var date = onChangeDate();

			//var query = "/measurement.xsodata/TSMeasurements?$format=json&$";

			this.ohrGraf("idVizFrameFL", "chartModelFL", "idVizSliderFL", AAAAA);
			console.log("FL LOADED");
			this.ohrGraf("idVizFrameRL", "chartModelRL", "idVizSliderRL", AAAAA);
			console.log("RL LOADED");
			this.ohrGraf("idVizFrameFR", "chartModelFR", "idVizSliderFR", AAAAA);
			console.log("FR LOADED");
			this.ohrGraf("idVizFrameRR", "chartModelRR", "idVizSliderRR", AAAAA);
			console.log("RR LOADED");

		},

		getOModel: function(chartModel) {
			var oModel = this.getModel(chartModel);
			if (!oModel) {
				oModel = new JSONModel();
				this.setModel(oModel, chartModel);
			}
			return oModel;
		},

		ohrGraf: function(vizFrame, chartModel, idSlider, query) {
			// URI's that will be used for loading in data 
			/*global modelForGauge */
			/*eslint no-undef: "error"*/

			var that = this;

			var oView = this.getView();
			var oSettingsModel = this.getModel("chartSettingsModel");
			if (!oSettingsModel) {
				oSettingsModel = new JSONModel();
				this.setModel(oSettingsModel, "chartSettingsModel");
			}

			var oVizFrame = oView.byId(vizFrame);

			oSettingsModel.attachRequestCompleted(function() {
				var data = oSettingsModel.getData();
				oVizFrame.setVizProperties(data.vizProperties);
			});
			oSettingsModel.loadData("/webapp/json/vizFrameSettings.json");

			//var oModel = modelForGauge(chartModel);

			var oModel = this.getModel(chartModel);
			if (!oModel) {
				oModel = new JSONModel();
				this.setModel(oModel, chartModel);
			}

			/** 
			 * This function retireves the omodel, sets the data and update it every 150 miliseconds
			 * 
			 */ 
			var attachRequestCompleted = function() {
				var data = oModel.getData();

				var transformedData = that.transformDataForChart(data);
				oModel.setData(transformedData); // To Potentially retrievethis data from outside onHomeRouteMatched method
				sap.ui.getCore().setModel(oModel);

				oVizFrame.setModel(oModel);

				that.setAppBusy(false);
				if (!that.intervalHandle) {
					that.intervalHandle = setInterval(function() {
						oModel.loadData(query);
					}, 150);
				}
			};

			oModel.attachRequestCompleted(attachRequestCompleted);
			oModel.loadData(query);

			/*	this.getView().byId(selectM).setModel(oModel);
				this.getView().byId(selectSI).setModel(oModel);*/
		},

		// After the page has rendered we create the gauges 
		// Perhaps the picture of the car should be sat to here as well
		/**
		 * 
		 * 
		 */
		onAfterRendering: function() {
			//Semi-circle gauges
			this.GauegeDisplay();
		},

		// Trnasform our JSON datetime format into one that SAP can translate into an UTCTimestamp 
		// (/date 10002136123/ --> new date 10002136123 --> 01/07/2019 23:59:59.0000000)
		transformDataForChart: function(data) {
			var data2 = [];
			// Transform backend data response to mocked data structure for display
			if (data.d) {
				data2 = data.d.results;
				for (var i = 0; i < data2.length; i++) {
					data2[i].measureTime = eval("new " + data2[i].measureTime.replace(/\//g, ""));
					delete data2[i].__metadata;
				}
				//console.log(data2);
				// Sorts data based o
				data2.sort(function(a, b) {
					return a.measureTime - b.measureTime;
				});
			}
			return data2;
		},

		//Semi-circle gauges
		// Constructs all defualt gauges with parameters that can be set set inside the constructor 
		GauegeDisplay: function() {
			/*global transformDataForChart, getOModel, oModelForGauge */
			/*eslint no-undef: "error"*/

			// Javascript get-set method for aqquiring the oData model
			var query = "/measurement.xsodata/TSMeasurements?$format=json&$top=100&$filter=seriesIdentifierId eq 'AAAAA'";

			//sap.ui.getCore().getModel().getProperty("realData");
			/*var lastIndex = updatedData.lastIndexOf();
			console.log(lastIndex);

			var latestValue = updatedData[lastIndex].value; */
			new JustGage({
				id: this.getView().byId("id_Gauge1").sId,
				value: 2,
				min: 0,
				max: 100,
				symbol: '%',
				pointer: true,
				pointerOptions: {
					toplength: 8,
					bottomlength: -20,
					bottomwidth: 6,
					color: '#8e8e93'
				},
				gaugeWidthScale: 0.1,
				counter: true
			});

			new JustGage({
				id: this.getView().byId('id_Gauge2').sId,
				value: 50,
				min: 0,
				max: 100,
				symbol: 'C',
				pointer: true,
				pointerOptions: {
					toplength: 8,
					bottomlength: -20,
					bottomwidth: 6,
					color: '#8e8e93'
				},
				gaugeWidthScale: 0.1,
				counter: true
			});

			new JustGage({
				id: this.getView().byId('id_Gauge3').sId,
				value: 2,
				min: 0,
				max: 100,
				symbol: 'V',
				pointer: true,
				pointerOptions: {
					toplength: 8,
					bottomlength: -20,
					bottomwidth: 6,
					color: '#8e8e93'
				},
				gaugeWidthScale: 0.1,
				counter: true
			});
		},

		//Meter Gauges
		// Currentl not in use
		// TODO: Find a way to implement this function so that we can set our own ranges
		createGauge: function(container, label, min, max, yellowRatio, redRatio) {
			var config = {
				size: 120,
				label: label,
				min: undefined !== min ? min : 0,
				max: undefined !== max ? max : 100,
				minorTicks: 5
			};

			var range = config.max - config.min;
			config.greenZones = [{
				from: config.min,
				to: config.min + range * yellowRatio
			}];
			config.yellowZones = [{
				from: config.min + range * yellowRatio,
				to: config.min + range * redRatio
			}];
			config.redZones = [{
				from: config.min + range * redRatio,
				to: config.max
			}];

			this.gauges[container] = new Gauge(container, config);
			this.gauges[container].render();
			return this.gauges[container];
		},

		// These types of methods handles events such as keypresses
		handleImagePress: function(oEvent) {
			MessageToast.show("This is Nova");
		},

		// Simple swap methoid for further use if needed
		swap: function(first, next) {
			var temp = first;
			first = next;
			next = temp;
		},

		popoverTopLeft: function(oEvent) {
			var popover = this.getView().byId("popoverFL");
			// toggle popover 
			if (popover.visible === false) {
				popover.setVisible(true);
			}
			popover.setVisible(false);
		},

		onSettingsButtonChange: function(oEvent) {
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("Revolve.revolveFrontend.view.Popover", this);
				this.getView().addDependent(this._oPopover);
				//this._oPopover.bindElement("/");
			}

			this._oPopover.openBy(event.getSource());
		},

		/**
		 * @returns: Run to query
		 */
		onChangeRun: function(oEvent) {
			this.getView().byId("sM").getSelectedKey();
			this.getView().byId("sID").getSelectedItem().getText();
		},

		/**
		 * @returns: Sensor to query
		 */
		onChangeSensor: function(oEvent) {
			this.getView().byId("sM").getSelectedKey();
			this.getView().byId("sID").getSelectedItem().getText();
		},

		/**	
		 * @returns: Date to query
		 */
		onChangeDate: function(oEvent) {
			var date = oEvent.getParameter("value");
			console.log(date);
			return date;
		},

		onExit: function() {
			// You should stop the interval on exit. 
			// You should also stop the interval if you navigate out of your view and start it again when you navigate back. 
			if (this.intervalHandle) {
				clearInterval(this.intervalHandle);
			}
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		}
	});
});