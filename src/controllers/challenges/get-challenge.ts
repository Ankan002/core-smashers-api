import { getPrismaClient } from "config/get-prisma-client";
import { Request, Response } from "express";
import { logger } from "utils/logger";
import { z } from "zod";

const RequestParamSchema = z.object({
	id: z.string().uuid(),
});

export const getChallenge = async (req: Request, res: Response) => {
	const requestParamSchemaVerificationResult = RequestParamSchema.safeParse(req.params);

	if (!requestParamSchemaVerificationResult.success) {
		return res.status(400).json({
			success: false,
			error: requestParamSchemaVerificationResult.error.errors[0]?.message,
		});
	}

	const { id } = requestParamSchemaVerificationResult.data;

	try {
		const prismaClient = getPrismaClient();

		const challenge = await prismaClient.challenge.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				name: true,
				total_marks: true,
				type: true,
				start_time: true,
				end_time: true,
				Question: {
					select: {
						id: true,
						question: true,
						difficulty: true,
						topic: true,
						option_one: true,
						option_two: true,
						option_three: true,
						option_four: true,
					},
				},
			},
		});

		if (!challenge) {
			return res.status(400).json({
				success: false,
				error: "No challenge record found!!",
			});
		}

		const currentMilliseconds = new Date().getTime();

		if (Number(challenge.start_time) > currentMilliseconds || Number(challenge.end_time) < currentMilliseconds) {
			return res.status(401).json({
				success: false,
				error: "Access to competition denied!!",
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				challenge,
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

		return res.status(500).json({
			success: false,
			error: "Internal Server Error!!",
		});
	}
};
