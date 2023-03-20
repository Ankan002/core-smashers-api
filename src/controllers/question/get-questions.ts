import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";
import { z } from "zod";

const RequestQueryParamsSchema = z.object({
	pageNumber: z.string().optional(),
	pageSize: z.string().optional(),
	topic: z
		.union([z.literal("thermo_dynamics"), z.literal("strength_of_material"), z.literal("fluid_dynamics")])
		.optional(),
	difficulty: z.union([z.literal("easy"), z.literal("medium"), z.literal("hard")]).optional(),
});

export const getQuestions = async (req: Request, res: Response) => {
	const requestQueryParamsVerficationResult = RequestQueryParamsSchema.safeParse(req.query);

	let pageNumber = 1;
	let pageSize = 15;

	let difficulty: "easy" | "medium" | "hard" | null = null;
	let topic: "thermo_dynamics" | "strength_of_material" | "fluid_dynamics" | null = null;

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
		if (reqQueryParams.topic) topic = reqQueryParams.topic;
		if (reqQueryParams.difficulty) difficulty = reqQueryParams.difficulty;

		const prismaClient = getPrismaClient();

		const questions = await prismaClient.question.findMany({
			where: {
				topic: {
					in: topic ? topic : ["fluid_dynamics", "strength_of_material", "thermo_dynamics"],
				},
				difficulty: {
					in: difficulty ? difficulty : ["easy", "medium", "hard"],
				},
			},
			skip: pageSize * (pageNumber - 1),
			take: pageSize,
			select: {
				id: true,
				question: true,
				difficulty: true,
				topic: true,
				option_one: true,
				option_two: true,
				option_three: true,
				option_four: true,
			}
		});

		return res.status(200).json({
			success: true,
			data: {
				questions,
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
			error: "Internal Server Erro!!",
		});
	}
};
