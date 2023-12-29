var Service = require('node-windows').Service;

var svc = new Service({
    name: 'HM Walkthrough',
    description: 'Express server for HM Walkthrough',
    script: 'C:\\Express\\HMELogs\\src\\index.js',
    workingDirectory: `C:\\Express\\HMELogs\\src\\`
});

svc.on('install', function () {
    svc.start();
})

svc.on('alreadyinstalled', function () {
    console.log('This service is already installed.');
})

svc.on('start', function () {
    console.log(svc.name+' start!\nVisit http://fs3s-hotmilllog/HM_Walkthrough/ to visit the site.')
})

svc.install();