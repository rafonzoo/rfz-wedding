export enum RouteWedding {
  wedding = '/wedding',
  weddingPublic = '/[name]',
  weddingEditor = '/wedding/[wid]',
}

export enum QueryWedding {
  weddingGetAll = '@@wedding/getAll',
  weddingDetail = '@@wedding/detail',
  weddingAddNew = '@@wedding/addNew',
  weddingUpdate = '@@wedding/update',
  weddingGuests = '@@wedding/guests',
  weddingComments = '@@wedding/comments',
  weddingGalleries = '@@wedding/galleries',
}

export enum FontFamilyWedding {
  cinzel = 'cinzel',
  poiret = 'poiret',
}
