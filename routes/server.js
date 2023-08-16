const express = require("express");
const app = express();
var router = express.Router();
const { exec } = require("child_process");

router.get("/", (req, res) => {
  const command = "pm2 list";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    
    const lines = stdout.trim().split("\n");
    const appNames = lines.slice(1).map(line => line.split(/\s+/)[1]);
    
    res.render("server/server", { appNames: appNames });
  });
});

module.exports = router;
