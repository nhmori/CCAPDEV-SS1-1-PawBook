$(function () {
    // auth guard
    if (!PawBookAuth.requireRole('business')) return;

    var OWNER_ID = 1;
    var KEY = 'pawbook_business_profile';
    var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var FIELDS = ['bizName','bizType','bizTagline','bizDesc','bizPhone','bizEmail','bizWebsite','bizSocial','bizAddress','bizCity','bizBranches','bizPolicy','bizNotes'];
    var CHECKS = ['petDog','petCat','petSmall','payCash','payCard','payEwallet','amAC','amWifi','amParking','amPickup','amWalkin'];

    var base = mockBusinesses.filter(function (b) { return b.id === OWNER_ID; })[0];
    var current = PawBookBiz.get(OWNER_ID);
    var hasSaved = false;
    try { 
        var s = JSON.parse(localStorage.getItem(KEY)); 
        hasSaved = !!(s && s.fields && s.fields.bizName); 
    } catch (e) {}

    // alert box
    function alertBox(type, msg) { 
        PawBookUtil.showAlert($('#alertBox'), type, msg); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // profile field getter
    function addServiceRow(sv) {
        sv = sv || {};
        var $r = $('<div class="row g-2 align-items-center mb-2 svc-row"></div>');
        $r.append($('<div class="col-12 col-md-5"></div>').append($('<input type="text" class="form-control s-name" maxlength="60" placeholder="Service name" aria-label="Service name">').val(sv.name || '')));
        $r.append($('<div class="col-6 col-md-3"></div>').append($('<input type="number" class="form-control s-price" min="0" step="1" placeholder="Price" aria-label="Price in pesos">').val(sv.price || '')));
        $r.append($('<div class="col-6 col-md-3"></div>').append($('<input type="number" class="form-control s-time" min="15" step="15" placeholder="Minutes" aria-label="Duration in minutes">').val(sv.time || '')));
        $r.append($('<div class="col-12 col-md-1 text-md-end"></div>').append('<button type="button" class="btn btn-outline-dark btn-sm s-del" aria-label="Remove service">✕</button>'));
        $('#serviceList').append($r);
        syncServiceEmpty();
    }

    // service list empty toggle
    function syncServiceEmpty() { 
        $('#noServices').toggleClass('d-none', $('.svc-row').length > 0); 
    }

    // handle click on "+ ADD SERVICE" button
    $('#addService').on('click', function () { 
        addServiceRow(); $('.s-name').last().focus(); 
    });

    // handle click on the "X" button to remove a service row
    $('#serviceList').on('click', '.s-del', function () { 
        $(this).closest('.svc-row').remove(); syncServiceEmpty(); 
    });

    // toggle hour row inputs
    function addHourRow(day, h) {
        h = h || { closed: false, open: '09:00', close: '18:00' };
        var id = 'h' + day;
        var $r = $('<div class="row g-2 align-items-center mb-2 hr-row"></div>').attr('data-day', day);
        $r.append($('<div class="col-12 col-md-3 fw-bold small"></div>').text(day));
        $r.append($('<div class="col-4 col-md-2"></div>').append(
        $('<div class="form-check"></div>')
            .append($('<input class="form-check-input h-closed" type="checkbox">').attr('id', id).prop('checked', !!h.closed))
            .append($('<label class="form-check-label small"></label>').attr('for', id).text('Closed'))));
        $r.append($('<div class="col-4 col-md-3"></div>').append($('<input type="time" class="form-control h-open" aria-label="Opens">').val(h.open || '09:00')));
        $r.append($('<div class="col-4 col-md-3"></div>').append($('<input type="time" class="form-control h-close" aria-label="Closes">').val(h.close || '18:00')));
        $('#hoursList').append($r);
        toggleRow($r);
    }

    // toggle open/close inputs based on closed checkbox
    function toggleRow($r) { 
        $r.find('.h-open, .h-close').prop('disabled', $r.find('.h-closed').is(':checked')); 
    }

    // toggle closed checkbox on row click
    $('#hoursList').on('change', '.h-closed', function () { 
        toggleRow($(this).closest('.hr-row')); 
    });

    // copy Monday hours to all other days
    $('#copyMonday').on('click', function () {
        var $m = $('.hr-row').first(), o = $m.find('.h-open').val(), c = $m.find('.h-close').val();
        $('.hr-row').slice(1).each(function () {
            if (!$(this).find('.h-closed').is(':checked')) { 
                $(this).find('.h-open').val(o); $(this).find('.h-close').val(c); 
            }
        });
    });

    // load profile data into form
    function loadProfile(data) {
        var f = data.fields || {}, c = data.checks || {};
        FIELDS.forEach(function (k) { $('#' + k).val(f[k] != null ? f[k] : ''); });
        if (f.bizType && !$('#bizType option').filter(function () { return this.value === f.bizType; }).length) {
            $('#bizType').append($('<option></option>').text(f.bizType));
            $('#bizType').val(f.bizType);
        }
        CHECKS.forEach(function (k) { $('#' + k).prop('checked', !!c[k]); });
        $('#serviceList').empty(); (data.services || []).forEach(addServiceRow); syncServiceEmpty();
        $('#hoursList').empty(); DAYS.forEach(function (d) { addHourRow(d, (data.hours || {})[d]); });
        $('#bizForm').removeClass('was-validated').find('.is-invalid').removeClass('is-invalid');
    }
  
    // initial load
    loadProfile(current);
    if (!hasSaved) {
        $('#alertBox').html('<div class="alert alert-info small">This is your starting profile. Edit anything and press <strong>SAVE BUSINESS PROFILE</strong> so customers see your changes.</div>');
    }

    // save profile
    $('#bizForm').on('submit', function (e) {
        e.preventDefault();

        // validate fields
        var bad = [];
        function flag(id, cond) { 
            $('#' + id).toggleClass('is-invalid', !cond); if (!cond) bad.push(id); 
        }

        // basic required fields
        ['bizName','bizDesc','bizPhone','bizAddress','bizCity'].forEach(function (id) { 
            flag(id, $.trim($('#' + id).val()) !== ''); 
        });
        flag('bizEmail', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($.trim($('#bizEmail').val())));
        flag('bizWebsite', PawBookUtil.isUrl($.trim($('#bizWebsite').val())));
        flag('bizSocial', PawBookUtil.isUrl($.trim($('#bizSocial').val())));

        // validate services
        var services = [], svcErr = false;
        $('.svc-row').each(function () {
            var n = $.trim($(this).find('.s-name').val()), p = $(this).find('.s-price').val(), t = $(this).find('.s-time').val();
            $(this).find('input').removeClass('is-invalid');
            if (!n && !p && !t) return;
            var ok = true;
            if (!n) { $(this).find('.s-name').addClass('is-invalid'); ok = false; }
            if (p === '' || +p < 0) { $(this).find('.s-price').addClass('is-invalid'); ok = false; }
            if (t === '' || +t < 15) { $(this).find('.s-time').addClass('is-invalid'); ok = false; }
            if (!ok) { svcErr = true; return; }
            services.push({ name: n, price: String(Math.round(+p)), time: String(Math.round(+t)) });
        });
        if (svcErr) bad.push('services');
        if (!services.length && !svcErr) { bad.push('services'); }

        // validate hours
        var hours = {}, hrErr = false, anyOpen = false;
        $('.hr-row').each(function () {
        var day = $(this).attr('data-day'), closed = $(this).find('.h-closed').is(':checked');
        var o = $(this).find('.h-open').val(), c = $(this).find('.h-close').val();
        $(this).find('input[type=time]').removeClass('is-invalid');
        if (!closed) {
            anyOpen = true;
            if (!o || !c || o >= c) { $(this).find('input[type=time]').addClass('is-invalid'); hrErr = true; }
        }
        hours[day] = { closed: closed, open: o || '09:00', close: c || '18:00' };
        });
        if (hrErr) bad.push('hours');
        else if (!anyOpen) bad.push('hours');

        // if any validation failed, show alert and focus first invalid field
        if (bad.length) {
            var msgs = [];
            if (bad.some(function (b) { return b !== 'services' && b !== 'hours'; })) msgs.push('Fix the highlighted fields.');
            if (bad.indexOf('services') !== -1) msgs.push(svcErr ? 'Each service needs a name, a price and a duration (at least 15 minutes).' : 'Add at least one service.');
            if (bad.indexOf('hours') !== -1) msgs.push(hrErr ? 'Closing time must be after opening time.' : 'Open on at least one day.');
            alertBox('danger', msgs.join(' '));
            var first = $('.is-invalid').first(); if (first.length) first.get(0).focus();
            return;
        }

        // gather form data
        var fields = {};
        FIELDS.forEach(function (k) { fields[k] = $.trim($('#' + k).val()); });
        var checks = {};
        CHECKS.forEach(function (k) { checks[k] = $('#' + k).is(':checked'); });

        // save to localStorage
        try {
            localStorage.setItem(KEY, JSON.stringify({ fields: fields, checks: checks, services: services, hours: hours }));
        } catch (err) { alertBox('danger', 'Could not save in this browser.'); return; }
        alertBox('success', 'Saved! Customers now see the updated profile for ' + fields.bizName + '.');
    });

    // reset profile
    $('#resetBtn').on('click', function () {
        if (!window.confirm('Discard your saved changes and go back to the default profile?')) return;
        try { localStorage.removeItem(KEY); } catch (e) {}
        loadProfile({ fields: base.fields, checks: base.checks, services: base.services, hours: base.hours });
        alertBox('success', 'Profile reset to the default.');
    });

    // branches management
    var BKEY = 'pawbook_branches';
    var branches = PawBookUtil.readList(BKEY);
    function saveBranches() { localStorage.setItem(BKEY, JSON.stringify(branches)); }
    var editingBranch = null;
    var branchModal = new bootstrap.Modal(document.getElementById('branchModal'));

    // summarize hours for display
    function hoursSummary(h) {
        var open = DAYS.filter(function (d) { return h[d] && !h[d].closed; });
        if (!open.length) return 'Closed all week';
        var f = h[open[0]], same = open.every(function (d) { return h[d].open === f.open && h[d].close === f.close; });
        var days = open.length === 7 ? 'Every day' : (open.length > 2 ? open[0].slice(0, 3) + '–' + open[open.length - 1].slice(0, 3) : open.map(function (d) { return d.slice(0, 3); }).join(', '));
        return days + (same ? ' · ' + PawBookUtil.hhmmTo12h(f.open) + '–' + PawBookUtil.hhmmTo12h(f.close) : ' · varies');
    }

    // render branches
    function renderBranches() {
        var $l = $('#branchList').empty();
        branches.forEach(function (b) {
        var $body = $('<div class="card-body d-flex flex-column"></div>');
        $body.append($('<div class="d-flex justify-content-between align-items-start gap-2 mb-2"></div>')
            .append($('<h3 class="h6 fw-bold mb-0"></h3>').text(b.name))
            .append($('<span class="badge"></span>').addClass(b.accepting ? 'bg-dark' : 'bg-secondary').text(b.accepting ? 'Accepting bookings' : 'Not accepting')));
        $body.append($('<p class="small mb-1"></p>').text([b.address, b.city].filter(Boolean).join(', ')));
        $body.append($('<p class="small text-muted mb-1"></p>').text('📞 ' + b.phone + (b.email ? '  ·  ✉ ' + b.email : '')));
        $body.append($('<p class="small text-muted mb-3"></p>').text('🕘 ' + hoursSummary(b.hours)));
        var $a = $('<div class="d-flex gap-2 mt-auto"></div>');
        $a.append($('<button type="button" class="btn btn-outline-dark btn-sm">UPDATE</button>').on('click', function () { openBranch(b.id); }));
        $a.append($('<button type="button" class="btn btn-dark btn-sm">REMOVE</button>').on('click', function () {
            if (!window.confirm('Remove "' + b.name + '"? This cannot be undone.')) return;
            branches = branches.filter(function (x) { return x.id !== b.id; });
            saveBranches(); renderBranches(); alertBox('success', 'Branch removed.');
        }));
        $body.append($a);
        $l.append($('<div class="col-md-6"></div>').append($('<div class="card h-100"></div>').append($body)));
        });
        $('#branchEmpty').toggleClass('d-none', branches.length > 0);
    }

    // build the hours inputs inside the branch modal
    function buildBranchHours(h) {
        var $w = $('#brHours').empty();
        DAYS.forEach(function (d) {
        var v = (h && h[d]) || { closed: false, open: '09:00', close: '18:00' }, id = 'bh' + d;
        var $r = $('<div class="row g-2 align-items-center mb-2 bh-row"></div>').attr('data-day', d);
        $r.append($('<div class="col-12 col-md-3 fw-bold small"></div>').text(d));
        $r.append($('<div class="col-4 col-md-2"></div>').append($('<div class="form-check"></div>')
            .append($('<input class="form-check-input bh-closed" type="checkbox">').attr('id', id).prop('checked', !!v.closed))
            .append($('<label class="form-check-label small"></label>').attr('for', id).text('Closed'))));
        $r.append($('<div class="col-4 col-md-3"></div>').append($('<input type="time" class="form-control bh-open" aria-label="Opens">').val(v.open)));
        $r.append($('<div class="col-4 col-md-3"></div>').append($('<input type="time" class="form-control bh-close" aria-label="Closes">').val(v.close)));
        $w.append($r);
        $r.find('.bh-open, .bh-close').prop('disabled', !!v.closed);
        });
    }

    // toggle open/close inputs based on closed checkbox
    $('#brHours').on('change', '.bh-closed', function () {
        $(this).closest('.bh-row').find('.bh-open, .bh-close').prop('disabled', this.checked);
    });

    // open branch modal for add/edit
    function openBranch(id) {
        var b = id ? branches.filter(function (x) { return x.id === id; })[0] : null;
        editingBranch = b;
        var p = PawBookBiz.get(OWNER_ID);
        $('#branchModalTitle').text(b ? 'Update branch' : 'Add branch');
        $('#branchErr').addClass('d-none');
        $('#brName').val(b ? b.name : ''); $('#brAddress').val(b ? b.address : '');
        $('#brCity').val(b ? b.city : (p ? p.fields.bizCity : '')); $('#brPhone').val(b ? b.phone : (p ? p.fields.bizPhone : ''));
        $('#brEmail').val(b ? b.email : (p ? p.fields.bizEmail : ''));
        $('#brAccepting').prop('checked', b ? b.accepting : true);
        buildBranchHours(b ? b.hours : (p ? p.hours : null));
        branchModal.show();
    }

    // handle the "+ ADD BRANCH" button
    $('#addBranchBtn').on('click', function () { 
        openBranch(null); 
    });

    // handle the branch form submission
    $('#branchForm').on('submit', function (e) {
        e.preventDefault();
        var name = $.trim($('#brName').val()), address = $.trim($('#brAddress').val()), city = $.trim($('#brCity').val()),
            phone = $.trim($('#brPhone').val()), email = $.trim($('#brEmail').val()), err = '';
        if (!name || !address || !city || !phone) err = 'Branch name, address, city and phone are required.';
        else if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err = 'Enter a valid email address.';
        var hours = {}, anyOpen = false;
        $('.bh-row').each(function () {
        var day = $(this).attr('data-day'), closed = $(this).find('.bh-closed').is(':checked');
        var o = $(this).find('.bh-open').val(), c = $(this).find('.bh-close').val();
        if (!closed) { anyOpen = true; if (!err && (!o || !c || o >= c)) err = day + ': closing time must be after opening time.'; }
        hours[day] = { closed: closed, open: o || '09:00', close: c || '18:00' };
        });
        if (!err && !anyOpen) err = 'Open on at least one day.';
        if (err) { $('#branchErr').text(err).removeClass('d-none'); return; }

        var data = { name: name, address: address, city: city, phone: phone, email: email, accepting: $('#brAccepting').is(':checked'), hours: hours };
        if (editingBranch) { $.extend(editingBranch, data); }
        else { data.id = Date.now(); branches.push(data); }
        saveBranches(); renderBranches(); branchModal.hide();
        alertBox('success', 'Branch ' + (editingBranch ? 'updated' : 'added') + '.');
    });

    renderBranches();

    // bookings management
    var bookings = PawBookBookings.read();
    function reloadBookings() { bookings = PawBookBookings.read(); }
    function saveBookings() { PawBookBookings.save(bookings); }
    function mine() { return bookings.filter(function (b) { return b.businessId === OWNER_ID; }); }
    function find(ref) { return bookings.filter(function (b) { return b.ref === ref; })[0]; }
  
    // update the status of a booking (e.g. to Confirmed, Rejected, or Completed)
    function setStatus(ref, st, msg) {
        var b = find(ref); if (!b) return;
        b.status = st; saveBookings(); renderBookings(); alertBox('success', msg);
    }

    // render bookings
    function renderBookings() {
        reloadBookings();
        var all = mine(), f = $('#bookingFilter').val();
        var pending = all.filter(function (b) { return b.status === 'Pending' && !PawBookBookings.isPast(b); }).length;
        $('#pendingBadge').text(pending).toggleClass('d-none', pending === 0);
        
        var list = all.filter(function (b) {
        if (f === 'all') return true;
        if (f === 'Closed') return b.status === 'Cancelled' || b.status === 'Rejected';
        return b.status === f;
        }).sort(function (a, b) { 
        return PawBookBookings.rank(a) - PawBookBookings.rank(b) || 
            (PawBookBookings.rank(a) < 2 ? PawBookBookings.startOf(a) - PawBookBookings.startOf(b) : PawBookBookings.startOf(b) - PawBookBookings.startOf(a)); 
        });

        var $t = $('#bookingRows').empty();
        list.forEach(function (b) {
        var past = PawBookBookings.isPast(b);
        var $tr = $('<tr></tr>');
        $tr.append($('<td class="small"></td>').append($('<div></div>').text(PawBookUtil.formatDate(b.date) + ' · ' + b.time)).append($('<div class="text-muted"></div>').text(b.ref)));
        $tr.append($('<td class="small"></td>').text((b.customer && b.customer.name) || 'Customer'));
        $tr.append($('<td class="small"></td>').text(b.pet || '—'));
        $tr.append($('<td class="small"></td>').text((b.services || []).join(', ')));
        $tr.append($('<td class="small"></td>').text('₱' + Number(b.total || 0).toLocaleString()));
        $tr.append($('<td></td>').append(PawBookUtil.statusBadge(past && b.status === 'Pending' ? 'Expired' : b.status)));

        var $a = $('<div class="d-flex flex-wrap gap-2 justify-content-end"></div>');
        function btn(label, cls, fn) { $a.append($('<button type="button" class="btn btn-sm"></button>').addClass(cls).text(label).on('click', fn)); }
        
        if (b.status === 'Pending' && !past) {
            btn('ACCEPT', 'btn-dark', function () { setStatus(b.ref, 'Confirmed', 'Booking ' + b.ref + ' accepted.'); });
            btn('REJECT', 'btn-outline-dark', function () { if (window.confirm('Reject this booking?')) setStatus(b.ref, 'Rejected', 'Booking ' + b.ref + ' rejected.'); });
            btn('RESCHEDULE', 'btn-outline-dark', function () { openResched(b.ref); });
        } else if (b.status === 'Pending') {
            btn('REJECT', 'btn-outline-dark', function () { setStatus(b.ref, 'Rejected', 'Booking ' + b.ref + ' rejected.'); });
        } else if (b.status === 'Confirmed') {
            btn('COMPLETE', 'btn-dark', function () { setStatus(b.ref, 'Completed', 'Booking ' + b.ref + ' marked as completed.'); });
            if (!past) btn('RESCHEDULE', 'btn-outline-dark', function () { openResched(b.ref); });
        }
        $tr.append($('<td class="text-end"></td>').append($a));
        $t.append($tr);
        });
        $('#bookingEmpty').toggleClass('d-none', list.length > 0);
    }
    $('#bookingFilter').on('change', renderBookings);

    // reschedule modal
    var reschedModal = new bootstrap.Modal(document.getElementById('reschedModal'));
    var rescheduling = null;
  
    // fill the time dropdown based on the selected date and shop hours
    function fillTimes() {
        var date = $('#rsDate').val(), $s = $('#rsTime').empty(), $h = $('#rsHint');
        if (!date) { $h.text('Choose a date.'); return; }
        var h = (PawBookBiz.get(OWNER_ID).hours || {})[DAYS[(PawBookUtil.isoToDate(date).getDay() + 6) % 7]];
        if (!h || h.closed) { $h.text('You are closed on this day. Pick another date.'); return; }
        var now = new Date(), nowMin = date === PawBookUtil.dateToIso(now) ? now.getHours() * 60 + now.getMinutes() : -1;
        var cur = PawBookUtil.hhmmaToMinutes(rescheduling.time), n = 0;
        for (var t = PawBookUtil.hhmmToMinutes(h.open); t < PawBookUtil.hhmmToMinutes(h.close); t += 30) {
        if (t <= nowMin) continue;
        $s.append($('<option></option>').val(t).text(PawBookUtil.minutesTo12h(t)).prop('selected', date === rescheduling.date && t === cur)); n++;
        }
        $h.text(n ? 'Open ' + PawBookUtil.hhmmTo12h(h.open) + '–' + PawBookUtil.hhmmTo12h(h.close) + '.' : 'No times left on this day.');
    }
  
    // open the reschedule modal and load the current booking info
    function openResched(ref) {
        rescheduling = find(ref); if (!rescheduling) return;
        var today = new Date(), max = new Date(today); max.setDate(max.getDate() + 90);
        $('#reschedInfo').text((rescheduling.customer && rescheduling.customer.name || 'Customer') + ' · ' + (rescheduling.pet || '') + ' · now ' + PawBookUtil.formatDate(rescheduling.date) + ' at ' + rescheduling.time);
        $('#reschedErr').addClass('d-none');
        $('#rsDate').attr({ min: PawBookUtil.dateToIso(today), max: PawBookUtil.dateToIso(max) }).val(rescheduling.date >= PawBookUtil.dateToIso(today) ? rescheduling.date : PawBookUtil.dateToIso(today));
        fillTimes(); reschedModal.show();
    }
    $('#rsDate').on('change', fillTimes);
    $('#reschedForm').on('submit', function (e) {
        e.preventDefault();
        if (!$('#rsDate').val() || !$('#rsTime').val()) { $('#reschedErr').text('Choose an available date and time.').removeClass('d-none'); return; }
        rescheduling.date = $('#rsDate').val();
        rescheduling.time = PawBookUtil.minutesTo12h(+$('#rsTime').val());
        rescheduling.status = 'Confirmed';
        saveBookings(); renderBookings(); reschedModal.hide();
        alertBox('success', 'Booking ' + rescheduling.ref + ' moved to ' + PawBookUtil.formatDate(rescheduling.date) + ' at ' + rescheduling.time + '.');
    });
    renderBookings();
    $(window).on('storage', renderBookings);

    // posts management
    var PKEY = 'pawbook_posts';
    function allPosts() { return PawBookUtil.readList(PKEY); }
  
    // render the list of posts created by this business
    function renderPosts() {
        var mineP = allPosts().filter(function (p) { return p.businessId === OWNER_ID; });
        var $w = $('#myPosts').empty();
        mineP.forEach(function (p) {
        var $body = $('<div class="card-body"></div>');
        $body.append($('<div class="d-flex justify-content-between align-items-start gap-2 mb-2"></div>')
            .append($('<div></div>').append($('<span class="badge bg-light text-dark border me-2"></span>').text(p.type || 'Update')).append($('<small class="text-muted"></small>').text(PawBookUtil.relativeTime(p.ts))))
            .append($('<button type="button" class="btn btn-outline-dark btn-sm">DELETE</button>').on('click', function () {
            if (!window.confirm('Delete this post?')) return;
            localStorage.setItem(PKEY, JSON.stringify(allPosts().filter(function (x) { return x.id !== p.id; })));
            renderPosts(); alertBox('success', 'Post deleted.');
            })));
        if (p.title) $body.append($('<h3 class="h6 fw-bold"></h3>').text(p.title));
        $body.append($('<p class="small mb-1" style="white-space:pre-wrap;"></p>').text(p.text));
        $body.append($('<small class="text-muted"></small>').text('♥ ' + (p.likes || 0)));
        $w.append($('<div class="card mb-3"></div>').append($body));
        });
        $('#noPosts').toggleClass('d-none', mineP.length > 0);
    }
  
    // update the character count on the post textarea
    $('#postBody').on('input', function () { $('#postCount').text(this.value.length); });

    // handle the "PUBLISH POST" form submission
    $('#bizPostForm').on('submit', function (e) {
        e.preventDefault();
        var text = $.trim($('#postBody').val());
        if (!text) { $('#postErr').text('Write a message before publishing.').removeClass('d-none'); return; }
        $('#postErr').addClass('d-none');
        var list = allPosts();
        list.unshift({ id: Date.now(), author: PawBookBiz.get(OWNER_ID).fields.bizName, kind: 'Business', businessId: OWNER_ID, type: $('#postType').val(),
                    title: $.trim($('#postTitle').val()), text: text, ts: Date.now(), likes: 0, liked: false });
        localStorage.setItem(PKEY, JSON.stringify(list));
        $('#bizPostForm')[0].reset(); $('#postCount').text('0');
        renderPosts(); alertBox('success', 'Your post is live in the community feed.');
    });

    renderPosts();
});