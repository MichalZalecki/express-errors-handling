import express from "express";
import Boom from "boom";

interface Request<TParams, TBody> extends express.Request {
  params: TParams;
  body: TBody;
}

declare global {
  type RouteHandler<TParams, TBody> = (req: Request<TParams, TBody>, res: express.Response) =>
    | void | express.Response | Boom<any>
    | Promise<void | express.Response | Boom<any>>;
}
