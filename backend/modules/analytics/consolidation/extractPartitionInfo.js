function extractPartitionInfo(filename) {

  const clean =

    filename.toLowerCase();

  // =========================
  // EXAMPLE:
  // appointments_2026_05_week1
  // =========================

  const parts =

    clean.split("_");

  return {

    dataset:
      parts[0] || "",

    year:
      parts[1] || "",

    month:
      parts[2] || ""

  };

}

export default extractPartitionInfo;