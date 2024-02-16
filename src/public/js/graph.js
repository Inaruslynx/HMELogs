console.log("graph.js loaded");
let chart;
// need async function to make api call to server to get data
window.getData = async function () {
  const dataSelection = document.getElementById("dataSelector").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  if (dataSelection === "" || fromDate === "" || toDate === "") {
    return;
  }
  //   const url = `/HM_Walkthrough/graph?dataSelection=${dataSelection}&fromDate=${fromDate}&toDate=${toDate}`;

  // use async function to get data
  const data = await execFetch(dataSelection, fromDate, toDate);

  if (data) {
    if (chart) chart.destroy();
    // load data into chart
    chart = new Chart(document.getElementById("Chart"), {
      type: "line",
      data: {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: dataSelection,
            data: data.map((item) => item.value),
          },
        ],
      },
    });
  }
};

async function execFetch(dataSelection, fromDate, toDate) {
  const url = "/HM_Walkthrough/graph";
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataSelection,
      fromDate,
      toDate,
    }),
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return false;
  }
}
