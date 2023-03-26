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
const { openAI } = require('../constants/api');

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

  if(!text || !questions || !response){
    res.status(401).json({
      message: "Parâmetros inválidos."
    });
  }

  const checkData = await checkRequests(userId);
  if (!checkData.success) {
    res.status(401).json({
      message: checkData.msg
    });
    return;
  }
  
  
    const genText = await generateText(text, questions, response);

    res.status(200).json({
      message: "OK",
      text: generateText
    });


});

function md5(str) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}


async function generateText(Text, Quest, Resp) {
  return new Promise(async (res, rej) => {
    const openai = new OpenAIApi(configuration);
    var cmd = `Gere ${Quest} sobre o seguinte texto, adicione a tag <strong> na pergunta:: ${Text}`;
    if (Resp) {
      cmd = `Gere ${Quest} sobre o seguinte texto, e adicione a resposta em baixo, adicione também a tag <strong> na pergunta: ${Text}`;
    }
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: cmd,
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["input:"]
    });
    var result = completion.data.choices[0].text;
    res(result);
  });

}


module.exports = {
  app: app,
  route: "/api/generator"
};