const Host = process.platform ===  "127.0.0.1" ? "win32": "165.232.151.6";
var mysql = require("mysql");
// var isWin = process.platform === "win32";

// if (!isWin) {
//   Host = "127.0.0.1"
  
// }
// console.log(Host);





const { exec } = require("child_process");
const cron = require("node-cron");

// Function to run the mysqldump command and save the backup to all.sql
function runMysqldump() {
  const backupFileName = "all.sql";
  const mysqldumpCommand = `mysqldump -u root -p --all-databases > ${backupFileName}`;

  exec(mysqldumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error running mysqldump:", error);
      return;
    }
    console.log(`Backup saved to ${backupFileName}`);
  });
}

// Schedule the mysqldump to run every 24 hours
cron.schedule("*/15 * * * * *", () => {
  console.log("Starting database backup...");
  runMysqldump();
});


var connection = mysql.createConnection({
  host: Host,
  user: "raj",
  password: "Kamingo@11",
  database: "passbook",
  charset:"utf8mb4",
  timeout: 60000

});
connection.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  
});
module.exports = connection;
