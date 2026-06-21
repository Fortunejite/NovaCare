import { z } from "zod";
import { labTests } from "../../shared";

export const createLabRequestSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  testType: z.enum(labTests, "Test type is required"),
});

export type CreateLabRequestSchemaDto = z.infer<typeof createLabRequestSchema>;

export const labRequestStatusSchema = z.enum(labTests)

export const createLabResultSchema = z.object({
  labRequestId: z.string().min(1, "Lab Request ID is required"),
  result: z.string().min(1, "Result is required"),
});

export type CreateLabResultSchemaDto = z.infer<typeof createLabResultSchema>;