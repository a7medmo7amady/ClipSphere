import morgan from "morgan";
import config from "../config/env";

const format = config.env === "production" ? "combined" : "dev";

const requestLogger = morgan(format);

export default requestLogger;

