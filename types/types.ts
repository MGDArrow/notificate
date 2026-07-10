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
  groupId: number
  userId: number
  group: Group
  createdAt: string
}

export interface Message {
  id: number
  text: string
  timestamp: string
  groupId: number
}