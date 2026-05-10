import { AppType } from "api"
import { hc } from 'hono/client'

export const client = hc<AppType>('http://localhost:3000/')
