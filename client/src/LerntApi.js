const axios = require('axios');

export default class LerntApi{
    getSequence(id){
        return axios.get('/api/learning-paths/' + id)
    }
    getSequenceNodeRecommendation(id){
        return axios.get('/api/learning-paths/' + id + '/recommendation')
    }
    getCourses(){
        return axios.get('/api/courses/')
    }
}