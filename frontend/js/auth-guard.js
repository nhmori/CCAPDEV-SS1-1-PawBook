window.PawBookAuth = (function () {
    // read the login status and role from localStorage
    function raw() {
        var loggedIn = false, role = '';
        try {
            loggedIn = localStorage.getItem('pawbook_logged_in') === 'true';
            role = localStorage.getItem('pawbook_role') || '';
        } catch (e) {}
        return { loggedIn: loggedIn, role: role };
    }

    // check if the user is logged in
    function isLoggedIn() { 
        return raw().loggedIn; 
    }

    // get the current role of the logged-in user
    function currentRole() { 
        return raw().role; 
    }

    // require a specific role for access, redirect to login if not met
    function requireRole(role) {
        var s = raw();
        if (!s.loggedIn) { 
        window.location.href = 'login-signup.html'; 
        return false; 
        }
        if (role && s.role !== role) { 
        window.location.href = 'login-signup.html'; 
        return false; 
        }
        return true;
    }

    // log in the user with a specific role and optional user data
    function login(role, user) {
        try {
        localStorage.setItem('pawbook_logged_in', 'true');
        localStorage.setItem('pawbook_role', role);
        if (user) localStorage.setItem('pawbook_account', JSON.stringify(user));
        } catch (e) {}
    }

    // log out the user and clear login data from localStorage
    function logout() {
        try {
        localStorage.removeItem('pawbook_logged_in');
        localStorage.removeItem('pawbook_role');
        } catch (e) {}
    }

    // public API
    return { 
        isLoggedIn: isLoggedIn, 
        currentRole: currentRole, 
        requireRole: requireRole, 
        login: login, 
        logout: logout 
    };
})();