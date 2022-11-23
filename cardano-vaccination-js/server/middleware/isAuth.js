const jwt = require('jsonwebtoken');
const VaccinationCenter = require('../models/VaccinationCenter');
const Patient = require('../models/Patient');

module.exports = async (req, res, next) => {
    const authHeader = req.get("authorization");
    if(!authHeader) {
        console.log("NO AUTHORIZATION HEADER");
        req.isAuth = false;
        return next();
    }

    const token = authHeader.split(' ')[1].trim();
    if(!token || token === '') {
        console.log("NO TOKEN");
        req.isAuth = false;
        return next();
    }

    let decodedToken;
    try {
        console.log("VERIFIYING TOKEN:");
        console.log(token);
        decodedToken = jwt.verify(token, 'UNSAFE_STRING');
    }catch(err) {
        req.isAuth = false;
        return next();
    }
    if(!decodedToken) {
        console.log("TOKEN IS WRONG?");
        req.isAuth = false;
        return next();
    }

    const user_id = decodedToken.user_id;
    var user = null;

    user = await Patient.findOne({}).where('id').equals(user_id);
    if(!user)
        user = await VaccinationCenter.findOne({}).where('id').equals(user_id);
    if(!user) {
        console.log("USER ", user_id, "DOES NOT EXIST???");
        req.isAuth = false;
        return next();
    }

    //if(user.jwt_token !== token) {
    //    console.log("USER.KWT_TOKEN ", user.jwt_token, "NOT IN DATABASE");
    //    console.log("TOKEN ", token, "NOT IN DATABASE");
    //    req.isAuth = false;
    //    return next();
    //}
    req.isAuth = true;
    req.user_id = decodedToken.user_id;
    req.user_did = decodedToken.user_did;
    next();
}