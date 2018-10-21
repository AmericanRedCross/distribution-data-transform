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
  { key: "Hygiene Kit", value: "hygiene kit", activity: "Distribution", activitycategory: "Health", sector: "Displacement and Protection"},
  { key: "Family Kit", value: "family kit", activity: "Distribution", activitycategory: "Livelihood", sector: "Displacement and Protection"},
  { key: "Baby Kit", value: "baby kit", activity: "Distribution", activitycategory: "Livelihood", sector: "Displacement and Protection"},
  { key: "Terpaulin", value: "tarpaulin", activity: "Distribution", activitycategory: "Shelter", sector: "Displacement and Protection"},
  { key: "Selimut", value: "blanket", activity: "Distribution", activitycategory: "Livelihood", sector: "Displacement and Protection"},
  { key: "Tikar", value: "mat", activity: "Distribution", activitycategory: "Shelter", sector: "Displacement and Protection"},
  { key: "Sarung", value: "sarung", activity: "Distribution", activitycategory: "Livelihood", sector: "Displacement and Protection"},
  { key: "shalter toll kits", value: "shelter toolkit", activity: "Distribution", activitycategory: "Shelter", sector: "Displacement and Protection"},
  { key: "Kelambu", value: "mosquito net", activity: "Distribution", activitycategory: "Health promotion", sector: "Health"}
]

var filename = "Rekap Dampak  Pelayanan PMI_19_Okt_AI.csv"
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
          console.log(rows[a])
          outputData.push({
            // Sector/Cluster	Activity Category	District	Sub Dstrict	Village	Place Name	Activity	Materials/Service Provided	Primary Beneficiary	# of Primary Beneficiaries	Status	Start Date	End Date
            "implementing agency": "Palang Merah Indonesia",
            "sector/cluster": itemsArray[b].sector,
            // "source": filename,
            // "index": rows[a]["_uuid"],
            "activity category": itemsArray[b].activitycategory,
            // "province": toTitleCase(rows[a].provinsi),
            "district": toTitleCase(rows[a]["Kab/Kota"]),
            "subdistrict": toTitleCase(rows[a].Kecamatan),
            "village": toTitleCase(rows[a].Desa),
            "place name": toTitleCase(rows[a].Lokasi),
            "activity": itemsArray[b].activity,
            "materials/ service provided": itemsArray[b].value,
            "primary beneficiary": "",
            "# of primary Beneficiaries": itemQty,
            "status": "Completed",
            "start date": rows[a].Tanggal,
            "end date": rows[a].Tanggal
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




