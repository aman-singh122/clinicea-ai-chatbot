function getTotalRows(data) {

  return data.length;
}


// =========================
// FIND COLUMN DYNAMICALLY
// =========================

function findColumn(
  data,
  keywords
) {

  if (!data.length)
    return null;

  const headers =
    Object.keys(data[0]);

  for (const header of headers) {

    const lower =
      header.toLowerCase();

    for (const keyword of keywords) {

      if (
        lower.includes(
          keyword.toLowerCase()
        )
      ) {

        return header;
      }
    }
  }

  return null;
}


// =========================
// FILTER ROWS
// =========================

function filterRows(
  data,
  column,
  value
) {

  return data.filter(row => {

    const cell =
      String(
        row[column] || ""
      ).toLowerCase();

    return cell.includes(
      value.toLowerCase()
    );
  });
}


// =========================
// COUNT VALUES
// =========================

function countByColumn(
  data,
  column
) {

  const counts = {};

  data.forEach(row => {

    const key =
      row[column] || "Unknown";

    counts[key] =
      (counts[key] || 0) + 1;
  });

  return counts;
}


// =========================
// SUM COLUMN
// =========================

function sumColumn(
  data,
  column
) {

  return data.reduce((sum, row) => {

    const value =
      parseFloat(
        row[column]
      ) || 0;

    return sum + value;

  }, 0);
}


// =========================
// SMART COLUMN DETECTION
// FUTURE READY
// =========================

function detectBestColumn(
  data,
  query
) {

  if (!data.length)
    return null;


  const headers =
    Object.keys(data[0]);


  query =
    query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ");


  const queryWords =
    query
      .split(" ")
      .filter(word =>
        word.length > 3
      );


  // =========================
  // EXACT HEADER MATCH
  // =========================

  for (const header of headers) {

    const cleanHeader =
      header
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ");

    if (
      query.includes(cleanHeader)
    ) {

      return header;
    }
  }


  // =========================
  // QUERY WORD MATCH
  // =========================

 

  // =========================
  // SMART FALLBACKS
  // =========================

  const smartMappings = {

  doctor: [

    "apptwithfullname",

    "resource",

    "created by"
  ],

  service: [

    "service name",

    "service category"
  ],

  revenue: [

    "service price",

    "after tax",

    "before tax"
  ],

  status: [

    "status",

    "cancel reason"
  ],

  patient: [

    "mobile",

    "email",

    "file no"
  ],

  date: [

    "created on date",

    "next appointment date",

    "apptstartdtm"
  ]
};

for (const keyword in smartMappings) {

  if (

    query.includes(keyword)

  ) {

    const possibleColumns =
      smartMappings[keyword];

    for (const header of headers) {

      const cleanHeader =
        header.toLowerCase();

      for (const possible of possibleColumns) {

        if (

          cleanHeader.includes(possible)

        ) {

          return header;
        }
      }
    }
  }
}

  


  // =========================
  // FINAL FALLBACK
  // =========================

  return headers[0];
}


// =========================
// GET DATE ROWS
// =========================

function getRowsByDate(
  data,
  dateColumn,
  date
) {

  return data.filter(row => {

    const rawDate =
      String(
        row[dateColumn] || ""
      );

    const cleanedRowDate =
      rawDate
        .replaceAll("/", "-")
        .split(" ")[0]
        .trim();

    const cleanedQueryDate =
      date
        .replaceAll("/", "-")
        .trim();

    return cleanedRowDate.includes(
      cleanedQueryDate
    );
  });
}


export {

  getTotalRows,

  findColumn,

  detectBestColumn,

  filterRows,

  countByColumn,

  sumColumn,

  getRowsByDate
};