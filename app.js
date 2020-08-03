const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv')
const cors = require('cors');

const con = require('./db.js');
const router = require('./routes.js')

dotenv.config();
const app = express();

app.use(cors({
  origin: '*'
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', router);


app.listen(process.env.PORT || 5000, function () {
  console.log("listening on port 5000")
});