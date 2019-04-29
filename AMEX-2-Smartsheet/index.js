module.exports = async function (context, req) {

    var client = require('smartsheet');
    var smartsheet = client.createClient({ accessToken: "txuqisuk8oadpl2nxa93v3m0hr" });
    var smartsheet_id = 5744708929513348;
    var options = {
        sheetId: smartsheet_id
    };

    context.log("test1");
    await smartsheet.sheets.getColumns(options)
    .then(function(columnList) {
        context.log("get column success");
    })
    .catch(function(error) {
        context.log("get column error");
    });
};
