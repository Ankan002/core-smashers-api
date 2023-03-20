import express from "express";
import cors from "cors";
import { logger } from "utils/logger";
import { morganConfig } from "middlewares/morgan";

export const startServer = () => {
	const app = express();
	const PORT = process.env["PORT"];

	app.use(cors());
	app.use(express.json());
	app.use(morganConfig);

	app.get("/", (req, res) => {
		return res.status(200).json({
			success: true,
			message: "Hello from API",
		});
	});

	app.listen(8000, () => logger.info(`App is running at ${PORT}`));
};
