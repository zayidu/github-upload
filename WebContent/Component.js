jQuery.sap.declare("imed.app.physio.Component");
jQuery.sap.require("imed.app.physio.MyRouter");
sap.ui.core.UIComponent.extend("imed.app.physio.Component", {
  metadata : {
    name : "Physiotherapy Confirmation Form",
    version : "1.0",
    includes : [],
    dependencies : {
      libs : ["sap.m", "sap.ui.layout"],
      components : []
    },
    rootView : "imed.app.physio.view.App",
    config : {
      resourceBundle : "i18n/messageBundle.properties",
      serviceConfig : {
        name : "Physiotherapy Confirmation Service",
        serviceUrl : "/sap/opu/odata/sap/Z_PHYSIO_FORMS_GSB_SRV/"
      }
    },
    routing : {
      config : {
        routerClass : imed.app.physio.MyRouter,
        viewType : "XML",
        viewPath : "imed.app.physio.view",
        targetAggregation : "detailPages",
        clearTarget : false

      },

      routes : [
                {
                  pattern : "",
                  name : "main",
                  view : "Master",
                  targetAggregation : "masterPages",
                  targetControl : "idAppControl",
                  viewLevel : 0,
                  subroutes : [
                               {
                                 viewLevel :1,
                                 pattern : "",
                                 name : "general",
                                 view : "Initial",
                                 targetAggregation : "detailPages"
                               },
                               {
                                 viewLevel :1,
                                 pattern : "error",
                                 name : "error",
                                 view : "General",
                                 targetAggregation : "detailPages"
                               }
                               ]
                },
                {
                  name : "catchallMaster",
                  view : "Master",
                  targetAggregation : "masterPages",
                  targetControl : "idAppControl",
                  subroutes : [
                               {
                                 pattern : ":all*:",
                                 name : "catchallDetail",
                                 view : "NotFound",
                                 transition : "show"
                               }
                               ]
                }
                ]
    }
  },

  init : function() { debugger; // VSDK924425
    sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

    config = 
    {

//        baseURL:'/sap/opu/odata/sap/Z_MEDFORMS_SRV_SRV/',
    	baseURL:'/sap/opu/odata/sap/Z_PHYSIO_FORMS_GSB_SRV/',
        institution : '',
        NursingOU: 'POPPUMH1'

    };
    appError = undefined;

    var mConfig = this.getMetadata().getConfig();

    // always use absolute paths relative to our own component
    // (relative paths will fail if running in the Fiori Launchpad)
    var rootPath = jQuery.sap.getModulePath("imed.app.physio");

    // set i18n model
    var i18nModel = new sap.ui.model.resource.ResourceModel({
      bundleUrl : [rootPath, mConfig.resourceBundle].join("/")
    });
    this.setModel(i18nModel, "i18n");

    sServiceUrl = getServiceUrl(mConfig.serviceConfig.serviceUrl);

    function getServiceUrl(sServiceUrl) {
      //for local testing prefix with proxy
      //if you and your team use a special host name or IP like 127.0.0.1 for localhost please adapt the if statement below 
      if (window.location.hostname == "localhost") {
        return "proxy" + sServiceUrl;
      } else {
        return sServiceUrl;
      }
    }

    var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
    oModel1 = oModel;
    this.setModel(oModel);

    function getUserDetails(user) {
      var ret = -1;
      var url = "/UserDetailsCollection(Username='"+user+"')";
      oModel1.read(url,{async:false, 
        success: function(oData, oResponse) { 
          ret = oData;
        }, 
        error: function(oError){  
          ret = -1;
          return;
        }  
      });
      return ret;
    }
    if(oUserModel.userID != ""){
      var userDetail = getUserDetails(oUserModel.userID);
      if(userDetail != undefined){
        config.institution = userDetail.Institution;
      }
    }
 
    
    // set device model
    var deviceModel = new sap.ui.model.json.JSONModel({
      isTouch : sap.ui.Device.support.touch,
      isNoTouch : !sap.ui.Device.support.touch,
      isPhone : sap.ui.Device.system.phone,
      isNoPhone : !sap.ui.Device.system.phone,
      listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
          listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
    });
    deviceModel.setDefaultBindingMode("OneWay");
    this.setModel(deviceModel, "device");


    this.getRouter().initialize();


  },
});