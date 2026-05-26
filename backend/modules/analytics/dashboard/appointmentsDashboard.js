import db
from "../duckdb/duckdbConnection.js";

import dashboardConfig
from "../config/dashboardConfig.js";

async function getAppointmentsDashboard(
  filters = {}
) {

  // =====================================
  // CONFIG
  // =====================================

  const config =

    dashboardConfig.appointments;

  // =====================================
  // FILTERS
  // =====================================

  const {

    dateRange = "30",

    doctor = "all"

  } = filters;

  // =====================================
  // PARQUET PATH
  // =====================================

  const parquetPath =

    "data/user1/parquet/appointments_-202605071242.parquet";

  // =====================================
  // DATE CONDITION
  // =====================================

  let dateCondition = "";

  switch (dateRange) {

    case "7":

      dateCondition = `

AND "ApptStartDtm"
>= CURRENT_DATE - INTERVAL 7 DAY

`;

      break;

    case "30":

      dateCondition = `

AND "ApptStartDtm"
>= CURRENT_DATE - INTERVAL 30 DAY

`;

      break;

    case "90":

      dateCondition = `

AND "ApptStartDtm"
>= CURRENT_DATE - INTERVAL 90 DAY

`;

      break;

    case "365":

      dateCondition = `

AND "ApptStartDtm"
>= CURRENT_DATE - INTERVAL 365 DAY

`;

      break;

    default:

      dateCondition = "";

  }

  // =====================================
  // DOCTOR CONDITION
  // =====================================

  let doctorCondition = "";

  if (

    doctor !== "all"

    &&

    doctor !== ""

  ) {

    const safeDoctor =

      doctor.replaceAll(
        "'",
        "''"
      );

doctorCondition = `

AND LOWER(TRIM("For"))

=

LOWER(TRIM('${safeDoctor}'))

`;

  }

  // =====================================
  // COMMON SOURCE
  // =====================================

  const source = `

FROM read_parquet(
  '${parquetPath}'
)

WHERE 1=1

${dateCondition}

${doctorCondition}

`;

  // =====================================
  // TOTAL APPOINTMENTS
  // =====================================

  const totalAppointmentsSQL = `

SELECT

  COUNT(*) as total

${source}

`;

  // =====================================
  // COMPLETED
  // =====================================

  const completedSQL = `

SELECT

  COUNT(*) as completed

${source}

AND "Status" = 'Check Out'

`;

  // =====================================
  // CANCELLED
  // =====================================

  const cancelledSQL = `

SELECT

  COUNT(*) as cancelled

${source}

AND "Status" = 'Cancelled'

`;

  // =====================================
  // REVENUE
  // =====================================

  const revenueSQL = `

SELECT

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue

${source}

`;

  // =====================================
  // APPOINTMENT TREND
  // =====================================

  const trendSQL = `

SELECT

  strftime(
    "ApptStartDtm",
    '%Y-%m-%d'
  ) as month,

  COUNT(*) as appointments

${source}

GROUP BY month

ORDER BY month

`;

  // =====================================
  // REVENUE TREND
  // =====================================

  const revenueTrendSQL = `

SELECT

  strftime(
    "ApptStartDtm",
    '%Y-%m-%d'
  ) as month,

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue

${source}

GROUP BY month

ORDER BY month

`;

  // =====================================
  // STATUS ANALYTICS
  // =====================================

  const statusSQL = `

SELECT

  COALESCE(
    "Status",
    'Unknown'
  ) as status,

  COUNT(*) as total

${source}

GROUP BY "Status"

ORDER BY total DESC

`;

  // =====================================
  // TOP DOCTORS
  // =====================================

const topDoctorsSQL = `

SELECT

  "For" as doctor,

  COUNT(*) as appointments,

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue,

  SUM(

    CASE

      WHEN "Status" = 'Check Out'

      THEN 1

      ELSE 0

    END

  ) as completed,

  SUM(

    CASE

      WHEN "Status" = 'Cancelled'

      THEN 1

      ELSE 0

    END

  ) as cancelled,

  ROUND(

    100.0 *

    SUM(

      CASE

        WHEN "Status" = 'Check Out'

        THEN 1

        ELSE 0

      END

    )

    /

    COUNT(*),

    2

  ) as completionRate

${source}

AND "For" IS NOT NULL

AND "For" LIKE 'Dr.%'

GROUP BY "For"

ORDER BY revenue DESC

LIMIT 50

`;

  // =====================================
  // CITY ANALYTICS
  // =====================================

  const cityAnalyticsSQL = `

SELECT

  CASE

    WHEN TRIM(
      "Patient City"
    ) = ''

    THEN 'Unknown'

    ELSE TRIM("Patient City")

  END as city,

  COUNT(*) as appointments

${source}

AND "Patient City" IS NOT NULL

GROUP BY city

ORDER BY appointments DESC

LIMIT 10

`;

  // =====================================
  // HOURLY TRAFFIC
  // =====================================

  const hourlyTrafficSQL = `

SELECT

  COALESCE(

    strftime(

      try_strptime(

        "Appt Start Time",

        '%I:%M %p'

      ),

      '%H'

    ),

    'Unknown'

  ) as hour,

  COUNT(*) as appointments

${source}

AND "Appt Start Time"
IS NOT NULL

GROUP BY hour

ORDER BY hour

`;

  // =====================================
  // WEEKDAY ANALYTICS
  // =====================================

const weekdayAnalyticsSQL = `

SELECT

  strftime(
    "ApptStartDtm",
    '%A'
  ) as weekday,

  COUNT(*) as appointments,

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue

${source}

GROUP BY weekday

ORDER BY appointments DESC

`;

// =====================================
// PEAK HOURS ANALYTICS
// =====================================

const peakHourSQL = `

SELECT

  COALESCE(

    strftime(

      try_strptime(

        "Appt Start Time",

        '%I:%M %p'

      ),

      '%H:00'

    ),

    'Unknown'

  ) as hour,

  COUNT(*) as appointments,

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue

${source}

AND "Appt Start Time"
IS NOT NULL

GROUP BY hour

ORDER BY appointments DESC

LIMIT 10

`;

// =====================================
// APPOINTMENT SOURCE ANALYTICS
// =====================================

const sourceAnalyticsSQL = `

SELECT

  COALESCE(
    "Appointment Source",
    'Unknown'
  ) as sourceName,

  COUNT(*) as appointments

${source}

GROUP BY sourceName

ORDER BY appointments DESC

LIMIT 10

`;

// =====================================
// CANCELLATION ANALYTICS
// =====================================

const cancellationAnalyticsSQL = `

SELECT

  strftime(
    "ApptStartDtm",
    '%A'
  ) as weekday,

  COUNT(*) as cancellations

${source}

AND "Status" = 'Cancelled'

GROUP BY weekday

ORDER BY cancellations DESC

`;

// =====================================
// PATIENT ANALYTICS
// =====================================

const patientAnalyticsSQL = `

SELECT

  COUNT(DISTINCT
    "ApptWithFullName"
  ) as uniquePatients,

  COUNT(*) as totalVisits,

  ROUND(

    COUNT(*) * 1.0 /

    NULLIF(

      COUNT(DISTINCT
        "ApptWithFullName"
      ),

      0

    ),

    2

  ) as avgVisitsPerPatient

${source}

`;

// =====================================
// AI INSIGHTS
// =====================================

const aiInsightSQL = `

SELECT

  "For" as doctor,

  COUNT(*) as appointments,

  COALESCE(

    SUM(
      "Service Price (After tax)"
    ),

    0

  ) as revenue

${source}

GROUP BY doctor

ORDER BY revenue DESC

LIMIT 1

`;



  // =====================================
  // DETAILED TABLE
  // =====================================

const tableSQL = `

SELECT

  COALESCE(
    "ApptWithFullName",
    'Unknown Patient'
  ) as patient,

  COALESCE(
    "For",
    'Unknown Doctor'
  ) as doctor,

  COALESCE(
    "Status",
    'Unknown'
  ) as status,

  CASE

    WHEN
      "Patient City" IS NULL

      OR trim(
        "Patient City"
      ) = ''

      OR length(
        trim(
          "Patient City"
        )
      ) < 3

    THEN 'Unknown'

    ELSE
      "Patient City"

  END as city,

  COALESCE(

    CAST(
      "Service Price (After tax)"
      AS DOUBLE
    ),

    0

  ) as revenue,

  strftime(
    "ApptStartDtm",
    '%d %b %Y'
  ) as appointmentDate

${source}

AND
  "ApptWithFullName"
  IS NOT NULL

AND
  trim(
    "ApptWithFullName"
  ) != ''

AND
  "For"
  IS NOT NULL

AND
  trim(
    "For"
  ) != ''

AND
  "Status"
  IN (

    'Check Out',
    'Scheduled',
    'Waiting',
    'Confirmed'

  )

ORDER BY

  revenue DESC,

  appointmentDate DESC

LIMIT 40

`;
  // =====================================
  // DOCTORS LIST
  // =====================================

  const doctorsSQL = `

SELECT DISTINCT

  "For" as doctor

FROM read_parquet(
  '${parquetPath}'
)

WHERE

  "For" IS NOT NULL

  AND

  "For" LIKE 'Dr.%'

ORDER BY doctor

`;

  // =====================================
  // TIMELINE RANGE
  // =====================================

  const timelineSQL = `

SELECT

  MIN("ApptStartDtm")
  as startDate,

  MAX("ApptStartDtm")
  as endDate

FROM read_parquet(
  '${parquetPath}'
)

`;

  // =====================================
  // QUERY EXECUTOR
  // =====================================

  function runQuery(sql) {

    return new Promise(

      (resolve, reject) => {

        db.all(

          sql,

          (err, rows) => {

            if (err) {

              console.log(
                "\nQUERY FAILED:\n"
              );

              console.log(sql);

              console.log(err);

              reject(err);

            }

            else {

              resolve(rows);

            }

          }

        );

      }

    );

  }

  // =====================================
  // EXECUTE ALL QUERIES
  // =====================================

const [

    totalResult,

    completedResult,

    cancelledResult,

    revenueResult,

    trendResult,

    revenueTrendResult,

    statusResult,

    topDoctorsResult,

    cityResult,

    hourlyTrafficResult,

    weekdayResult,

    tableResult,

    doctorsResult,

    timelineResult,

    peakHourResult,

    sourceAnalyticsResult,

    cancellationAnalyticsResult,

    patientAnalyticsResult,

    aiInsightResult

] = await Promise.all([

    runQuery(
      totalAppointmentsSQL
    ),

    runQuery(
      completedSQL
    ),

    runQuery(
      cancelledSQL
    ),

    runQuery(
      revenueSQL
    ),

    runQuery(
      trendSQL
    ),

    runQuery(
      revenueTrendSQL
    ),

    runQuery(
      statusSQL
    ),

    runQuery(
      topDoctorsSQL
    ),

    runQuery(
      cityAnalyticsSQL
    ),

    runQuery(
      hourlyTrafficSQL
    ),

    runQuery(
      weekdayAnalyticsSQL
    ),

    runQuery(
      tableSQL
    ),

    runQuery(
      doctorsSQL
    ),

    runQuery(
      timelineSQL
    )
    ,

runQuery(
  peakHourSQL
),

runQuery(
  sourceAnalyticsSQL
),

runQuery(
  cancellationAnalyticsSQL
),

runQuery(
  patientAnalyticsSQL
),

runQuery(
  aiInsightSQL
)

  ]);

  // =====================================
  // FINAL RESPONSE
  // =====================================

  return {

    success: true,

    title:
      config.title,

    config,

    filters: {

      dateRange,

      doctor

    },

    timeline: {

      start:
        timelineResult[0]
          ?.startDate,

      end:
        timelineResult[0]
          ?.endDate

    },

    doctors:
      doctorsResult,

    analytics: {

      kpis: {

        totalAppointments:

          totalResult[0]
            ?.total || 0,

        completed:

          completedResult[0]
            ?.completed || 0,

        cancelled:

          cancelledResult[0]
            ?.cancelled || 0,

        revenue:

          revenueResult[0]
            ?.revenue || 0

      },

      trend:
        trendResult,

      revenueTrend:
        revenueTrendResult,

      status:
        statusResult,

      topDoctors:
        topDoctorsResult,

      cityAnalytics:
        cityResult,

      hourlyTraffic:
        hourlyTrafficResult,

      weekdayAnalytics:
        weekdayResult,

      table:
        tableResult

        ,

peakHours:
  peakHourResult,

appointmentSources:
  sourceAnalyticsResult,

cancellationAnalytics:
  cancellationAnalyticsResult,

patientAnalytics:
  patientAnalyticsResult,

aiInsights:
  aiInsightResult

    }

  };

}

export default getAppointmentsDashboard;