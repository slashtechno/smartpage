import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { userMiddleware } from "../middleware";
import { decode, sign, verify } from 'hono/jwt'
import { InitialUploadSchema } from "../types/misc";
import { generateBlobPath, getJwtToken, getPresignedImageUploadUrl, JWT_SECRET } from "../storage";

export const storageApp = new Hono().post(
  "/",
  userMiddleware,
  sValidator("json", InitialUploadSchema),
  async (c) => {
    // .var and .get are basically the same, just dot notation and string keys respectively

    const user = c.var.user;
    const body = c.req.valid("json");

    const uploadPath = generateBlobPath(user.id, body.imageFormat);
    const {presignedUrl} = await getPresignedImageUploadUrl(uploadPath);
    // probably a bad idea to use the ai gateway key, but it's high-entropy, I would hope
    const jwtToken = await getJwtToken(uploadPath, user.id, JWT_SECRET);
    return c.json(
      {
        presignedUrl,
        jwtToken,
      },
      200,
    ); 

  },
);


