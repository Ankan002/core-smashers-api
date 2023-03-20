import express from "express";
import cors from "cors";
import { logger } from "utils/logger";
import { morganConfig } from "middlewares/morgan";
import { authRouter } from "routes/auth";
import { questionRouter } from "routes/question";
import { userRouter } from "routes/user";

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

	app.use("/api/auth", authRouter);
	app.use("/api/question", questionRouter);
	app.use("/api/user", userRouter);

	app.listen(8000, () => logger.info(`App is running at ${PORT}`));
};
