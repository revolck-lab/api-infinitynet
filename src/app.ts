import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { routes } from "./routes";
import { AppError } from "./shared/errors/AppError";
import { loggerMiddleware } from "./shared/middlewares/logger.middleware";

dotenv.config();

class App {
  public app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(loggerMiddleware);
  }

  private routes(): void {
    this.app.use("/api", routes);
  }

  private errorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: "Rota não encontrada" });
    });

    // Error handling middleware
    this.app.use(
      (
        err: Error | AppError,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
          });
        }

        console.error(err.stack);
        return res.status(500).json({
          status: "error",
          message: "Erro interno do servidor",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor rodando na porta ${this.port}`);
    });
  }
}

const app = new App();
app.start();

export default app.app;
