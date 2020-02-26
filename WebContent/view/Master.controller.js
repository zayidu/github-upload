jQuery.sap.require("imed.app.physio.util.Formatter");
jQuery.sap.require("imed.app.physio.util.Controller");
imed.app.physio.util.Controller.extend("imed.app.physio.view.Master", {

	
	onInit : function() {
		
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) { 

			// when detail navigation occurs, update the binding context
			if (oEvent.getParameter("name") === "main") {
				//alert('master main');
			}
		},

		this);
	},
});
