import { generateHandler } from './handler'

export async function POST(req: Request): Promise<Response> {
  return generateHandler(req)
}
