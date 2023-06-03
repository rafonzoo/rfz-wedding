interface Invitation<T> {
  id: string
  date: T
  location: T
  title?: string
  opening?: string
  hours: T
}

interface iWeddingTime {
  akad: string
  marriage: string
}

export interface iWedding extends Invitation<iWeddingTime> {
  groom: iWeddingPerson
  bride: iWeddingPerson
}

interface iWeddingPerson {
  name: string
  fullName: string
  born: string
  address: string
  childOf: string
  parental: {
    father: string
    mother: string
  }
}
