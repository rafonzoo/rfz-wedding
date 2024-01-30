import { isLocal } from '@/tools/helper'

export class AppError extends Error {
  public readonly name: string
  public readonly message: string

  constructor(name: string, message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.message = ''

    Error.captureStackTrace?.(this)
    if (isLocal()) this.message = message ?? ''
  }
}
