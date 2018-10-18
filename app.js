var converter = require('json-2-csv');
var csv = require('csv-parser');
var fs = require('fs');
var moment = require('moment');
var path = require('path');


function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
    return match.toUpperCase();
  });
}

var timestamp = moment().format('YYYYMMDD-HHmmss');

var itemsArray = [
  { key: "How many **baby kit** distributed?", value: "Baby kit"},
  { key: "How many **blanket** distributed?", value: "Blanket"},
  { key: "How many **family kit** distributed?", value: "Family kit"},
  { key: "How many **hygiene kit** distributed?", value: "Hygiene kit"},
  { key: "How many **jerry can** distributed?", value: "Jerry can"},
  { key: "How many **kitchen set** distributed?", value: "Kitchen set"},
  { key: "How many **mat** distributed?", value: "Sleeping mat"},
  { key: "How many **mosquito net** distributed?", value: "Mosquito net"},
  { key: "How many **sarong** distributed?", value: "Sarong"},
  { key: "How many **solar lamp** distributed?", value: "Solar lamp"},
  { key: "How many **tarp** distributed?", value: "Tarpauline"},
  { key: "How many **tent (family)** distributed?", value: "Family tent"},
  { key: "How many **sleeping bag** distributed?", value: "Sleeping bag"}
]

var filename = "FORM_DISTRIBUSI_IN-KIND_-_latest_version_-_English_(en)_ALL-2018-10-18.csv"
var rows = [];
fs.createReadStream('./data/'+filename)
  .pipe(csv())
  .on('data', function(data) {
    try {
      rows.push(data);
    }
    catch(err) {
      //error handler
    }
  })
  .on('end',transformData);  

var outputData = []  
function transformData() {
  function doneYet() {
    if(aCount==rows.length){ writeOutput(); }
  }
  var aCount = 0;
  for(var a=0;a<rows.length;a++) {
    var bCount = 0;
    for(var b=0;b<itemsArray.length;b++) {
      var itemQty = parseInt(rows[a][ itemsArray[b].key ]);
      if( itemQty !== NaN ) {
        if( itemQty > 0 ) {
          outputData.push({
            "source": filename,
            "index": rows[a]["_uuid"],
            "province": toTitleCase(rows[a].provinsi),
            "district": toTitleCase(rows[a].kabkota),
            "subdistrict": toTitleCase(rows[a].kecamatan),
            "village": toTitleCase(rows[a].desa),
            "activity": "Distribution",
            "item": itemsArray[b].value,
            "date": rows[a].today,
            "qty": itemQty,
            "primary beneficiary": "Households",
            "# prim ben": rows[a]["'How many households received item(s)?'"]
          })
          bCount++;
          if(bCount==itemsArray.length) { aCount++; doneYet(); }
        } else {
          bCount++;
          if(bCount==itemsArray.length) { aCount++; doneYet(); }
        }
      } else {
        bCount++;
        if(bCount==itemsArray.length) { aCount++; doneYet(); }
      }
    }
  }
}

function writeOutput() {
  var options = {
    delimiter : {
      wrap  : '"', // Double Quote (") character
    }
  }
  
  converter.json2csv(outputData, function(err, csv) {
    var filePath = path.join(__dirname,"data", "output_" + timestamp + ".csv");
    fs.writeFile(filePath, csv, (err) => {
      if (err) throw err;
      console.log("the CSV has been written!")
    });
  }, options);

}




