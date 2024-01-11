async function fetchData(url) {
  const elementLogID = document.getElementById("logID")
  const elementSubmitButton = document.getElementById("formSubmitButton")

  elementLogID.value = ""
  elementSubmitButton.textContent = "Submit"
  // console.log("Sending:", url);
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    for (const key in data) {
      // console.log(key);
      if (key === "returnDate") {
        const date = new Date(data[key]);
        // console.log(date);
        document.getElementById("logDate").value = date
          .toISOString()
          .split("T")[0];
      }
      if (key === "formEnabled") {
        // console.log("formEnabled:", data[key]);
        const isFormDisabled = data[key] === false;
        // console.log("isFormDisabled", isFormDisabled);
        setFormDisabledState(isFormDisabled); // if not log creator disable form
        addFormDisableToLocal(isFormDisabled);

        // see if Log ID passed and if so then put it in hidden input text
        // also change text of submit button to update
        if (data["logID"]) {
          console.log("logID:",data["logID"])
          elementLogID.value = data["logID"]
          console.log("The document is ready:",document.readyState)
          console.log("elementLogID:", elementLogID.value)
          elementSubmitButton.textContent="Update"
        }
      }
      if (key === "results") {
        for (const key in data["results"]) {
          const inputElement = document.getElementsByName(key)[0];
          if (inputElement) {
            if (
              inputElement.type == "checkbox" &&
              data["results"][key] === "true"
            ) {
              inputElement.checked = true;
            }
            if (inputElement.tagName == "TEXTAREA") {
              inputElement.classList.remove("collapse");
            }
            inputElement.value = data["results"][key];
          }
        }
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function submitDate() {
  const selectedDate = document.getElementById("logDate").value;
  const url = `/HM_Walkthrough/walkthrough?date=${selectedDate}`;

  fetchData(url);
}

function prevLog() {
  let url = "";
  const selectedDate = document.getElementById("logDate").value;
  if (selectedDate) {
    url = `/HM_Walkthrough/walkthrough?prev=true&date=${selectedDate}`;
  } else {
    url = `/HM_Walkthrough/walkthrough?prev=true`;
  }

  fetchData(url);
}

function nextLog() {
  let url = "";
  const selectedDate = document.getElementById("logDate").value;
  if (selectedDate) {
    url = `/HM_Walkthrough/walkthrough?next=true&date=${selectedDate}`;
  } else {
    url = `/HM_Walkthrough/walkthrough?next=true`;
  }

  fetchData(url);
}

function setFormDisabledState(isFormDisabled) {
  const element = document.getElementById("formFieldset");
  element.disabled = isFormDisabled; // gets passed isFormEnabled
}

function addFormDisableToLocal(isFormDisabled) {
  localStorage.setItem("isFormDisabled", isFormDisabled);
  // console.log(
  //   "localStorage isFormDisabled changed to:",
  //   localStorage.getItem("isFormDisabled")
  // );
}
