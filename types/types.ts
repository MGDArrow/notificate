export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Group {
  id: number
  name: string
  publicKey: string
  secretKey: string
  userId: number
  createdAt: string
}

export interface Subscription {
  id: number
  endpoint: string
  keys: any
  userId: number | null
  groups: GroupSubscription[]
  createdAt: string
}

export interface GroupSubscription {
  id: number
  groupId: number
  subscriptionId: number
  group: Group
  subscription: Subscription
  createdAt: string
}

export interface Message {
  id: number
  text: string
  timestamp: string
  groupId: number
}