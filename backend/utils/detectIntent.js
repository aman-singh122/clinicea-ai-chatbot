function detectIntent(question) {

    const q =
        question.toLowerCase();

    // ================= FLAGS =================

    const intent = {

        type: "general",

        bill: false,

        patient: false,

        video: false,

        clinicea: false,

        upload: false,

        action: false
    };

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

        "sso",

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

        "clinic workflow",

        "sso",

        "soap notes"
    ];

    if (

        cliniceaKeywords.some(
            k => q.includes(k)
        )

    ) {

        intent.clinicea = true;
    }

    // ================= PRIORITY RESOLUTION =================

    // BILL PRIORITY

    if (intent.bill) {

        intent.type = "bill";

        return intent;
    }

    // CLINICEA PRIORITY

    if (intent.clinicea) {

        intent.type = "clinicea";

        return intent;
    }

    // DOCUMENT / PDF PRIORITY

    if (intent.upload) {

        intent.type = "document";

        return intent;
    }

    // GENERAL

    intent.type = "general";

    return intent;
}

export default detectIntent;