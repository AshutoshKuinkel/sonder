import { errorHandler } from './middlewares/errorHandler.middleware';
import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { connectFirestore } from './config/db.config';

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT;
const string = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? ''

// db imports
connectFirestore(string)

app.use(
  cors({credentials: true})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes
import memoryRoutes from "./routes/memory.routes";

// use routes
app.use("/api/v1", memoryRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: `Server Home`,
  });
});

app.get("/{*all}", (req: Request, res: Response) => {
  res.status(404).json({
    message: `Cannot ${req.method} @ ${req.url}`,
  });
});

// call error handler
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Live Server: http://localhost:${PORT} `);
});
