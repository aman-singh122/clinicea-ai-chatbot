function detectIntent(question) {

    const q =
        question.toLowerCase();


    // ================= FLAGS =================

    const intent = {

        type: "general",

        analytics: false,

        graph: false,

        bill: false,

        patient: false,

        video: false,

        clinicea: false,

        upload: false,

        comparison: false,

        trend: false,

        action: false,

        dateQuery: false,

        revenueQuery: false,

        appointmentQuery: false,

        summaryQuery: false
    };


    // ================= ANALYTICS =================

    const analyticsKeywords = [

        "analytics",
        "revenue",
        "income",
        "appointments",
        "appointment",
        "cancelled",
        "waiting",
        "completed",
        "check out",
        "trend",
        "distribution",
        "compare",
        "comparison",
        "statistics",
        "status",
        "graph",
        "chart",
        "pie chart",
        "bar chart",
        "line chart",
        "csv",
        "dataset",
        "report",
        "analysis",
        "top services",
        "performance"
    ];


    if (
        analyticsKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.analytics = true;

        intent.type = "analytics";
    }


    // ================= GRAPH =================

    const graphKeywords = [

        "graph",
        "chart",
        "visualize",
        "plot",
        "pie",
        "bar",
        "line",
        "trend",
        "distribution",
        "compare"
    ];


    if (
        graphKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.graph = true;
    }


    // ================= COMPARISON =================

    if (

        q.includes("compare") ||
        q.includes("vs") ||
        q.includes("difference")

    ) {

        intent.comparison = true;
    }


    // ================= TREND =================

    if (

        q.includes("trend") ||
        q.includes("growth") ||
        q.includes("timeline")

    ) {

        intent.trend = true;
    }


    // ================= REVENUE =================

    if (

        q.includes("revenue") ||
        q.includes("income") ||
        q.includes("payment") ||
        q.includes("financial")

    ) {

        intent.revenueQuery = true;
    }


    // ================= DATE QUERY =================

    const dateRegex =
        /\d{2}-\d{2}-\d{4}/;

    if (
        dateRegex.test(q)
    ) {

        intent.dateQuery = true;
    }


    // ================= APPOINTMENTS =================

    if (

        q.includes("appointment") ||
        q.includes("booking") ||
        q.includes("calendar")

    ) {

        intent.appointmentQuery = true;
    }


    // ================= BILL ACTION =================

    const billKeywords = [

        "create bill",
        "generate bill",
        "invoice",
        "receipt",
        "billing",
        "payment receipt",
        "make bill"
    ];


    if (
        billKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.bill = true;

        intent.action = true;

        intent.type = "bill";
    }


    // ================= PATIENT / PDF =================

    const patientKeywords = [

        "patient",
        "report",
        "prescription",
        "medicine",
        "diagnosis",
        "pdf",
        "medical report",
        "lab report",
        "summary",
        "file no",
        "treatment"
    ];


    if (
        patientKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.patient = true;

        intent.upload = true;
    }


    // ================= VIDEO =================

    const videoKeywords = [

        "video",
        "tutorial",
        "how to",
        "guide",
        "demo",
        "show me how"
    ];


    if (
        videoKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.video = true;
    }


    // ================= CLINICEA =================

    const cliniceaKeywords = [

        "clinicea",
        "emr",
        "crm",
        "calendar",
        "callbox",
        "financials",
        "pharmacy",
        "investigations",
        "patient portal",
        "queue",
        "appointment workflow",
        "clinic workflow"
    ];


    if (
        cliniceaKeywords.some(
            k => q.includes(k)
        )
    ) {

        intent.clinicea = true;
    }


    // ================= SUMMARY =================

    if (

        q.includes("summary") ||
        q.includes("overview") ||
        q.includes("insight")

    ) {

        intent.summaryQuery = true;
    }


    // ================= PRIORITY RESOLUTION =================

// BILL highest priority
if (intent.bill) {

    intent.type = "bill";

    return intent;
}


// CLINICEA second priority
if (intent.clinicea) {

    intent.type = "clinicea";

    return intent;
}


// ANALYTICS third priority
if (intent.analytics) {

    intent.type = "analytics";

    return intent;
}


// DOCUMENT
if (intent.upload) {

    intent.type = "document";

    return intent;
}


// GENERAL
intent.type = "general";

return intent;
}


export default detectIntent;