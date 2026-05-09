function csvSchema(data) {

  if (!data.length) {

    return [];
  }

  return Object.keys(data[0]);
}

export default csvSchema;