module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

    if (req.body && req.body.filename && req.body.contents && req.body.smartsheet_id && req.body.account_name) {
        var filename = req.body.filename;
        var b = new Buffer(req.body.contents, 'base64')
        var contents = b.toString();
        var smartsheet_id = req.body.smartsheet_id;
        var account_name = req.body.account_name;
        var body = {
            "status": 200,
            "message": "success",
            "filename": filename,
            "smartsheet_id": smartsheet_id,
            "account_name": account_name,
        }
        
        
        body["warning_count"] = 0;
        body["warnings"] = [];
        body["error_count"] = 0;
        body["errors"] = [];
        body["info_count"] = 0;
        body["infos"] = [];
        
        
        var rows = contents.split(/\r?\n/);
        if(rows[0] !== "Cosa sono le transazioni contabilizzate ?"){
            body["warning_count"] ++;
            var d = new Date();
            var warning = {
                "timestamp": ISODateString(d),
                "row" : 1,
                "type": "Warning",
                "message": "Unexpected beginning of file. Expected 'Cosa sono le transazioni contabilizzate ?', found " + "'" + rows[0] + "'."
            }
            body["warnings"].push(warning);
        }
        
        
        var last_row = rows[rows.length - 1];
        var sample_last_row = "1-x of y Transazioni";
        sample_last_row.replaceAt(2, last_row.charAt(2));
        sample_last_row.replaceAt(7, last_row.charAt(7));
        if(last_row !== sample_last_row){
            body["warning_count"] ++;
            var d = new Date();
            var warning = {
                "timestamp": ISODateString(d),
                "row" : rows.length,
                "type": "Warning",
                "message": "Unexpected end of file. Expected '1-x of y Transazioni', found '" + last_row + "'."
            }
            body["warnings"].push(warning);
        }
        else{
            if(last_row.charAt(2) !== last_row.charAt(7)){
                body["warning_count"] ++;
                var d = new Date();
                var warning = {
                    "timestamp": ISODateString(d),
                    "row" : rows.length,
                    "type": "Warning",
                    "message": "Possible incomplete file. Expecting " + last_row.charAt(7) + " transactions but report contains " + last_row.charAt(2) + "."
                }
                body["warnings"].push(warning);
            }
            else{
                body["info_count"] ++;
                var d = new Date();
                var info = {
                    "timestamp": ISODateString(d),
                    "row" : rows.length,
                    "type": "Information",
                    "message": "Expecting " + last_row.charAt(2) + " transactions."
                }
                body["infos"].push(info);
            }
        }
        
        
        body["tx_count_expected"] = last_row.charAt(7);
        body["tx_count_reported"] = last_row.charAt(2);
        body["tx_count_found"] = 0;
        body["tx_count_credit"] = 0;
        body["tx_count_debit"] = 0;
        body["transactions"] = [];
        
        
        var date_separator1 = [];
        rows.forEach(function(element, index) {
            months.forEach(function(month){
                if(element.includes(month)){
                    date_separator1.push(index);
                    return true;
                }
            });
        });

        body["tx_count_found"] = date_separator1.length / 2;
        for(var i = 0; i < date_separator1.length - 1; i += 2){
            j = date_separator1[i];
            var arr1 = rows[j].split(" ");
            var d = new Date();
            var date = d.getUTCFullYear() + '-' + getMonthFromString(arr1[1], months) + '-' + arr1[0];
            var amount_text = rows[j + 4].split(" ")[0];
            var amount_text1 = amount_text.replace(/./g, "");
            var amount_text2 = amount_text1.replace(/,/g, ".");
            var amount = parseFloat(amount_text2);
            var type = "UNDEFINED";
            if(amount === NaN){
                body["warning_count"] ++;
                var d = new Date();
                var warning = {
                    "timestamp": ISODateString(d),
                    "row" : j + 5,
                    "type": "Warning",
                    "message": "Expected amount but found '" + rows[j + 4] + "'."
                }
                body["warnings"].push(warning);
            }else{
                if(amount < 0){
                    type = "CREDIT";
                    body["tx_count_credit"] ++;
                }else{
                    type = "DEBIT";
                    body["tx_count_debit"] ++;
                }
            }

            var transaction = {
                "type": type,
                "date": date,
                "description": rows[j + 2],
                "amount": amount,
            }

            var payee = "";
            if(rows[j + 5] === "DESCRIZIONE"){
                payee = rows[j + 6];
            }else{
                body["warning_count"] ++;
                var d = new Date();
                var warning = {
                    "timestamp": ISODateString(d),
                    "row" : j + 6,
                    "type": "Warning",
                    "message": "Expected DESCRIZIONE but found '" + rows[j + 5] + "'."
                }
                body["warnings"].push(warning);
            }

            var record_date = "";
            if(rows[j + 8] === "DATA DELLA CONTABILIZZAZIONE"){
                arr1 = rows[j + 9].split(" ");
                record_date = arr1[2] + '-' + getMonthFromString(arr1[1], months) + '-' + arr1[0];
                transaction["record_date"] = record_date;
            }else{
                body["transactions"].push(transaction);
                continue;
            }

            var transaction_id = "";
            if(rows[j + 11] === "NUMERO DI RIFERIMENTO"){
                transaction_id = rows[j + 12];
                transaction["transaction_id"] = transaction_id;
            }else{
                body["transactions"].push(transaction);
                continue;
            }

            var currency_amount = 0;
            var currency_id = "USD";
            if(rows[j + 14] === "DETTAGLI SULLA VALUTA ESTERA"){
                arr1 = rows[j + 16].split(" ");
                currency_amount = parseFloat(arr1[0].replace(/,/g, ""));
                currency_id = arr1[1];
                transaction["currency_amount"] = currency_amount;
                transaction["currency_id"] = currency_id;
            }else{
                body["transactions"].push(transaction);
                continue;
            }
            
            var fx_commission = 0;
            var fx_rate = 0.0;
            if(rows[j + 17] === "Commissione"){
                arr1 = rows[j + 18].split(" ");
                amount_text1 = arr1[0].replace(/./g, "");
                amount_text2 = amount_text1.replace(/,/g, ".");
                fx_commission = parseFloat(amount_text2);
                transaction["fx_commission"] = fx_commission;
                if(rows[j + 19] === "Tasso di cambio"){
                    fx_rate = parseFloat(rows[j + 20]).toFixed(6);
                    transaction["fx_rate"] = fx_rate;
                }else{
                    body["transactions"].push(transaction);
                    continue;
                }
                
            }else{
                body["transactions"].push(transaction);
                continue;
            }
        }

        
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: body
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a correct parameters in the request body"
        };
    }
};
function ISODateString(d){
    function pad(n){return n<10 ? '0'+n : n}

    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+'T'
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds())+'Z'
}
String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}
function getMonthFromString(str, months){
    var m = "0";
    months.forEach(function(element, index){
        if(str.includes(element)){
            if(index + 1 < 10){
                m += (index + 1);
                return true;
            }else{
                m = ""+ (index + 1);
                return true;
            }
        }
    });
    return m;
}
   
