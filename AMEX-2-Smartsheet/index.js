module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
    var row_delimiters = [["DESCRIZIONE", "payee"], ["DATA DELLA CONTABILIZZAZIONE", "record_date"], ["NUMERO DI RIFERIMENTO", "transaction_id"], ["DETTAGLI SULLA VALUTA ESTERA", "currency_info"], ["Spese all estero", "currency_amount"], ["Commissione", "fx_commission"], ["Tasso di cambio", "fx_rate"]];
    var delimiters_map = new Map(row_delimiters);

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
        
        contents = contents.replace(/’/g, " ");
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
        var regex = /^1-([0-9]{1,3}) of ([0-9]{1,3}) Transazioni/g;
        var arr = regex.exec(last_row);
        if(arr === null){
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
            if(arr[1] !== arr[2]){
                body["warning_count"] ++;
                var d = new Date();
                var warning = {
                    "timestamp": ISODateString(d),
                    "row" : rows.length,
                    "type": "Warning",
                    "message": "Possible incomplete file. Expecting " + arr[2] + " transactions but report contains " + arr[1] + "."
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
                    "message": "Expecting " + arr[1] + " transactions."
                }
                body["infos"].push(info);
            }
        }
        
        
        body["tx_count_expected"] = arr[2];
        body["tx_count_reported"] = arr[1];
        body["tx_count_found"] = 0;
        body["tx_count_credit"] = 0;
        body["tx_count_debit"] = 0;
        body["transactions"] = [];
        var row_index = 0;
        var start_pattern = /^([0-9]{2}) (gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)$/;
        var date_pattern = /^([0-9]{2}) (gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre), ([0-9]{4})$/i;
        var transaction = {};
        while(row_index < rows.length){
            if(rows[row_index] === ""){
                row_index++;
                continue;
            }
            var arr = start_pattern.exec(rows[row_index]);
            if(arr !== null){
                body["tx_count_found"] ++;
                if(!isEmpty(transaction)){
                    body["transactions"].push(transaction);
                    transaction = {};
                }
                transaction["type"] = "UNDEFINED";
                
                d = new Date();
                var mon = months.indexOf(arr[2]) + 1;
                var yr = "";
                if(mon < d.getUTCMonth()){
                    mon = pad(mon);
                    yr = d.getUTCFullYear();
                }else{
                    mon = pad(mon);
                    yr = d.getUTCFullYear() - 1;
                }
                transaction["date"] = yr + '-' + mon + '-' + arr[1];
                row_index += 2;
                transaction["description"] = rows[row_index];
                row_index += 2;
                var amount = amountFormatter(rows[row_index]);
                transaction["amount"] = amount;
                if(amount >= 0){
                    transaction["type"] = "DEBIT";
                    body["tx_count_debit"] ++;
                }else{
                    transaction["type"] = "CREDIT";
                    body["tx_count_credit"] ++;
                }

                if(rows[row_index + 1] !== "DESCRIZIONE"){
                    body["warning_count"] ++;
                    var d = new Date();
                    var warning = {
                        "timestamp": ISODateString(d),
                        "row" : row_index + 2,
                        "type": "Warning",
                        "message": "Expected DESCRIZIONE but found '" + rows[row_index + 1] + "'."
                    }
                    body["warnings"].push(warning);
                }
                
                row_index ++;
            }else{
                switch(delimiters_map.get(rows[row_index])){
                    case "payee": 
                        transaction["payee"] = rows[++row_index];
                        break;
                    case "record_date": {
                        var arr = date_pattern.exec(rows[++row_index]);
                        transaction["record_date"] = arr[3] + '-' + pad(months.indexOf(arr[2]) + 1) + '-' + arr[1];
                        break;
                    }
                    case "transaction_id":
                        transaction["transaction_id"] = rows[++row_index];
                        break;
                    case "currency_info":
                        row_index++;
                        break;
                    case "currency_amount": {
                        transaction["currency_amount"] = "xxxxx";
                        var arr = rows[++row_index].split(" ");
                        //transaction["currency_amount"] = parseFloat(arr[0]);
                        transaction["currency_id"] = arr[1];
                        break;
                    }
                    case "fx_commission": 
                        transaction["fx_commission"] = amountFormatter(rows[++row_index]);
                        break;
                    case "fx_rate":
                        transaction["fx_rate"] = parseFloat(rows[++row_index]).toFixed(6);
                        break;
                    default: row_index ++; break;
                }
            }
        }
        
        if(transaction.length >= 0){
            body["transactions"].push(transaction);
            transaction = {};
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
function pad(n){return n<10 ? '0'+n : n}
function ISODateString(d){
    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+'T'
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds())+'Z'
}
function amountFormatter(amount){
    var arr1 = amount.split(" ");
    amount_text1 = arr1[0].replace(/\./g, "");
    amount_text2 = amount_text1.replace(/,/g, ".");
    return parseFloat(amount_text2);
}
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}