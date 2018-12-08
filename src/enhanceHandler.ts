import express from "express";
import Boom from "boom";
import isNil from "lodash/isNil"

function formatBoomPayload(error: Boom<any>) {
  return {
    ...error.output.payload,
    ...(isNil(error.data) ? {} : { data: error.data }),
  }
}

export function enhanceHandler<T, P>(handler: RouteHandler<T, P>) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const result = await handler(req, res);
      if (result instanceof Error && Boom.isBoom(result)) {
        res.status(result.output.statusCode).send(formatBoomPayload(result));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production" && (error.stack || error.message)) {
        res.status(500).send(error.stack || error.message);
      } else {
        res.status(500).send(Boom.internal().output.payload);
      }
    }
    next();
  };
}
