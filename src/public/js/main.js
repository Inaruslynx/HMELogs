// This script just makes it easier for me to import all of my scripts into the page
$(document).ready(function () {
  const url = "http://fs3s-hotmilllog/HM_Walkthrough/js/";
  const ListOfScripts = [
    "DynamicScrollspy.js",
    "getCookie.js",
    "toggleMode.js",
    "validateForms.js",
    "handleCheckboxClick.js",
    "logUtils.js"
  ];

  ListOfScripts.forEach((element) => {
    $.getScript(`${url}${element}`, function (script, textStatus, jqXHR) {
      console.log(`Script: ${element} loaded`);
    });
  });
});
