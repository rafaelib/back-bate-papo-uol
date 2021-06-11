import express from "express";
import cors from "cors";
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
    from: name,
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
  const participants = req.body;
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const newMessage = req.body;
  const { to, text, type } = newMessage;
  const from = req.headers.user;
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
  console.log(participants);
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
    messagesToDisplay.reverse();
    messagesToDisplay.splice(50, Number.MAX_VALUE);
    messagesToDisplay.reverse();
    res.send(messagesToDisplay);
  }
});
app.listen(4000, () => console.log("iniciando o server..."));
