function datasetRouter(query) {

  const q =
    query.toLowerCase();

  // ======================
  // APPOINTMENTS
  // ======================

  const appointmentKeywords = [

    "appointment",
    "check out",
    "checkout",
    "doctor visit",
    "scheduled",
    "waiting",
    "consultation",
    "patient visit",
    "appt",
    "status"
  ];

  // ======================
  // BILLS
  // ======================

  const billKeywords = [

    "revenue",
    "bill",
    "tax",
    "paid",
    "unpaid",
    "due",
    "amount",
    "billing",
    "payment",
    "invoice"
  ];

  // ======================
  // BILL ITEMS
  // ======================

  const itemKeywords = [

    "item",
    "inventory",
    "qty",
    "quantity",
    "drug",
    "service category",
    "sell price",
    "buy price",
    "top items",
    "most sold",
    "medicine"
  ];

  // ======================
  // CHECK APPOINTMENTS
  // ======================

 // ======================
// PRIORITY:
// ITEM QUERIES FIRST
// ======================

for (const word of itemKeywords) {

  if (q.includes(word)) {

    return "BillItems";
  }
}

// ======================
// BILLS
// ======================

for (const word of billKeywords) {

  if (q.includes(word)) {

    return "Bills";
  }
}

// ======================
// APPOINTMENTS
// ======================

for (const word of appointmentKeywords) {

  if (q.includes(word)) {

    return "Appointments";
  }
}

  // ======================
  // CHECK BILLS
  // ======================

  for (const word of billKeywords) {

    if (q.includes(word)) {

      return "Bills";
    }
  }

  // ======================
  // CHECK ITEMS
  // ======================

  for (const word of itemKeywords) {

    if (q.includes(word)) {

      return "BillItems";
    }
  }

  // DEFAULT

  return "Appointments";
}

export default datasetRouter;
