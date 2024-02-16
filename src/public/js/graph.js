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
    const COLOR = getGridColor();
    // load data into chart
    chart = new Chart(document.getElementById("Chart"), {
      type: "line",
      data: {
        labels: data.map((item) => item.date),
        color: COLOR,
        datasets: [
          {
            data: data.map((item) => item.value),
            color: COLOR,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: {
              color: COLOR,
            },
            ticks: {
              color: COLOR,
            },
          },
          y: {
            grid: {
              color: COLOR,
            },
            ticks: {
              color: COLOR,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: dataSelection,
            color: COLOR,
          },
          legend: {
            display: false,
          },
        },
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

// Function to get the grid color based on the theme
function getGridColor() {
  // Check if data-bs-theme is set to 'dark'
  const body = document.body;
  const theme = body.getAttribute("data-bs-theme");

  // Return white if theme is 'dark', otherwise return black
  return theme === "dark" ? "white" : "black";
}

// Function to update chart grid color dynamically
function updateGridColor() {
  if (!chart) return;
  const gridColor = getGridColor();
  chart.options.scales.y.grid.color = gridColor;
  chart.options.scales.y.ticks.color = gridColor;
  chart.options.scales.x.grid.color = gridColor;
  chart.options.scales.x.ticks.color = gridColor;
  chart.options.plugins.title.color = gridColor;
  chart.update(); // Update the chart to reflect the changes
}

// Listen for changes in data-bs-theme attribute
document.body.addEventListener("theme-change", updateGridColor);
