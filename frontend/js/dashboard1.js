// =====================================
// GLOBAL CHART STORAGE
// =====================================

const chartInstances = {};

let dashboardCache = null;

let trendChartInstance = null;

// =====================================
// LOAD APPOINTMENTS DASHBOARD
// =====================================

async function loadAppointmentsDashboard(
  dateRange = null,

  doctor = null,
) {
  try {
    // =====================================
    // FILTER VALUES
    // =====================================

    const selectedDateRange =
      dateRange || document.getElementById("dateFilter")?.value || "30";

    const selectedDoctor =
      doctor || document.getElementById("doctorFilter")?.value || "all";

    // =====================================
    // FETCH API
    // =====================================

    const response = await fetch(
      `http://localhost:5000/api/dashboard/appointments?dateRange=${selectedDateRange}&doctor=${selectedDoctor}`,
    );

    const responseData = await response.json();

    console.log("FULL RESPONSE:", responseData);

    // =====================================
    // REAL DATA
    // =====================================

    const dashboardData = responseData.data || responseData;

    console.log("DASHBOARD DATA:", dashboardData);

    if (!dashboardData) {
      console.log("Dashboard data missing");

      return;
    }

    // =====================================
    // CACHE
    // =====================================

    dashboardCache = dashboardData;

    // =====================================
    // SHORTCUTS
    // =====================================

    const analytics = dashboardData.analytics || {};

    // =====================================
    // TITLE
    // =====================================

    const titleElement = document.getElementById("dashboardTitle");

    if (titleElement) {
      titleElement.innerText = dashboardData.title || "Appointments Dashboard";
    }

    // =====================================
    // TIMELINE
    // =====================================

    const timelineElement = document.getElementById("timelineRange");

    if (timelineElement && dashboardData.timeline) {
      timelineElement.innerText = `${dashboardData.timeline.start}
         →
         ${dashboardData.timeline.end}`;
    }

    // =====================================
    // AI INSIGHT
    // =====================================

    const insightBox = document.getElementById("aiInsight");

    if (insightBox) {
      insightBox.innerText = `
Peak traffic hours and revenue analytics generated successfully.
Live parquet analytics engine connected successfully.
`;
    }

    // =====================================
    // POPULATE DOCTORS
    // =====================================

    if (dashboardData.doctors) {
      populateDoctorFilter(dashboardData.doctors);
    }

    // =====================================
    // KPI RENDER
    // =====================================

    if (analytics.kpis) {
      renderKPIs(analytics.kpis);
    }

    // =====================================
    // DESTROY OLD CHARTS
    // =====================================

    destroyAllCharts();

    // =====================================
    // MAIN TREND ENGINE
    // =====================================

    switchTrend("appointments");

    // =====================================
    // OTHER CHARTS
    // =====================================

    if (analytics.status) {
      renderStatusChart(analytics.status);
    }

    if (analytics.topDoctors) {
      renderDoctorChart(analytics.topDoctors);
      renderTopDoctorsTable(analytics.topDoctors);
    }

    if (analytics.cityAnalytics) {
      renderCityChart(analytics.cityAnalytics);
    }

    if (analytics.weekdayAnalytics) {
      renderWeekdayChart(analytics.weekdayAnalytics);
    }

    // =====================================
    // TABLE
    // =====================================

    if (analytics.table) {
      renderTable(analytics.table);
    }
  } catch (error) {
    console.log("\nFRONTEND DASHBOARD ERROR:\n");

    console.log(error);
  }
}

// =====================================
// KPI RENDER
// =====================================

function renderKPIs(kpis) {
  const container = document.getElementById("kpiContainer");

  if (!container) return;

  container.innerHTML = `

<div class="kpi-card">

  <h3>
    Total Appointments
  </h3>

  <p>
    ${kpis.totalAppointments || 0}
  </p>

</div>

<div class="kpi-card">

  <h3>
    Completed
  </h3>

  <p>
    ${kpis.completed || 0}
  </p>

</div>

<div class="kpi-card">

  <h3>
    Cancelled
  </h3>

  <p>
    ${kpis.cancelled || 0}
  </p>

</div>

<div class="kpi-card">

  <h3>
    Revenue
  </h3>

  <p>
    ₹${Number(kpis.revenue || 0).toLocaleString()}
  </p>

</div>

`;
}

// =====================================
// DESTROY CHARTS
// =====================================

function destroyAllCharts() {
  Object.values(chartInstances).forEach((chart) => {
    if (chart) {
      chart.destroy();
    }
  });
}

// =====================================
// COMMON CHART OPTIONS
// =====================================

function commonChartOptions() {
  return {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "white",
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },

      y: {
        ticks: {
          color: "white",
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };
}

// =====================================
// DYNAMIC TREND SWITCHER
// =====================================

function switchTrend(type) {

  if (!dashboardCache) return;

  document.querySelectorAll(".trend-tab").forEach((tab) => {
    tab.classList.remove("active-tab");
  });

  const activeButton =
    document.querySelector(`[data-trend="${type}"]`);

  if (activeButton) {
    activeButton.classList.add("active-tab");
  }

  let labels = [];

  let values = [];

  let label = "";

  let chartType = "line";

  // =====================================
  // APPOINTMENTS
  // =====================================

  if (type === "appointments") {

    labels =
      dashboardCache.analytics.trend.map(
        (r) => r.month
      );

    values =
      dashboardCache.analytics.trend.map(
        (r) => r.appointments
      );

    label = "Appointments";

    chartType = "line";

  }

  // =====================================
  // REVENUE
  // =====================================

  if (type === "revenue") {

    labels =
      dashboardCache.analytics.revenueTrend.map(
        (r) => r.month
      );

    values =
      dashboardCache.analytics.revenueTrend.map(
        (r) => r.revenue
      );

    label = "Revenue";

    chartType = "line";

  }

  // =====================================
  // DOCTORS
  // =====================================

  if (type === "doctors") {

    labels =
      dashboardCache.analytics.topDoctors.map(
        (r) => r.doctor
      );

    values =
      dashboardCache.analytics.topDoctors.map(
        (r) => Number(r.revenue)
      );

    label = "Doctor Revenue";

    chartType = "column";

  }

  // =====================================
  // PEAK HOURS
  // =====================================

  if (type === "hours") {

    labels =
      dashboardCache.analytics.hourlyTraffic.map(
        (r) => r.hour
      );

    values =
      dashboardCache.analytics.hourlyTraffic.map(
        (r) => r.appointments
      );

    label = "Peak Hours";

    chartType = "column";

  }

  // =====================================
  // DESTROY OLD
  // =====================================

  if (
    trendChartInstance &&
    typeof trendChartInstance.destroy === "function"
  ) {

    trendChartInstance.destroy();

  }

  // =====================================
  // HIGHCHARTS RENDER
  // =====================================

  trendChartInstance =
    Highcharts.chart("chart1", {

      chart: {

        type: chartType,

        backgroundColor: "transparent",

        height: 420,

        spacingLeft: 20,

        spacingRight: 20

      },

      title: {
        text: null
      },

      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {

        enabled: true,

        itemStyle: {
          color: "#ffffff"
        }

      },

      xAxis: {

        categories: labels,

        lineColor: "rgba(255,255,255,0.1)",

        tickColor: "rgba(255,255,255,0.1)",

        labels: {

          style: {
            color: "#cbd5e1",
            fontSize: "11px"
          },

          rotation:
            labels.length > 8
              ? -35
              : 0

        }

      },

      yAxis: {

        title: {
          text: null
        },

        gridLineColor:
          "rgba(255,255,255,0.08)",

        labels: {

          style: {
            color: "#cbd5e1",
            fontSize: "11px"
          }

        }

      },

      tooltip: {

        backgroundColor: "#111827",

        borderColor: "#6366f1",

        style: {
          color: "#ffffff"
        }

      },

      plotOptions: {

        line: {

          marker: {
            enabled: true
          },

          lineWidth: 3

        },

        column: {

          borderRadius: 6

        },

        series: {

          animation: {
            duration: 800
          }

        }

      },

      series: [

        {

          name: label,

          data: values,

          color: "#6366f1"

        }

      ]

    });

}



function renderStatusChart(data) {

  Highcharts.chart("chart2", {

    chart: {
      type: "pie",
      backgroundColor: "transparent"
    },

    title: {
      text: null
    },

    credits: {
      enabled: false
    },

    tooltip: {

      backgroundColor: "#111827",

      style: {
        color: "#ffffff"
      }

    },

    plotOptions: {

      pie: {

        allowPointSelect: true,

        cursor: "pointer",

        dataLabels: {

          enabled: true,

          style: {
            color: "#ffffff"
          }

        }

      }

    },

    series: [

      {

        name: "Appointments",

        data: data.map((r) => ({
          name: r.status,
          y: r.total
        }))

      }

    ]

  });

}

// =====================================
// STATUS CHART
// =====================================



// =====================================
// DOCTOR CHART
// =====================================

// =====================================
// DOCTOR CHART
// =====================================

function renderDoctorChart(data) {

  Highcharts.chart("chart3", {

    chart: {
      type: "column",
      backgroundColor: "transparent"
    },

    title: {
      text: null
    },

    credits: {
      enabled: false
    },

    xAxis: {

      categories:
        data.map((r) => r.doctor),

      labels: {

        style: {
          color: "#cbd5e1"
        }

      }

    },

    yAxis: {

      title: {
        text: null
      },

      labels: {

        style: {
          color: "#cbd5e1"
        }

      }

    },

    tooltip: {

      backgroundColor: "#111827",

      style: {
        color: "#ffffff"
      }

    },

    series: [

      {

        name: "Revenue",

        data:
          data.map((r) =>
            Number(r.revenue)
          ),

        color: "#6366f1"

      }

    ]

  });

}
// =====================================
// CITY CHART
// =====================================

// =====================================
// CITY CHART
// =====================================

function renderCityChart(data) {

  Highcharts.chart("chart4", {

    chart: {

      type: "bar",

      backgroundColor: "transparent"

    },

    title: {
      text: null
    },

    credits: {
      enabled: false
    },

    xAxis: {

      categories:
        data.map((r) => r.city),

      labels: {

        style: {
          color: "#cbd5e1"
        }

      }

    },

    yAxis: {

      title: {
        text: null
      },

      labels: {

        style: {
          color: "#cbd5e1"
        }

      }

    },

    tooltip: {

      backgroundColor: "#111827",

      style: {
        color: "#ffffff"
      }

    },

    series: [

      {

        name: "Appointments",

        data:
          data.map(
            (r) => r.appointments
          ),

        color: "#10b981"

      }

    ]

  });

}

// =====================================
// WEEKDAY CHART
// =====================================

function renderWeekdayChart(data) {
  console.log("Weekday Analytics:", data);
}

// =====================================
// TOP DOCTORS ENTERPRISE TABLE
// =====================================

function renderTopDoctorsTable(data) {
  const container = document.getElementById("topDoctorsTable");

  if (!container) return;

  container.innerHTML = `

  <div class="doctor-table-wrapper">

    <table class="doctor-performance-table">

      <thead>

        <tr>

          <th>Doctor</th>

          <th>Revenue</th>

          <th>Appointments</th>

          <th>Completed</th>

          <th>Cancelled</th>

          <th>Completion %</th>

        </tr>

      </thead>

      <tbody>

        ${data
          .map(
            (doctor) => `

          <tr>

            <td>

              ${doctor.doctor}

            </td>

            <td>

              ₹${Number(doctor.revenue || 0).toLocaleString()}

            </td>

            <td>

              ${doctor.appointments || 0}

            </td>

            <td>

              ${doctor.completed || 0}

            </td>

            <td>

              ${doctor.cancelled || 0}

            </td>

            <td>

              ${doctor.completionRate || 0}%

            </td>

          </tr>

        `,
          )
          .join("")}

      </tbody>

    </table>

  </div>

  `;
}

// =====================================
// TABLE
// =====================================

function renderTable(data) {
  const table = document.getElementById("analyticsTable");

  if (!table) return;

  table.innerHTML = `

<tr>

  <th>Patient</th>

  <th>Doctor</th>

  <th>Status</th>

  <th>City</th>

  <th>Revenue</th>

</tr>

`;

  data.forEach((row) => {
    table.innerHTML += `

<tr>

  <td>
    ${row.patient}
  </td>

  <td>
    ${row.doctor}
  </td>

  <td>
    ${row.status}
  </td>

  <td>
    ${row.city}
  </td>

  <td>
    ₹${Number(row.revenue).toLocaleString()}
  </td>

</tr>

`;
  });
}

// =====================================
// DOCTOR FILTER
// =====================================

function populateDoctorFilter(doctors) {
  const doctorFilter = document.getElementById("doctorFilter");

  if (!doctorFilter) return;

  if (doctorFilter.options.length > 1) {
    return;
  }

  doctors.forEach((doc) => {
    const option = document.createElement("option");

    option.value = doc.doctor;

    option.textContent = doc.doctor;

    doctorFilter.appendChild(option);
  });
}

// =====================================
// PLACEHOLDER
// =====================================

function loadBillsDashboard() {
  alert("Bills dashboard coming soon 😄🔥");
}

function loadBillItemsDashboard() {
  alert("Bill items dashboard coming soon 😄🔥");
}

// =====================================
// FILTER EVENTS
// =====================================

const dateFilter = document.getElementById("dateFilter");

const doctorFilter = document.getElementById("doctorFilter");

function reloadDashboard() {
  loadAppointmentsDashboard(
    dateFilter?.value,

    doctorFilter?.value,
  );
}

if (dateFilter) {
  dateFilter.addEventListener(
    "change",

    reloadDashboard,
  );
}

if (doctorFilter) {
  doctorFilter.addEventListener(
    "change",

    reloadDashboard,
  );
}

// =====================================
// INITIAL LOAD
// =====================================

loadAppointmentsDashboard();
