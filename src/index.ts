import express from "express";
import bodyParser from "body-parser";
import Boom from "boom";
import { Joi, celebrate, errors } from "celebrate";
import { enhanceHandler } from "./enhanceHandler";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

type CreateSessionBody = { email: string, password: string };

const createSession: RouteHandler<{}, CreateSessionBody> = (req, res) => {
  const { email, password } = req.body;
  if (password !== "password") {
    return Boom.unauthorized("Invalid password");
  }
  res.status(201).send({ email, password });
};

const createSessionBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

app.post("/session", celebrate({ body: createSessionBodySchema }), enhanceHandler(createSession));

app.use(errors());

app.listen(PORT, () => {
  console.log(`Server listens on port: ${PORT}`);
});
