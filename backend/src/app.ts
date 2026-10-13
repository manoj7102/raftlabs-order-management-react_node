import { timingSafeEqual } from "node:crypto";
import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import { MENU } from "./menu";
import { OrderStore } from "./order-store";
import {
  parseOrderRequest,
  parseStatusRequest,
  ValidationError,
} from "./validation";

export interface AppOptions {
  adminToken?: string;
  frontendOrigin?: string;
}

function tokensMatch(expected: string, supplied: string | undefined): boolean {
  if (!supplied) return false;
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return (
    expectedBytes.length === suppliedBytes.length &&
    timingSafeEqual(expectedBytes, suppliedBytes)
  );
}

export function createApp(
  store: OrderStore = new OrderStore(),
  options: AppOptions = {},
) {
  const app = express();
  const adminToken = options.adminToken ?? process.env.ORDER_ADMIN_TOKEN;
  const frontendOrigin = options.frontendOrigin ?? process.env.FRONTEND_ORIGIN;
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  if (frontendOrigin) {
    const configured = new URL(frontendOrigin);
    if (configured.protocol !== "http:" && configured.protocol !== "https:") {
      throw new Error("FRONTEND_ORIGIN must be an HTTP or HTTPS origin.");
    }
    allowedOrigins.add(configured.origin);
  }

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.has(origin));
      },
    }),
  );
  app.use(express.json({ limit: "20kb" }));
  app.use("/api/orders", (_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  function authorizeOrder(request: Request, response: Response): boolean {
    const id = request.params.id;
    if (!id || !store.getOrder(id)) {
      response.status(404).json({ error: "Order not found." });
      return false;
    }
    if (!store.verifyOrderToken(id, request.get("X-Order-Token"))) {
      response.status(401).json({ error: "Order token required or invalid." });
      return false;
    }
    return true;
  }

  app.get("/api/menu", (_request, response) => {
    response.json(MENU);
  });

  app.post("/api/orders", (request, response) => {
    try {
      const { customer, items } = parseOrderRequest(request.body, MENU);
      response.status(201).json(store.createOrder(customer, items));
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      response.status(400).json({ error: error.message, field: error.field });
    }
  });

  app.get("/api/orders", (request, response) => {
    if (!adminToken) {
      response.status(503).json({ error: "Order listing unavailable." });
      return;
    }
    if (!tokensMatch(adminToken, request.get("X-Admin-Token"))) {
      response.status(401).json({ error: "Admin token required or invalid." });
      return;
    }
    response.json(store.listOrders());
  });

  app.get("/api/orders/:id", (request, response) => {
    if (!authorizeOrder(request, response)) return;
    const order = store.getOrder(request.params.id);
    response.json(order);
  });

  app.delete("/api/orders/:id", (request, response) => {
    if (!authorizeOrder(request, response)) return;
    store.deleteOrder(request.params.id);
    response.status(204).send();
  });

  app.patch("/api/orders/:id/status", (request, response) => {
    if (!authorizeOrder(request, response)) return;
    let status;
    try {
      status = parseStatusRequest(request.body);
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      response.status(400).json({ error: error.message, field: error.field });
      return;
    }

    const result = store.updateStatus(request.params.id, status);
    if (result.kind === "not-found") {
      response.status(404).json({ error: "Order not found." });
    } else if (result.kind === "invalid-transition") {
      response.status(409).json({
        error: `Cannot move from ${result.currentStatus} to ${status}.`,
        currentStatus: result.currentStatus,
      });
    } else {
      response.json(result.order);
    }
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found." });
  });

  const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request,
    response,
    next,
  ) => {
    if (error instanceof SyntaxError) {
      response.status(400).json({ error: "Invalid JSON body." });
      return;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      error.type === "entity.too.large"
    ) {
      response.status(413).json({ error: "Request body is too large." });
      return;
    }
    next(error);
  };
  app.use(errorHandler);

  return app;
}
