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
    isSubscribed(userId, sequenceId){
        return axios.get('/api/learning-paths/is-subscribed/' + sequenceId + '/' + userId)
    }
    toggleSubscribe(userId, sequenceId){
        return axios.post('/api/learning-paths/toggle-subscribe/' + sequenceId + '/' + userId)
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
    saveUser(user){
        return axios.post('/api/users/'+ user.userID, user)
    }
    getSkills(){
        return axios.get('/api/skills/')
    }
    getLearningStyles(){
        return axios.get('/api/learning-styles/')
    }
}