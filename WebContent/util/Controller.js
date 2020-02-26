jQuery.sap.declare("imed.app.physio.util.Controller");
jQuery.sap.require("imed.app.physio.Component");
jQuery.sap.require("imed.app.physio.MyRouter");
sap.ui.core.mvc.Controller.extend("imed.app.physio.util.Controller", {
	getEventBus : function () {  debugger;
		var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
		return sap.ui.component(sComponentId).getEventBus();
	},
	getRouter : function () { debugger;
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	showErrorAlert : function(sMessage) { debugger;
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert(sMessage);
	},
	onHome : function() { debugger;
		this.getRouter().navTo("general", true);
	},
	onCancel: function() { debugger;
		//this.getRouter().backWithoutHash(this.getView());
		this.getRouter().myNavBack("main");
	},
	showLoading : function(status)
	{ debugger;
		if (!this._dialog) {
			this._dialog = sap.ui.xmlfragment("imed.app.physio.view.BusyDialog", this);
			this.getView().addDependent(this._dialog);
		}
		if(status)
		{
			this._dialog.open();
		}
		else
		{
			jQuery.sap.delayedCall(200, this, function () {
				this._dialog.close();
			});}

	},
	fetchNursingOU : function(caseID){ debugger;
		var that= this;
		var url = "/OrgUnitCollection(Institution='"+config.institution+"',PatientID='"+that.PatientID+ "',Case='" + caseID + "')";
		console.info(url);
		oModel1.read(url,{async:false, 
			success: function(oData, oResponse) {  debugger;
				ret = oData;
				config.NursingOU = oData.Department;
				ret = 0;
			}, 
			error: function(oError){   debugger;
				ret = -1;
				appError = "Error in fetching organizational unit (OU)! ("+that.getError(oError)+")";
				that.getRouter().navTo("error", false);
			}  
		});
		return ret;
	},
	fetchNursingOUOLD : function(){ debugger;
		var that= this;
		var	i_object      = 'PHARMACY_POS';
		var i_param1      = 'DEPARTMENT';
		var i_param2      = 'ORGUNIT';
		var i_param3      = '';
		var url = "/ConfigDataCollection(Institution='"+config.institution+"',Object='"+i_object+"',Param1='"+i_param1+"',Param2='"+i_param2+"',Param3='"+i_param3+"')";
		console.log(url);
		oModel1.read(url,{async:false, 
			success: function(oData, oResponse) { debugger;
				ret = oData;
				config.NursingOU = oData.Val2;
				ret = 0;
			}, 
			error: function(oError){  
				ret = -1;
				appError = "Organizational unit (OU)  is not maintained!";
			}  
		});
		return ret;
	},
	userLogoff : function(){ debugger;  
		var shell = sap.ui.getCore().byId("mainShell");  
		shell.attachLogout(function()  
				{   
			jQuery.ajax({url:location.protocol + "//" + location.host + "/sap/public/bc/icf/logoff",  
				async:false}).complete(function (){
					if (!document.execCommand("ClearAuthenticationCache")) {  
						//"ClearAuthenticationCache" will work only for IE. Below code for other browsers  
						$.ajax({  
							type: "GET",  
							url: location.href, //any URL to a Gateway service  
							username: 'dummy', //dummy credentials: when request fails, will clear the authentication header  
							password: 'dummy', 
							success: function(data) {
								//
							},
							statusCode: { 401: function() {  
								//This empty handler function will prevent authentication pop-up in chrome/firefox  
							} },  
							error: function() { 
								window.location.assign(location.href); 

							}  
						});  
					}
				});            
				});  
		shell.fireLogout();  
	},
});