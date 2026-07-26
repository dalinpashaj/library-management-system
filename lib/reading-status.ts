import { ReadingStatus } from "@prisma/client";

export function isValidReadingStatus(value: string | null | undefined): value is ReadingStatus {
  return value != null && Object.values(ReadingStatus).includes(value as ReadingStatus);
}
