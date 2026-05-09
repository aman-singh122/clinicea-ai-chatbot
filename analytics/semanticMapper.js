const semanticDictionary = {

  // =========================
  // DOCTOR / PROVIDER
  // =========================

  doctor: [

    "doctor",
    "doctors",
    "provider",
    "resource",
    "consultant",
    "physician",
    "apptwithfullname",
    "doctor name",
    "provider name",
    "billdocname"
  ],

  // =========================
  // REVENUE / MONEY
  // =========================

  revenue: [

    "revenue",
    "revenues",
    "income",
    "earning",
    "earnings",
    "sales",
    "money",
    "amount",
    "net amount",
    "gross amount",
    "price",
    "service price",
    "before tax",
    "after tax",
    "tax",
    "payment",
    "bill amount",
    "billing",
    "invoice",
    "collection",
    "collections",
    "financial",
    "billed amt",
    "paid amt",
    "subtotal"
  ],

  // =========================
  // APPOINTMENTS
  // =========================

  appointment: [

    "appointment",
    "appointments",
    "appt",
    "booking",
    "bookings",
    "consultation",
    "consultations",
    "visit",
    "visits",
    "checkup",
    "schedule"
  ],

  // =========================
  // PATIENT
  // =========================

  patient: [

    "patient",
    "patients",
    "patient name",
    "customer",
    "client",
    "bill for",
    "billtoname",
    "bill to name",
    "patfileno",
    "mobile",
    "email"
  ],

  // =========================
  // CITY / LOCATION
  // =========================

  city: [

    "city",
    "cities",
    "patient city",
    "location",
    "region",
    "state",
    "address"
  ],

  // =========================
  // SERVICES
  // =========================

  service: [

    "service",
    "services",
    "service name",
    "service category",
    "treatment",
    "procedure",
    "package",
    "medical service",
    "item"
  ],

  // =========================
  // STATUS
  // =========================

  status: [

    "status",
    "cancel",
    "cancelled",
    "completed",
    "active",
    "pending",
    "confirmed",
    "closed",
    "billstatus"
  ],

  // =========================
  // WAITING
  // =========================

  waiting: [

    "waiting",
    "waiting duration",
    "wait time",
    "delay",
    "queue",
    "hold time"
  ],

  // =========================
  // CONSULTATION
  // =========================

  consultation: [

    "consultation",
    "consultation duration",
    "engaged time",
    "doctor time",
    "session"
  ],

  // =========================
  // DATE / TIME
  // =========================

  date: [

    "date",
    "day",
    "month",
    "year",
    "timeline",
    "trend",
    "time",
    "created on",
    "appointment date"
  ],

  // =========================
  // SOURCE
  // =========================

  source: [

    "source",
    "appointment source",
    "patient source",
    "channel",
    "origin",
    "reference"
  ],

  // =========================
  // FEEDBACK
  // =========================

  feedback: [

    "feedback",
    "rating",
    "review",
    "score",
    "feedback score",
    "comments"
  ]
};


// =========================
// DIRECT PROFESSIONAL MAPPINGS
// =========================

const directMappings = {

  patient: [

    "Bill For",
    "BillToName",
    "Patient Name"
  ],

  billing: [

    "Total Billed Amt",
    "Patient Bill Amt",
    "Bill Sub Total Amt",
    "Total Paid Amt"
  ],

  revenue: [

    "Total Billed Amt",
    "Patient Bill Amt",
    "Bill Sub Total Amt",
    "Total Paid Amt"
  ],

  doctor: [

    "BillDocName",
    "ApptWithFullName"
  ],

  appointment: [

    "ApptWithFullName",
    "Appointment"
  ],

  city: [

    "Patient City"
  ],

  status: [

    "BillStatus",
    "Status"
  ],

  service: [

    "Service Name",
    "Service Category",
    "Item Name"
  ]
};


// =========================
// CLEAN TEXT
// =========================

function clean(text) {

  if (!text) {

    return "";
  }

  return String(text)

    .toLowerCase()

    .replace(/[^a-z0-9 ]/g, " ")

    .replace(/\s+/g, " ")

    .trim();
}


// =========================
// SCORE FUNCTION
// =========================

function calculateScore(

  column,

  possibleWords

) {

  let score = 0;

  for (

    const word of possibleWords

  ) {

    const cleanWord =
      clean(word);

    // EXACT MATCH

    if (

      column === cleanWord

    ) {

      score += 10;
    }

    // PARTIAL MATCH

    else if (

      column.includes(cleanWord)

    ) {

      score += 5;
    }

    // WORD MATCH

    const words =
      cleanWord.split(" ");

    for (

      const singleWord
      of words

    ) {

      if (

        column.includes(
          singleWord
        )

      ) {

        score += 2;
      }
    }
  }

  return score;
}


// =========================
// SEMANTIC MAPPER
// =========================

function semanticMapper(

  schema,

  term

) {

  const normalizedTerm =
    clean(term);


  // =========================
  // DIRECT MAPPINGS
  // =========================

  for (

    const key in directMappings

  ) {

    if (

      normalizedTerm.includes(key)

    ) {

      for (

        const possibleColumn
        of directMappings[key]

      ) {

        const found =
          schema.find(field =>

            clean(field.column)
              .includes(
                clean(possibleColumn)
              )
          );

        if (found) {

          return found.column;
        }
      }
    }
  }


  // =========================
  // FIND RELATED WORDS
  // =========================

  let possibleWords = [

    normalizedTerm
  ];

  for (

    const key in semanticDictionary

  ) {

    if (

      normalizedTerm.includes(key)

    ) {

      possibleWords = [

        ...possibleWords,

        ...semanticDictionary[key]
      ];
    }
  }


  // =========================
  // FIND BEST COLUMN
  // =========================

  let bestColumn =
    null;

  let bestScore =
    -1;


  for (

    const field of schema

  ) {

    const column =
      clean(
        field.normalized
      );

    let score =
      calculateScore(

        column,

        possibleWords
      );


    // =========================
    // TYPE BONUS
    // =========================

    if (

      (
        normalizedTerm.includes("revenue") ||

        normalizedTerm.includes("billing") ||

        normalizedTerm.includes("amount")
      ) &&

      field.type === "number"

    ) {

      score += 3;
    }


    if (

      normalizedTerm.includes(
        "patient"
      ) &&

      field.type === "string"

    ) {

      score += 2;
    }


    if (

      normalizedTerm.includes(
        "doctor"
      ) &&

      field.type === "string"

    ) {

      score += 2;
    }


    // =========================
    // BEST MATCH
    // =========================

    if (

      score > bestScore

    ) {

      bestScore = score;

      bestColumn = field.column;
    }
  }


  // =========================
  // FAIL SAFE
  // =========================

  if (

    bestScore <= 0

  ) {

    return null;
  }

  
  return bestColumn;
}
export default semanticMapper;