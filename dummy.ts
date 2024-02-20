import type { WeddingAdd } from '@wedding/schema'
import { djs } from '@/tools/lib'

export const DUMMY_NAME = 'laura-john' as const

export const DUMMY_EVENT = {
  id: 1,
  date: djs().tz().add(3, 'M').toISOString(),
  eventName: 'Resepsi',
  timeStart: '11:00',
  timeEnd: '13:00',
  placeName: 'GOR -- Sumantri',
  district: 'Kuningan',
  province: 'Jakarta',
  opensTo: '',
  localTime: 'WIB',
  detail:
    'Jl. H. R. Rasuna Said No.10b, RT.2/RW.5, Kuningan, Karet Kuningan, Kecamatan Kuningan, Kabupaten Kuningan, Daerah Khusus Ibukota Jakarta 12950',
}

export const DUMMY_GUEST = {
  id: 1,
  name: 'RFZ Team',
  slug: 'RFZ-Team',
  token: '123456',
}

export const DUMMY_COMMENT = {
  text: 'Thank you for letting us share in this joyful day! May the joy of your new home be filled with laughter, smiles, kisses, hugs, respect understanding and faithfulness. Happy wedding!',
  alias: 'RFZ Team',
  token: '123456',
  isComing: 'no' as const,
}

export const DUMMY_INVITATION: WeddingAdd = {
  name: DUMMY_NAME,
  wid: /* OPTIONAL */ void 0,
  userId: /* OPTIONAL */ void 0,
  status: 'draft',
  guests: [DUMMY_GUEST],
  comments: [DUMMY_COMMENT],
  createdAt: /* OPTIONAL */ void 0,
  updatedAt: /* OPTIONAL */ void 0,
  music: /* NULLABLE */ null,
  galleries: [],
  events: [DUMMY_EVENT],
  displayName: DUMMY_NAME.replace(/-/g, ' & '),
  payment: [],
  couple: [
    {
      id: 0,
      fullName: 'Laura Caldwell',
      nameOfFather: 'Jack Caldwell',
      nameOfMother: 'Kye Morton',
      order: 2,
      socialUrl: {
        facebook: /* OPTIONAL */ 'http://localhost:3000',
      },
    },
    {
      id: 1,
      fullName: 'John L. Doe',
      nameOfFather: 'Steve Ramsey',
      nameOfMother: 'Alivia Atkins',
      order: 1,
      socialUrl: {
        instagram: /* OPTIONAL */ 'http://localhost:3000',
      },
    },
  ],
  loadout: {
    theme: 'tropical',
    foreground: 'fall',
    background: 'white',
  },
  stories:
    /* OPTIONAL */ '## First met (2022)\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Tunangan (2023)\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Pernikahan (2024)\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ❤️❤️✨🫥🫥',
  surprise:
    /* OPTIONAL */ 'Jika memberi merupakan tanda kasih, kami dengan senang hati menerima dan tentunya akan menambah kebahagiaan kami.\n\n## Alamat\n- Kediaman **John Doe**: Jl. H. R. Rasuna Said No.10b, RT.2/RW.5, Kuningan, Karet Kuningan, Kecamatan Kuningan, Kabupaten Kuningan, Daerah Khusus Ibukota Jakarta 12950\n\n## Transfer\n- Bank BNI - **John Doe** *copy: 9213 1323 2312 0292*\n\n- Bank Mandiri - **Lauren S.** *copy: 9213 1323 2312 1234*\n\n## Ewallet\n- Gopay: *copy: 0899 9999 9999*\n- OVO: *copy: 0899 9999 9999*\n- Emoney: *copy: 0899 9999 9999*',
}
