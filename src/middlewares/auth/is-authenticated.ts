import { NextFunction, Request, Response } from "express";
import { logger } from "utils/logger";
import jwt, {JwtPayload} from "jsonwebtoken";

interface UserJWTPayload extends JwtPayload {
    user: {
        id: string;
        email: string;
        provider_id: string;
    }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	const authToken = req.headers["authToken"];

	if (!authToken) {
		return res.status(401).json({
			success: false,
			error: "Access Denied",
		});
	}

	try {
        const data = jwt.verify(authToken as string, process.env["JWT_SECRET"] ?? "") as UserJWTPayload;

        req.user = data.user;

        return next();
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);

			return res.status(400).json({
				success: false,
				error: error.message,
			});
		}

		logger.error(error);

		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
};
