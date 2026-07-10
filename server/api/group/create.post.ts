import { createGroup } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const { name } = await readBody(event)
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createError({ status: 400, message: 'Название группы обязательно' })
  }
  const group = await createGroup(name.trim())
  return {
    groupName: group.name,
    publicKey: group.publicKey,
    secretKey: group.secretKey
  }
})