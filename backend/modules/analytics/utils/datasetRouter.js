function datasetRouter(query) {

  // =========================
  // VALIDATION
  // =========================

  if (

    !query ||

    typeof query !== "string"

  ) {

    return "AI_FALLBACK";

  }

  // =========================
  // CLEAN QUERY
  // =========================

  const q =

    query
      .toLowerCase()
      .trim();

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

    "appointment",
    "appointments",
    "appt",
    "booking",
    "bookings",
    "visit",
    "visits",

    "doctor",
    "doctors",
    "physician",
    "clinician",

    "patient",
    "patients",

    "check out",
    "checkout",
    "cancelled",
    "scheduled",
    "waiting",
    "confirmed",
    "no show",

    "consultation",
    "consultation duration",
    "waiting duration",
    "appointment duration",

    "busiest doctor",
    "busiest day",
    "appointment trend",
    "appointment status",

    "feedback",
    "queue",
    "walkin",

    "city",
    "appointment city"

  ];

  // =========================
  // BILLS KEYWORDS
  // =========================

  const billKeywords = [

    "bill",
    "billing",
    "invoice",
    "payment",
    "receipt",

    "revenue",
    "earnings",
    "income",
    "sales",
    "money",

    "tax",
    "paid",
    "unpaid",
    "due",
    "profit",
    "loss",

    "financial",
    "financials",

    "bill amount",
    "paid amount",
    "total billed",

    "revenue trend",
    "revenue growth"

  ];

  // =========================
  // BILL ITEMS KEYWORDS
  // =========================

  const itemKeywords = [

    "item",
    "items",
    "product",
    "products",

    "medicine",
    "medicines",
    "drug",
    "tablet",
    "capsule",

    "qty",
    "quantity",
    "sold",

    "top selling",
    "best selling",
    "most sold",

    "inventory",
    "stock",

    "service",
    "services",

    "pharmacy"

  ];

  // =========================
  // SCORE FUNCTION
  // =========================

  function calculateScore(
    keywords,
    datasetName
  ) {

    let score = 0;

    for (const word of keywords) {

      if (q.includes(word)) {

        // =====================
        // LONG PHRASES
        // =====================

        if (word.includes(" ")) {

          score += 3;

        }

        // =====================
        // NORMAL WORDS
        // =====================

        else {

          score += 1;

        }

      }

    }

    console.log(
      `${datasetName} SCORE:`,
      score
    );

    return score;

  }

  // =========================
  // BASE SCORES
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
  // STRONG BILL BOOSTS
  // =========================

  const strongBillPatterns = [

    "revenue",
    "billing",
    "invoice",
    "financial",
    "payment",
    "profit",
    "income"

  ];

  for (const pattern of strongBillPatterns) {

    if (q.includes(pattern)) {

      billsScore += 5;

    }

  }

  // =========================
  // STRONG ITEM BOOSTS
  // =========================

  const strongItemPatterns = [

    "top selling",
    "medicine",
    "inventory",
    "qty",
    "stock",
    "pharmacy"

  ];

  for (const pattern of strongItemPatterns) {

    if (q.includes(pattern)) {

      billItemsScore += 5;

    }

  }

  // =========================
  // APPOINTMENT BOOSTS
  // =========================

  const strongAppointmentPatterns = [

    "doctor",
    "appointment",
    "patient",
    "consultation",
    "waiting",
    "status"

  ];

  for (const pattern of strongAppointmentPatterns) {

    if (q.includes(pattern)) {

      appointmentScore += 2;

    }

  }

  // =========================
  // SCORE OBJECTS
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
  // SORT DESC
  // =========================

  scores.sort(
    (a, b) => b.score - a.score
  );

  console.log(
    "\nDATASET SCORES:"
  );

  console.log(scores);

  // =========================
  // LOW CONFIDENCE
  // =========================

  if (

    scores[0].score <= 2

  ) {

    console.log(
      "\nLOW CONFIDENCE → USE AI"
    );

    return "AI_FALLBACK";

  }

  // =========================
  // TIE DETECTION
  // =========================

  if (

    scores[0].score ===
    scores[1].score

  ) {

    console.log(
      "\nTIE DETECTED → USE AI"
    );

    return "AI_FALLBACK";

  }

  // =========================
  // FINAL DATASET
  // =========================

  console.log(
    `\nSELECTED DATASET: ${scores[0].dataset}`
  );

  return scores[0].dataset;

}

export default datasetRouter;