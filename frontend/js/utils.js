window.PawBookUtil = (function () {
    // currency 
    function money(n) { 
        return '₱' + Number(n).toLocaleString(); 
    }
    function priceOf(s) { 
        return Number(String(s.price).replace(/,/g, '')) || 0; 
    }

    // time: "HH:MM" <-> minutes 
    function hhmmToMinutes(t) { 
        var p = t.split(':'); return +p[0] * 60 + +p[1]; 
    }
    function minutesTo12h(min) {
        var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
        return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    }
  
    // "2:30 PM" -> minutes
    function hhmmaToMinutes(str) {
        var m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(str || '');
        if (!m) return 0;
        var h = +m[1] % 12; if (m[3].toUpperCase() === 'PM') h += 12;
        return h * 60 + +m[2];
    }

    // "14:30" -> "2:30 PM"
    function hhmmTo12h(t) {
        if (!t) return '';
        var p = t.split(':'), h = +p[0], ap = h >= 12 ? 'PM' : 'AM';
        return ((h % 12) || 12) + ':' + p[1] + ' ' + ap;
    }

    // dates: ISO <-> Date 
    function isoToDate(v) { 
        var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); 
    }
    function dateToIso(d) {
        var m = d.getMonth() + 1, day = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
    }

    // format date for display: "2024-06-15" -> "Sat, Jun 15, 2024"
    function formatDate(v) {
        return isoToDate(v).toLocaleDateString('en-PH',
        { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // pad single digit numbers with leading zero
    function pad2(n) { 
        return (n < 10 ? '0' : '') + n; 
    }

    // miscellaneous
    // stable hash
    function stableHash(str) {
        var h = 0;
        for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
        return h;
    }

    // localStorage list reader
    function readList(key) {
        try { var v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; }
        catch (e) { return []; }
    }

    // URL validation
    function isUrl(v) { 
        return !v || /^https?:\/\/\S+\.\S+/i.test(v); 
    }

    // relative time
    function relativeTime(ts) {
        var m = Math.floor((Date.now() - ts) / 60000);
        if (m < 1) return 'Just now';
        if (m < 60) return m + ' min' + (m === 1 ? '' : 's') + ' ago';
        var h = Math.floor(m / 60);
        if (h < 24) return h + ' hr' + (h === 1 ? '' : 's') + ' ago';
        var d = Math.floor(h / 24);
        return d === 1 ? 'Yesterday' : d + ' days ago';
    }

    // rating stars
    function ratingStars(n) { 
        return '★'.repeat(n) + '☆'.repeat(5 - n); 
    }

    // pill badge
    function pillBadge(text) {
        return $('<span class="badge bg-light text-dark border"></span>').text(text);
    }

    // status badge
    function statusBadge(st) {
        var $b = $('<span class="badge"></span>').text(st);
        if (st === 'Confirmed' || st === 'Completed') $b.addClass('bg-dark');
        else if (st === 'Pending') $b.addClass('bg-secondary');
        else $b.addClass('bg-light text-dark border');
        return $b;
    }

    // alert message
    function showAlert($container, type, msg) {
        var $a = $('<div class="alert alert-' + type + ' small alert-dismissible" role="alert"></div>')
        .text(msg)
        .append('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>');
        $container.empty().append($a);
    }

    // public API 
    return {
        money: money,
        priceOf: priceOf,
        hhmmToMinutes: hhmmToMinutes,
        minutesTo12h: minutesTo12h,
        hhmmaToMinutes: hhmmaToMinutes,
        hhmmTo12h: hhmmTo12h,
        isoToDate: isoToDate,
        dateToIso: dateToIso,
        formatDate: formatDate,
        pad2: pad2,
        stableHash: stableHash,
        readList: readList,
        isUrl: isUrl,
        relativeTime: relativeTime,
        ratingStars: ratingStars,
        pillBadge: pillBadge,
        statusBadge: statusBadge,
        showAlert: showAlert
    };
})();