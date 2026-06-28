// Do not remove this import. It is used to ingest environment files.
import "./config/ingestEnvironmentFiles.js";

import express from "express";

import { serverPort } from "./config/index.js";
import { connectMongoose } from "./config/mongoConfig.js";
import { v1Router } from "./routes/v1/index.js";

const app = express();

app.use(express.json());

app.get("/", (_, res) => res.send("Welcome to the Hop server."));
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/v1", v1Router);

const setup = async () => {
  await connectMongoose();

  app.listen(serverPort, () => {
    console.log("server running", { port: serverPort });
  });
};

setup();
