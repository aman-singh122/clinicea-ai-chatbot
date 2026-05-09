import ai from "../config/gemini.js";

async function csvAnswerEngine(prompt) {

  try {

    const response =
      await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt
      });

    return response.text;

  } catch (error) {

    console.log(error);

    return "CSV AI failed.";
  }
}

export default csvAnswerEngine;