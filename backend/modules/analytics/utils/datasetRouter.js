function datasetRouter(query) {

  // =========================
  // CLEAN QUERY
  // =========================

  const q = query.toLowerCase().trim();

  // =========================
  // SCORE SYSTEM
  // =========================

  let appointmentScore = 0;

  let billsScore = 0;

  let billItemsScore = 0;

  // =========================
  // APPOINTMENTS KEYWORDS
  // =========================

  const appointmentKeywords = [

    // Core
    "appointment",
    "appointments",
    "appt",
    "booking",
    "bookings",
    "visit",
    "visits",
    "doctor visit",
    "patient visit",

    // Status
    "check out",
    "checkout",
    "checked out",
    "cancelled",
    "scheduled",
    "waiting",
    "confirmed",
    "no show",

    // Time
    "consultation",
    "consultation duration",
    "waiting duration",
    "appointment duration",

    // Doctors
    "doctor",
    "physician",
    "clinician",

    // Analytics
    "busiest doctor",
    "busiest day",
    "weekday",
    "appointments by",
    "appointment trend",

    // Feedback
    "feedback",
    "feedback score",

    // Source
    "appointment source",

    // Patient flow
    "queue",
    "walkin",
    "walk-in"
  ];

  // =========================
  // BILLS KEYWORDS
  // =========================

  const billKeywords = [

    // Core
    "bill",
    "billing",
    "invoice",
    "payment",
    "receipt",

    // Revenue
    "revenue",
    "earnings",
    "income",
    "sales",
    "money",

    // Finance
    "tax",
    "paid",
    "unpaid",
    "due",
    "profit",
    "loss",
    "amount",

    // Bill status
    "bill status",
    "payment status",

    // Financial analytics
    "financial",
    "financials",

    // Patient billing
    "bill amount",
    "paid amount",
    "total billed",

    // Trends
    "revenue trend",
    "billing trend",

    // Comparisons
    "highest revenue",
    "lowest revenue"
  ];

  // =========================
  // BILL ITEMS KEYWORDS
  // =========================

  const itemKeywords = [

    // Core
    "item",
    "items",
    "product",
    "products",
    "inventory",

    // Medicine
    "medicine",
    "medicines",
    "drug",
    "drugs",
    "tablet",
    "tablets",
    "capsule",
    "capsules",

    // Quantity
    "qty",
    "quantity",
    "sold",
    "most sold",
    "top selling",
    "best selling",

    // Pricing
    "sell price",
    "buy price",

    // Services
    "service",
    "services",
    "service category",

    // Pharmacy
    "pharmacy",

    // Analytics
    "top items",
    "item revenue",
    "revenue by item",

    // Inventory
    "stock"
  ];

  // =========================
  // SCORING FUNCTION
  // =========================

  function calculateScore(keywords, datasetName) {

    let score = 0;

    for (const word of keywords) {

      if (q.includes(word)) {

        // LONGER PHRASES
        // GET HIGHER SCORE

        if (word.includes(" ")) {

          score += 3;

        } else {

          score += 1;

        }

      }

    }

    console.log(`${datasetName} SCORE:`, score);

    return score;
  }

  // =========================
  // CALCULATE SCORES
  // =========================

  appointmentScore =
    calculateScore(
      appointmentKeywords,
      "Appointments"
    );

  billsScore =
    calculateScore(
      billKeywords,
      "Bills"
    );

  billItemsScore =
    calculateScore(
      itemKeywords,
      "BillItems"
    );

  // =========================
  // PRIORITY RULES
  // =========================

  // VERY STRONG ITEM INTENT

  const strongItemPatterns = [

    "top selling",
    "most sold",
    "best selling",
    "medicine",
    "medicines",
    "drug",
    "tablet",
    "capsule",
    "inventory",
    "qty"
  ];

  for (const pattern of strongItemPatterns) {

    if (q.includes(pattern)) {

      console.log(
        "STRONG MATCH: BillItems"
      );

      return "BillItems";
    }

  }

  // =========================
  // VERY STRONG BILL INTENT
  // =========================

  const strongBillPatterns = [

    "revenue",
    "invoice",
    "billing",
    "payment",
    "tax",
    "profit",
    "financial"
  ];

  for (const pattern of strongBillPatterns) {

    if (q.includes(pattern)) {

      console.log(
        "STRONG MATCH: Bills"
      );

      return "Bills";
    }

  }

  // =========================
  // SCORE COMPARISON
  // =========================

  const scores = [

    {
      dataset: "Appointments",
      score: appointmentScore
    },

    {
      dataset: "Bills",
      score: billsScore
    },

    {
      dataset: "BillItems",
      score: billItemsScore
    }

  ];

  // =========================
  // SORT DESCENDING
  // =========================

  scores.sort(
    (a, b) => b.score - a.score
  );

  console.log("\nDATASET SCORES:");

  console.log(scores);

  // =========================
  // IF ALL ZERO
  // =========================

  if (scores[0].score === 0) {

    console.log(
      "\nNO MATCH FOUND → DEFAULT Appointments"
    );

    return "Appointments";
  }

  // =========================
  // FINAL WINNER
  // =========================

  console.log(
    `\nSELECTED DATASET: ${scores[0].dataset}`
  );

  return scores[0].dataset;
}

export default datasetRouter;