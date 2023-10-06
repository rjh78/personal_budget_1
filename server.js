/*
  Author: Robert Hermann
  Date: October 5, 2023
  Assignment: Personal Budget, part 1 (Codecademy Back End Engineer path)
  Description: personal budget API to track envelopes of 
    money. Can create envelopes, edit them, delete them,
    transfer money between them. 

  TODO List:
    1) refactor code - lots of redundant error checking
    2) implement "total budget" and track that with real-time
        updates
    3) write & read envelope data to/from a database or file to preserve
        data between server sessions
*/

//import the express framework
const express = require("express");

//returns an instance of an Express application. This application
//can then be used to start a server and specify server behavior.
const app = express();

//use middleware to parse request data sent in the body of the request
const bodyParser = require("body-parser");

const PORT = 4001;
const totalBudget = 0;
const envelope_array = [
  { id: 1, title: "Charitable Donations", budget: 50 },
  { id: 2, title: "Mortgage", budget: 3550 },
  { id: 3, title: "Utilities", budget: 350 },
  { id: 4, title: "Food-Market", budget: 275 },
  { id: 5, title: "Food-Eating Out", budget: 150 },
  { id: 6, title: "IRA Contribution", budget: 625 },
  { id: 7, title: "Home", budget: 350 },
];
/*
{"id": 1, "title": "Charitable Donations", "budget": 50},
{"id": 2, "title": "Mortgage", "budget": 3550},
{"id": 3, "title": "Utilities", "budget": 350},
{"id": 4, "title": "Food-Market", "budget": 275},
{"id": 5, "title": "Food-Eating Out", "budget": 150},
{"id": 6, "title": "IRA Contribution", "budget": 625},
{"id": 7, "title": "Home", "budget": 350}
*/
let envId = 8;

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

//move money from the :from id to the :to id
app.put("/envelopes/transfer/:from/:to", (req, res, next) => {
  let fromId = Number(req.params.from);
  let toId = Number(req.params.to);
  let moveAmt = Number(req.query.budget);
  let lastId = envelope_array[envelope_array.length - 1].id;

  if (fromId < 1 || fromId > lastId || toId < 1 || toId > lastId) {
    return res
      .status(404)
      .send(`Error 404: 'from' id or 'to' id is out of range.`);
  }

  const getArrayIndexFrom = (element) => element.id === fromId;
  const getArrayIndexTo = (element) => element.id === toId;

  if (
    envelope_array.findIndex(getArrayIndexFrom) === -1 ||
    envelope_array.findIndex(getArrayIndexTo) === -1
  ) {
    return res
      .status(404)
      .send(
        `Error 404: 'from' id or 'to' id was not found. It may have been deleted.`
      );
  }

  const arrayIndexFrom = envelope_array.findIndex(getArrayIndexFrom);
  const arrayIndexTo = envelope_array.findIndex(getArrayIndexTo);

  envelope_array[arrayIndexFrom].budget =
    envelope_array[arrayIndexFrom].budget - moveAmt;

  envelope_array[arrayIndexTo].budget =
    envelope_array[arrayIndexTo].budget + moveAmt;

  res.status(200).send(envelope_array);
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
