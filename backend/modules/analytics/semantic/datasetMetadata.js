const datasetMetadata = {

  appointments: {

    purpose:
      "patient appointments, doctor schedules, visit analytics, waiting analytics, consultation workflow, OPD analytics, clinic workflow, appointment lifecycle tracking",

    domain:
      "operations",

    primaryMetrics: [

      "appointment count",
      "visited patients",
      "doctor workload",
      "waiting time",
      "consultation duration",
      "appointment trends",
      "feedback score"

    ],

    businessMeaning: {

      visited:
        "Status = Check Out",

      cancelled:
        "Status = Cancelled",

      waiting:
        "Status = Waiting",

      scheduled:
        "Status = Scheduled"

    },

    semanticKeywords: [

      "appointment",
      "appointments",
      "booking",
      "visit",
      "consultation",
      "doctor",
      "physician",
      "patient",
      "queue",
      "waiting",
      "check out",
      "feedback",
      "workflow",
      "clinic operations"

    ],

    recommendedQueries: [

      "busiest doctors",
      "appointments by weekday",
      "waiting time analysis",
      "doctor performance",
      "appointment trends",
      "visit conversion"

    ]

  },

  bills: {

    purpose:
      "financial analytics, billing analytics, invoice management, payment tracking, revenue analytics, clinic collections, profit and financial reporting",

    domain:
      "finance",

    primaryMetrics: [

      "total revenue",
      "paid amount",
      "due amount",
      "collection trends",
      "invoice count",
      "tax analytics",
      "doctor revenue"

    ],

    businessMeaning: {

      paid:
        "Total Paid Amt",

      unpaid:
        "Total Due Amt",

      revenue:
        "Total Billed Amt"

    },

    semanticKeywords: [

      "revenue",
      "billing",
      "invoice",
      "payment",
      "financial",
      "money",
      "earnings",
      "sales",
      "income",
      "tax",
      "collections",
      "profit",
      "loss"

    ],

    recommendedQueries: [

      "top revenue doctors",
      "monthly revenue trends",
      "highest billing patients",
      "payment collection analysis",
      "unpaid invoices",
      "revenue growth"

    ]

  },

  billItems: {

    purpose:
      "pharmacy analytics, medicine sales analytics, inventory analytics, item performance tracking, stock analytics, service/item revenue analytics",

    domain:
      "inventory",

    primaryMetrics: [

      "top selling items",
      "quantity sold",
      "inventory movement",
      "medicine revenue",
      "item profitability",
      "stock analytics"

    ],

    businessMeaning: {

      quantitySold:
        "Qty",

      revenue:
        "Total (After Tax) Amt"

    },

    semanticKeywords: [

      "medicine",
      "medicines",
      "drug",
      "tablet",
      "capsule",
      "item",
      "inventory",
      "stock",
      "product",
      "pharmacy",
      "top selling",
      "quantity sold",
      "services"

    ],

    recommendedQueries: [

      "top selling medicines",
      "item revenue analysis",
      "inventory trends",
      "best selling products",
      "pharmacy revenue",
      "stock movement"

    ]

  }

};

export default datasetMetadata;