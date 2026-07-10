import { removeSubscription } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { endpoint } = await readBody(event)
  await removeSubscription(endpoint)
  return { success: true }
})