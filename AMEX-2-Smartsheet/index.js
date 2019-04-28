module.exports = async function (context, req) {

    var client = require('smartsheet');
    var smartsheet = client.createClient({ accessToken: "txuqisuk8oadpl2nxa93v3m0hr" });
    var smartsheet_id = 5744708929513348;
    var column = [
        {
          "title": "Conto",
          "type": "TEXT_NUMBER",
          "index": 1
        },
        {
          "title": "Data",
          "type": "DATE",
          "index": 1
        },
        {
            "title": "Descrizione banca",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Descrizione",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Entrate",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Uscite",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Entrate in valuta",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Uscite in valuta",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Valuta",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Commissione",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "Tasso di cambio",
            "type": "TEXT_NUMBER",
            "index": 1
        },
        {
            "title": "ID transazione",
            "type": "TEXT_NUMBER",
            "index": 1
        },
      ];
      
      // Set options
      var options = {
        sheetId: smartsheet_id,
        body: column
        };
      
      // Add columns to the sheet
      smartsheet.sheets.addColumn(options)
        .then(function(newColumns) {
            context.log("add column success");
        })
        .catch(function(error) {
            context.log("add column error");
        });
    
        var options = {
            sheetId: smartsheet_id
          };
        
        var rows = [];
        //var transactions = body["transactions"];
        
        var transactions = [
            {
                "type": "DEBIT",
                "date": "2018-04-22",
                "description": "CAPE CODDER HYANNIS",
                "amount": 42.73,
                "payee": "CAPE CODDER RESORT",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010088548",
                "currency_amount": 46.86,
                "currency_id": "USD",
                "fx_commission": 1.04,
                "fx_rate": "1.124000"
              },
              {
                "type": "CREDIT",
                "date": "2018-04-22",
                "description": "CVS/PHARMACY #01215 000 CAMBRIDGE",
                "amount": -13.63,
                "payee": "CVS/PHARMACY #01215",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010088566",
                "currency_amount": 14.95,
                "currency_id": "USD",
                "fx_commission": 0.33,
                "fx_rate": "1.124000"
              },
              {
                "type": "DEBIT",
                "date": "2018-04-22",
                "description": "CAPE CODDER RESORT HYAN HYANNIS",
                "amount": 103.91,
                "payee": "CAPE CODDER RESORT",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010088551",
                "currency_amount": 113.94,
                "currency_id": "USD",
                "fx_commission": 2.53,
                "fx_rate": "1.123800"
              },
              {
                "type": "DEBIT",
                "date": "2018-04-22",
                "description": "PAYPAL *UBER 8772238023",
                "amount": 1.82,
                "payee": "MARK PAYPAL PPPL",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010086575",
                "currency_amount": 2,
                "currency_id": "USD",
                "fx_commission": 0.04,
                "fx_rate": "1.123500"
              },
              {
                "type": "CREDIT",
                "date": "2018-04-22",
                "description": "PAYPAL *UBER 8772238023",
                "amount": -10.07,
                "payee": "MARK PAYPAL PPPL",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010086576",
                "currency_amount": 11.05,
                "currency_id": "USD",
                "fx_commission": 0.25,
                "fx_rate": "1.125200"
              },
              {
                "type": "DEBIT",
                "date": "2018-04-22",
                "description": "PAYPAL *UBER 8772238023",
                "amount": 1.82,
                "payee": "MARK PAYPAL PPPL",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010086579",
                "currency_amount": 2,
                "currency_id": "USD",
                "fx_commission": 0.04,
                "fx_rate": "1.123500"
              },
              {
                "type": "DEBIT",
                "date": "2018-04-22",
                "description": "PAYPAL *UBER 8772238023",
                "amount": 14.25,
                "payee": "MARK PAYPAL PPPL",
                "record_date": "2019-04-23",
                "transaction_id": "AT191130046000010086580",
                "currency_amount": 15.63,
                "currency_id": "USD",
                "fx_commission": 0.35,
                "fx_rate": "1.124400"
              }
        ];
        var map_array1 = [["Data", "date"], ["Descrizione banca", "description"], ["Descrizione", "payee"], ["Uscite", "amount"], ["Entrate in valuta", "amount"], ["Uscite in valuta", "currency_amount"], ["Valuta", "currency_id"], ["Commissione", "fx_commission"], ["Tasso di cambio", "fx_rate"], ["ID transazione", "transaction_id"]];
        var col_map = new Map(map_array1);
    
    smartsheet.sheets.getColumns(options)
    .then(function(columnList) {
        context.log("get column success");
        var col_info = columnList["data"];
        var col_info_map_array = [];
        col_info.forEach(element => {
            col_info_map_array.push([element.title, element.id]);
        });
        var col_info_map = new Map(col_info_map_array);
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
    
        var yyyy = today.getFullYear();
        if (dd < 10) {
        dd = '0' + dd;
        } 
        if (mm < 10) {
        mm = '0' + mm;
        } 
        var today = yyyy + '-' + mm + '-' + dd;
        var debit_amount = 1330;
        var credit_amount = 1330;
        var account_name = "Carta AMEX";
        var row = {
            "toTop": true,
            "cells": [
                {
                    "columnId": col_info[0].id,
                    "value": "Summary"
                },
                {
                    "columnId": col_info_map.get("Data"),
                    "value": today
                },
                {
                    "columnId": col_info_map.get("Descrizione banca"),
                    "value": "Summary row"
                },
                {
                    "columnId": col_info_map.get("Descrizione"),
                    //"value": "Expected " + body["tx_count_expected"] + ", reported " + body["tx_count_reported"]
                    "value": "Expected 8, reported 7"
                },
                {
                    "columnId": col_info_map.get("Uscite"),
                    "value": debit_amount
                },
                {
                    "columnId": col_info_map.get("Entrate in valuta"),
                    "value": credit_amount
                },
            ]
        }
        rows.push(row);
        transactions.forEach(element => {
            row = {};
            row["toTop"] = true;
            row["cells"] = [];
            row["cells"].push({
                "columnId": col_info_map.get("Conto"),
                //"value": body["account_name"]
                "value": account_name
            })
            col_info_map_array.forEach((col, index, arr) => {
                if(col_map.get(col[0]) !== undefined){
                    if(element.type === "DEBIT" && col[0] === "Entrate in valuta"){
                        return;
                    }else if(element.type === "CREDIT" && col[0] === "Uscite"){
                        element.amount *= -1;
                        return;
                    }
                    var cell = {
                        "columnId": col[1],
                        "value": element[col_map.get(col[0])]
                    }
                    row["cells"].push(cell);
                }
            });
            rows.push(row);
        });
    var options = {
        sheetId: smartsheet_id,
        body: rows
        };
        
        // Add rows to sheet
        smartsheet.sheets.addRows(options)
        .then(function(newRows) {
            context.log("add rows success");
        })
        .catch(function(error) {
            context.log("get column error");
        });
    })
    .catch(function(error) {
        context.log("get column error");
    });
    
        
};
