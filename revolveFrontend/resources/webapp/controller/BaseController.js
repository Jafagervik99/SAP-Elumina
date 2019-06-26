
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/m/MessageToast',
		'sap/ui/core/routing/History'
	], function (Controller, MessageToast, History) {
		"use strict";

		return Controller.extend("Revolve.revolveFrontend.controller.BaseController", {

			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
			
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onNavBack: function (oEvent) {
				
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
				
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					this.getRouter().navTo("appHome", {}, true /*no history*/);
				}
			},
			
			setAppBusy: function(busy){
				var oAppModel = this.getModel('appView');
				oAppModel.setProperty('/busy', busy);
			}
			
		});

	}
);