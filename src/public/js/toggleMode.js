$(document).ready(function () {
  var element = document.body;
  if (localStorage.hasOwnProperty("Mode")) {
    if (localStorage.getItem("Mode") === "dark") {
      element.dataset.bsTheme = "dark";
      $("flexSwitchCheckChecked").prop("checked");
    } else if (localStorage.getItem("Mode") === "light") {
      element.dataset.bsTheme = "light";
      $("flexSwitchCheckChecked").removeProp("checked");
    }
  }
});

function toggleMode() {
  var element = document.body;
  element.dataset.bsTheme =
    element.dataset.bsTheme == "light" ? "dark" : "light";
    document.body.dispatchEvent(new Event('theme-change'));

  const isLoggedIn = getCookie("isLoggedIn");
  if (isLoggedIn) {
    fetch("http://fs3s-hotmilllog/HM_Walkthrough/darkmode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ darkMode: element.dataset.bsTheme }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        if (!data.success) {
          localStorage.setItem("Mode", element.dataset.bsTheme);
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  }
}
