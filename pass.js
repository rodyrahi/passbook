const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const PDFParser = require('pdf-parse');
var extractImagesFromPDF = require("./extractImages.js");
const path = require('path');



var con = require("./database.js");
const port = 9000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



const folderPath = './public/images';

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading folder contents:', err);
    return;
  }

  // Loop through all files and remove them
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log(`${file} has been deleted successfully.`);
    });
  });
});



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
  const pass = await executeQuery(`SELECT * FROM passdata WHERE user='${name}'`);


  var now = new Date();
  now = now.getDate() +'/'+now.getMonth() +'/'+now.getFullYear()
  now = now.toString();
  console.log(now);
  
  if (result.length > 0) {

    if (result[0].expiredate === now) {
      console.log('expired');

      res.render('login');
    }else{
      console.log('notexpired' , now , result.expiredate);
      res.render('home' , {user:name , passbooks:pass});

    }
  } else {
    res.render('login');
  }
});

const upload = multer({ dest: 'uploads/' });

app.post('/getfile', upload.single('pdf'), (req, res) => {
  const file = req.file.path;

  
  const pdfFilePath = 'input.pdf';
  const outputDirectory = './public/images';

  extractImagesFromPDF(file, outputDirectory);


  const {user} = req.body 

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
        let id_number = '';
        let ko_number = 'K410094';
        let dob
        for (let index = 16; index < 45; index++) {
          const element = text[index];

          if (element.startsWith('Customer Name')) {
            name = element.replace('Customer Name' ,'')
          }

          if (element.startsWith('S/O:') ) {
            father_name = element.replace('S/O:' ,'').split(',')[0]
          }
          if (element.startsWith('W/O:') ) {
            father_name = element.replace('W/O:' ,'').split(',')[0]
          }
          if (element.startsWith('S/O') ) {
            father_name = element.replace('S/O' ,'').split(',')[0]
          }
          if (element.startsWith('W/O') ) {
            father_name = element.replace('W/O' ,'').split(',')[0]
          }
          if (element.startsWith('C/O') ) {
            father_name = element.replace('C/O' ,'').split(',')[0]
          }
          if (element.startsWith('C/O:') ) {
            father_name = element.replace('C/O:' ,'').split(',')[0]
          }




          // let married

          // if (element.startsWith('Marital Status')) {
          //   married = element.replace('Marital Status' ,'')
       
          // }
          // if (element.startsWith('Name of Spouse (if married)')) {
            
            
          //   if (element.replace('Name of Spouse (if married)' ,'')=== '') {

          //     console.log('ok');
          //   }
          //   else{
          //     father_name = element.replace('Name of Spouse (if married)', '')

          //   }
            
          // }
          






          if (element.startsWith('Account No')) {
            account_number = element.replace('Account No' ,'')
          }

          if (element.startsWith('Customer ID')) {
            cif_number = element.replace('Customer ID' ,'')
          }

          if (element.startsWith('Mobile No')) {
            mobile_number = element.replace('Mobile No' ,'')
          }
          
          if (element.startsWith('Date of Birth')) {
            dob = element.replace('Date of Birth' ,'')
          }

          
          
        }
        // Extract the required information
        

        const result = await executeQuery(`SELECT * FROM passdata WHERE name = '${name}'`); 
         const phone = await executeQuery(`SELECT * FROM profiles WHERE name = '${user}'`);

         console.log(phone);


        if (result.length < 1) {
          executeQuery(`INSERT INTO passdata (user,name, fathername, accountno, cifno, ifsccode, mobileno, idno, kocode) VALUES ('${user}','${name}', '${father_name}', '${account_number}', '${cif_number}', '${ifsc_code}', '${mobile_number}', '${id_number}', '${ko_number}')`);

        }


        function allCapsToCamelCase(inputString) {
          return inputString.toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
                        }
        
        // Example usage:
       
       father_name = allCapsToCamelCase(father_name);



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
            dob,
            user,
            phone 
            

          });
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});



app.post('/details', async (req, res) => {
  const { name, fathername , accountno , cifno , ifsccode , mobileno,idno,kocode } = req.body;

  res.render('passbook', {
    name,
    father_name:fathername,
    account_number:accountno,
    cif_number:cifno,
    ifsc_code:ifsccode,
    mobile_number:mobileno,
    id_number:idno,
    ko_number:kocode,

  });

});

app.get('/createclient', async (req, res) => {
  const clients = await executeQuery(`SELECT * FROM profiles `);
  res.render('createclient', {clients:clients})
})
app.post('/createclient', async (req, res) => {

  var oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  oneYearFromNow = oneYearFromNow.getDate()+'/'+oneYearFromNow.getMonth() +'/'+oneYearFromNow.getFullYear()
  
  var now = new Date();
  now = now.getDate() +'/'+now.getMonth() +'/'+now.getFullYear()

  const { name, number , pass } = req.body;
  executeQuery(`INSERT INTO profiles (name, mobileno , pass , activedate , expiredate) VALUES ('${name}','${number}','${pass}', '${now}', '${oneYearFromNow}')`);


  
  res.redirect('/createclient')
  

})

app.get('/deleteclient/:name', async (req, res) => {

  const name = req.params.name

  console.log(name);
  await executeQuery(`DELETE FROM profiles WHERE name = '${name}' ;
  `)
  res.redirect('/createclient')
  

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
