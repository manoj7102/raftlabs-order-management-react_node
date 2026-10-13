import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("PORT must be an integer between 0 and 65535.");
}

createApp().listen(port, "0.0.0.0", () => {
  console.log(`Order API listening on 0.0.0.0:${port}`);
});
