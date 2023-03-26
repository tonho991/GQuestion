const {
  Configuration,
  OpenAIApi
} = require("openai");
const express = require("express");
const app = express.Router();
const crypto = require('crypto');
const {
  checkRequests
} = require('../util/Firebase');
const {
  openAI
} = require('../constants/api');

const configuration = new Configuration({
  apiKey: openAI.apiKey,
});

app.post('/', async (req, res) => {
  const {
    data
  } = req.body;
  const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
  const {
    sign,
    salt,
    userId,
    text,
    questions,
    response
  } = decodedData;

  if (!text || !questions || !response) {
    res.status(401).json({
      status: "error",
      message: "Parâmetros inválidos."
    });
  }

  const checkData = await checkRequests(userId);
  if (!checkData.success) {
    res.status(401).json({
      status: "error",
      message: checkData.msg
    });
    return;
  }


  generateText(text, questions, response)
  .then((result) => {
    res.status(200).json({
      status: "OK",
      message: "Perguntas geradas com sucesso",
      text: result
    });
  }).catch((err) => {
    res.status(200).json({
      status: "error",
      message: "Erro ao gerar sua pergunta.",
    });
  });




});

function md5(str) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}


async function generateText(text, question, answer) {
  try {
    const openai = new OpenAIApi(configuration);

    var prompt = `Gere ${question} sobre o seguinte texto, adicione a tag <strong> na pergunta: ${text}`;
    if (answer) {
      prompt = `Gere ${question} sobre o seguinte texto, adicione a resposta em baixo, adicione também a tag <strong> na pergunta: ${text}`;
    }

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["input:"]
    });
    console.log(completion.data)
    const result = completion.data.choices[0].text;

    return result;
  } catch (error) {
    console.error("Error while generating text:", error);
    throw error;
  }
}



module.exports = {
  app: app,
  route: "/api/generator"
};