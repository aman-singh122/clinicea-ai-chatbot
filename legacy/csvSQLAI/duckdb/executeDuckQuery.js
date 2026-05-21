import db from "./duckdbConnection.js";

function executeDuckQuery(sql) {

  return new Promise((resolve, reject) => {

    db.all(sql, (err, rows) => {

      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }

    });

  });

}

export default executeDuckQuery;