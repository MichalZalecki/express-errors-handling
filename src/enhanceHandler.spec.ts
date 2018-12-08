import Boom from "boom";
import noop from "lodash/noop";
import { enhanceHandler } from "./enhanceHandler";

describe("enhanceHandler", () => {
  let res: any;

  beforeEach(() => {
    res = {
      send: jest.fn(() => res),
      status: jest.fn(() => res),
    };
  });

  afterEach(() => {
    res.send.mockClear();
    res.status.mockClear();
  });

  it("formats returned Boom error", async () => {
    await enhanceHandler(() => Boom.notFound())({} as any, res, jest.fn());
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith({
      error: "Not Found",
      message: "Not Found",
      statusCode: 404,
    });
  });

  it("formats additional Boom error data", async () => {
    await enhanceHandler(() => Boom.badRequest("FooBar", { foo: "bar" }))({} as any, res, noop);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({
      error: "Bad Request",
      message: "FooBar",
      statusCode: 400,
      data: {
        foo: "bar",
      },
    });
  });

  it("responds with 500 status and stack on error", async () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const error = new Error("Bug!");
    await enhanceHandler(() => { throw error; })({} as any, res, noop);
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith(error.stack);
    process.env.NODE_ENV = env;
  });

  it("responds with 500 status and message on error when stack isn't present", async () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const error = new Error("Bug!");
    error.stack = "";
    await enhanceHandler(() => { throw error; })({} as any, res, noop);
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith(error.message);
    process.env.NODE_ENV = env;
  });

  it("responds standard internal Boom error in production", async () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    await enhanceHandler(() => { throw new Error("Bug!"); })({} as any, res, noop);
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      error: "Internal Server Error",
      message: "An internal server error occurred",
      statusCode: 500,
    });
    process.env.NODE_ENV = env;
  });

  it("responds standard internal Boom error when there is no stack and message", async () => {
    const error = new Error("");
    error.stack = "";
    await enhanceHandler(() => { throw error; })({} as any, res, noop);
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      error: "Internal Server Error",
      message: "An internal server error occurred",
      statusCode: 500,
    });
  });
});
