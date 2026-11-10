$(function () {
    // auth guard
    if (!PawBookAuth.requireRole('admin')) return;

    var KEY = 'pawbook_users';

    // load users from localStorage
    function users() { 
        return PawBookUtil.readList(KEY); 
    }
  
    // format the created timestamp for display
    function fmt(ts) { 
        return ts 
        ? new Date(ts).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) 
        : 'Built-in'; 
    }

    // render the admin accounts table
    function renderAdmins() {
        var $b = $('#adminRows').empty();
    
    // built-in admin is always shown first
        var list = [{ name: 'PawBook Admin', email: 'admin@pawbook.com', created: 0 }]
            .concat(users().filter(function (u) { return u.role === 'admin'; }));
        
        list.forEach(function (u) {
        $b.append($('<tr></tr>')
            .append($('<td class="small"></td>').text(u.name))
            .append($('<td class="small"></td>').text(u.email))
            .append($('<td class="small"></td>').text(fmt(u.created))));
        });
    }

    renderAdmins();

    // reset the form when the modal opens
    $('#adminModal').on('show.bs.modal', function () {
        $('#adminForm')[0].reset(); 
        $('#adminErr').addClass('d-none');
    });

    // handle form submission to create a new admin
    $('#adminForm').on('submit', function (e) {
        e.preventDefault();
        
        var name = $.trim($('#adName').val());
        var email = $.trim($('#adEmail').val()).toLowerCase();
        var p1 = $('#adPass').val();
        var p2 = $('#adPass2').val();
        var err = '';
    
        // validation
        if (!name) err = 'Enter a name.';
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err = 'Enter a valid email address.';
        else if (p1.length < 8) err = 'Password must be at least 8 characters.';
        else if (p1 !== p2) err = 'Passwords do not match.';
        else if (email === 'admin@pawbook.com' || users().some(function (u) { return u.email === email; })) err = 'An account with that email already exists.';
        
        if (err) { 
            $('#adminErr').text(err).removeClass('d-none'); 
            return; 
        }

        // save new admin
        var list = users();
        list.push({ name: name, email: email, password: p1, role: 'admin', created: Date.now() });
        localStorage.setItem(KEY, JSON.stringify(list));
    
        // close modal, re-render, show success message
        bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
        renderAdmins();
        PawBookUtil.showAlert($('#adminAlert'), 'success', 'Admin account created for ' + name + ' (' + email + ').');
    });
});