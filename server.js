//import the express framework
const express = require("express");

//returns an instance of an Express application. This application
//can then be used to start a server and specify server behavior.
const app = express();

//use middleware to parse request data sent in the body of the request
const bodyParser = require("body-parser");

const PORT = 4001;
const totalBudget = 0;
const envelope_array = [];
/*
{"title": "Charitable Donations", "budget": 50}
{"title": "Mortgage", "budget": 3550}
{"title": "Utilities", "budget": 350}
{"title": "Food-Market", "budget": 275}
{"title": "Food-Eating Out", "budget": 150}
{"title": "IRA Contribution", "budget": 625}
{"title": "Home", "budget": 350}
*/
let envId = 1;

//req.body parsing middleware
app.use(bodyParser.json());

//return all envelopes in envelope_array
app.get("/envelopes", (req, res, next) => {
  if (envelope_array.length > 0) {
    res.json(envelope_array);
  } else {
    res.status(404).send("envelope_array is empty");
  }
});

//return envelope specified by id number
app.get("/envelopes/:id", (req, res, next) => {
  let searchId = req.params.id;
  if (searchId < 1 || searchId > envelope_array.length) {
    return res
      .status(404)
      .send(`Error 404: Envelope ID ${searchId} not found.`);
  } else {
    let searchEnv = envelope_array[searchId - 1];
    res.json(searchEnv);
  }
});

//create a new envelope - new envelopes exist only as long as the server.js
// is running. Restart the node server.js and the existing envelope data is gone
app.post("/envelopes", (req, res, next) => {
  let body = req.body;
  let envTitle = body.title;
  let envBudget = body.budget;
  if (envTitle === "" || envBudget < 0) {
    return res.status(400).send("Invalid request body");
  }
  const newEnvelope = { id: envId, title: envTitle, budget: envBudget };
  envId++;
  envelope_array.push(newEnvelope);
  res.status(201).json(newEnvelope);
});

//update an existing envelope - rename envelope title, add/subtract from budget amt
app.put("/envelopes/:id", (req, res, next) => {
  let searchId = Number(req.params.id);
  let dollarAmt = Number(req.query.budget);
  let searchTitle = req.query.title;
  let lastId = envelope_array[envelope_array.length - 1].id;

  //check if user entered id is < or >  range of id's in envelope_array
  if (searchId < 1 || searchId > lastId) {
    return res
      .status(404)
      .send(`Error 404: Envelope ID ${searchId} out of range.`);
  }

  const getArrayIndex = (element) => element.id === searchId;

  //check if user entered id was deleted from envelope_array
  if (envelope_array.findIndex(getArrayIndex) === -1) {
    return res
      .status(404)
      .send(
        `Error 404: Envelope ID ${searchId} was not found. It may have been deleted.`
      );
  }
  const arrayIndex = envelope_array.findIndex(getArrayIndex);
  let searchEnv = envelope_array[arrayIndex];

  if (searchTitle) {
    searchEnv.title = searchTitle;
  }
  if (dollarAmt) {
    //dollarAmt must be neg for deducting $ and pos for adding $
    searchEnv.budget += dollarAmt;
  }
  res.json(searchEnv);
});

app.delete("/envelopes/:id", (req, res, next) => {
  let searchId = Number(req.params.id);
  let lastId = envelope_array[envelope_array.length - 1].id;

  if (searchId < 1 || searchId > lastId) {
    return res
      .status(404)
      .send(`Error 404: Envelope ID ${searchId} out of range.`);
  }
  const getArrayIndex = (element) => element.id === searchId;

  //check if user entered id was deleted from envelope_array
  if (envelope_array.findIndex(getArrayIndex) === -1) {
    return res
      .status(404)
      .send(
        `Error 404: Envelope ID ${searchId} was not found. It may have been deleted.`
      );
  }
  const arrayIndex = envelope_array.findIndex(getArrayIndex);

  envelope_array.splice(arrayIndex, 1);
  res.status(200).send(envelope_array);
});

//specify port number for express server to 'listen' for new requests
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
