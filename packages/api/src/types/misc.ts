import z from "zod";

export function zodTimezone() {
  return z
    .string()
    .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), {
      message: "Invalid IANA timezone",
    });
}
