import { z } from "zod";

/**
 * The schema for the query parameters
 */
export const metricsQuerySchema = z.object({
    ipAddress: z.string().ip(),
    periodDays: z.number().int().min(1).max(14),
    period: z.number().int().min(60).max(86400)
  });

/**
 * Validate the query parameters
 * @param query - The query parameters
 * @returns The validated query parameters
 */
function validateRequestQuery({ query }: { query: any }) {
    const result = metricsQuerySchema.safeParse(query);
    if (!result.success) {
        return { 
            success: false, 
            status: 400, 
            error: result.error.errors[0].message 
        };
    }
    return { success: true, status: 200 };
}
  
export {
    validateRequestQuery
};