const businessRules = {

  appointments: {

    // =========================
    // MAIN ENTITIES
    // =========================

    patientName:
      "ApptWithFullName",

    doctorName:
      "For",

    appointmentDate:
      "ApptStartDtm",

    appointmentStatus:
      "Status",

    appointmentSource:
      "Appointment Source",

    city:
      "Patient City",

    service:
      "Service Name",

    serviceCategory:
      "Service Category",

    revenue:
      "Service Price (After tax)",

    revenueBeforeTax:
      "Service Price (Before tax)",

    feedback:
      "Feedback Score",

    organisation:
      "Organisation Name",

    packageItem:
      "Package Item",

    newAppointment:
      "New Appointment",

    // =========================
    // TIME
    // =========================

    startTime:
      "Appt Start Time",

    endTime:
      "Appt End Time",

    checkOutTime:
      "Check Out Time",

    // =========================
    // DURATIONS
    // =========================

    appointmentDuration:
      "Appointment Duration",

    waitingDuration:
      "Waiting Duration",

    consultationDuration:
      "Consultation Duration",

    // =========================
    // STATUS LOGIC
    // =========================

    visitedMeans:
      "Check Out",

    cancelledMeans:
      "Cancelled",

    scheduledMeans:
      "Scheduled",

    waitingMeans:
      "Waiting",

    noShowMeans:
      "No Show",

    // =========================
    // SEARCH UNDERSTANDING
    // =========================

    synonyms: {

      visitors:
        "ApptWithFullName",

      patients:
        "ApptWithFullName",

      doctors:
        "For",

      physician:
        "For",

      clinician:
        "For",

      appointments:
        "ApptWithFullName",

      bookings:
        "ApptWithFullName",

      revenue:
        "Service Price (After tax)",

      earnings:
        "Service Price (After tax)",

      money:
        "Service Price (After tax)",

      city:
        "Patient City",

      location:
        "Patient City",

      service:
        "Service Name",

      category:
        "Service Category",

      status:
        "Status",

      visit:
        "Check Out",

      visited:
        "Check Out",

      cancelled:
        "Cancelled",

      cancellation:
        "Cancelled",

      waiting:
        "Waiting",

      scheduled:
        "Scheduled"
    }
  }

  ,

  bills: {

    patient:
      "Bill For",

    doctor:
      "BillDocName",

    consultedBy:
      "Consulted By",

    billDate:
      "Bill Date",

    billNo:
      "Bill No",

    billType:
      "Bill Type",

    revenue:
      "Total Billed Amt",

    tax:
      "Tax Amt",

    due:
      "Total Due Amt",

    paid:
      "Total Paid Amt",

    status:
      "BillStatus",

    organisation:
      "OrgName",

    synonyms: {

      revenue:
        "Total Billed Amt",

      earnings:
        "Total Billed Amt",

      sales:
        "Total Billed Amt",

      tax:
        "Tax Amt",

      due:
        "Total Due Amt",

      unpaid:
        "Total Due Amt",

      paid:
        "Total Paid Amt",

      doctor:
        "BillDocName",

      physician:
        "BillDocName",

      patient:
        "Bill For",

      invoice:
        "Bill No",

      billing:
        "Bill Type"
    }
  },

  billItems: {

    item:
      "Item",

    itemCategory:
      "ServiceCategory",

    quantity:
      "Qty",

    revenue:
      "Total (After Tax) Amt",

    tax:
      "Tax Amt",

    sellPrice:
      "Sell Price",

    buyPrice:
      "Buy Price",

    billDate:
      "Bill Date",

    doctor:
      "Consulted By",

    patient:
      "Bill For",

    billNo:
      "Bill No",

    synonyms: {

      item:
        "Item",

      items:
        "Item",

      medicine:
        "Item",

      product:
        "Item",

      service:
        "Item",

      quantity:
        "Qty",

      qty:
        "Qty",

      sold:
        "Qty",

      revenue:
        "Total (After Tax) Amt",

      earnings:
        "Total (After Tax) Amt",

      sales:
        "Total (After Tax) Amt",

      tax:
        "Tax Amt",

      doctor:
        "Consulted By",

      patient:
        "Bill For"
    }
  }
};

export default businessRules;