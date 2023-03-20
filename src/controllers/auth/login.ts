import { Request, Response } from "express";
import { z } from "zod";
import { logger } from "utils/logger";
import { getPrismaClient } from "config/get-prisma-client";
import jwt from "jsonwebtoken";

const RequestBodySchema = z.object({
	name: z
		.string()
		.min(3, { message: "The name should be at least 3 characters long" })
		.max(50, { message: "The name should be at most 50 characters long" }),
	email: z.string().email({ message: "Please provide a valid email id" }),
	provider_id: z.string(),
});

export const login = async (req: Request, res: Response) => {
	const requestBodyValidationResult = RequestBodySchema.safeParse(req.body);

	if (!requestBodyValidationResult.success) {
		return res.status(400).json({
			success: false,
			error: requestBodyValidationResult.error.errors[0]?.message,
		});
	}

	const requestBody = requestBodyValidationResult.data;

	try {
		const prisamClient = getPrismaClient();
		const retrievedUser = await prisamClient.user.findUnique({
			where: {
				provider_id: requestBody.provider_id,
			},
			select: {
				id: true,
				email: true,
				provider_id: true,
			},
		});

		if (retrievedUser) {
			const dataToBeEncryptedInToken = {
				user: retrievedUser,
			};
	
			const jwtToken = jwt.sign(dataToBeEncryptedInToken, process.env["JWT_SECRET"] ?? "");
	
			return res.status(200).setHeader("authToken", jwtToken).json({
				success: true,
			});
		}

		const createdUser = await prisamClient.user.create({
			data: {
				email: requestBody.email,
				name: requestBody.name,
				provider_id: requestBody.provider_id,
				username: requestBody.email.split("@")[0] + "_gal",
				avatar: `https://api.dicebear.com/5.x/avataaars/png?seed=${requestBody.email.split("@")[0]}`,
			},
			select: {
				id: true,
				email: true,
				provider_id: true,
			},
		});

		await prisamClient.profile.create({
			data: {
				userId: createdUser.id,
			},
		});

		const dataToBeEncryptedInToken = {
			user: createdUser,
		};

		const jwtToken = jwt.sign(dataToBeEncryptedInToken, process.env["JWT_SECRET"] ?? "");

		return res.status(200).setHeader("authToken", jwtToken).json({
			success: true,
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
