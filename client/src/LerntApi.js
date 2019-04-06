const axios = require('axios');

export default class LerntApi{
    getSequence(id){
        return axios.get('/api/learning-paths/' + id)
    }
    getSequenceNodeRecommendation(id){
        return axios.get('/api/learning-paths/' + id + '/recommendation')
    }
    getCourse(id){
        return axios.get('/api/courses/'+ id)
    }
    getCourses(){
        return axios.get('/api/courses/')
    }
}