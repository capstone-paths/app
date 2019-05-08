import axios from 'axios';

export default class LerntApi {
    constructor(){
        axios.defaults.headers.common['User'] = window.currentUser;
    }
    getSequence(id) {
        return axios.get('/api/learning-paths/' + id)
    }
    saveSequence(sequence) {
        return axios.post('/api/learning-paths/save/', sequence)
    }
    remixSequence(sequence) {
        return axios.post('/api/learning-paths/remix/', sequence)
    }
    getSequences() {
        return axios.get('/api/learning-paths/')
    }
    getSequenceCourseRecommendation(sequenceId, courseId) {
        return axios.get('/api/learning-paths/recommendations/' + sequenceId + '/' + courseId)
    }
    isSubscribed(sequenceId, user) {
         console.log(user);
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
    updateCourseStatus(courseId, status){
        return axios.post('/api/courses/update-status/'+ courseId + '/' + status);
    }
    reviewCourse(courseId, review){
        return axios.post('/api/courses/review/' + courseId, review)
    }
    getUser(id) {
        return axios.get('/api/users/' + id)
    }
    getUserByEmail(email) {
        return axios.get('/api/users/email/' + email)
    }
    signUp(user){
        return axios.post('/auth/signup', user )
    }
    signIn(user){
        return axios.post('/auth/signin', user )
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