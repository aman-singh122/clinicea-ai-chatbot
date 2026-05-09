import fs from "fs";

import path from "path";


// ======================================
// QUERY KEYWORDS
// ======================================

const queryCategories = {

  // =========================
  // APPOINTMENTS
  // =========================

  appointments: [

    "appointment",
    "appointments",
    "doctor",
    "doctors",
    "schedule",
    "scheduled",
    "consultation",
    "consultations",
    "visit",
    "visits",
    "checkup",
    "patient flow",
    "booking",
    "bookings",
    "waiting",
    "queue",
    "engaged",
    "status",
    "cancelled",
    "active"
  ],

  // =========================
  // BILLING / REVENUE
  // =========================

  billing: [

    "revenue",
    "revenues",
    "income",
    "earning",
    "earnings",
    "bill",
    "bills",
    "billing",
    "payment",
    "payments",
    "invoice",
    "invoices",
    "money",
    "financial",
    "finance",
    "collection",
    "collections",
    "tax",
    "profit",
    "amount",
    "price"
  ],

  // =========================
  // SERVICES / ITEMS
  // =========================

  services: [

    "service",
    "services",
    "item",
    "items",
    "treatment",
    "treatments",
    "procedure",
    "procedures",
    "package",
    "packages",
    "category",
    "medical service"
  ],

  // =========================
  // PATIENTS
  // =========================

  patients: [

    "patient",
    "patients",
    "city",
    "cities",
    "mobile",
    "email",
    "address",
    "location",
    "patient source"
  ]
};


// ======================================
// FILE PRIORITIES
// ======================================

const fileMatchers = {

  appointments: [

    "appointment"
  ],

  billing: [

    "bills report",
    "bill report"
  ],

  services: [

    "bill items",
    "items report"
  ]
};


// ======================================
// HELPER
// ======================================

function containsKeyword(

  query,

  keywords

) {

  return keywords.some(keyword =>

    query.includes(
      keyword
    )
  );
}


// ======================================
// MAIN FUNCTION
// ======================================

function findRelevantFiles(

  user,

  query

) {

  const userFolder =

    path.join(

      process.cwd(),

      "data",

      user
    );

  // =========================
  // CHECK USER FOLDER
  // =========================

  if (

    !fs.existsSync(userFolder)

  ) {

    console.log(
      "User folder not found"
    );

    return [];
  }

  // =========================
  // GET FILES
  // =========================

  const files =

    fs.readdirSync(userFolder);

  const normalizedQuery =

    query.toLowerCase();

  const matchedFiles =

    new Set();

  // ======================================
  // APPOINTMENTS
  // ======================================

  if (

    containsKeyword(

      normalizedQuery,

      queryCategories.appointments
    )

  ) {

    for (

      const file of files

    ) {

      const lowerFile =

        file.toLowerCase();

      if (

        fileMatchers.appointments.some(
          keyword =>

            lowerFile.includes(
              keyword
            )
        )

      ) {

        matchedFiles.add(file);
      }
    }
  }

  // ======================================
  // BILLING
  // ======================================

  if (

    containsKeyword(

      normalizedQuery,

      queryCategories.billing
    )

  ) {

    for (

      const file of files

    ) {

      const lowerFile =

        file.toLowerCase();

      if (

        fileMatchers.billing.some(
          keyword =>

            lowerFile.includes(
              keyword
            )
        )

      ) {

        matchedFiles.add(file);
      }
    }
  }

  // ======================================
  // SERVICES
  // ======================================

  if (

    containsKeyword(

      normalizedQuery,

      queryCategories.services
    )

  ) {

    for (

      const file of files

    ) {

      const lowerFile =

        file.toLowerCase();

      if (

        fileMatchers.services.some(
          keyword =>

            lowerFile.includes(
              keyword
            )
        )

      ) {

        matchedFiles.add(file);
      }
    }
  }

  // ======================================
  // PATIENTS
  // ======================================

  if (

    containsKeyword(

      normalizedQuery,

      queryCategories.patients
    )

  ) {

    for (

      const file of files

    ) {

      const lowerFile =

        file.toLowerCase();

      // PATIENT ANALYTICS
      // often use appointment data

      if (

        lowerFile.includes(
          "appointment"
        )

      ) {

        matchedFiles.add(file);
      }
    }
  }

  // ======================================
  // FALLBACK
  // ======================================

  if (

    matchedFiles.size === 0

  ) {

    console.log(
      "No direct match found. Using all files."
    );

    return files;
  }

  // ======================================
  // FINAL
  // ======================================

  return [

    ...matchedFiles
  ];
}

export default findRelevantFiles;