import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";
import { z } from "zod";

const RequestQueryParamsSchema = z.object({
	pageNumber: z.string().optional(),
	pageSize: z.string().optional(),
});

export const getPracticeHistory = async (req: Request, res: Response) => {
	const requestQueryParamsVerficationResult = RequestQueryParamsSchema.safeParse(req.query);
	const user = req.user;

	let pageNumber = 1;
	let pageSize = 15;

	if (!requestQueryParamsVerficationResult.success) {
		return res.status(400).json({
			success: false,
			error: requestQueryParamsVerficationResult.error.errors[0]?.message,
		});
	}

	const reqQueryParams = requestQueryParamsVerficationResult.data;
	try {
		if (
			reqQueryParams.pageSize &&
			parseInt(reqQueryParams.pageSize) >= 1 &&
			parseInt(reqQueryParams.pageSize) <= 100
		)
			pageSize = parseInt(reqQueryParams.pageSize);
		if (reqQueryParams.pageNumber && parseInt(reqQueryParams.pageNumber) >= 1)
			pageNumber = parseInt(reqQueryParams.pageNumber);

		const prismaClient = getPrismaClient();

		const practiceHistory = await prismaClient.questionAttempted.findMany({
			where: {
				userId: user.id,
			},
			select: {
				id: true,
				question: {
					select: {
						question: true,
					}
				},
				result: true,
			},
			skip: pageSize * (pageNumber - 1),
			take: pageSize,
		});

		return res.status(200).json({
			success: true,
			data: {
				practiceHistory,
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
