import { z } from 'zod'

const bodySchema = z.object({
  endpoint: z.string().url()
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { endpoint } = await readValidatedBody(event, bodySchema.parse)

  await removeSubscription(endpoint, userId)

  return { success: true }
})