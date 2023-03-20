import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";

export const getUser = async (req: Request, res: Response) => {
	const user = req.user;

	try {
		const prismaClient = getPrismaClient();

		const retrievedUser = await prismaClient.user.findUnique({
			where: {
				id: user.id,
			},
			select: {
				id: true,
				avatar: true,
				name: true,
				email: true,
				username: true,
				provider_id: true,
			},
		});

		return res.status(200).json({
			success: true,
			data: {
				user: retrievedUser,
			},
		});
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
			error: "Internal Server Error!!",
		});
	}
};
