const PathStart = {
  seqID: {
    type: 'uuid',
    primary: true,
  },
  name: 'string',
  rating: 'float',
  category: 'string',
  recommendations: 'integer',
  author: {
    type: 'relationship',
    target: 'User',
    relationship: 'CREATED',
    properties: {
      userID: 'uuid'
    },
    eager: true,
  }
}
