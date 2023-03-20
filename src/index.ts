import { config as dotenvConfig } from "dotenv";
import { startServer } from "./app";

dotenvConfig();
startServer();
