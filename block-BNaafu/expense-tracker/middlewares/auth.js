var User = require('../models/User');
module.exports = {
    isUserLogged : (req,res,next)=> {
        if((req.session && req.session.userId) || (req.session && req.session.passport && req.session.passport.user)){
            next();
        }else {
            res.redirect('/users/login');
        }
    },
    userInfo : async (req,res,next)=> {
        try {
            var userId = (req.session && req.session.userId) || (req.session && req.session.passport && req.session.passport.user)||null;
            if(userId){
                const user = await User.findById(userId);
                req.user = user;
                res.locals.user = user;
                next();
            } else {
                req.user = null;
                res.locals.user = null;
                next();
            }
        } catch (error) {
            next(error);
        }
    }

}; 