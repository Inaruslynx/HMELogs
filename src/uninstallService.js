var Service = require("node-windows").Service;

var svc = new Service({
  name: "HM Walkthrough",
  description: "Express server for HM Walkthrough",
  script: "C:\\Express\\HMELogs\\src\\index.js",
  workingDirectory: `C:\\Express\\HMELogs\\src\\`,
});

// Listen for the "uninstall" event so we know when it's done.
svc.on("uninstall", function () {
  console.log("Uninstall complete.");
  console.log("The service exists: ", svc.exists);
});

// Uninstall the service.
svc.uninstall();
