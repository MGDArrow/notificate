
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const groups = await getGroupsByUserId(userId)
  return groups.map(g => ({
    id: g.id,
    name: g.name,
    publicKey: g.publicKey,
    secretKey: g.secretKey,
    createdAt: g.createdAt
  }))
})