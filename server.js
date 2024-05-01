const express = require("express");
const app = express();
// const db = require("db");
const mysql = require("mysql");
const path = require("path");
const db = mysql.createConnection({
  hostname: "localhost",
  username: "root",
  password: "",
  database: "ftext",
});

app.use(express.static("public"));
app.use(express.json());
const start = () => {
  try {
    app.listen(8000, () => {
      console.log("server started at port 8000..");
    });
  } catch (error) {
    console.log(error);
  }
};
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as id " + db.threadId);
});
db.query("create database if not exists ftext", function (err) {
  if (err) {
    throw err;
  }
  console.log("db created successfully");
});
db.query(
  "create table if not exists text (id varchar(6) primary key, content varchar(10000))",
  function (err) {
    if (err) {
      throw err;
    }
    console.log("table created successfully");
  }
);

app.post("/text", (req, res) => {
  const { id, content } = req.body;
  if (typeof id !== "string" || typeof content !== "string") {
    res.status(400).json({ error: "Invalid data types" });
    return;
  }
  db.query(
    "insert into text (id, content) values (?, ?)",
    [id, content],
    (err, result) => {
      if (err) throw err;
      res.status(201).json("data inserted successfully");
    }
  );
});

app.get("/text.html/:id", (req, res) => {
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "invalid id" });
  }
  db.query(`select content from text where id = ?`, id, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(404).json({ error: "content not found" });
    }
    console.log("content", result[0]);
    // res.status(200).send(result[0]);
    const content = result[0];
    res.sendFile(path.join(__dirname, "public/text.html"), { content });
  });
});

// db.end();
start();
