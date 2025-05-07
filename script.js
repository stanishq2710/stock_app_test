// const attributeSelect = document.getElementById("attributeSelect");
const companyList = document.getElementById("companyList");
let chart;

async function fetchCsvData(params) {
    const res = await fetch("dump.csv");
    const text  =await res.text();
    return parseCSV(text);
}

function parseCSV(csv){
  const [header, ...rows]  =csv.trim().split("\n");
  const keys = header.split(",").map(key => key.trim().replace(/^"|"$/g, ""));
  return rows.map(row => {
    const values = row.split(",").map(value => value.trim().replace(/^"|"$/g, ""));
    const obj = {};
    keys.forEach((k,i) =>obj[k] = values[i]);
    return obj;
  });
}

function updateChart(companyData, company){
  const d = companyData[0];
  const labels = [ "Open Index", "High Index", "Low Index", "Closing Index",
  "Points Change", "Change %", "Volume", "Turnover (₹ Cr)",
  "PE Ratio", "PB Ratio", "Div Yield"
];
  const keys = [
    "open_index_value", "high_index_value", "low_index_value", "closing_index_value",
    "points_change", "change_percent", "volume", "turnover_rs_cr",
    "pe_ratio", "pb_ratio", "div_yield"
  ];
  const values = keys.map(k =>parseFloat(d[k]));

  if (chart && typeof chart.destroy === "function") {
    chart.destroy();
  }
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${company} - Attributes on ${d.index_date}`,
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Index Details for ${company} (${d.index_date})`
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Value"
          }
        },
        x: {
          title: {
            display: true,
            text: "Attribute"
          }
        }
      }
    }
  });
}

function renderCompanyList(data){
  const companiesSet = new Set();
  data.forEach(d => {
    if(d.index_name) companiesSet.add(d.index_name);
  });
  const companies = Array.from(companiesSet).sort();
  companies.forEach(company =>{
    const li = document.createElement("li");
    li.textContent =company;
    li.onclick = () =>{
      const companyData = data.filter(d =>d.index_name === company);
      updateChart(companyData, company);
    }
    companyList.appendChild(li);
  });
}

window.onload = async() => {
  const data = await fetchCsvData();
  console.log("Parsed Data", data)
  renderCompanyList(data);
};