const companyList = document.getElementById("companyList");
const searchInput = document.getElementById("searchInput");
let chart;
let allCompanies =[]; // global list of all company names
let fullData =[]; //global reference to csv data

// fetching the csv file and parsing it into usable json objects
async function fetchCsvData(params) {
    const res = await fetch("dump.csv");
    const text  =await res.text(); //converting to text
    return parseCSV(text);
}

// converts the csv text into an array of objects 
function parseCSV(csv){
  const [header, ...rows]  =csv.trim().split("\n");
  const keys = header.split(",").map(key => key.trim().replace(/^"|"$/g, ""));
  // maps each row to an object using the header keys
  return rows.map(row => {
    const values = row.split(",").map(value => value.trim().replace(/^"|"$/g, ""));
    const obj = {};
    keys.forEach((k,i) =>obj[k] = values[i]);
    return obj;
  });
}
// update the chart with the selected company data
function updateChart(companyData, company){
  const d = companyData[0];  // use the first entry for the selected company

  // labels and corresponding keys for different stock/index attributes
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

  // destroy the previous chart instance if it exists
  if (chart && typeof chart.destroy === "function") {
    chart.destroy();
  }

  // create a new chart instance
  const ctx = document.getElementById("chart").getContext("2d");
  // create gradient just for enhancement 
  const gradient = ctx.createLinearGradient(0, 0,600,0);
  gradient.addColorStop(0, 'rgba(54, 162, 235, 0.7)');
  gradient.addColorStop(1, 'rgba(153, 102, 255, 0.7)');
  // creating horizontal bar 
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${company} - Attributes on ${d.index_date}`,
        data: values,
        backgroundColor: gradient,
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius:6
      }]
    },
    options: {
      indexAxis:'y', //for horizontal bar chart
      responsive: true,
      animation:{
        duration:1200,
        easing:'easeInOutBack' // animation effect
      },
      // plugins: {
      //   title: {
      //     display: true,
      //     text: `Index Details for ${company} (${d.index_date})`,
      //     font:{
      //       family:'Segoe UI, Roboto, Arial',
      //       size:18,
      //       weight:'bold',
      //     }
      //   }
      // },
      tooltip:{
        enalbled:true, //enable tooltip
        callbacks:{
          label: function(context){
            const label = context.label || '';
            const value = context.parsed.y ;
            return `${label}: ${value}`;
          }
        }
      },
      interaction:{
        mode:'nearest', // show tooltip for the nearest x-axis item
        intersect: false
      },
      scales: {
        x: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Value"
          }
        },
        y: {
          title: {
            display: true,
            text: "Attribute"
          }
        }
      }
    }
  });
}

// create a list item for each company and add a click event 
function displayCompanyList(companies) {
  companyList.innerHTML ="";
  companies.forEach(company =>{
    const li  = document.createElement("li");
    li.textContent = company;
    li.style.cursor = "pointer";
    li.onclick =() =>{
      const companyData = fullData.filter( d=>d.index_name === company);
      updateChart(companyData, company);
    };
    companyList.appendChild(li);
  });
}

// when the page loads, fetch the data and populates the company list 
window.onload = async() =>{
  fullData = await fetchCsvData();
  // collect unique company names from the data
  const companiesSet = new Set();
  fullData.forEach(d =>{
    if(d.index_name) companiesSet.add(d.index_name);
  });
  allCompanies = Array.from(companiesSet).sort(); //convert to sorted array
  displayCompanyList(allCompanies);
// search filter 
  searchInput.addEventListener("input", () =>{
    const query = searchInput.value.toLowerCase().trim();
    const filteredCompanies = allCompanies.filter(name => name.toLowerCase().includes(query));
    displayCompanyList(filteredCompanies);
  });
}