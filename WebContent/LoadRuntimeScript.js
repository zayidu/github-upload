var domainURL =  location.protocol + "//" + location.host;
if(location.host.indexOf("localhost") > -1){
	domainURL = "http://llhimd.burjeel.com:8000";
}

document.write("<script src='" + domainURL + "/sap/public/bc/ui2/services/sap/ui2/srvc/error.js'>" + "</script>");
document.write("<script src='" + domainURL  + "/sap/public/bc/ui2/services/sap/ui2/srvc/utils.js'>" + "</script>");
document.write("<script src='" + domainURL  + "/sap/public/bc/ui2/shell-api/sap/ui2/shell/startup.js'>" + "</script>");