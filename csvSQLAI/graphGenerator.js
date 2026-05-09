function graphGenerator(
  result
) {

  if (

    !result ||

    result.length === 0

  ) {

    return null;
  }

  const firstRow =
    result[0];

  const keys =
    Object.keys(firstRow);

  if (keys.length < 2) {

    return null;
  }

  const labelKey =
    keys[0];

  const valueKey =
    keys[1];

  return {

    labels:

      result.map(
        row => row[labelKey]
      ),

    values:

      result.map(
        row =>
          Number(
            row[valueKey]
          )
      )
  };
}

export default graphGenerator;