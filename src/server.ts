import app from "./app";
import { config } from "./config";

const port = config.server.port || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});