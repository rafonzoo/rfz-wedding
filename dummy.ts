import type { WeddingAdd } from '@wedding/schema'

export const DUMMY_WEDDING_NAME = 'claire-leon' as const

export const DUMMY_EVENT = {
  id: 0,
  date: '2024-04-07T17:14:17.301Z',
  eventName: 'Akad',
  timeStart: '11:00',
  timeEnd: '13:00',
  placeName: 'GOR Soemantry',
  district: 'Kuningan',
  province: 'Jakarta',
  country: 'Indonesia',
  opensTo: '',
  localTime: 'WIB',
  detail: 'asdasdasdasd',
  mapUrl: '',
}

export const DUMMY_INVITATION: WeddingAdd = {
  name: DUMMY_WEDDING_NAME,
  wid: /* OPTIONAL */ void 0,
  userId: /* OPTIONAL */ void 0,
  status: 'draft',
  guests: [
    {
      id: 1,
      name: 'GGRFZ Team',
      slug: 'GGRFZ-Team',
      token: '123456',
    },
    // {
    //   name: 'Jim',
    //   reaction: /* OPTIONAL */ ['smile'],
    //   comment: /* OPTIONAL */ 'Congrats',
    //   avatar: /* OPTIONAL */ 'default',
    //   rsvp: /* OPTIONAL */ {
    //     attendance: true,
    //     length: 2,
    //     message: /* OPTIONAL */ 'Siap laksanakan!',
    //     validGuest: /* OPTIONAL */ false,
    //   },
    // },
  ],
  comments: [
    {
      text: 'Thank you for letting us share in this joyful day! May the joy of your new home be filled with laughter, smiles, kisses, hugs, respect understanding and faithfulness. Happy wedding!',
      alias: 'GGRFZ Team',
    },
  ],
  createdAt: /* OPTIONAL */ void 0,
  updatedAt: /* OPTIONAL */ void 0,
  stories: /* OPTIONAL */ '',
  music: /* NULLABLE */ null,
  galleries: [],
  events: [DUMMY_EVENT],
  couple: [
    {
      id: 0,
      fullName: 'Claire Redfield',
      nameOfFather: 'Joe Redfield',
      nameOfMother: 'Marsinah',
      socialUrl: {
        facebook: /* OPTIONAL */ 'http://localhost:3000',
      },
      biography: /* OPTIONAL */ 'Claire is the one that blah...',
      order: 2,
    },
    {
      id: 1,
      fullName: 'Leon S. Kennedy',
      nameOfFather: 'Scott Kennedy',
      nameOfMother: 'Sutiyem',
      socialUrl: {
        instagram: /* OPTIONAL */ 'http://localhost:3000',
      },
      biography: /* OPTIONAL */ 'Claire is the one that blah...',
      order: 1,
    },
  ],
  loadout: {
    theme: 'tropical',
    foreground: 'fall',
    background: 'white',
  },
  surprise: `
    Jika memberi merupakan tanda kasih, kami dengan senang hati menerima dan tentunya akan menambah kebahagiaan kami.

    ## Alamat
    - Kediaman **John Doe**: \
    Jl. H. R. Rasuna Said No.10b, RT.2/RW.5, Kuningan, Karet Kuningan, Kecamatan Kuningan, Kabupaten Kuningan, Daerah Khusus Ibukota Jakarta 12950

    ## Transfer
    - Bank BNI - **John Doe** \
    *copy: 9213 1323 2312 0292*

    - Bank Mandiri - **Lauren S.** \
    *copy: 9213 1323 2312 1234*

    ## Ewallet
    - Gopay: *copy:0899 9999 9999*
    - OVO: *copy:0899 9999 9999*
    - Emoney: *copy:0899 9999 9999*
  `,
}
