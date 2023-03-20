import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";

export const getProfile = async (req: Request, res: Response) => {
	const user = req.user;

	try {
		const prismaClient = getPrismaClient();
		const userProfile = await prismaClient.profile.findFirst({
			where: {
				userId: user.id,
			},
			select: {
				id: true,
				branch: true,
				institution: true,
				current_rating: true,
				streak: true,
				userId: true,
			},
		});

		return res.status(200).json({
			success: true,
			data: {
				user_profile: userProfile,
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
