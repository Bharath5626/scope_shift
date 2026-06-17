import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";


const app = express();
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/api", routes);
app.use(errorHandler);
export default app;