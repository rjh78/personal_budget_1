//import the express framework
const express = require("express");
//instantiate an express server to variable "app"
const app = express();

const PORT = 3000;

app.get("/", (req, res, next) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
