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
    const appDataLines = lines.slice(2, -1); // Extract app data lines
    
    const appData = appDataLines.map(line => {
      const data = line.trim().split(/\s+/);
      return {
        id: data[0],
        name: data[1],
        status: data[8]
      };
    });

    res.render("server/server", { appData: appData });
  });
});

module.exports = router;
