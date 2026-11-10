$(function () {
    $('#backToBusinesses').on('click', function (e) {
        if (window.history.length > 1) { e.preventDefault(); window.history.back(); }
    });

    var OWNER_ID = 1; 
    var STORAGE_KEY = 'pawbook_business_profile';
    var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'), 10) || 1;
    var biz = null;
    if (typeof mockBusinesses !== 'undefined') {
        biz = mockBusinesses.filter(function (b) { return b.id === id; })[0] || mockBusinesses[0];
    }
    if (!biz) {
        $('main, .container.py-4').first().html('<p class="text-muted">Business data could not be loaded. Check that js/businesses-data.js is included.</p>');
        return;
    }

    var data = { fields: biz.fields, checks: biz.checks, services: biz.services, hours: biz.hours };
    if (biz.id === OWNER_ID) {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && saved.fields && saved.fields.bizName) data = saved;
        } catch (e) {}
    }
    var f = data.fields || {}, c = data.checks || {};

    // cover and gallery images
    PawBookBiz.setPhoto($('#pCover'), biz.image, f.bizName);
    PawBookBiz.setPhoto($('#pImg1'), (biz.gallery || [])[0], f.bizName);
    PawBookBiz.setPhoto($('#pImg2'), (biz.gallery || [])[1], f.bizName);

    // small helper functions
    function fill($wrap, labels) {
        if (!labels.length) { 
            $wrap.append('<span class="text-muted">Not specified</span>'); return; 
        }
        labels.forEach(function (l) { $wrap.append(PawBookUtil.pillBadge(l)); });
    }

    // header
    $('#bookNow').attr('href', 'book-appointment.html?id=' + biz.id);
    document.title = 'PawBook — ' + (f.bizName || 'Business Profile');
    $('#pName').text(f.bizName || 'Business name');
    $('#pTagline').text(f.bizTagline || '');
    if (biz.rating) { 
        $('#pRating').text('★ ' + biz.rating.score); $('#pReviewCount').text('(' + biz.rating.count + ' reviews)'); 
    }
    $('#pLocation').text(f.bizCity || '');
    if (f.bizType) $('#pBadges').append(PawBookUtil.pillBadge(f.bizType));
    (data.services || []).slice(0, 3).forEach(function (s) { 
        $('#pBadges').append(PawBookUtil.pillBadge(s.name)); 
    });

    $('#pDesc').text(f.bizDesc || 'No description provided yet.');

    // services
    var $sv = $('#pServices');
        if (!(data.services || []).length) {
        $sv.append('<tr><td colspan="3" class="text-muted">No services listed yet.</td></tr>');
    }
    (data.services || []).forEach(function (s) {
        var price = s.price ? Number(String(s.price).replace(/,/g, '')) : 0;
        var $tr = $('<tr></tr>');
        $tr.append($('<td></td>').text(s.name));
        $tr.append($('<td class="text-muted"></td>').text(s.time ? s.time + ' min' : '—'));
        $tr.append($('<td class="text-end"></td>').text(price ? '₱' + price.toLocaleString() : '—'));
        $sv.append($tr);
    });

    // other info
    var pets = [], pay = [], am = [];
    if (c.petDog) pets.push('Dogs'); 
    if (c.petCat) pets.push('Cats'); 
    if (c.petSmall) pets.push('Small animals');
    if (c.payCash) pay.push('Cash'); 
    if (c.payCard) pay.push('Card'); 
    if (c.payEwallet) pay.push('E-wallet');
    if (c.amAC) am.push('Air-conditioned'); 
    if (c.amWifi) am.push('Free Wi-Fi'); if (c.amParking) am.push('Parking');
    if (c.amPickup) am.push('Pick-up & delivery'); 
    if (c.amWalkin) am.push('Walk-ins welcome');
    fill($('#pPets'), pets); 
    fill($('#pPayments'), pay); 
    fill($('#pAmenities'), am);
    if (f.bizPolicy) $('#pPolicy').text(f.bizPolicy); else $('#pPolicyWrap').remove();
    if (f.bizNotes) $('#pNotes').text(f.bizNotes); else $('#pNotesWrap').remove();

    // hours
    var todayName = DAYS[(new Date().getDay() + 6) % 7];
    DAYS.forEach(function (d) {
        var h = (data.hours || {})[d];
        var $li = $('<li class="d-flex justify-content-between py-1"></li>');
        $li.append($('<span></span>').text(d).toggleClass('fw-bold', d === todayName));
        var txt = !h ? '—' : (h.closed 
            ? 'Closed' 
            : hhmmto12h(h.open) + ' – ' + hhmmto12h(h.close));
        $li.append($('<span></span>').text(txt).toggleClass('fw-bold', d === todayName).toggleClass('text-muted', !!(h && h.closed)));
        $('#pHours').append($li);
    });

    // contact info
    $('#pPhone').text(f.bizPhone || '—').attr('href', f.bizPhone ? 'tel:' + f.bizPhone.replace(/\s+/g, '') : null);
    $('#pEmail').text(f.bizEmail || '—').attr('href', f.bizEmail ? 'mailto:' + f.bizEmail : null);
    if (f.bizWebsite && /^https?:\/\//i.test(f.bizWebsite)) $('#pWebsite').text(f.bizWebsite).attr('href', f.bizWebsite);
    else $('#pWebsiteWrap').remove();
    if (f.bizSocial) $('#pSocial').text(f.bizSocial); else $('#pSocialWrap').remove();
    $('#pAddress').text([f.bizAddress, f.bizCity].filter(Boolean).join(', ') || '—');

    // reviews
    var reviews = biz.reviews || [];
    if (!reviews.length) $('#pReviews').append('<p class="small text-muted mb-0">No reviews yet.</p>');
    reviews.forEach(function (rv, i) {
        var $item = $('<div class="py-3"></div>').toggleClass('border-top', i > 0).toggleClass('pt-0', i === 0);
        var $head = $('<div class="d-flex align-items-center mb-1"></div>');
        $head.append('<div class="bg-secondary rounded-circle me-2" style="width: 32px; height: 32px;"></div>');
        $head.append($('<small class="fw-bold"></small>').text(rv.name));
        $head.append($('<small class="text-muted ms-auto"></small>').text(rv.date));
        $item.append($head);
        $item.append($('<p class="small mb-1"></p>').text(PawBookUtil.ratingStars(rv.rating)));
        $item.append($('<p class="small mb-0"></p>').text(rv.text));
        $('#pReviews').append($item);
    });
});