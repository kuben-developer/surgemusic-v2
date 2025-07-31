export interface CreditPackage {
  credits: number
  price: number
  priceId: string
}

export interface User {
  _id: string
  userId: string
  email: string
  videoGenerationCredit: number
  videoGenerationAdditionalCredit: number
  subscriptionPriceId?: string
  isTrial?: boolean
}