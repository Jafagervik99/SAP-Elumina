/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0*/
/*eslint-env node, es6 */
"use strict";

var conn = $.hdb.getConnection();
var query = "SELECT FROM TelemetrySensors.Measurements { " +
	        " MeasurementId as \"mID\", " +
            " SeriesIdentifierId as \"siID\", " +
            " measureTime as \"mTime\", " +
            " value as \"val\", " +
            " } ";
var rs = conn.executeQuery(query);

var body = "";
for(var item of rs){
   if(item.siID === 1){
	body += item.mID + "\t" +
			item.siID + "\t" + 
			item.mTime + "\t" +
			item.val  + "\n";
   }
}

$.response.setBody(body);
$.response.contentType = "application/vnd.ms-excel; charset=utf-16le";
$.response.headers.set("Content-Disposition",
		"attachment; filename=Excel.xls");
$.response.status = $.net.http.OK;
