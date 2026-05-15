import { AppType } from "api"
import { hc } from 'hono/client'
import { fetch } from 'expo/fetch';


export const client = hc<AppType>('http://localhost:3000/',
  { fetch: fetch })
