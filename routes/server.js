const express = require("express");
const app = express();
var router = express.Router();
const { exec } = require("child_process");

router.get("/", (req, res) => {
  const command = "pm2 prettylist";

  var result ;
  var std = ''; // Initialize std

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Handle error
      result = error.message;
    }
    if (stderr) {

      std = stderr;
    }
    
    // Store stdout and render the view here, inside the callback
    std = stdout;


    const appNames = std.map(appData => appData.name);
    

   
    res.render("server/server", { result: appNames, std: std });
  });
});

module.exports = router;
