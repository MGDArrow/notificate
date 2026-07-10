import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100)
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { name } = await readValidatedBody(event, bodySchema.parse)

  const group = await createGroup(name.trim(), userId)

  return {
    groupName: group.name,
    publicKey: group.publicKey,
    secretKey: group.secretKey
  }
})