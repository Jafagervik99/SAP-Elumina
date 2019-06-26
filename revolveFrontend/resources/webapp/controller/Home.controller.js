sap.ui.define([
	"Revolve/revolveFrontend/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/suite/ui/commons/ChartContainer',
	'sap/suite/ui/commons/ChartContainerContent',
	'sap/ui/core/ws/WebSocket'
], function(BaseController, JSONModel, FlattenedDataset, FeedItem, ChartFormatter, Format, ChartContainer, ChartContainerContent,
	WebSocket) {
	"use strict";

	return BaseController.extend("Revolve.revolveFrontend.controller.Home", {

		webSocket: null,
		webSocketUrl: 'wss://REV01:Revolve19@90.236.222.149:30054/1/workspaces/default/projects/revolve_hello_world/publisher?mode=duplex',

		onInit: function() {
			

			var oRouter = this.getRouter();
			oRouter.getRoute("home").attachPatternMatched(this.onHomeRouteMatched, this);
			
			var oView = this.getView();
			var oVizFrame = oView.byId("idVizFrame");
			
			var oPopOver = this.getView().byId("idPopOver");
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

			var oChartPanel = oView.byId("chartPanel");
			oChartPanel.addContent(oVizFrame);
		
		},
			
			// OLD WITH LEFT AND RIGHT
			
			/*
			var oViewLeft = this.getView();
			var oVizFrameLeft = oViewLeft.byId("idVizFrameLeft");

			var oPopOverLeft = this.getView().byId("idPopOverLeft");
			oPopOverLeft.connect(oVizFrameLeft.getVizUid());

			oPopOverLeft.setFormatString({
				"Value": ChartFormatter.DefaultPattern.STANDARDFLOAT
			});
			
			
			
			// NEW
			var oViewRight = this.getView();
			var oVizFrameRight = oViewRight.byId("idVizFrameRight");

			var oPopOverRight = this.getView().byId("idPopOverRight");
			oPopOverRight.connect(oVizFrameRight.getVizUid());

			oPopOverRight.setFormatString({
				"Value": ChartFormatter.DefaultPattern.STANDARDFLOAT
			});
		
			
			var oFilters = [];
			var oFilterA = new sap.ui.model.Filter("seriesIdentifierId", sap.ui.model.FilterOperator.EQ, "AAAAA");
			var oFilterB = new sap.ui.model.Filter("seriesIdentifierId", sap.ui.model.FilterOperator.EQ, "BBBBB");
			oFilters.push(oFilterA, oFilterB);

			var oChartContainerContentLeft = new ChartContainerContent({
				icon: "sap-icon://line-chart-time-axis",
				title: "vizFrame Line Chart Sample",
				content: [oVizFrameLeft]
			});

			
			
			// NEW
			
			var oChartContainerContentRight = new ChartContainerContent({
				icon: "sap-icon://line-chart-time-axis",
				title: "vizFrame Line Chart Sample",
				content: [oVizFrameRight]
			});

			var oChartContainerRight = new ChartContainer({
				content: [oChartContainerContentRight]
			});

			oChartContainerRight.setShowFullScreen(true);
			oChartContainerRight.setAutoAdjustHeight(true);

			var oChartPanelRight = oViewRight.byId("chartPanelRight");
			oChartPanelRight.addContent(oVizFrameRight);
			

		},*/

		/*createWebSocket: function() {

			var webSocket = new WebSocket(this.webSocketUrl);

			var that = this;

			webSocket.attachOpen(function(event) {
				that.onWebSocketOpen(event);
			});

			webSocket.attachError(function(event) {
				that.onWebSocketError(event);
			});

			webSocket.attachMessage(function(event) {
				that.onWebSocketMessage(event);
			});

			webSocket.attachClose(function(event) {
				that.onWebSocketClose(event);
			});

			this.webSocket = webSocket;
		},

		onWebSocketOpen: function(event) {
			console.log("web socket open : ", event);
		},

		onWebSocketError: function(event) {
			console.log("web socket error : ", event);
		},

		onWebSocketMessage: function(event) {
			console.log("web socket message : ", event);
		},

		onWebSocketClose: function(event) {
			console.log("web socket close : ", event);
		},*/

		onHomeRouteMatched: function() {
			
			// URI's that will be used for loading in data 
			var AAAAA = "/measurement.xsodata/TSMeasurements?$format=json&$top=100&$filter=seriesIdentifierId eq 'AAAAA'";
			var BBBBB = "/measurement.xsodata/TSMeasurements?$format=json&$top=100&$filter=seriesIdentifierId eq 'BBBBB'";
			var distinctModel = "/measurement.xsodata/TSMeasurements?$format=json&$apply=groupby((seriesIdentifierId))&top=10&$count=true";

			var that = this;

			var oView = this.getView();
			/*var oViewLeft = this.getView();
			var oViewRight = this.getView();*/
			
			var oSettingsModel = this.getModel("chartSettingsModel");
			if (!oSettingsModel) {
				oSettingsModel = new JSONModel();
				this.setModel(oSettingsModel, "chartSettingsModel");
			}

			/*
			var oSettingsModelLeft = this.getModel("chartSettingsModel");
			if (!oSettingsModelLeft) {
				oSettingsModelLeft = new JSONModel();
				this.setModel(oSettingsModelLeft, "chartSettingsModel");
			}
			
			// NEW
			var oSettingsModelRight = this.getModel("chartSettingsModel");
			if (!oSettingsModelRight) {
				oSettingsModelRight = new JSONModel();
				this.setModel(oSettingsModelRight, "chartSettingsModel");
			}*/

			var oVizFrame = oView.byId("idVizFrame");
			/*
			var oVizFrameLeft = oViewLeft.byId("idVizFrameLeft");
			var oVizFrameRight = oViewRight.byId("idVizFrameRight");*/

			oSettingsModel.attachRequestCompleted(function() {
				var data = oSettingsModel.getData();
				oVizFrame.setVizProperties(data.vizProperties);
			});
			oSettingsModel.loadData("/webapp/json/vizFrameSettings.json");

			/*oSettingsModelLeft.attachRequestCompleted(function() {
				var data = oSettingsModelLeft.getData();
				oVizFrameLeft.setVizProperties(data.vizProperties);
			});
			oSettingsModelLeft.loadData("/webapp/json/vizFrameSettings.json");
			
			
			// NEW
			oSettingsModelRight.attachRequestCompleted(function() {
				var data = oSettingsModelRight.getData();
				oVizFrameRight.setVizProperties(data.vizProperties);
			});
			oSettingsModelRight.loadData("/webapp/json/vizFrameSettings.json");*/
			
			var oModel = this.getModel("chartModel");
			if (!oModel) {
				oModel = new JSONModel();
				this.setModel(oModel, "chartModel");
			}
			
			
			/*
			var oModelLeft = this.getModel("chartModelLeft");
			if (!oModelLeft) {
				oModelLeft = new JSONModel();
				this.setModel(oModelLeft, "chartModelLeft");
			}
			
			var oModelRight = this.getModel("chartModelRight");
			if (!oModelRight) {
				oModelRight = new JSONModel();
				this.setModel(oModelRight, "chartModelRight");
			}*/
			
			var attachRequestCompleted = function() {
				var data = oModel.getData();

				var transformedData = that.transformDataForChart(data);
				oModel.setData(transformedData);

				oVizFrame.setModel(oModel);

				that.setAppBusy(false);
				if (!that.intervalHandle) {
					that.intervalHandle = setInterval(function() {
						oModel.loadData(AAAAA);
					}, 150);
				}
			};
			oModel.attachRequestCompleted(attachRequestCompleted);
			oModel.loadData(AAAAA);
			
			
			/*
			var attachRequestCompletedLeft = function() {
				var data = oModelLeft.getData();

				var transformedData = that.transformDataForChart(data);
				oModelLeft.setData(transformedData);

				oVizFrameLeft.setModel(oModelLeft);

				that.setAppBusy(false);
				if (!that.intervalHandle) {
					that.intervalHandle = setInterval(function() {
						oModelLeft.loadData(AAAAA);
					}, 150);
				}
			};
			oModelLeft.attachRequestCompleted(attachRequestCompletedLeft);
			oModelLeft.loadData(AAAAA);
			
			var attachRequestCompletedRight = function() {
				var data = oModelRight.getData();

				var transformedData = that.transformDataForChart(data);
				oModelRight.setData(transformedData);

				oVizFrameRight.setModel(oModelRight);

				that.setAppBusy(false);
				if (!that.intervalHandle) {
					that.intervalHandle = setInterval(function() {
						oModelRight.loadData(BBBBB);
					}, 150);
				}
			};

			oModelRight.attachRequestCompleted(attachRequestCompletedRight);
			oModelRight.loadData(BBBBB);
			*/

			this.getView().byId("oSelectM").setModel(oModel); 
			this.getView().byId("oSelectSI").setModel(oModel); 
			/*
			this.getView().byId("oSelectMLeft").setModel(oModelLeft);
			this.getView().byId("oSelectSILeft").setModel(oModelLeft);
			this.getView().byId("oSelectMRight").setModel(oModelRight);
			this.getView().byId("oSelectSIRight").setModel(oModelRight);
			*/

			//this.calendarOneMonth();

			//this.createWebSocket();

		},

		/*onAfterRendering: function() {
			//Semi-circle gauges
			//this.GauegeDisplay();
		},*/

		//Semi-circle gauges
		/*GauegeDisplay: function() {
			new JustGage({
				id: this.getView().byId("id_Gauge1").sId,
				value: 50,
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
				value: 70,
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
				value: 30,
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
		// TODO: Find a way to implement this function
		createGauge: function(container, label, min, max) {
			var config = {
				size: 120,
				label: label,
				min: undefined != min ? min : 0,
				max: undefined != max ? max : 100,
				minorTicks: 5
			};

			var range = config.max - config.min;
			config.greenZones = [{
				from: config.min,
				to: config.min + range * 0.75
			}];
			config.yellowZones = [{
				from: config.min + range * 0.75,
				to: config.min + range * 0.9
			}];
			config.redZones = [{
				from: config.min + range * 0.9,
				to: config.max
			}];

			this.gauges[container] = new Gauge(container, config);
			this.gauges[container].render();
			return this.gauges[container];
		},

		// WIDGETS 

		calendarOneMonth: function() {
			var oCalendar = this.getView().byId("calendar");
			oCalendar.setSingleRow(false);
			oCalendar.setMonthsToDisplay(1);
			oCalendar.setWeeksPerRow(1);
			oCalendar.setMonthsPerRow(1);
		},*/

		transformDataForChart: function(data) {

			var data2 = [];
			//console.log("test " + data)

			// Transform backend data response to mocked data structure for display
			if (data.d) {
				data2 = data.d.results;
				console.log(data2);
				for (var i = 0; i < data2.length; i++) {
					data2[i].measureTime = eval("new " + data2[i].measureTime.replace(/\//g, ""));
					delete data2[i].__metadata;
				}
			}
			return data2;
		},

		onExit: function() {
			// You should stop the interval on exit. 
			// You should also stop the interval if you navigate out of your view and start it again when you navigate back. 
			if (this.intervalHandle) {
				clearInterval(this.intervalHandle);
			}
		}
	});
});