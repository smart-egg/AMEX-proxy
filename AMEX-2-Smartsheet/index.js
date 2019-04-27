module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

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
        // rows.forEach(function(element) {

        // });    
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
         + pad(d.getUTCSeconds())+'Z'}
   
