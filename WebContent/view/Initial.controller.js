jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("imed.app.physio.util.Controller");
imed.app.physio.util.Controller.extend("imed.app.physio.view.Initial", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf llh_consent.Initial
	 */
	onInit: function() {

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);

	},
	onRouteMatched : function(oEvent) { debugger;
    var oParameters = oEvent.getParameters();
    if (oParameters.name !== "general") {
      return;
    }
    
    
    var oLayout = "";
    oLayout = this.getView().byId('vbFragment'); //don't forget to set id for a VerticalLayout
    var formName = this.getFormName(config.institution, 'en')
    this.oFrag = sap.ui.xmlfragment(formName,this);
    oLayout.addItem(this.oFrag);
    //this.getView().addDependent(this.oFrag);
     
    /*}else{
      this.getRouter().navTo("error", false);
    }*/
    this.setCurrentDateTime();

  },
  
  getFormName : function(institution,lang){ debugger;
  var formName =  "imed.app.physio.view.Fragments.PhysiotherapyForm";
  return formName;
},
	onClickSignature : function(oEvent){ debugger; // VSDK924425
		if (!this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("imed.app.physio.view.Popover", this);
		}
		this._oPopover.openBy(oEvent.getSource());
		this._oPopover.setModel(this.getView().getModel("i18n"),"signI18n");
		this._oPopover.fromId = oEvent.getParameter("id");//.split("--")[1];
		$('.sigPad').signaturePad({drawOnly:true}).clearCanvas();
	},

	handleCloseButton: function (oEvent) { debugger;
		this._oPopover.close();
	},
	
	handleSaveButton: function (oEvent) { debugger;
		var d = document.getElementById("canImg");
		var id = this._oPopover.fromId + "Display";
		sap.ui.getCore().byId(id).setSrc(d.toDataURL());
		this._oPopover.close();
	},

	handleOkButton : function(oEvent){ debugger;
    var that = this;
    var oView = this.getView();
    
    var ipPatientID = sap.ui.getCore().byId("ipPatientID");
    var ipCaseID = sap.ui.getCore().byId("ipCaseID");
    
    /* Patient ID */
    if(!ipPatientID.getValue()){
    ipPatientID.setValueState("Error");
    ipPatientID.setValueStateText("Fill the Patient ID");
    sap.m.MessageToast.show("Fill the Patient ID");
    }
    else{
    	ipPatientID.setValueState("None");
    	ipPatientID.setValueStateText("");
    }
    
    /* Case ID */
    if(!ipCaseID.getValue()){
    ipCaseID.setValueState("Error");
    ipCaseID.setValueStateText("Fill the Case Number");
    sap.m.MessageToast.show("Fill the Case Number");
    }else{
    	ipCaseID.setValueState("None");
    	ipCaseID.setValueStateText("");
    }
    
    /* Mandatory Inputs */
    if(!ipPatientID.getValue() && !ipCaseID.getValue() ){
        sap.m.MessageToast.show("Enter the Details");
        }
    
    if(ipPatientID.getValue() && ipCaseID.getValue()){
      ipPatientID.setValueState("None");
      ipCaseID.setValueState("None");
      
      that.showLoading(true);
      var def = new $.Deferred();
      oModel1.read("/PatientCollection(Institution='" + config.institution + "',PatientID='" + ipPatientID.getValue() + "',Case='" + ipCaseID.getValue() + "')",{async:true,
        success: function(oData, oResponse) {  debugger;
//          sap.ui.getCore().byId("patName").setValue(oData.FirstName + " " + oData.LastName + " - " + oData.PatientID);
        
//          var _fullName = oData.FirstName + " " + oData.LastName + " - " + oData.PatientID.replace(/^[0]+/g,"");
          var _fullName = oData.FirstName + " " + oData.LastName;
          document.getElementById("patName").value = _fullName;
          
          that.PatientID = oData.PatientID;
          that.CaseID    = oData.Case;
          
          that.fetchNursingOU(that.CaseID);
          that._oPopoverPatientID.close();
          that.showLoading(false);
          
          scrollTo(0,0);
          document.getElementById("patName").focus();
          
//          sap.ui.getCore().byId("pnlContent").focus();
        },
        error: function(oError){
          def.reject(that.getError(oError));
          sap.m.MessageToast.show(that.getError(oError));
          that.showLoading(false);
          ipPatientID.setValueState("Error");
          ipCaseID.setValueState("Error");
        }
      });
//      oModel1.read("/AdnicFormDetCollection(PatientID='"+ ipPatientID.getValue() + "',Institution='"+config.institution+"')",{async:true,
//        success: function(oData,oResponse){
//          debugger;
//          sap.ui.getCore().byId("patMemNo").setValue(oData.MemNo);
//        },
//        error: function(oError){
//          def.reject(that.getError(oError));
//          sap.m.MessageToast.show(that.getError(oError));
//          that.showLoading(false);
//          ipPatientID.setValueState("Error");
//        }
//      });
      return def.promise();
    }
  },

	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf llh_consent.Initial
	 */
//	onBeforeRendering: function() {

//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf llh_consent.Initial
	 */
	onAfterRendering: function() { debugger;
		var that = this;
		scrollTo(0,0);
		this.showPatientIdPopUp();
		document.getElementById("patName").focus();
	},

	getError : function(oError){
		var error ="Error";
		try {
			var mystr = oError.response.body;
			var array = jQuery.parseJSON(mystr);
			error = array.error.message.value;
			//error = JSON.parse(str);
		} catch (e) {
			error = oError.message;
		}
		return error;

	},
	showLoading : function(status) { debugger;
		if (!this._dialog) {
			this._dialog = sap.ui.xmlfragment("imed.app.physio.view.BusyDialog",this);
			//this.getView().addDependent(this._dialog);
		}
		if (status) {
			this._dialog.open();
		} else {

			jQuery.sap.delayedCall(400, this, function() {
				this._dialog.close();
			});
		}
	},
	showPatientIdPopUp : function(){ debugger;
		var that = this;
		if (! this._oPopoverPatientID) {
			this._oPopoverPatientID = sap.ui.xmlfragment("imed.app.physio.view.PatientID", this);
			this.getView().addDependent(this._oPopoverPatientID);
		}

		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPopoverPatientID);
		this._oPopoverPatientID.open();
		this.showLoading(false);

		this._oPopoverPatientID.attachBrowserEvent("keydown", function(oEvent) {
			if(oEvent.keyCode == 27){
				oEvent.stopPropagation();
			}
		});
	},
	onChangeLanguage : function(oEvent){ debugger;
		var imgLogoL = this.getView().byId('imgLogoL');
		var imgLogoLS = this.getView().byId('imgLogoLS');
		var imgLogoR = this.getView().byId('imgLogoR');
		var imgLogoRS = this.getView().byId('imgLogoRS');
		
		sap.ui.getCore().getConfiguration().setLanguage("en");
		var formName = this.getFormName(config.institution, 'en')
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : "./i18n/messageBundle_en_US.properties"
		});
		var swLang = this.getView().byId("swLang");
		if (this.oFrag) {
			this.oFrag.destroy(true);
		}

		if(swLang.getState()== true){
//			To display logo on left side for both english and arabic language
			imgLogoR.setVisible(false);
			imgLogoRS.setVisible(false);
			imgLogoL.setVisible(true);
			imgLogoLS.setVisible(true);
			sap.ui.getCore().getConfiguration().setLanguage("en");
			i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : "./i18n/messageBundle_en_US.properties"
			});
			var oLayout = this.getView().byId('vbFragment'); //don't forget to set id for a VerticalLayout
			oLayout.removeAllItems();
			formName = this.getFormName(config.institution, 'en')
			this.oFrag = sap.ui.xmlfragment(formName,this);
			oLayout.addItem(this.oFrag);

		}else{
//			To display logo on left side for both english and arabic language			
			imgLogoR.setVisible(true);
			imgLogoRS.setVisible(true);
			imgLogoL.setVisible(false);
			imgLogoLS.setVisible(false);
			sap.ui.getCore().getConfiguration().setLanguage("ar");
			formName = this.getFormName(config.institution, 'ar')
			i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : "./i18n/messageBundle_ar.properties"
			});
			var oLayout = this.getView().byId('vbFragment'); //don't forget to set id for a VerticalLayout
			oLayout.removeAllItems();
			this.oFrag = sap.ui.xmlfragment(formName,this);
			oLayout.addItem(this.oFrag);
		}
		this.setCurrentDateTime();
		this.getView().setModel(i18nModel,"i18n")

		//this.getRouter().navTo("general",{}, true);
		return;
		this.showLoading(true);
		var a = document.URL;
		if(oEvent.getSource().getState()){
			//Change English Language
			window.location.href = a.replace("AR","EN");
		}
		else{
			//Change Arabic Language
			window.location.href = a.replace("EN","AR");
		}
	}, 
	onCancel : function(){ debugger;
		window.location = location.href;
	},
	saveData : function(imgData){ debugger;
		var that = this;
		$("#dummyContent").html("");
		$("#dummyContent").css("display","none");
		if(!that.validateDate()){
//			that.getView().byId("swLang").setVisible(true);
			alert(this.error);
		}
		else{
			
			that.showLoading(true);
			that.getView().byId("idSave").disabled = true;
			that.getView().byId("idPreview").disabled = true;

//			that.getView().byId("swLang").setVisible(false);

			var canvas = undefined;// document.getElementById("canTest");
			//canvas.width = document.querySelector("body").offsetWidth;
//			$("#pnlContent").clone().appendTo("#dummyContent");
			$("#__xmlview2--contentWhole").clone().appendTo("#dummyContent");
			$("#dummyContent").css("display","block");

			//var qsObj = document.querySelector("#__xmlview2--contentWhole");
			var qsObj = document.querySelector("#dummyContent");

			/*if(this.getView().byId('imgPreview').getVisible() == true){
				qsObj = document.querySelector("__xmlview2--imgPreview");//this.getView().byId('imgPreview').sId;
			}else{
				//canvas.height = qsObj.scrollHeight;
			}*/

			var quotes = document.getElementById('dummyContent');
			//$("#dummyContent").html($("#__xmlview2--contentWhole").html());

			jQuery.sap.delayedCall(1000, this, function() {
				html2canvas(qsObj, {
					onrendered: function (canvas) {
						canvas : canvas
					}, 
					height: qsObj.scrollHeight+20,
					letterRendering : true
				}).then(function(canvas) {

					var extra_canvas = document.createElement("canvas");
					extra_canvas.setAttribute('width',canvas.width);
					extra_canvas.setAttribute('height',canvas.height);
					var ctx = extra_canvas.getContext('2d');
					ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,1120,1650  );
					//canvas = extra_canvas;

					var pdf = new jsPDF('p', 'pt', 'letter',true);
					
					pdf.setTextColor(150);
					pdf.setFontSize(28);
					pdf.setFont("times");
					pdf.setFontType("normal");
					for (var i = 0; i <= quotes.clientHeight / 1300; i++) {
						//! This is all just html2canvas stuff
						var srcImg = canvas;
						var sX = 0;
						var sY = 1020 * i + 10; // start 980 pixels down for every new page
						var sWidth = 900;
						var sHeight = 1020;
						var dX = 0;
						var dY = 0;
						var dWidth = 900;
						var dHeight = 1020;

						window.onePageCanvas = document.createElement("canvas");
						onePageCanvas.setAttribute('width', 900);
						onePageCanvas.setAttribute('height', 1020);
						var ctx = onePageCanvas.getContext('2d');
						// details on this usage of this function: 
						// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
						ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

						// document.body.appendChild(canvas);
						var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

						var width = onePageCanvas.width;
						var height = onePageCanvas.clientHeight;

						//! If we're on anything other than the first page,
						// add another page
						if (i > 0) {
							pdf.addPage(612, 791); //8.5" x 11" in pts (in*72)
						}
						//! now we declare that we're working on that page
						pdf.setPage(i + 1);
						//! now we add content to that page!
						pdf.addImage(canvasDataURL, 'PNG', 20, 60, (width * .62), (height * .62), undefined, 'FAST');
//						pdf.setFontSize(12);
//						pdf.text(20, 700, "Abu Dhabi National Insurance Co., P.O. Box: 839, Abu Dhabi, U.A.E., Tel. No. (02) 4080 100, Fax No. (02)");
//						pdf.text(20,720,"4080 604");
//						pdf.text(20,740,"ADNIC-COMU-03-F02");
////						pdf.text(500, 750, "Page "+ parseInt(i + 1)+" of "+ Math.ceil(quotes.clientHeight / 1020));
//						pdf.setFontSize(20);
//						if(sap.ui.getCore().getConfiguration().getLanguage() == "ar"){
//							pdf.addImage(imgData, 'JPEG', 10, 10, 150, 48);
//							pdf.text(225,48,"نموذج الإقرار للأعضاء");
//						}else{
//							pdf.addImage(imgData, 'JPEG', 10, 10, 150, 48);
//							pdf.text(225,48,"Member Consent Form");
//						}
					}
					/*pdf.save("testt.pdf");
					that.showLoading(false);
					return;*/
					var pdfString = pdf.output("datauristring");
					var upload = {
							DocumentCategory: "ZPHYSIO_FM",
//							DocumentCategory: "ZCONNTATTA",
							FileName: "PhysiotherapyForm.pdf",
							FileType: pdfString.split(",")[0].split("/")[1].split(";")[0],
							Institution: config.institution,
							Description: "Physiotherapy Confirmation Form",
							NursingOU: config.NursingOU,
							PatientID: that.PatientID,
							SoftCopy: pdfString.split(",")[1],
							Case: that.CaseID

					};
					var def = new $.Deferred();
					oModel1.create("/ConsentFormCollection", upload, {async:true, 
						success: function(oData, oResponse) { 	
							debugger;
							var ret = 0;
							def.resolve(ret);
							sap.m.MessageToast.show("Form uploaded successfully!");
							that.showLoading(false);
							location.reload();
							jQuery.sap.delayedCall(1000, this, function() {
								location.reload();
							});
						}, 
						error: function(oError){  
							def.reject(that.getError(oError));
							sap.m.MessageToast.show(that.getError(oError));
							that.getView().byId("idSave").disabled = false;
							that.getView().byId("idPreview").disabled = false;
							that.showLoading(false);
							$("#dummyContent").html("");
							$("#dummyContent").css("display","none");

						}  
					});
					return def.promise();

				});

			}, false);
		}
	},
//==============================================================================//
//   Function to load case		                         						//
//==============================================================================//		
	fnCaseLoad : function(){
		debugger
		var searchPatientId = sap.ui.getCore().byId("ipPatientID").getValue();
		var def = new $.Deferred();
		
		var oView   = this.getView();
        var othat   = this;
        var oJsonData = new sap.ui.model.json.JSONModel();
        
        //Fetch the Case Numbers for the patient:
		var url_Case = "/CaseIDValueHelpSet?$filter=Einri eq '" + config.institution + "' and Patnr eq '" + searchPatientId + "'";
		oModel1.read(url_Case, {
			async:true,
	        success: function(oData, oResponse) {  debugger;
	        console.log(oData);
	        
//	        var _falnr = oData.results.map( e => e.Falnr);
	        var _falnr = oData.results.map(function(elem) {
	        	  return {
	        	    Falnr: elem.Falnr
	        	  } 
	        	});
	        
//	        var oJsonData = new sap.ui.model.json.JSONModel({
//                "Data": _falnr
//            });
	        oJsonData.setData(_falnr);
	        oView.setModel(oJsonData ,"Case");
	        
	     // open value help dialog filtered by the input value
	       // othat._valueHelpDialogCase.open();
	        sap.ui.getCore().byId("ipPatientID").setValueState("None");
	        sap.ui.getCore().byId("ipCaseID").setValueState("None");
	        
	        },
	        error: function(oError){
	          oJsonData.setData(null);
	          oView.setModel(oJsonData ,"Case");
	           
	          def.reject(that.getError(oError));
	          sap.m.MessageToast.show(that.getError(oError));
//	          that.showLoading(false);
	          ipPatientID.setValueState("Error");
	          ipCaseID.setValueState("Error");
//	          oBusyDialog.close();
	        }
	      
		});
		return def.promise();
	},
	
	
	
	
	
//==============================================================================//
//  Case Help Callback Function                         						//
//==============================================================================//	
	handleValueHelpCase : function(){
		debugger;
		var searchPatientId = sap.ui.getCore().byId("ipPatientID").getValue();
		
		
		var oView   = this.getView();
        var othat   = this;
        
		    
		if(searchPatientId){
			
		     // create value help dialog
	        if (!this._valueHelpDialogCase) {
	            this._valueHelpDialogCase = sap.ui.xmlfragment(
	                 "imed.app.physio.view.Fragments.ZValueHelp",
	                 this
	             );
	             this.getView().addDependent(this._valueHelpDialogCase);
	         }
	        othat._valueHelpDialogCase.open();
	        //Fetch the Case Numbers for the patient:
//			var url_Case = "/CaseIDValueHelpSet?$filter=Einri eq '" + config.institution + "' and Patnr eq '" + searchPatientId + "'";
//			oModel1.read(url_Case, {
//				async:true,
//		        success: function(oData, oResponse) {  debugger;
//		        console.log(oData);
//		        
////		        var _falnr = oData.results.map( e => e.Falnr);
//		        var _falnr = oData.results.map(function(elem) {
//		        	  return {
//		        	    Falnr: elem.Falnr
//		        	  } 
//		        	});
//		        
//		        var oJsonData = new sap.ui.model.json.JSONModel({
////                    "Data": oData.results
//                    "Data": _falnr
//                });
//		        oView.setModel(oJsonData ,"Case");
//		        
//		     // open value help dialog filtered by the input value
//		        othat._valueHelpDialogCase.open();
//		        sap.ui.getCore().byId("ipPatientID").setValueState("None");
//		        sap.ui.getCore().byId("ipCaseID").setValueState("None");
//		        
//		        },
//		        error: function(oError){
//		          def.reject(that.getError(oError));
//		          sap.m.MessageToast.show(that.getError(oError));
////		          that.showLoading(false);
//		          ipPatientID.setValueState("Error");
//		          ipCaseID.setValueState("Error");
////		          oBusyDialog.close();
//		        }
//		      
//			});
			
		}
		else{
			sap.m.MessageToast.show("Fill the Patient ID");
		}
		
	},
	
//==============================================================================//
//                         Case Confirm/Close Function                          //
//==============================================================================//
	_handleValueHelpSearchCase : function(oEvent){ debugger;
     var sValue = oEvent.getParameter("value");
     var oFilter1 = new sap.ui.model.Filter("Falnr",sap.ui.model.FilterOperator.Contains, sValue);
     var allFilter = new sap.ui.model.Filter([ oFilter1 ], false);
     oEvent.getSource().getBinding("items").filter(allFilter);
    },	
    
//==============================================================================//
//                         Case   Search Help Confirm Close                     //
//==============================================================================//
    _handleValueHelpCloseCase : function(oEvent){ debugger;
            var oView = this.getView();
            var vTitle,vDesc;
            var oSelectedItem       = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
            	sap.ui.getCore().byId("ipCaseID").setValue(oSelectedItem.getTitle());
            }
            else{
            	sap.ui.getCore().byId("ipCaseID").setValue("");
            }
    },    
//==============================================================================//
//                         Case Live Change Suggestion Event                    //
//==============================================================================//
    fnCaseLive : function(oEvent){ debugger;
              var oCont = this;
              var oValue = oEvent.getSource().getValue();
            var oLength = oEvent.getSource().getValue().length;
            var oView = this.getView();
            var oM = oView.getModel("Case");

            if (oLength == 0) {
            	sap.ui.getCore().byId("ipCaseID").setValue("");


            }else {
                 try {
                    var oInLength = oView.getModel("Case").oData.Data.length;
                  } catch (e) {}

                  if(oInLength > 0){
                  for (var i = 0; i < oInLength; i++) {
                          if (oView.getModel("Case").oData.Data[i].Falnr == oValue){
                        	  sap.ui.getCore().byId("ipCaseID").setValue(oView.getModel("Case").oData.Data[i].Falnr);
                              break;
                          }else{
                              oView.byId("ipCaseID").setValueState("Error");
                             // oCont.oJsonMaterial.setData(null);
                            //  oCont.oJsonMaterialWd.setData(null);
                             // oCont.oJsonWorkCenter.setData(null);
                          }
                  }
                  }
            }
    },	
    fnPatientLive : function(oEvent){
    	debugger;
//    	suggestionItems="{Case>/Data}"
//    	var oCaseId = sap.ui.getCore().byId("ipCaseID").getSuggestionItems();
//    	if (!oCaseId.length){
//    		oCaseId.bindAggregation("suggestionItems", {
//    			path: "/Case",
//    			template: new sap.ui.core.Item({
//    				text: "{Data}"
//    			})
//    		});
//    	}
    	
    	var vLenPatientId = sap.ui.getCore().byId("ipPatientID").getValue().trim().length;
    	if(vLenPatientId >= 8){
    		this.fnCaseLoad();
    	}
    	else{
    			
    		oMd = this.getView().getModel("Case");
    		if(oMd){
    			oMd.setData(null);
    		}
    		 
    	}
    	
    	
    },
    
    
//==============================================================================//
//  Item Selected Event                     						//
//==============================================================================//    
    fnsuggestionItemSelected : function(oEvent){
        debugger
        var oView = this.getView();
        var oInLength = oView.getModel("Case").oData.Data.length;
        for (var i = 0; i < oInLength; i++) {
        if (oView.getModel("Case").oData.Data[i].Falnr == oEvent.getSource().getSelectedKey()){
        	sap.ui.getCore().byId("ipCaseID").setValue(oView.getModel("Case").oData.Data[i].Falnr);
        	sap.ui.getCore().byId("ipCaseID").setValueState("None");
       //oCont.fnMaterialLaod(oValue);
       //oCont.fnWorkCenterLoad(oValue);
       break;
          }
        }
  },
    
	onSave : function(){ debugger;
		var that = this;
//		that.getView().byId("swLang").setVisible(false);
		var getImageFromUrl = function(url, callback) {
			var img = new Image, data, ret={data: null, pending: true};
			
			img.onError = function() {
				throw new Error('Cannot load image: "'+url+'"');
			}
			img.onload = function() {
				var canvas = document.createElement('canvas');
				document.body.appendChild(canvas);
				canvas.width = img.width;
				canvas.height = img.height;

				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				// Grab the image as a jpeg encoded in base64, but only the data
				data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
				// Convert the data to binary form
				data = atob(data)
				document.body.removeChild(canvas);

				ret['data'] = data;
				ret['pending'] = false;
				if (typeof callback === 'function') {
					callback(data);
				}
			}
			img.src = url;

			return ret;
		}
		var getLogo = function(imgData) { 
			that.saveData(imgData);
		}
		getImageFromUrl('img/ADNIC_LOGO.png', getLogo);
		
	},
	onPreview : function(){ debugger;
		var body = document.body,
		html = document.documentElement;

		var height = Math.max( body.scrollHeight, body.offsetHeight, 
				html.clientHeight, html.scrollHeight, html.offsetHeight );

		var that = this;
		that.showLoading(true);

		that.getView().byId("swLang").setVisible(false);




		var canvas = document.getElementById("canTest");
		canvas.width = document.querySelector("body").offsetWidth;
		canvas.height = document.querySelector("#__xmlview2--contentWhole").scrollHeight;

		jQuery.sap.delayedCall(1000, this, function() {
			html2canvas(document.querySelector("#__xmlview2--contentWhole"), {
				onrendered: function (canvas) {
					canvas : canvas
				}, 
				height: canvas.height,
				letterRendering : true
			}).then(function(canvas) {

				var extra_canvas = document.createElement("canvas");
				extra_canvas.setAttribute('width',canvas.width);
				extra_canvas.setAttribute('height',canvas.height);
				var ctx = extra_canvas.getContext('2d');
				ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,900,1450  );
				canvas = extra_canvas;

				that.getView().byId("contentWhole").setVisible(false);
				that.getView().byId("imgPreview").setVisible(true);
				that.getView().byId("imgPreview").setSrc(canvas.toDataURL());
				//that.getView().byId("imgPreview").setHeight(canvas.height + "px");
				//document.getElementById("idPreview").style.display = "none";

				//document.getElementById("test").disabled = false;
				that.showLoading(false);
			});
		});
	},
	validateDate : function(){
		debugger;
 		this.error = "";
 		
//		Patient's signature
		var imgOneDisplay = sap.ui.getCore().byId("imgOneDisplay");
		if((imgOneDisplay != undefined) && imgOneDisplay.getSrc() == ""){
			this.error = "Patient's signature is required."
				ret = false;
		}
		if(ret == false)
			return ret; 		

// 		Time-In Signature
 		var inPatientGuardianDT =  sap.ui.getCore().byId("inPatientGuardianDT");
		var ret = true;
		if(inPatientGuardianDT != undefined 	&& 
			inPatientGuardianDT.getValue() != "" && 
			inPatientGuardianDT.getDateValue() > new Date()){
//			inPatientGuardianDT.setValueState("Error");
			 this.error = "Error in Time In: You have selected the future date/time."
				 ret = false;
		 }  
//		else if(inPatientGuardianDT != undefined 	&& 
//					inPatientGuardianDT.getValue() != "" && 
//					inPatientGuardianDT.getDateValue().getDate() < new Date().getDate() && 
//					inPatientGuardianDT.getDateValue().getTime() < new Date().getTime()){
//			 		inPatientGuardianDT.setValueState("Error");
//					 this.error = "Error in Time In: Please Select Today's Date."
//						 ret = false;
//		}   
		else if(inPatientGuardianDT != undefined 	&& 
		inPatientGuardianDT.getValue() != "" && 
		inPatientGuardianDT.getDateValue().getFullYear() < new Date().getFullYear()){
 		inPatientGuardianDT.setValueState("Error");
		 this.error = "Error in Time In: Please Select Current Year."
			 ret = false;
}
		 else if (inPatientGuardianDT.getValue() == "") {
//			inPatientGuardianDT.setValueState("Error");
			this.error = "Error in Time In: Please Enter the Time In:"
				ret = false;
		} else{
			inPatientGuardianDT.setValueState("None");
		}
		if(ret == false)
			return ret;
		
// 		Time-Out Signature
		var inPatientGuardianDT2 =  sap.ui.getCore().byId("inPatientGuardianDT2");
		if(inPatientGuardianDT2 != undefined 	&& 
				inPatientGuardianDT2.getValue() != "" && 
				inPatientGuardianDT2.getDateValue() > new Date()){
//			 inPatientGuardianDT2.setValueState("Error");
			 this.error = "Error in Time Out: You have selected the future date/time."
				 ret = false;
		 }	else if(inPatientGuardianDT2 != undefined 	&& 
				    inPatientGuardianDT  != undefined 	&& 
				    inPatientGuardianDT.getValue()  != "" && 
					inPatientGuardianDT2.getValue() != "" && 
					inPatientGuardianDT2.getDateValue() < inPatientGuardianDT.getDateValue()){
//			 	 inPatientGuardianDT2.setValueState("Error");
				 this.error = "Error in Time Out: Date should always be after Time-In."
					 ret = false;
			 }else if(  inPatientGuardianDT2 != undefined 	&& 
					 	inPatientGuardianDT2.getValue() != "" && 
					 	inPatientGuardianDT2.getDateValue().getDate() < new Date().getDate() && 
					 	inPatientGuardianDT2.getDateValue().getTime() < new Date().getTime()){
				         
//				  		 inPatientGuardianDT2.setValueState("Error");
						 this.error = "Error in Time Out: Please Select Today's Date."
							 ret = false;
			} else if (inPatientGuardianDT2.getValue() == "") {
//				inPatientGuardianDT2.setValueState("Error");
				this.error = "Error in Time Out: Please Enter the Time Out:"
					ret = false;
		 } else{
			 inPatientGuardianDT2.setValueState("None");
			}
		if(ret == false)
			return ret;
		
// 		Time-In Signature 			// 		Time-Out Signature
			if(  inPatientGuardianDT2 != undefined 	&& 
				    inPatientGuardianDT  != undefined 	&& 
				    inPatientGuardianDT.getValue()  != "" && 
					inPatientGuardianDT2.getValue() != "" &&
					inPatientGuardianDT2.getValue() == inPatientGuardianDT.getValue() ){
		         
//		  		 inPatientGuardianDT.setValueState("Error");
//		  		 inPatientGuardianDT2.setValueState("Error");				
				 this.error = "Error: Time In & Time Out Dates can't be same."
					 ret = false;
	}
		if(ret == false)
			return ret;
		
// 		CheckBox :
		if (
				sap.ui.getCore().byId("IFT").getSelected() ||
				sap.ui.getCore().byId("ULTRASOUND").getSelected() ||
				sap.ui.getCore().byId("EMS").getSelected() ||
				sap.ui.getCore().byId("ITT").getSelected() ||
				sap.ui.getCore().byId("MOH").getSelected() ||
				sap.ui.getCore().byId("MTT").getSelected() ||
				sap.ui.getCore().byId("EXC").getSelected() ||
				sap.ui.getCore().byId("OTHERS").getSelected()){
			
			if(sap.ui.getCore().byId("OTHERS").getSelected() && 
			   document.getElementById("others").value != ""){
				ret = true;
			}else if(sap.ui.getCore().byId("OTHERS").getSelected() && 
					   document.getElementById("others").value == ""){
				this.error = "Please Specify the Others Input:"
					ret = false;
			}
			
		} else{
			this.error = "Error: Please Select Modality!"
				ret = false;
		}
		if(ret == false)
			return ret;
		
//		Physiotherapist's Signature
		var imgThreeDisplay = sap.ui.getCore().byId("imgThreeDisplay");
		if((imgThreeDisplay != undefined) && imgThreeDisplay.getSrc() == ""){
			this.error = "Physiotherapist's Signature signature is required."
				ret = false;
		}
		return ret;
	},
	onValidate : function(){
		debugger;
 		this.error = "";		

// 		Time-In Signature
 		var inPatientGuardianDT =  sap.ui.getCore().byId("inPatientGuardianDT");
		var ret = true;
		if(inPatientGuardianDT != undefined 	&& 
			inPatientGuardianDT.getValue() != "" && 
			inPatientGuardianDT.getDateValue() > new Date()){
//			inPatientGuardianDT.setValueState("Error");
			 this.error = "Error in Time In: You have selected the future date/time."
				 ret = false;
		 }  else if(inPatientGuardianDT != undefined 	&& 
					inPatientGuardianDT.getValue() != "" && 
					inPatientGuardianDT.getDateValue().getDate() < new Date().getDate() && 
					inPatientGuardianDT.getDateValue().getTime() < new Date().getTime()){
//			 		inPatientGuardianDT.setValueState("Error");
					 this.error = "Error in Time In: Please Select Today's Date."
						 ret = false;
		}   else if (inPatientGuardianDT.getValue() == "") {
//			inPatientGuardianDT.setValueState("Error");
			this.error = "Error in Time In: Please Enter the Time In:"
				ret = false;
		} else{
			inPatientGuardianDT.setValueState("None");
		}
		if(ret == false)
			return ret;
		
// 		Time-Out Signature
		var inPatientGuardianDT2 =  sap.ui.getCore().byId("inPatientGuardianDT2");
		if(inPatientGuardianDT2 != undefined 	&& 
				inPatientGuardianDT2.getValue() != "" && 
				inPatientGuardianDT2.getDateValue() > new Date()){
//			 inPatientGuardianDT2.setValueState("Error");
			 this.error = "Error in Time Out: You have selected the future date/time."
				 ret = false;
		 }	else if(inPatientGuardianDT2 != undefined 	&& 
				    inPatientGuardianDT  != undefined 	&& 
				    inPatientGuardianDT.getValue()  != "" && 
					inPatientGuardianDT2.getValue() != "" && 
					inPatientGuardianDT2.getDateValue() < inPatientGuardianDT.getDateValue()){
//			 	 inPatientGuardianDT2.setValueState("Error");
				 this.error = "Error in Time Out: Date should always be after Time-In."
					 ret = false;
			 }else if(  inPatientGuardianDT2 != undefined 	&& 
					 	inPatientGuardianDT2.getValue() != "" && 
					 	inPatientGuardianDT2.getDateValue().getDate() < new Date().getDate() && 
					 	inPatientGuardianDT2.getDateValue().getTime() < new Date().getTime()){
				         
//				  		 inPatientGuardianDT2.setValueState("Error");
						 this.error = "Error in Time Out: Please Select Today's Date."
							 ret = false;
			} else if (inPatientGuardianDT2.getValue() == "") {
//				inPatientGuardianDT2.setValueState("Error");
				this.error = "Error in Time Out: Please Enter the Time Out:"
					ret = false;
		 } else{
			 inPatientGuardianDT2.setValueState("None");
			}
		if(ret == false)
			return ret;
		
		return ret;
	},
	setCurrentDateTime : function(){
		debugger;
		//var inPatientGuardianDT = sap.ui.getCore().byId('inPatientGuardianDT');
		var dateCtls = ['inPatientGuardianDT2'];
		for(var i=0; i<dateCtls.length;i++){
			var inDate = dateCtls[i].toString();
			var inDateCtrl = sap.ui.getCore().byId(inDate);
			if(inDateCtrl != null || inDateCtrl != undefined){
				inDateCtrl.setDateValue(new Date());

				var showValueHelp = function () {
					sap.ui.getCore().byId(this.sId).setDateValue(new Date());
					return false;
				};
				
				sap.ui.getCore().byId(inDate).attachBrowserEvent("change", showValueHelp);
			}

		}
	},
	
	onOther : function(){
		debugger;
		if(sap.ui.getCore().byId("OTHERS").getSelected()){
			$("#others").removeAttr('readonly');
		} else {
			$("#others").attr('readonly', true);
			$("#others").val("");
		}
		
	}
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf llh_consent.Initial
	 */
//	onExit: function() {

//	}

});