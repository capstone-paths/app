const axios = require('axios');

export default class LerntApi{
    getSequence(id){
        return axios.get('/api/learning-paths/' + id)
    }
    getSequences(){
        return axios.get('/api/learning-paths/')
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
    getUser(id){
        return axios.get('/api/users/'+ id)
    }
    getSkills(){
        return axios.get('/api/skills/')
    }
    getLearningStyles(){
        return axios.get('/api/learning-styles/')
    }
}