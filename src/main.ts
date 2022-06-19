import Express from "express";
import Axios from "axios";
import cors from "cors";
import rateLimit from 'express-rate-limit'
import { Webhook, MessageBuilder } from "discord-webhook-node";
import bodyParser from "body-parser";
require("dotenv").config();

const app = Express();
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const corsOptions = {
  origin: "https://pol.engineer",
  optionsSuccessStatus: 200,
}
app.use(limiter);
app.use(bodyParser.json());
app.use(cors(corsOptions));


app.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  const data: any = {
    name,
    email,
    message,
  };

  const url = process.env.DISCORD_WEBHOOK;
  if (url === undefined) {
    return;
  }

  const hook = new Webhook({
    url,
    throwErrors: true,
    retryOnLimit: true
  });
  const embed = new MessageBuilder()
    .setTitle('New message')
    .setAuthor()
    .addField('Name', `${data.name}`, true)
    .addField('Email', `${data.email}`, true)
    .addField('Message', `${data.message}`, false)
    .addField('IP', `${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`, true)
    .addField('Browser', `${req.get('User-Agent')}`, true)
    .setColor(45300)
    .setTimestamp();
  try {
    await hook.send(embed)
  } catch (e) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
