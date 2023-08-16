const express = require("express");
const app = express();
var router = express.Router();
const { exec } = require("child_process");

router.get("/", (req, res) => {
  const command = "pm2 jlist";

  var result ;
  var std ='' ; 

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Handle error
      result = error;
    }
    if (stderr) {

      std = `${stderr}`;
    }
    
    // Store stdout and render the view here, inside the callback
    std = `${stdout}`;

    

    std = JSON.parse(std);

   
    res.render("server/server", { result: std,error:`${error}`, stderr:`${stderr}` , stdout:`${stdout}` });
  });
});


router.post("/cmd", (req, res) => {

  const {command }= req.body

  var result ;
  var std ='' ; 

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Handle error
      result = error;
    }
    if (stderr) {

      std = `${stderr}`;
    }
    
    // Store stdout and render the view here, inside the callback
    std = `${stdout}`;



    std = JSON.parse(std);

   
    res.render("server/server", { result: std,error:`${error}`, stderr:`${stderr}` , stdout:`${stdout}` });
  });
});
module.exports = router;
