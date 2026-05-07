import XLSX from "xlsx";

function loadExcel(filePath) {

    try {

        // Read workbook
        const workbook = XLSX.readFile(filePath);

        // First sheet
        const sheetName = workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];

        // Convert to rows
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });

        // First row = headers
        const headers = rows[0];

        // Remaining rows
        const dataRows = rows.slice(1);

        // Convert rows to objects
        const formattedData = dataRows.map(row => {

            const obj = {};

            headers.forEach((header, index) => {

                obj[header] = row[index];

            });

            return obj;
        });

        return formattedData;

    } catch (error) {

        console.log("Excel Loading Error:", error);

        return [];
    }
}

export default loadExcel;