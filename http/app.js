import express from "express";
import { engine } from "express-handlebars";
import { errorHandler } from "./middlewares/error-handler.js";
import { requestId } from "./middlewares/request-id.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { routeNotFound } from "./middlewares/route-not-found.js";
import { router } from "./router.js";

export const app = express();

app.engine("hbs", engine({ extname: "hbs" }));
app.set("view engine", "hbs");
app.set("views", "views");

app.use(requestId());
app.use(requestLogger());

app.use(express.static("public"));
app.use("/css", express.static("node_modules/bootstrap/dist/css"));
app.use("/js", express.static("node_modules/bootstrap/dist/js"));

app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(routeNotFound);
app.use(errorHandler);
