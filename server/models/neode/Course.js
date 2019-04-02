const Course = {
  courseID: {
    primary: true,
    type: 'uuid',
  },
  name: 'string',
  institution: 'string',
  category: 'string',
  recommendations: 'integer',
  next: {
    type: 'relationship',
    target: 'Course',
    relationship: 'NEXT',
    properties: {
      seqID: 'uuid'
    }
  }
};

module.exports = Course;
