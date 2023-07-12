
const express = require('express')
const app = express()

const multer = require('multer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const PDFParser = require('pdf-parse');
const { log } = require('console');

var con = require("./database.js");


const port = 9000

app.use(express.static("public"));
app.set("view engine", "ejs");
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



  res.render('login')
})

app.post('/login',async (req, res) => {
  const{name,password}=req.body
  const result=await executeQuery(`SELECT * FROM profiles WHERE name='${name}' AND pass='${password}'`)

  if (result.length>0) {
    res.render('home')
  }else{
    res.render('login')
  }

})
const upload = multer({ dest: 'uploads/' }); // Replace 'uploads/' with the directory where you want to store the uploaded files

app.post('/getfile', upload.single('pdf'), (req, res) => {
  const file = req.file.path;

  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error(err);
      return;
    }
  
    PDFParser(buffer).then((data) => {
      const text = data.text.split('\n');
  
      console.log(text);
      // Extract the required information
      const name = text[18].replace('Customer Name' , '');
      const father_name = text[42].slice(25);
      const account_number = text[20].slice(10);
      const cif_number = text[21].slice(11);
      const ifsc_code = 'PUB0099000';
      const mobile_number = text[23].slice(9);
      const id_number = 'Not in the form';
      const ko_number = 'K410094';
  
      const filePath = './table.html';
  
      fs.readFile(filePath, 'utf8', (err, htmlContent) => {
        if (err) {
          console.error('Error reading HTML file:', err);
          return;
        }
  

        res.render('passbook' , { 
          name , 
          father_name ,
          account_number,
          cif_number,
          ifsc_code,
          mobile_number,
          id_number,
          ko_number
        
        } );
      });

    }).catch((error) => {
      console.error('Error:', error);
    });
  });



 
 // Render the 'passbook' view
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})







// async function htmlToPDF(htmlContent, outputPath) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Set the HTML content of the page
//   await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//   // Generate the PDF
//   await page.pdf({ path: outputPath, format: 'A4' });

//   await browser.close();
// }





