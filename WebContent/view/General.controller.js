jQuery.sap.require("imed.app.physio.util.Controller");
imed.app.physio.util.Controller.extend("imed.app.physio.view.General", {

	onInit: function() {

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);

	},
	onRouteMatched : function(oEvent) { debugger; // VSDK924425
		var oParameters = oEvent.getParameters();
		if (oParameters.name !== "error") { 
			return;
		}
		var lblError = this.getView().byId("lblError");
		lblError.setText("");
		if(appError != undefined && appError != "")
			lblError.setText(appError);
		
		
	},
});