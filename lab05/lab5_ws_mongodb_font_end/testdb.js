var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
console.log("xxx");
MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log("eer");
    throw err;
  }
    console.log("iii");
    var dbo = db.db("iot");
    var myobj = { wp: "10" };
    dbo.collection("current_envs").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
  });
}); 

console.log("11111");