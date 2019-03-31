const axios = require('axios');

export default class LerntApi{
    getSequence(id){
        return axios.get('/api/learning-paths/' + id)
    }
}