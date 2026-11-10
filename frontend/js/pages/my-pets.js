$(function () {
    // ensure the user is logged in
    if (!PawBookAuth.requireRole('owner')) return;

    var KEY = 'pawbook_pets_v2';
    
    var PHOTO = {
        Dalla:   'img/Dalla1.jpg',
        Kiwi:    'img/Kiwi1.jpg',
        Charlie: 'img/Charlie1.jpg'
    };

    var SEED = [
        { id: 1, name: 'Dalla',   breed: 'Mixed breed', age: 2, size: 'Medium', health: '', notes: '' },
        { id: 2, name: 'Kiwi',    breed: 'Mixed breed', age: 2, size: 'Medium', health: '', notes: '' },
        { id: 3, name: 'Charlie', breed: 'Mixed breed', age: 2, size: 'Medium', health: '', notes: '' }
    ];

    // load and save pets list from localStorage
    function load() {
        try {
        var d = JSON.parse(localStorage.getItem(KEY));
        if (Array.isArray(d)) return d;
        } catch (e) {}
        save(SEED);
        return SEED.slice();
    }

    // save the pets list to localStorage
    function save(list) { 
        localStorage.setItem(KEY, JSON.stringify(list)); 
    }

    var pets = load();
    var modal = new bootstrap.Modal(document.getElementById('petModal'));

    // photo helpers
    function photoCandidates(src) {
        var base = src.replace(/\.[^.\/]+$/, '');
        var bases = [base];
        if (base.toLowerCase() !== base) bases.push(base.toLowerCase());
        var list = [src];
        bases.forEach(function (b) {
        ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'].forEach(function (ext) {
            var c = b + '.' + ext;
            if (list.indexOf(c) === -1) list.push(c);
        });
        });
        return list;
    }

    // get the photo URL for a pet based on its name
    function photoFor(p) {
        var name = String(p.name || '').trim().toLowerCase();
        var key = Object.keys(PHOTO).filter(function (k) { return k.toLowerCase() === name; })[0];
        return key ? PHOTO[key] : '';
    }

    // create a photo element for a pet, with fallback if the photo is missing
    function photo(p, height) {
        var $box = $('<div class="bg-light d-flex align-items-center justify-content-center overflow-hidden"></div>').css('height', height);
        function fallback(missing) {
            var $c = $('<div class="text-center px-2"></div>').append('<div style="font-size:2.5rem;">🐾</div>');
            if (missing) $c.append($('<small class="text-muted d-block"></small>').text("Can't find " + missing));
            $box.empty().append($c);
        }
        var src = photoFor(p);
        if (src) {
            var tries = photoCandidates(src), i = 0;
            var $img = $('<img>').attr({ src: tries[0], alt: (p.name || 'Pet') + ' photo' })
                .css({ width: '100%', height: '100%', objectFit: 'cover' })
                .on('error', function () {
                i++;
                if (i < tries.length) $img.attr('src', tries[i]); else fallback(src);
                })
                .appendTo($box);
        } else {
            fallback();
        }
        return $box;
    }

    // render the list of pets in the UI
    function render() {
        var $list = $('#petList').empty();
        $('#emptyState').toggleClass('d-none', pets.length > 0);

        pets.forEach(function (p) {
            var $card = $('<div class="card h-100 overflow-hidden"></div>').append(photo(p, 180));
            var $body = $('<div class="card-body d-flex flex-column"></div>');

            var $head = $('<div class="mb-3"></div>');
            $head.append($('<h2 class="h6 fw-bold mb-0"></h2>').text(p.name));
            $head.append($('<small class="text-muted"></small>').text(p.breed));
            $body.append($head);

            var $badges = $('<div class="d-flex flex-wrap gap-1 mb-3"></div>');
            if (p.gender) $badges.append(PawBookUtil.pillBadge(p.gender));
            $badges.append(PawBookUtil.pillBadge(p.size));
            $badges.append(PawBookUtil.pillBadge(p.age + (Number(p.age) === 1 ? ' yr' : ' yrs')));
            $body.append($badges);

            if (p.health) $body.append($('<p class="small mb-1"></p>').append('<span class="text-muted">Health: </span>').append(document.createTextNode(p.health)));
            if (p.notes) $body.append($('<p class="small mb-1"></p>').append('<span class="text-muted">Notes: </span>').append(document.createTextNode(p.notes)));

            var $actions = $('<div class="d-flex gap-2 mt-auto pt-3"></div>');
            $actions.append($('<button type="button" class="btn btn-outline-dark btn-sm flex-fill">VIEW</button>').on('click', function () { openForm(p.id); }));
            $actions.append($('<button type="button" class="btn btn-dark btn-sm flex-fill">DELETE</button>').on('click', function () { removePet(p.id); }));
            $body.append($actions);

            $card.append($body);
            $list.append($('<div class="col-md-6 col-lg-4"></div>').append($card));
        });
    }

    // open the pet form modal for adding or editing a pet
    function openForm(id) {
        var p = pets.filter(function (x) { return x.id === id; })[0];
        $('#petForm')[0].reset();
        $('#petId').val(p ? p.id : '');
        $('#petModalTitle').text(p ? p.name : 'Add pet');
        $('#petSaveBtn').text(p ? 'SAVE CHANGES' : 'SAVE PET');
        if (p) {
            $('#petName').val(p.name);
            $('#petBreed').val(p.breed);
            $('#petAge').val(p.age);
            $('#petSize').val(p.size);
            $('#petGender').val(p.gender || '');
            $('#petHealth').val(p.health);
            $('#petNotes').val(p.notes);
        }
        $('#petPhotoPreview').empty().append(photo(p || {}, 200));
        modal.show();
    }

    // remove a pet from the list after confirmation
    function removePet(id) {
        var p = pets.filter(function (x) { return x.id === id; })[0];
        if (!p || !confirm('Delete ' + p.name + '\'s profile? This can\'t be undone.')) return;
        pets = pets.filter(function (x) { return x.id !== id; });
        save(pets);
        render();
    }

    // event handlers for adding a new pet and submitting the pet form
    $('#addPetBtn, #emptyAddBtn').on('click', function () { openForm(null); });

    // handle the submission of the pet form, either adding a new pet or updating an existing one
    $('#petForm').on('submit', function (e) {
        e.preventDefault();
        var id = parseInt($('#petId').val(), 10);
        var data = {
            name: $('#petName').val().trim(),
            breed: $('#petBreed').val().trim(),
            age: parseFloat($('#petAge').val()),
            size: $('#petSize').val(),
            gender: $('#petGender').val(),
            health: $('#petHealth').val().trim(),
            notes: $('#petNotes').val().trim()
            };
        if (id) {
            pets = pets.map(function (p) { return p.id === id ? $.extend({}, p, data) : p; });
        } else {
            var nextId = pets.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1;
            pets.push($.extend({ id: nextId }, data));
        }
        save(pets);
        render();
        modal.hide();
    });

    // initial render of the pets list
    render();

    // account management
    var ACC_KEY = 'pawbook_account';
    var account = { name: 'Juan Dela Cruz', email: 'juan@example.com' };
    try {
        var savedAcc = JSON.parse(localStorage.getItem(ACC_KEY));
        if (savedAcc && savedAcc.name && savedAcc.email) account = savedAcc;
    } catch (e) {}
  
    $('#accName').val(account.name);
    $('#accEmail').val(account.email);

    $('#accountForm').on('submit', function (e) {
        e.preventDefault();
        var pw = $('#accPassword').val(), pw2 = $('#accPassword2').val();
        $('#accountMsg, #accountErr').addClass('d-none');
        if (pw && pw !== pw2) {
        $('#accountErr').text('The passwords do not match. Re-enter them and try again.').removeClass('d-none');
        return;
        }
        account = { name: $('#accName').val().trim(), email: $('#accEmail').val().trim() };
        localStorage.setItem(ACC_KEY, JSON.stringify(account));
        $('#accPassword, #accPassword2').val('');
        $('#accountMsg').text(pw ? 'Your name, email and password were updated.' : 'Your name and email were updated.').removeClass('d-none');
    });
});

// handle hash link to account tab
$(function () {
    if (location.hash === '#account') {
        var el = document.querySelector('[data-bs-target="#account-pane"]');
        if (el) bootstrap.Tab.getOrCreateInstance(el).show();
    }
});