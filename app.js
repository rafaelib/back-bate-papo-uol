import express from "express";
import cors from "cors";
import { stripHtml } from "string-strip-html";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());

let participants = [];
let messages = [];

setInterval(() => {
  let updatedParticipants = [];
  for (let i = 0; i < participants.length; i++) {
    if (Date.now() - participants[i].lastStatus <= 10000) {
      updatedParticipants.push(participants[i]);
    } else {
      messages.push({
        from: participants[i].name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs(Date.now()).format("HH:mm:ss"),
      });
    }
  }
  participants = updatedParticipants;
}, 15000);

app.post("/participants", (req, res) => {
  // POST PARTICIPANTS
  const participant = req.body;
  const { name } = participant;

  if (name.length === 0 || participants.includes(name)) {
    res.sendStatus(400);
    return;
  }

  participant.lastStatus = Date.now();

  participants.push(participant);

  const newParticipantMessage = {
    from: stripHtml(name).result.trim(),
    to: "Todos",
    text: "entra na sala...",
    type: "status",
    time: dayjs(participant.lastStatus).format("HH:mm:ss"),
  };

  messages.push(newParticipantMessage);
  res.sendStatus(200);
});

app.get("/participants", (req, res) => {
  // GET PARTICIPANTS
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const newMessage = req.body;
  let { to, text, type } = newMessage;
  to = stripHtml(to).result.trim();
  text = stripHtml(text).result.trim();
  type = stripHtml(type).result.trim();

  const from = (to = stripHtml(req.headers.user).result.trim());
  const typeValidation = type === "message" || type === "private_message";
  if (
    to.length === 0 ||
    text.length === 0 ||
    from.length === 0 ||
    !typeValidation
  ) {
    res.sendStatus(400);
    return;
  }
  newMessage.from = from;
  newMessage.time = dayjs(Date.now()).format("HH:mm:ss");
  messages.push(newMessage);
  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  let messagesToDisplay = messages.filter(
    (message) =>
      message.to === "Todos" ||
      message.to === req.headers.user ||
      message.from === req.headers.user
  );

  if (req.query.limit === undefined) {
    res.send(messagesToDisplay);
  } else {
    messagesToDisplay.splice(0, messagesToDisplay.length - 1 - req.query.limit);
    res.send(messagesToDisplay);
  }
});

app.post("/status", (req, res) => {
  const user = participants.findIndex(
    (participant) => req.headers.user === participant.name
  );
  if (user === -1) {
    res.sendStatus(400);
  } else {
    participants[user].lastStatus = Date.now();
    res.sendStatus(200);
  }
});

app.listen(4000, () => console.log("iniciando o server..."));
