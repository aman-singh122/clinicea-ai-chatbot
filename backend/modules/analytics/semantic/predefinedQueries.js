const predefinedQueries = {

  // =========================
  // TOP REVENUE DOCTORS
  // =========================

  topRevenueDoctors: `

SELECT

  "For",

  SUM(
    "Service Price (After tax)"
  ) AS total_revenue

FROM appointments

WHERE

  "For" IS NOT NULL

  AND "For" != ''

GROUP BY "For"

ORDER BY total_revenue DESC

LIMIT 10

`,

  // =========================
  // MONTHLY REVENUE TREND
  // =========================

  monthlyRevenueTrend: `

SELECT

  strftime(

    "ApptStartDtm",

    '%Y-%m'

  ) AS month,

  SUM(

    "Service Price (After tax)"

  ) AS revenue

FROM appointments

GROUP BY month

ORDER BY month ASC

`,

  // =========================
  // APPOINTMENT STATUS
  // =========================

  appointmentStatusDistribution: `

SELECT

  "Status",

  COUNT(*) AS total

FROM appointments

GROUP BY "Status"

ORDER BY total DESC

`,

  // =========================
  // TOP SERVICES
  // =========================

  topServices: `

SELECT

  "Service Name",

  SUM(

    "Service Price (After tax)"

  ) AS revenue

FROM appointments

WHERE

  "Service Name" IS NOT NULL

  AND "Service Name" != ''

GROUP BY "Service Name"

ORDER BY revenue DESC

LIMIT 10

`,

  // =========================
  // CITY REVENUE
  // =========================

  cityRevenue: `

SELECT

  "Patient City",

  SUM(

    "Service Price (After tax)"

  ) AS revenue

FROM appointments

WHERE

  "Patient City" IS NOT NULL

  AND "Patient City" != ''

GROUP BY "Patient City"

ORDER BY revenue DESC

LIMIT 10

`,

  // =========================
  // DOCTOR WORKLOAD
  // =========================

  doctorWorkload: `

SELECT

  "For",

  COUNT(*) AS total_appointments

FROM appointments

WHERE

  "For" IS NOT NULL

  AND "For" != ''

GROUP BY "For"

ORDER BY total_appointments DESC

LIMIT 10

`,

  // =========================
  // APPOINTMENT TREND
  // =========================

  appointmentTrend: `

SELECT

  strftime(

    "ApptStartDtm",

    '%Y-%m'

  ) AS month,

  COUNT(*) AS total_appointments

FROM appointments

GROUP BY month

ORDER BY month ASC

`,

  // =========================
  // FEEDBACK ANALYTICS
  // =========================

  feedbackAnalytics: `

SELECT

  "For",

  AVG(

    TRY_CAST(

      "Feedback Score"

      AS DOUBLE

    )

  ) AS avg_feedback

FROM appointments

WHERE

  "Feedback Score" IS NOT NULL

  AND "Feedback Score" != ''

GROUP BY "For"

ORDER BY avg_feedback DESC

LIMIT 10

`,

  // =========================
  // APPOINTMENT GROWTH
  // =========================

  appointmentGrowth: `

SELECT

  month,

  total_appointments,

  total_appointments

  -

  LAG(
    total_appointments
  )

  OVER (

    ORDER BY month

  ) AS growth

FROM (

  SELECT

    strftime(

      "ApptStartDtm",

      '%Y-%m'

    ) AS month,

    COUNT(*) AS total_appointments

  FROM appointments

  GROUP BY month

) AS monthly_data

ORDER BY month ASC

`

};

export default predefinedQueries;