import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import path from "path";


const app = express();
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(
  cors({
    origin: "*",
    'https://scope-shift.vercel.app/',
  })
);
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/api", routes);
app.use(errorHandler);
export default app;
