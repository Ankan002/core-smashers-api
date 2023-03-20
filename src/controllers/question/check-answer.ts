import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";
import { z } from "zod";

const RequestBodySchema = z.object({
	question_id: z.string().uuid(),
	selected_option: z.union([
		z.literal("option_one"),
		z.literal("option_two"),
		z.literal("option_three"),
		z.literal("option_four"),
	]),
});

export const checkAnswer = async (req: Request, res: Response) => {
	const requestBodySchemaValidationResult = RequestBodySchema.safeParse(req.body);
	const user = req.user;

	if (!requestBodySchemaValidationResult.success) {
		return res.status(400).json({
			success: false,
			error: requestBodySchemaValidationResult.error.errors[0]?.message,
		});
	}

	const requestBody = requestBodySchemaValidationResult.data;

	try {
		const prismaClient = getPrismaClient();

		const question = await prismaClient.question.findUnique({
			where: {
				id: requestBody.question_id,
			},
			select: {
				correct_option: true,
			},
		});

		if (!question) {
			return res.status(400).json({
				success: false,
				error: "No such question exists...",
			});
		}

		const hasWon = requestBody.selected_option === question.correct_option;

		await prismaClient.questionAttempted.create({
			data: {
				questionId: requestBody.question_id,
				userId: user.id,
				result: hasWon ? "correct" : "wrong",
			},
		});

		return res.status(200).json({
			success: true,
			data: {
				result: hasWon ? "correct" : "wrong",
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
