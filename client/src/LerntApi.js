import axios from 'axios';

export default class LerntApi {
    static getSequence(id) {
        return axios.get('/api/learning-paths/' + id)
    }
    static saveSequence(sequence) {
        return axios.post('/api/learning-paths/', sequence)
    }
    getSequences() {
        return axios.get('/api/learning-paths/')
    }
    static getSequenceCourseRecommendation(userId, sequenceId, courseId) {
        return axios.get('/api/learning-paths/recommendations/' + sequenceId + '/' + userId + '/' + courseId)
    }
    isSubscribed(userId, sequenceId) {
        return axios.get('/api/learning-paths/is-subscribed/' + sequenceId + '/' + userId)
    }
    toggleSubscribe(userId, sequenceId) {
        return axios.post('/api/learning-paths/toggle-subscribe/' + sequenceId + '/' + userId)
    }
    getCourse(id) {
        return axios.get('/api/courses/' + id)
    }
    getCourses() {
        return axios.get('/api/courses/')
    }
    getUser(id) {
        return axios.get('/api/users/' + id)
    }
    saveUser(user) {
        return axios.post('/api/users/' + user.userID, user)
    }
    getSkills() {
        return axios.get('/api/skills/')
    }
    getLearningStyles() {
        return axios.get('/api/learning-styles/')
    }
    // TODO: Must pass in user for additional context
    static getSystemRecommendation(trackID) {
        return axios.get('/api/learning-paths/system-recommendation/' + trackID);
    }
    static getAllTrackNames() {
        return axios.get('/api/tracks');
    }
    static getAllPathsByTrackID(id) {
        return axios.get('/api/learning-paths/by-track-id/' + id);
    }
}