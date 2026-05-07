function getTotalAppointments(data) {

    return data.length;
}


function getCancelledAppointments(data) {

    return data.filter(row =>

        row.Status === "Cancelled"

    ).length;
}


function getCompletedAppointments(data) {

    return data.filter(row =>

        row.Status === "Check Out"

    ).length;
}


function getWaitingAppointments(data) {

    return data.filter(row =>

        row.Status === "Waiting"

    ).length;
}


function getTotalRevenue(data) {

    return data.reduce((sum, row) => {

        return sum + Number(row["Service Price (After tax)"] || 0);

    }, 0);
}

// DATE FILTER
function getAppointmentsByDate(data, date) {

    return data.filter(row => {

        const createdDate =
            row["Created On Date"];

        return createdDate === date;
    });
}


export {
   getTotalAppointments,
   getCancelledAppointments,
   getCompletedAppointments,
   getWaitingAppointments,
   getTotalRevenue,
   getAppointmentsByDate
};