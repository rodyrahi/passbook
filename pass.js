const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const PDFParser = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
var con = require("./database.js");
const port = 9000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const result = await executeQuery(`SELECT * FROM profiles WHERE name='${name}' AND pass='${password}'`);

  if (result.length > 0) {
    res.render('home');
  } else {
    res.render('login');
  }
});

const upload = multer({ dest: 'uploads/' });

app.post('/getfile', upload.single('pdf'), (req, res) => {
  const file = req.file.path;

  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error(err);
      return;
    }

    PDFParser(buffer)
      .then(async (data) => {
        const text = data.text.split('\n');

        console.log(text);


        let name 
        let father_name = text[42].replace('Name of Father / Guardian', '');
        let account_number = text[20].replace('Account No', '');
        let cif_number = text[21].slice(11);
        let ifsc_code = 'PUB0099000';
        let mobile_number = text[23].replace('Mobile No', '');
        let id_number = 'Not in the form';
        let ko_number = 'K410094';
        for (let index = 16; index < 45; index++) {
          const element = text[index];

          if (element.startsWith('Customer Name')) {
            name = element.replace('Customer Name' ,'')
          }

          if (element.startsWith('Name of Father / Guardian')) {
            father_name = element.replace('Name of Father / Guardian' ,'')
          }

          if (element.startsWith('Account No')) {
            account_number = element.replace('Account No' ,'')
          }

          if (element.startsWith('Customer ID')) {
            cif_number = element.replace('Customer ID' ,'')
          }

          if (element.startsWith('Mobile No')) {
            mobile_number = element.replace('Mobile No' ,'')
          }
          


          
          
        }
        // Extract the required information
        


        const filePath = './table.html';

        fs.readFile(filePath, 'utf8', async (err, htmlContent) => {
          if (err) {
            console.error('Error reading HTML file:', err);
            return;
          }


          res.render('passbook', {
            name,
            father_name,
            account_number,
            cif_number,
            ifsc_code,
            mobile_number,
            id_number,
            ko_number,

          });
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
