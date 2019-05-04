import axios from 'axios';
//TODO adjust to pull the proper user from context. Consider also doing this in a constructor for LerntAPI
axios.defaults.headers.common['User'] = '2';

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
    static getSequenceCourseRecommendation(sequenceId, courseId) {
        return axios.get('/api/learning-paths/recommendations/' + sequenceId + '/' + courseId)
    }
    isSubscribed(sequenceId) {
        return axios.get('/api/learning-paths/is-subscribed/' + sequenceId)
    }
    toggleSubscribe(sequenceId) {
        return axios.post('/api/learning-paths/toggle-subscribe/' + sequenceId )
    }
    getCourse(courseId) {
        return axios.get('/api/courses/' + courseId )
    }
    getCourses() {
        return axios.get('/api/courses/')
    }
    static updateCourseStatus(courseId, status){
        return axios.post('/api/courses/'+ courseId + '/' + status);
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