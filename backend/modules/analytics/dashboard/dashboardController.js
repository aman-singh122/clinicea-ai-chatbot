import getAppointmentsDashboard
from "./appointmentsDashboard.js";

async function dashboardController(

  req,
  res

) {

  try {

    // =========================
    // GET FILTERS
    // =========================

    const filters = {

      dateRange:

        req.query.dateRange || "30"

    };

    console.log(
      "\nFILTERS:\n",
      filters
    );

    // =========================
    // GET DASHBOARD DATA
    // =========================

    const data =

      await getAppointmentsDashboard(

        filters

      );

    // =========================
    // BIGINT FIX
    // =========================

    const safeData =

      JSON.parse(

        JSON.stringify(

          data,

          (key, value) =>

            typeof value === "bigint"

              ? Number(value)

              : value

        )

      );

    // =========================
    // SUCCESS RESPONSE
    // =========================

    res.status(200).json({

      success: true,

      filters,

      data: safeData

    });

  } catch (error) {

    console.log(
      "\nDASHBOARD ERROR:\n"
    );

    console.log(error);

    res.status(500).json({

      success: false,

      error:
        "Dashboard failed",

      message:
        error.message

    });

  }

}

export default dashboardController;