const mysql = require('mysql')

//DATABASE CONNECTION
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "budget"
});

con.connect(function(error){
if(error) {
  return error.message
}else {
  console.log("connected");
}
});

module.exports = con;