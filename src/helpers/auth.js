
const auth = {}

auth.isAuthenticated = function(req, res, next){
    if (req.isAuthenticated() && req.user.role == 'usuario') {
        req.session.user
        return next();
    }
    if (req.session.role === "admin") {
        return res.redirect('/admin')
    }
    if (req.session.role === "usuario") {
        return res.redirect('/profile')
    }
    res.redirect('/index')
}

auth.isAuthenticatedadmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        return next();
    }
    if (req.session.role === "admin") {
        return res.redirect('/admin')
    }
    if (req.session.role === "usuario") {
        return res.redirect('/profile')
    }
    res.redirect('/index')
}

auth.isNotAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    console.log(req.session.role)
    if (req.session.role === "admin") {
        return res.redirect('/admin')
    }
    if (req.session.role === "usuario") {
        return res.redirect('/profile')
    }
    return next();
}


module.exports = auth
