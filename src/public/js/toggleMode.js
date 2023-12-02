$(document).ready(function () {
    if (localStorage.hasOwnProperty('Mode')) {
        
    }
})

function toggleMode() {
  var element = document.body;
  element.dataset.bsTheme =
    element.dataset.bsTheme == "light" ? "dark" : "light";

  fetch("http://fs3s-hotmilllog/HM_Walkthrough/darkmode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ darkMode: element.dataset.bsTheme }),
  })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        if (!data.success) {
            localStorage.setItem('Mode', element.dataset.bsTheme);
        }
    })
    .catch((err) => {
      console.error("Error: ", err);
    });
}
