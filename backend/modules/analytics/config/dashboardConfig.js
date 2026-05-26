const dashboardConfig = {

  // =====================================
  // APPOINTMENTS DASHBOARD
  // =====================================

  appointments: {

    title:
      "Appointments Dashboard",

    dataset:
      "appointments",

    timelineColumn:
      "ApptStartDtm",

    filters: [

      "dateRange",

      "doctor",

      "city",

      "status",

      "serviceCategory"

    ],

    kpis: [

      {

        key:
          "totalAppointments",

        label:
          "Total Appointments",

        type:
          "count"

      },

      {

        key:
          "completedAppointments",

        label:
          "Completed",

        type:
          "count"

      },

      {

        key:
          "cancelledAppointments",

        label:
          "Cancelled",

        type:
          "count"

      },

      {

        key:
          "revenue",

        label:
          "Revenue",

        type:
          "sum"

      },

      {

        key:
          "averageWaiting",

        label:
          "Average Waiting",

        type:
          "average"

      }

    ],

    charts: [

      {

        id:
          "appointmentTrend",

        type:
          "line",

        title:
          "Appointment Trend",

        x:
          "month",

        y:
          "appointments"

      },

      {

        id:
          "statusDistribution",

        type:
          "pie",

        title:
          "Appointment Status",

        x:
          "status",

        y:
          "total"

      },

      {

        id:
          "doctorRevenue",

        type:
          "bar",

        title:
          "Top Revenue Doctors",

        x:
          "doctor",

        y:
          "revenue"

      },

      {

        id:
          "cityAnalytics",

        type:
          "doughnut",

        title:
          "City Analytics",

        x:
          "city",

        y:
          "appointments"

      },

      {

        id:
          "hourlyTraffic",

        type:
          "heatmap",

        title:
          "Hourly Patient Traffic"

      },

      {

        id:
          "weekdayAnalytics",

        type:
          "bar",

        title:
          "Weekday Appointments"

      }

    ],

    insights: [

      "Peak appointment hours",

      "Most cancelled doctor",

      "Highest revenue service",

      "Busiest weekday",

      "Most active city",

      "Average consultation duration"

    ]

  },

  // =====================================
  // BILLS DASHBOARD
  // =====================================

  bills: {

    title:
      "Bills Dashboard",

    dataset:
      "bills",

    timelineColumn:
      "Bill Date",

    filters: [

      "dateRange",

      "doctor",

      "billType",

      "status"

    ],

    kpis: [

      {

        key:
          "totalBills",

        label:
          "Total Bills",

        type:
          "count"

      },

      {

        key:
          "totalRevenue",

        label:
          "Revenue",

        type:
          "sum"

      },

      {

        key:
          "pendingAmount",

        label:
          "Pending Amount",

        type:
          "sum"

      },

      {

        key:
          "paidAmount",

        label:
          "Paid Amount",

        type:
          "sum"

      }

    ],

    charts: [

      {

        id:
          "billingTrend",

        type:
          "line",

        title:
          "Billing Trend"

      },

      {

        id:
          "doctorBilling",

        type:
          "bar",

        title:
          "Doctor Billing"

      },

      {

        id:
          "paymentStatus",

        type:
          "pie",

        title:
          "Payment Status"

      },

      {

        id:
          "dailyCollections",

        type:
          "area",

        title:
          "Daily Collections"

      }

    ],

    insights: [

      "Highest billing doctor",

      "Pending collections",

      "Revenue growth",

      "Most billed services"

    ]

  },

  // =====================================
  // BILL ITEMS DASHBOARD
  // =====================================

  billItems: {

    title:
      "Bill Items Dashboard",

    dataset:
      "billItems",

    timelineColumn:
      "Bill Date",

    filters: [

      "dateRange",

      "doctor",

      "itemCategory"

    ],

    kpis: [

      {

        key:
          "totalItems",

        label:
          "Items Sold",

        type:
          "count"

      },

      {

        key:
          "medicineRevenue",

        label:
          "Medicine Revenue",

        type:
          "sum"

      },

      {

        key:
          "topSellingMedicine",

        label:
          "Top Selling",

        type:
          "top"

      }

    ],

    charts: [

      {

        id:
          "topMedicines",

        type:
          "bar",

        title:
          "Top Medicines"

      },

      {

        id:
          "categoryAnalytics",

        type:
          "pie",

        title:
          "Category Analytics"

      },

      {

        id:
          "inventoryMovement",

        type:
          "line",

        title:
          "Inventory Movement"

      }

    ],

    insights: [

      "Top selling medicine",

      "Highest revenue category",

      "Medicine demand trend"

    ]

  }

};

export default dashboardConfig;