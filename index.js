const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require('body-parser');
const crypto = require('crypto');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((err, req, res, next) =>{
  res.status(500).render("./res/err", {
    code: 500,
    message: "Internal server error.\nIf persists, please contact us."
  });
});

fs.readdirSync('./routes').forEach(file => {
  const route = require(`./routes/${file}`);
  console.log(route.route)
  app.use(route.route, route.app);
});

app.use((req, res, next) => {
  if (req.method === "POST") {
    const {
      data
    } = req.body;
    try {
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
      const {
        sign,
        salt,
        userId
      } = decodedData;

      const expectedSign = md5('viaviweb' + salt + userId);
      if (sign !== expectedSign) {
        res.status(401).json({
          message: 'Token inválido'
        });
        return;
      }

    } catch (e) {
      console.log(e)
      res.status(401).json({
        message: 'Token inválido'
      });
      return;

    }
  } else {
    res.setHeader("Content-type", "text/html");
    res.status(200).send(fs.readFileSync("./res/err.html", "UTF-8"));
    return;
  }
  next();
});

function md5(str) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}

app.listen(3000, () => {
  console.log("Funfando")
})