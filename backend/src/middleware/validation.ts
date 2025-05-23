import { z } from "zod";

const ALLOWED_TIME_RANGES = [
    'Last Hour',
    'Last 6 Hours',
    'Last 12 Hours',
    'Last Day',
    'Last 7 Days'
] as const;

/**
 * The schema for the query parameters
 */
export const metricsQuerySchema = z.object({
    ipAddress: z.string().ip(),
    timeRange: z.enum(ALLOWED_TIME_RANGES, {
        errorMap: () => ({ message: 'Invalid timeRange. Must be one of: ' + ALLOWED_TIME_RANGES.join(', ') })
    }),
    period: z.number().int().min(60).max(86400)
});

/**
 * Validate the query parameters
 * @param query - The query parameters
 * @returns The validated query parameters
 */
function validateRequestQuery({ query }: { query: any }) {
    console.log('[Validation] Validating request query:', query);
    
    const result = metricsQuerySchema.safeParse(query);
    if (!result.success) {
        console.log('[Validation] Validation failed:', result.error.errors[0].message);
        return { 
            success: false, 
            status: 400, 
            error: result.error.errors[0].message 
        };
    }
    
    console.log('[Validation] Validation successful');
    return { success: true, status: 200 };
}
  
export {
    validateRequestQuery
};