import { Express, Request } from "express";

declare global {
	namespace Express {
		interface Request {
			user: {
				id: string;
				email: string;
                provider_id: string;
			};
		}
	}
}
