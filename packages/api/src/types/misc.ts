import z from "zod";

export function zodTimezone() {
  return z
    .string()
    .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), {
      message: "Invalid IANA timezone",
    });
}

export type UploadJwtPayload = {
  sub: string; // user ID
  exp: number; // expiration timestamp in seconds
  uploadPath: string; // path the user is allowed to upload to in blob
};

export const InitialUploadSchema = z.object({
  imageFormat: z.enum(["jpg", "png"]), // intellisense on the expo image.format states it is either `jpg` or `png`
});