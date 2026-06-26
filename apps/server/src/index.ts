// Do not remove this import. It is used to ingest environment files.
import "./config/ingestEnvironmentFiles.js";

import express from "express";

import { serverPort } from "./config/index.js";
import { connectMongoose } from "./utils/mongoConfig.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const setup = async () => {
  await connectMongoose();

  app.listen(serverPort, () => {
    console.log("server running", { port: serverPort });
  });
};

setup();
