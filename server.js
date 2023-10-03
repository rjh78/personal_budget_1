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
//  { title: "Rent", budget: 1300 },
//  { title: "Groceries", budget: 260 },
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

//specify port number for express server to 'listen' for new requests
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
