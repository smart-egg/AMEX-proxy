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