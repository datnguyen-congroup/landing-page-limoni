/* LIMONI — script dùng chung cho mọi trang */
/* Song ngữ (19/10): trang tiếng Anh nằm trong thư mục en/ với <html lang="en">; T(vi, en) chọn chuỗi theo ngôn ngữ trang. */
var LIMONI_EN = document.documentElement.lang === 'en';
function T(vi, en) { return LIMONI_EN ? en : vi; }
(function () {
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = 'IntersectionObserver' in window && !reduceMotion;

  /* ---------- 20/10: mọi khối chữ đứng riêng đều có hiệu ứng hiện dần (trượt lên + rõ dần) như "Ba điều LIMONI giữ gìn" ----------
     Tự gắn data-reveal cho tiêu đề và đoạn văn trong các section (trừ hero đầu trang và các khối đã có hiệu ứng riêng:
     pillar, thẻ review, vé ưu đãi, tab hạng phòng, accordion, form, chữ nằm trên ảnh). Dòng tiêu đề xếp tầng hiện lần lượt. */
  if (canAnimate) {
    var SKIP = '.pillar, .reviews, .offers-list, .ticket, .offers-track, .offers-nav, .rt-panels, .rt-tabs, .rt-nav, .acc-item, form, .ph, .room, .room-card, .floor-plan, .rm, [data-reveal], .av2-post-word';
    var main = document.querySelector('main');
    if (main) {
      var first = main.firstElementChild;
      var groups = new Map();
      main.querySelectorAll('h2, h3, p, .stack > span, .stack > em, .hero-links, dl, .av2-map-link').forEach(function (el) {
        if (first && first.contains(el)) return;
        if (el.closest(SKIP)) return;
        if (el.matches('h2.stack, h2') && el.querySelector(':scope > span, :scope > em')) return; // tiêu đề xếp tầng: hiện từng dòng
        if (el.closest('dl') && el.tagName !== 'DL') return;
        if (!el.textContent.trim()) return;
        var par = el.closest('.stack') || el.parentElement;
        var i = groups.get(par) || 0; groups.set(par, i + 1);
        el.setAttribute('data-reveal', '');
        if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
      });
    }
  }

  /* ---------- Hiện dần các khối có data-reveal ---------- */
  if (canAnimate) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    var vh = window.innerHeight;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.9) el.classList.add('in'); // đã trong màn hình: hiện luôn
    });
    document.documentElement.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    revealEls.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });

    /* Section "Khách hàng nói gì?": ảnh nền thu 110% → 100%, thẻ đánh giá hiện lần lượt */
    var reviews = document.getElementById('reviews');
    if (reviews) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { reviews.classList.add('in'); rio.disconnect(); } });
      }, { threshold: 0.25 });
      rio.observe(reviews);
    }

    /* Pillar: vẽ đường kẻ dọc khi tiêu đề lộ ra trong khung ảnh */
    var pillars = document.querySelectorAll('.pillar');
    if (pillars.length) {
      var ticking = false;
      var updatePillars = function () {
        ticking = false;
        var h = window.innerHeight;
        pillars.forEach(function (p) {
          var r = p.getBoundingClientRect();
          var title = p.querySelector('h3, .pillar-title');
          var titleBottom = title ? title.getBoundingClientRect().bottom : h * 0.25;
          p.classList.toggle('in', r.top <= titleBottom && r.bottom > h * 0.35);
        });
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updatePillars); }
      }, { passive: true });
      window.addEventListener('resize', updatePillars);
      updatePillars();
    }
  }

  /* ---------- Header: nền đỏ + logo monogram khi cuộn qua hero ---------- */
  var header = document.getElementById('header');
  var hero = document.querySelector('.hero, .phero');
  if (header) {
    var onScroll = function () {
      var limit = hero ? hero.offsetHeight - header.offsetHeight : 120;
      header.classList.toggle('solid', window.scrollY > limit);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu toàn màn hình ---------- */
  var menu = document.getElementById('menu');
  var openBtn = document.getElementById('menuOpen');
  var closeBtn = document.getElementById('menuClose');
  if (menu && openBtn && closeBtn) {
    var menuOpen = false;
    var setMenu = function (open) {
      menuOpen = open;
      menu.classList.toggle('open', open);
      menu.inert = !open;
      menu.setAttribute('aria-hidden', String(!open));
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      (open ? closeBtn : openBtn).focus();
    };
    openBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    // Link sang trang khác: giữ menu mở để màn đỏ chuyển trang phủ lên luôn (comment 19/10); link trong cùng trang thì đóng menu như cũ
    menu.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () {
      var u; try { u = new URL(a.href, location.href); } catch (err) { setMenu(false); return; }
      var otherPage = u.pathname !== location.pathname || u.search !== location.search;
      if (!otherPage) setMenu(false);
    }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  }

  /* ---------- Tiện ích ngày ---------- */
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var todayStr = today.toISOString().slice(0, 10);
  function fmt(v) { var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function linkDates(a, b) {
    if (!a || !b) return;
    a.min = todayStr; b.min = todayStr;
    a.addEventListener('change', function () {
      b.min = a.value || todayStr;
      if (b.value && b.value <= a.value) b.value = '';
    });
  }

  // Chuyển sang engine đặt phòng EZCMS (dùng chung cho thanh đặt phòng và form liên hệ)
  function goToBooking(checkInVal, checkOutVal, adults, children) {
    var params = [
      ['hotel_code', 'JT4AB3'],
      ['check_in', checkInVal],
      ['check_out', checkOutVal],
      ['num_of_rooms', 1],
      ['num_of_adults', adults],
      ['num_of_children', children],
      ['promo_code', ''],
      ['room_code', ''],
      ['lang', T('vi', 'en')],
      ['currency', 'VND']
    ].map(function (p) { return p[0] + '=' + encodeURIComponent(p[1]); }).join('&');
    window.location.href = 'https://booking.ezcms.vn/hotel/BeDetailHotel?' + params;
  }

  /* ---------- Thanh đặt phòng (trang chủ, trang phòng) ---------- */
  var form = document.getElementById('bookingForm');
  if (form) {
    var note = document.getElementById('formNote');
    var checkin = document.getElementById('checkin');
    var checkout = document.getElementById('checkout');
    linkDates(checkin, checkout);
    var chosenRoom = '';
    document.querySelectorAll('[data-room]').forEach(function (r) {
      r.addEventListener('click', function () {
        chosenRoom = r.getAttribute('data-room');
        note.classList.remove('error');
        note.textContent = T('Phòng đã chọn: ' + chosenRoom + '. Chọn ngày để tiếp tục.', 'Selected room: ' + chosenRoom + '. Choose your dates to continue.');
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.classList.remove('error');
      if (!checkin.value || !checkout.value) {
        note.classList.add('error');
        note.textContent = T('Vui lòng chọn ngày nhận phòng và trả phòng.', 'Please choose your check-in and check-out dates.');
        (checkin.value ? checkout : checkin).focus();
        return;
      }
      if (checkout.value <= checkin.value) {
        note.classList.add('error');
        note.textContent = T('Ngày trả phòng phải sau ngày nhận phòng.', 'Check-out must be after check-in.');
        checkout.focus();
        return;
      }
      note.textContent = T('Đang chuyển tới trang đặt phòng…', 'Redirecting to the booking page…');
      goToBooking(checkin.value, checkout.value, document.getElementById('adults').value, document.getElementById('children').value);
    });
  }

  /* ---------- Form liên hệ / đặt phòng (trang Liên hệ) ---------- */
  var cform = document.getElementById('contactForm');
  if (cform) {
    var cnote = document.getElementById('contactNote');
    var cin = document.getElementById('cCheckin');
    var cout = document.getElementById('cCheckout');
    linkDates(cin, cout);
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      cnote.classList.remove('error');
      var name = document.getElementById('cName');
      var email = document.getElementById('cEmail');
      var problem = null;
      if (!name.value.trim()) problem = [name, T('Vui lòng nhập họ và tên.', 'Please enter your full name.')];
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) problem = [email, T('Email chưa đúng định dạng, ví dụ: ten@email.com.', 'Please enter a valid email, e.g. name@email.com.')];
      else if (!cin.value || !cout.value) problem = [cin.value ? cout : cin, T('Vui lòng chọn ngày nhận phòng và trả phòng.', 'Please choose your check-in and check-out dates.')];
      else if (cout.value <= cin.value) problem = [cout, T('Ngày trả phòng phải sau ngày nhận phòng.', 'Check-out must be after check-in.')];
      if (problem) {
        cnote.classList.add('error');
        cnote.textContent = problem[1];
        problem[0].focus();
        return;
      }
      cnote.textContent = T('Đang chuyển tới trang đặt phòng…', 'Redirecting to the booking page…');
      goToBooking(cin.value, cout.value, document.getElementById('cAdults').value, document.getElementById('cKids').value);
    });
  }

  /* ---------- Accordion (câu hỏi thường gặp, danh sách tầng) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    var single = group.getAttribute('data-accordion') === 'single';
    var items = group.querySelectorAll('.acc-item');
    items.forEach(function (item) {
      var btn = item.querySelector('.acc-head');
      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('open');
        if (single) items.forEach(function (o) { if (o !== item) setItem(o, false); });
        setItem(item, willOpen || single);
      });
    });
    function setItem(item, open) {
      item.classList.toggle('open', open);
      item.querySelector('.acc-head').setAttribute('aria-expanded', String(open));
      if (open && item.hasAttribute('data-floor')) showFloor(item.getAttribute('data-floor'));
    }
  });

  /* ---------- Trang Phòng nghỉ: danh sách phòng cuộn liền mạch qua các tầng ----------
     Cột phải là một vùng cuộn chứa phòng của tất cả các tầng (2 → 5). Cuộn hết tầng 2 thì sang tầng 3, rồi tiếp tục đến hết.
     Accordion bên trái tự mở đúng tầng đang hiển thị; bấm vào một tầng thì cột phải cuộn tới tầng đó. */
  var floorScroller = document.querySelector('.floors-right');
  var floorItems = document.querySelectorAll('.floors [data-accordion] .acc-item[data-floor]');
  var floorLock = 0;
  function openFloorItem(floor) {
    floorItems.forEach(function (it) {
      var on = it.getAttribute('data-floor') === floor;
      if (it.classList.contains('open') !== on) {
        it.classList.toggle('open', on);
        it.querySelector('.acc-head').setAttribute('aria-expanded', String(on));
      }
    });
  }
  function showFloor(floor) {
    if (!floorScroller) return;
    var list = floorScroller.querySelector('.floor-rooms[data-floor="' + floor + '"]');
    if (!list || list.parentNode !== floorScroller) return; // mobile: danh sách nằm trong accordion, không cần cuộn
    floorLock = Date.now() + 900; // đang cuộn theo lệnh bấm: tạm không đồng bộ ngược accordion
    floorScroller.scrollTo({ top: list.offsetTop, behavior: 'smooth' });
  }
  if (floorScroller && floorItems.length) {
    var lists = floorScroller.querySelectorAll('.floor-rooms[data-floor]');
    var ticking = false;
    floorScroller.addEventListener('scroll', function () {
      if (Date.now() < floorLock) { floorLock = Date.now() + 150; return; }
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var top = floorScroller.scrollTop, probe = top + floorScroller.clientHeight * 0.35, cur = null;
        lists.forEach(function (l) { if (l.offsetTop <= probe) cur = l.getAttribute('data-floor'); });
        if (top + floorScroller.clientHeight >= floorScroller.scrollHeight - 2) cur = lists[lists.length - 1].getAttribute('data-floor');
        if (cur) openFloorItem(cur);
      });
    }, { passive: true });
  }
})();

/* Footer curtain reveal: chỉ bật khi footer vừa trong một màn hình (nếu cao hơn, phần trên sẽ không bao giờ lộ ra). */
(() => {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const root = document.documentElement;
  const update = () => root.classList.toggle('footer-reveal', footer.offsetHeight <= window.innerHeight);
  update();
  window.addEventListener('resize', update, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(footer);
})();

/* Mở trang mới luôn bắt đầu từ section đầu tiên.
   Trình duyệt / khung xem artifact có thể giữ lại vị trí cuộn của trang trước (hoặc khôi phục vị trí cũ)
   khi chuyển trang từ menu — nên chủ động đưa về đầu trang, trừ khi link có #anchor (vd. contact.html#dat-phong).
   19/10: bỏ lần kéo về đầu trang lúc 'load' (sự kiện này đến muộn, sau khi tải hết ảnh — nếu khách đã bắt đầu cuộn
   thì trang bị giật ngược lên). Giờ chỉ kéo về đầu ngay khi mở trang, và lúc 'load' chỉ khi khách chưa cuộn/chạm. */
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let touched = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(t => window.addEventListener(t, () => { touched = true; }, { passive: true, once: true }));
  const toTop = () => {
    if (location.hash && document.getElementById(location.hash.slice(1))) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Nếu trang đang nằm trong khung (iframe) mà khung ngoài cuộn, kéo cả khung ngoài về đầu trang
    try { document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) {}
  };
  window.limoniToTop = toTop;
  toTop();
  window.addEventListener('pageshow', e => { if (e.persisted) return; toTop(); });
  window.addEventListener('load', () => { if (!touched) toTop(); });
})();

/* ---------- Popup thông tin phòng (Love Archive) ----------
   Mọi phần tử có data-room-id="<id>" (thẻ phòng trang chủ, trang Phòng nghỉ, gợi ý trong popup) sẽ mở popup của phòng đó.
   Dữ liệu: window.LIMONI_ROOMS (rooms-data.js). Link trực tiếp: #phong-<id> mở sẵn popup. */
(() => {
  const ROOMS = window.LIMONI_ROOMS;
  if (!Array.isArray(ROOMS) || !ROOMS.length) return;
  const byId = Object.fromEntries(ROOMS.map(r => [r.id, r]));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bookHref = r => 'contact.html?room=' + encodeURIComponent(r.id) + '#dat-phong';

  /* Prefill form liên hệ khi đến từ nút "Đặt phòng" của popup */
  const msg = document.getElementById('cMsg');
  if (msg) {
    const id = new URLSearchParams(location.search).get('room');
    const r = id && byId[id];
    if (r && !msg.value) msg.value = T('Tôi muốn đặt phòng ' + r.name + ' (Phòng ' + r.room + ', Tầng ' + r.floor + ' — câu chuyện ' + r.couple + ').', 'I would like to book ' + r.name + ' (Room ' + r.room + ', Floor ' + r.floor + ' — the story of ' + r.couple + ').');
  }

  const triggers = () => document.querySelectorAll('[data-room-id]');
  if (!document.querySelector('[data-room-id]')) return;

  /* Khung popup */
  const root = document.createElement('div');
  root.className = 'rm';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'rmTitle');
  root.setAttribute('aria-hidden', 'true');
  root.inert = true;
  root.innerHTML =
    '<div class="rm-backdrop" data-rm-close></div>' +
    '<div class="rm-sheet">' +
      '<button class="rm-close" type="button" data-rm-close aria-label="' + T('Đóng thông tin phòng', 'Close room details') + '">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.5"/></svg><span>' + T('Đóng', 'Close') + '</span></button>' +
      '<div class="rm-scroll"></div>' +
      '<div class="rm-foot"><div class="rm-foot-info"><strong></strong><span></span></div>' +
        '<a class="rm-book" href="contact.html#dat-phong"><span>' + T('Đặt phòng', 'Book this room') + '</span><span aria-hidden="true">→</span></a></div>' +
    '</div>';
  document.body.appendChild(root);
  const scroller = root.querySelector('.rm-scroll');
  const footName = root.querySelector('.rm-foot-info strong');
  const footMeta = root.querySelector('.rm-foot-info span');
  const bookBtn = root.querySelector('.rm-book');
  let lastFocus = null, current = null;

  function suggestions(r) {
    // 2 phòng cùng tầng (kế tiếp phòng đang xem) + phòng đầu tiên của tầng kế
    const same = ROOMS.filter(x => x.floor === r.floor && x.id !== r.id);
    const i = same.findIndex(x => x.no > r.no);
    const ordered = i < 0 ? same : same.slice(i).concat(same.slice(0, i));
    const nextFloor = ROOMS.find(x => x.floor === (r.floor === 5 ? 2 : r.floor + 1));
    return [ordered[0], ordered[1], nextFloor].filter(Boolean);
  }

  function render(r) {
    const hero = r.photos.find(p => /giường|bed/i.test(p.cap)) || r.photos[0];
    const views = r.photos.map((p, i) =>
      '<figure><img src="' + p.src + '" alt="' + esc(r.name + ' — ' + p.cap) + '" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async">' +
      '<figcaption><span>' + pad(i + 1) + '</span>' + esc(p.cap) + '</figcaption></figure>').join('');
    const art = r.art.map((a, k) => '<img src="' + a.src + '" alt="" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async" style="--k:' + k + '">').join('');
    const more = suggestions(r).map(s =>
      '<button class="rm-card" type="button" data-room-id="' + s.id + '">' +
        '<img src="' + (s.photos.find(p => /giường|bed/i.test(p.cap)) || s.photos[0]).src + '" alt="" loading="lazy">' +
        '<span class="eyebrow">' + T('Tầng ', 'Floor ') + s.floor + T(' · Phòng ', ' · Room ') + s.room + '</span>' +
        '<span class="rm-card-text"><h4>' + esc(s.name) + '</h4><span class="eyebrow">' + esc(s.couple) + '</span></span>' +
      '</button>').join('');

    scroller.innerHTML =
      '<header class="rm-hero">' +
        '<img src="' + hero.src + '" alt="' + esc(r.name + ' — ' + hero.cap) + '">' +
        '<div class="rm-hero-text"><p class="eyebrow">' + T('Câu chuyện ', 'Story ') + pad(r.no) + T(' · Tầng ', ' · Floor ') + r.floor + T(' · Phòng ', ' · Room ') + r.room + '</p>' +
          '<h2 id="rmTitle">' + esc(r.name) + '</h2><p class="rm-couple">' + esc(r.couple) + '</p></div>' +
      '</header>' +
      '<section class="rm-sec">' +
        '<div class="rm-label"><p class="eyebrow">' + T('Câu chuyện', 'The story') + '</p><p class="rm-tagline">' + esc(r.tagline) + '</p></div>' +
        '<div class="rm-story"><p>' + esc(r.story) + '</p>' +
          '<dl class="rm-facts"><div><dt>' + T('Tầng', 'Floor') + '</dt><dd>' + r.floor + '</dd></div><div><dt>' + T('Phòng', 'Room') + '</dt><dd>' + r.room + '</dd></div>' +
          '<div><dt>' + T('Mẫu thiết kế', 'Design') + '</dt><dd>' + esc(r.typeName) + '</dd></div></dl></div>' +
      '</section>' +
      '<section class="rm-sec">' +
        '<div class="rm-label"><h3>' + T('Mặt bằng', 'Floor plan') + '</h3><p class="eyebrow">' + T('Tầng ', 'Floor ') + r.floor + '</p></div>' +
        '<figure class="rm-plan"><img src="' + r.plan + '" alt="' + T('Mặt bằng tầng ' + r.floor + ', vị trí phòng ' + r.room + ' được tô đỏ', 'Floor ' + r.floor + ' plan, with room ' + r.room + ' highlighted in red') + '" loading="lazy">' +
          '<figcaption>' + T('Vị trí phòng ', 'Location of room ') + r.room + ' — ' + esc(r.name) + '</figcaption></figure>' +
      '</section>' +
      '<section class="rm-views-wrap" aria-label="' + T('Ảnh theo góc nhìn', 'Room views') + '">' +
        '<div class="rm-views-head"><div class="rm-label"><h3>' + T('Góc nhìn <em>trong phòng</em>', 'Inside <em>the room</em>') + '</h3></div>' +
          '<p>' + T('Mẫu thiết kế ', 'Design: ') + esc(r.typeName) + ' — ' + r.photos.length + T(' góc nhìn.', ' views.') + '</p></div>' +
        '<div class="rm-views" data-count="' + r.photos.length + '">' + views + '</div>' +
      '</section>' +
      '<section class="rm-sec">' +
        '<div class="rm-label"><h3>' + T('Artwork <em>của câu chuyện</em>', 'The story\'s <em>artwork</em>') + '</h3><p class="eyebrow">' + esc(r.couple) + '</p></div>' +
        '<div class="rm-art-wrap"><div class="rm-stack" role="button" tabindex="0" data-n="' + r.art.length + '" aria-label="' + T('Chồng artwork — bấm để xem ảnh tiếp theo', 'Artwork stack — tap to see the next image') + '">' + art + '</div>' +
          '<p class="rm-stack-hint"><span class="rm-stack-count">01 / ' + pad(r.art.length) + '</span> ' + T('Bấm vào chồng ảnh để xem ảnh tiếp theo', 'Tap the stack to see the next image') + '</p></div>' +
      '</section>' +
      '<section class="rm-more" aria-label="' + T('Gợi ý phòng khác', 'Other rooms') + '">' +
        '<div class="rm-more-head"><h3>' + T('Những câu chuyện <em>khác</em>', 'Other <em>stories</em>') + '</h3><a href="rooms.html#floors" data-rm-close>' + T('Xem cả 20 phòng →', 'See all 20 rooms →') + '</a></div>' +
        '<div class="rm-more-list">' + more + '</div>' +
      '</section>';

    footName.textContent = r.name;
    footMeta.textContent = T('Tầng ', 'Floor ') + r.floor + T(' · Phòng ', ' · Room ') + r.room + ' · ' + r.couple;
    bookBtn.href = bookHref(r);
    bookBtn.setAttribute('aria-label', T('Đặt phòng ', 'Book ') + r.name);
  }

  function open(id, fromEl) {
    const r = byId[id];
    if (!r) return;
    if (!root.classList.contains('open')) lastFocus = fromEl || document.activeElement;
    const swapping = root.classList.contains('open');
    render(r);
    current = r;
    scroller.scrollTop = 0;
    if (swapping) { scroller.classList.remove('swap'); void scroller.offsetWidth; scroller.classList.add('swap'); }
    root.inert = false;
    root.setAttribute('aria-hidden', 'false');
    root.classList.add('open');
    document.documentElement.classList.add('room-open');
    try { history.replaceState(null, '', '#phong-' + r.id); } catch (e) {}
    setTimeout(() => root.querySelector('.rm-close').focus({ preventScroll: true }), 50);
  }

  function close() {
    if (!root.classList.contains('open')) return;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
    document.documentElement.classList.remove('room-open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    current = null;
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-room-id]');
    if (t) { e.preventDefault(); open(t.getAttribute('data-room-id'), t.closest('.rm') ? null : t); return; }
    if (e.target.closest('[data-rm-close]')) close();
  });
  /* Chồng artwork: bấm (hoặc Enter/Space) để đưa ảnh trên cùng xuống cuối chồng */
  function cycleStack(st) {
    const imgs = [...st.querySelectorAll('img')], n = imgs.length;
    imgs.forEach(im => im.style.setProperty('--k', (Number(im.style.getPropertyValue('--k')) - 1 + n) % n));
    const top = (Number(st.dataset.top || 0) + 1) % n; st.dataset.top = top;
    const c = st.parentNode.querySelector('.rm-stack-count'); if (c) c.textContent = pad(top + 1) + ' / ' + pad(n);
  }
  root.addEventListener('click', e => { const st = e.target.closest('.rm-stack'); if (st) cycleStack(st); });
  root.addEventListener('keydown', e => { const st = e.target.closest && e.target.closest('.rm-stack'); if (st && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cycleStack(st); } });

  document.addEventListener('keydown', e => {
    if (!root.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // giữ focus trong popup
      const f = [...root.querySelectorAll('button, a[href], [tabindex="0"]')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const m = location.hash.match(/^#phong-(.+)$/);
  if (m && byId[m[1]]) open(m[1]);
})();

/* Sơ đồ tầng: liên kết thẻ phòng ↔ ô phòng trên sơ đồ (trang Phòng nghỉ) */
(() => {
  const rects = document.querySelectorAll('.fp-room[data-room-id]');
  if (!rects.length) return;
  const cardOf = id => document.querySelector('.floors-right .room-card[data-room-id="' + id + '"]');
  const rectOf = id => document.querySelector('.fp-room[data-room-id="' + id + '"]');
  const set = (id, on) => {
    const r = rectOf(id), c = cardOf(id);
    if (r) r.classList.toggle('on', on);
    if (c) c.classList.toggle('fp-on', on);
  };
  document.querySelectorAll('.floors-right .room-card[data-room-id]').forEach(c => {
    const id = c.getAttribute('data-room-id');
    c.addEventListener('mouseenter', () => set(id, true));
    c.addEventListener('mouseleave', () => set(id, false));
    c.addEventListener('focus', () => set(id, true));
    c.addEventListener('blur', () => set(id, false));
  });
  rects.forEach(r => {
    const id = r.getAttribute('data-room-id');
    r.addEventListener('mouseenter', () => set(id, true));
    r.addEventListener('mouseleave', () => set(id, false));
  });
})();

/* [Mobile ≤ 560px] Trang Phòng nghỉ: danh sách phòng của mỗi tầng được chuyển vào bên trong accordion của tầng đó
   (mở tầng nào thấy phòng của tầng đó); trên màn lớn hơn trả về cột phải như cũ. */
(() => {
  const right = document.querySelector('.floors-right');
  if (!right) return;
  const mq = window.matchMedia('(max-width: 560px)');
  const lists = [...document.querySelectorAll('.floor-rooms[data-floor]')];
  const place = () => {
    lists.forEach(l => {
      if (mq.matches) {
        const body = document.querySelector('.floors .acc-item[data-floor="' + l.dataset.floor + '"] .acc-body > div');
        if (body && l.parentNode !== body) body.appendChild(l);
      } else if (l.parentNode !== right) right.appendChild(l);
    });
    document.documentElement.classList.toggle('rooms-in-floors', mq.matches);
  };
  place();
  mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place);
})();

/* Trang Ưu đãi — carousel vòng lặp 3 ưu đãi (18/10).
   Dựng 5 ô (ưu đãi -2 … +2 quanh ưu đãi đang chọn); khi chuyển, cả dải trượt 1 ô rồi dựng lại ô quanh ưu đãi mới
   nên vòng lặp liền mạch theo cả hai chiều. Bấm ảnh hai bên, vuốt, hoặc phím ←/→ để chuyển. */
(() => {
  const sec = document.querySelector('.offers');
  if (!sec) return;
  const list = sec.querySelector('.offers-list');
  const items = [...list.querySelectorAll('.offer-item')];
  const n = items.length;
  if (n < 2) return;
  const track = document.createElement('div');
  track.className = 'offers-track';
  list.replaceWith(track);
  sec.classList.add('js-offers');
  let active = 0, busy = false;
  const mod = i => ((i % n) + n) % n;
  const slotW = () => { const a = track.children[0], b = track.children[1]; return b.offsetLeft - a.offsetLeft; };

  function render() {
    track.innerHTML = '';
    for (let k = -2; k <= 2; k++) {
      const idx = mod(active + k);
      const el = items[idx].cloneNode(true);
      el.dataset.k = k; el.dataset.idx = idx;
      setRole(el, k === 0);
      track.appendChild(el);
    }
    measure();
  }
  function setRole(el, center) {
    el.classList.toggle('is-center', center);
    const title = el.querySelector('h2').textContent;
    if (center) {
      el.removeAttribute('role'); el.removeAttribute('tabindex'); el.removeAttribute('aria-label');
      el.querySelector('.offer-text').removeAttribute('aria-hidden');
      el.querySelectorAll('a').forEach(a => a.removeAttribute('tabindex'));
      el.setAttribute('aria-roledescription', 'slide');
      el.setAttribute('aria-label', (+el.dataset.idx + 1) + ' / ' + n + ': ' + title);
    } else {
      const visible = Math.abs(+el.dataset.k) === 1;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', T('Xem ưu đãi: ', 'View offer: ') + title);
      if (visible) el.tabIndex = 0; else el.tabIndex = -1;
      if (!visible) el.setAttribute('aria-hidden', 'true');
      el.querySelector('.offer-text').setAttribute('aria-hidden', 'true');
      el.querySelectorAll('a').forEach(a => a.tabIndex = -1);
    }
  }
  function measure() {
    const c = track.querySelector('.is-center .offer-text');
    if (c) track.style.setProperty('--drop', ((c.offsetHeight + 24) / 2) + 'px');
  }
  function go(dir) {
    if (busy || !dir) return;
    busy = true;
    const hadFocus = sec.contains(document.activeElement) && document.activeElement !== document.body;
    const slots = [...track.children];
    slots.forEach(el => { el.dataset.k = +el.dataset.k - dir; setRole(el, +el.dataset.k === 0); });
    measure();
    track.style.setProperty('--shift', (-dir * slotW()) + 'px');
    const done = () => {
      active = mod(active + dir);
      if (typeof count !== 'undefined' && count) count.textContent = String(active + 1).padStart(2, '0');
      track.classList.add('no-anim');
      track.style.setProperty('--shift', '0px');
      render();
      void track.offsetWidth;
      track.classList.remove('no-anim');
      busy = false;
      if (hadFocus) { const t = track.querySelector('[data-k="' + dir + '"]'); t && t.focus({ preventScroll: true }); }
    };
    const dur = parseFloat(getComputedStyle(sec).getPropertyValue('--dur')) || 0;
    if (!dur) { done(); return; }
    let fired = false;
    const fin = e => { if (e && (e.target !== track || e.propertyName !== 'transform')) return; if (fired) return; fired = true; track.removeEventListener('transitionend', fin); done(); };
    track.addEventListener('transitionend', fin);
    setTimeout(fin, dur * 1000 + 150);
  }
  track.addEventListener('click', e => {
    const slot = e.target.closest('.offer-item');
    if (!slot || slot.classList.contains('is-center')) return;
    e.preventDefault();
    go(Math.sign(+slot.dataset.k));
  });
  track.addEventListener('keydown', e => {
    const slot = e.target.closest('.offer-item');
    if ((e.key === 'Enter' || e.key === ' ') && slot && !slot.classList.contains('is-center')) { e.preventDefault(); go(Math.sign(+slot.dataset.k)); }
  });
  sec.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  // vuốt trên màn cảm ứng (19/10: dùng touch events + touch-action: pan-y — pointer events bị trình duyệt huỷ khi vuốt ngang trên mobile)
  let x0 = null, y0 = 0, swiped = false;
  track.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; swiped = false; }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (x0 === null) return;
    const t = e.touches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) && e.cancelable) e.preventDefault();
  }, { passive: false });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  track.addEventListener('touchcancel', () => { x0 = null; });
  // vuốt xong thì bỏ cú "click" đi kèm (tránh vừa vuốt vừa mở link cuống vé)
  track.addEventListener('click', e => { if (swiped) { swiped = false; e.preventDefault(); e.stopPropagation(); } }, true);

  // Mũi tên trái / phải + số thứ tự ở dưới carousel (19/10 — hiển thị trên mobile)
  const nav = document.createElement('div');
  nav.className = 'offers-nav';
  nav.innerHTML = '<span class="rt-count" aria-live="polite"><b>01</b> / ' + String(n).padStart(2, '0') + '</span>' +
    '<div class="rt-arrows">' +
      '<button class="rt-arrow" type="button" data-dir="-1" aria-label="' + T('Ưu đãi trước', 'Previous offer') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
      '<button class="rt-arrow" type="button" data-dir="1" aria-label="' + T('Ưu đãi tiếp theo', 'Next offer') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
    '</div>';
  track.after(nav);
  const count = nav.querySelector('.rt-count b');
  nav.addEventListener('click', e => { const b = e.target.closest('[data-dir]'); if (b) go(+b.dataset.dir); });
  sec.addEventListener('scroll', () => { if (sec.scrollLeft) sec.scrollLeft = 0; });
  window.addEventListener('resize', measure);
  render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
})();

/* Phòng nghỉ — tab các hạng phòng (18/10): đổi ảnh + nội dung; phím ←/→/Home/End chuyển tab. */
(() => {
  const sec = document.querySelector('.room-types');
  if (!sec) return;
  const tabs = [...sec.querySelectorAll('.rt-tab')];
  const panels = [...sec.querySelectorAll('.rt-panel')];
  const imgs = [...sec.querySelectorAll('.rt-img')];
  const select = (i, focus) => {
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    const type = panels[i].dataset.type;
    panels.forEach(p => { p.hidden = p.dataset.type !== type; });
    shown = 0;
    imgs.forEach(im => im.classList.toggle('on', im === imgs.find(x => x.dataset.type === type)));
    if (focus) tabs[i].focus();
    cur = i;
    buildInd();
    restart();
    const cnt = sec.querySelector('.rt-count');
    if (cnt) cnt.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(tabs.length).padStart(2, '0');
  };
  let cur = 0;
  /* 20/10: mỗi hạng phòng có nhiều ảnh — tự chuyển sang ảnh kế tiếp sau mỗi 2s (vòng lặp);
     chỉ chạy khi section đang trong màn hình và tab trình duyệt đang mở; đổi hạng phòng thì bắt đầu lại từ ảnh đầu. */
  const INTERVAL = 2000;
  let shown = 0, timer = 0, visible = false;
  const step = () => {
    const set = imgs.filter(im => im.dataset.type === panels[cur].dataset.type);
    if (set.length < 2) return;
    shown = (shown + 1) % set.length;
    const nx = set[(shown + 1) % set.length]; if (nx.loading === 'lazy') nx.loading = 'eager';
    set.forEach((im, k) => im.classList.toggle('on', k === shown));
    paintInd();
  };
  /* Chỉ báo ảnh (20/10): mỗi ảnh của hạng phòng là một vạch ở đáy khung ảnh; vạch đang xem chạy đầy trong 2s; bấm vạch để tới ảnh đó. */
  const ind = document.createElement('div');
  ind.className = 'rt-ind';
  sec.querySelector('.rt-media').appendChild(ind);
  function buildInd() {
    const set = imgs.filter(im => im.dataset.type === panels[cur].dataset.type);
    ind.innerHTML = '';
    ind.hidden = set.length < 2;
    set.forEach((im, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', T('Ảnh ', 'Image ') + (k + 1) + ' / ' + set.length);
      b.innerHTML = '<span></span>';
      b.addEventListener('click', () => {
        shown = k;
        set.forEach((x, j) => x.classList.toggle('on', j === k));
        set.forEach(x => { if (x.loading === 'lazy') x.loading = 'eager'; });
        paintInd(); restart();
      });
      ind.appendChild(b);
    });
    paintInd();
  }
  function paintInd() {
    [...ind.children].forEach((b, k) => {
      b.classList.toggle('done', k < shown);
      b.classList.remove('on'); void b.offsetWidth;
      if (k === shown) b.classList.add('on');
      b.setAttribute('aria-current', k === shown ? 'true' : 'false');
    });
    ind.classList.toggle('running', !!timer);
  }
  function restart() {
    clearInterval(timer); timer = 0;
    if (typeof paintInd === 'function' && ind) ind.classList.remove('running');
    if (!visible || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const set = imgs.filter(im => im.dataset.type === panels[cur].dataset.type);
    if (set[1] && set[1].loading === 'lazy') set[1].loading = 'eager';
    timer = setInterval(step, INTERVAL);
    paintInd();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; restart(); }, { threshold: 0.25 }).observe(sec.querySelector('.rt-media'));
  } else { visible = true; restart(); }
  document.addEventListener('visibilitychange', restart);
  buildInd();
  sec.querySelectorAll('.rt-arrow').forEach(b => b.addEventListener('click', () => {
    select((cur + (+b.dataset.dir) + tabs.length) % tabs.length);
  }));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(j, true); }
    });
  });
})();

/* Công tắc ngôn ngữ VN / ENG (19/10): mỗi trang có bản tiếng Anh riêng trong en/; nút VN/ENG là link sang trang tương ứng (build.py). */

/* Trang Ưu đãi — bấm cuống vé: xé rời cuống rồi chuyển tới trang đặt phòng (18/10).
   Trang Liên hệ: ?offer=... điền sẵn ưu đãi vào ô lời nhắn. */
(() => {
  document.addEventListener('click', e => {
    const stub = e.target.closest('.offers .is-center .tk-stub');
    if (!stub || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    e.preventDefault();
    stub.classList.add('torn');
    setTimeout(() => { window.limoniGo ? window.limoniGo(stub.href) : (location.href = stub.href); }, 650);
  });
  window.addEventListener('pageshow', () => document.querySelectorAll('.tk-stub.torn').forEach(s => s.classList.remove('torn')));
  const msg = document.getElementById('cMsg');
  const offer = msg && new URLSearchParams(location.search).get('offer');
  if (offer && !msg.value) msg.value = T('Tôi muốn đặt phòng với ưu đãi ' + offer + '.', 'I would like to book with the ' + offer + ' offer.');
})();

/* Chữ [data-fit-width]: co/giãn cỡ chữ để dòng chữ dài đúng bằng bề ngang khung chứa (18/10) */
(() => {
  const els = [...document.querySelectorAll('[data-fit-width]')];
  if (!els.length) return;
  const fit = () => els.forEach(el => {
    const box = el.parentElement.clientWidth;
    el.style.fontSize = '100px';
    const w = el.scrollWidth || el.getBoundingClientRect().width;
    // scrollWidth của phần tử rộng 100% không phản ánh độ dài chữ → đo bằng range
    const r = document.createRange(); r.selectNodeContents(el);
    const tw = r.getBoundingClientRect().width || w;
    if (tw) el.style.fontSize = (100 * box / tw) + 'px';
  });
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
})();

/* =====================================================================
   Hiệu ứng chuyển trang (18/10): màn đỏ trượt vào từ phải → chuyển trang → màn đỏ trượt ra sang trái.
   window.limoniGo(url) dùng chung cho các nút tự điều hướng bằng JS (vd. cuống vé trang Ưu đãi).
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get() { try { return sessionStorage.getItem('limoni-pt'); } catch (e) { return null; } },
    set() { try { sessionStorage.setItem('limoni-pt', '1'); } catch (e) {} },
    clear() { try { sessionStorage.removeItem('limoni-pt'); } catch (e) {} }
  };
  const curtain = document.createElement('div');
  curtain.className = 'pt-curtain'; curtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curtain);

  // Vào trang: nếu trang trước vừa phủ đỏ, bắt đầu ở trạng thái phủ kín rồi rút sang trái
  // 19/10 (phối lại): bỏ khoảng dừng — trang đích đã được tải trước trong lúc màn đỏ phủ, nên vừa sang trang là rút màn đỏ ngay.
  const DWELL = 0;
  if (store.get() || root.classList.contains('pt-enter')) {
    const coveredAt = +store.get() || 0;
    store.clear();
    const shade = document.createElement('div'); shade.className = 'pt-shade'; shade.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shade);
    curtain.classList.add('at-cover');
    root.classList.remove('pt-enter');
    // 19/10: chỉ rút màn đỏ khi section đầu tiên đã sẵn sàng (ảnh hero đã giải mã + font đã tải),
    // tối đa chờ 1,8s — tránh cảnh màn đỏ rút đi mà phía sau ảnh hero chưa hiện, chữ còn nhảy font.
    const first = document.querySelector('main > :first-child');
    const heroImg = first && first.querySelector('img');
    const imgReady = heroImg ? (heroImg.decode ? heroImg.decode().catch(() => {}) : new Promise(r => { if (heroImg.complete) r(); else { heroImg.onload = heroImg.onerror = r; } })) : Promise.resolve();
    const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
    const cap = new Promise(r => setTimeout(r, 800));
    Promise.race([Promise.all([imgReady, fontReady]), cap]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      const waited = coveredAt > 1e12 ? Date.now() - coveredAt : 0;
      setTimeout(() => {
        if (window.limoniToTop) window.limoniToTop();
        curtain.classList.remove('at-cover'); curtain.classList.add('leave'); shade.classList.add('off');
        setTimeout(() => { curtain.className = 'pt-curtain'; shade.remove(); }, 900);
      }, Math.max(0, DWELL - waited));
    })));
  }

  /* Tải trước trang đích + ảnh section đầu của nó (19/10): bắt đầu ngay khi rê chuột / chạm vào link,
     và chậm nhất là lúc bấm — tận dụng 0,5s màn đỏ đang phủ để trang mới sẵn trong bộ nhớ đệm. */
  let heroes = {};
  try { heroes = JSON.parse((document.querySelector('meta[name="limoni-heroes"]') || {}).content || '{}'); } catch (e) {}
  const warmed = new Set();
  const warm = href => {
    let u; try { u = new URL(href, location.href); } catch (e) { return; }
    if (!/\.html$/i.test(u.pathname) || warmed.has(u.pathname)) return;
    warmed.add(u.pathname);
    if (location.protocol !== 'file:') fetch(u.pathname + u.search, { credentials: 'same-origin' }).catch(() => {});
    const key = Object.keys(heroes).find(k => new URL(k, location.href).pathname === u.pathname);
    if (key) { const im = new Image(); im.decoding = 'async'; im.src = heroes[key]; }
  };
  const warmFrom = e => { const a = e.target.closest && e.target.closest('a[href$=".html"], a[href*=".html?"], a[href*=".html#"]'); if (a && a.target !== '_blank') warm(a.href); };
  document.addEventListener('pointerover', warmFrom, { passive: true });
  document.addEventListener('touchstart', warmFrom, { passive: true });
  document.addEventListener('focusin', warmFrom);

  let going = false;
  const go = url => {
    if (reduce || going) { location.href = url; return; }
    going = true;
    warm(url);
    curtain.className = 'pt-curtain';
    void curtain.offsetWidth;
    curtain.classList.add('cover');
    // phủ xong (0,5s) thì chuyển trang ngay
    setTimeout(() => { try { sessionStorage.setItem('limoni-pt', String(Date.now())); } catch (err) {} location.href = url; }, 500);
  };
  window.limoniGo = go;

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    let url; try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin && location.protocol !== 'file:') return;
    if (!/\.html$/i.test(url.pathname) && !/\/$/.test(url.pathname)) return;
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage) return;   // cùng trang (chỉ khác #) thì để cuộn bình thường
    e.preventDefault();
    go(url.href);
  });

  // Quay lại bằng nút Back (trang lấy từ bộ nhớ đệm): gỡ màn đỏ còn sót
  window.addEventListener('pageshow', ev => {
    if (ev.persisted) { going = false; curtain.className = 'pt-curtain'; store.clear(); root.classList.remove('pt-enter'); }
  });
})();

/* Dải ảnh cuộn ngang (.strip, vd. trang ANFORA) — comment 18/10:
   • nhấn giữ chuột rồi kéo để trượt ngang (có quán tính nhẹ khi thả);
   • rê chuột lên dải ảnh thì con lăn chuột cuộn ngang; tới đầu/cuối dải thì trả lại cuộn dọc cho trang. */
(() => {
  document.querySelectorAll('.strip').forEach(strip => {
    let down = false, moved = false, x0 = 0, s0 = 0, lastX = 0, lastT = 0, v = 0, raf = 0;
    const max = () => strip.scrollWidth - strip.clientWidth;
    strip.style.scrollBehavior = 'auto';
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = lastX = e.clientX; s0 = strip.scrollLeft; lastT = performance.now(); v = 0;
      cancelAnimationFrame(raf);
      strip.style.scrollSnapType = 'none';
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('dragging'); }
      strip.scrollLeft = s0 - dx;
      const t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false; strip.classList.remove('dragging');
      let vel = -v * 16;   // px mỗi khung hình
      const glide = () => {
        if (Math.abs(vel) < 0.5) { strip.style.scrollSnapType = ''; return; }
        strip.scrollLeft += vel; vel *= 0.92; raf = requestAnimationFrame(glide);
      };
      glide();
    });
    // chặn click/kéo ảnh mặc định khi vừa kéo
    strip.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    strip.addEventListener('dragstart', e => e.preventDefault());
    // con lăn → cuộn ngang khi đang rê chuột trên dải
    strip.addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      const atStart = strip.scrollLeft <= 0, atEnd = strip.scrollLeft >= max() - 1;
      if ((d < 0 && atStart) || (d > 0 && atEnd)) return;   // hết dải: để trang cuộn tiếp
      e.preventDefault();
      cancelAnimationFrame(raf);
      strip.style.scrollSnapType = 'none';
      strip.scrollLeft += d * (e.deltaMode === 1 ? 32 : 1);
      clearTimeout(strip._snapT); strip._snapT = setTimeout(() => { strip.style.scrollSnapType = ''; }, 200);
    }, { passive: false });
  });
})();

/* Trang ANFORA — form đặt bàn (18/10): kiểm tra ngày (không chọn ngày đã qua), báo lại yêu cầu đã ghi nhận */
(() => {
  const f = document.getElementById('tableForm');
  if (!f) return;
  const note = document.getElementById('tableNote');
  const d = document.getElementById('tDate');
  const pad = n => String(n).padStart(2, '0');
  const now = new Date(); const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  d.min = today;
  const fmt = v => { const [y, m, dd] = v.split('-'); return dd + '/' + m + '/' + y; };
  f.addEventListener('submit', e => {
    e.preventDefault();
    note.classList.remove('error');
    if (!d.value) { note.classList.add('error'); note.textContent = T('Vui lòng chọn ngày dùng bữa.', 'Please choose a date.'); d.focus(); return; }
    if (d.value < today) { note.classList.add('error'); note.textContent = T('Ngày dùng bữa không thể là ngày đã qua.', 'The date cannot be in the past.'); d.focus(); return; }
    const g = document.getElementById('tGuests').value;
    const tm = document.getElementById('tTime').value, ar = document.getElementById('tArea').value.toLowerCase();
    note.textContent = T('Đã ghi nhận yêu cầu đặt bàn: ' + fmt(d.value) + ' lúc ' + tm + ', ' +
      (g === '11+' ? 'trên 10 khách' : g + ' khách') + ', ' + ar + '. LIMONI sẽ liên hệ lại để xác nhận.',
      'Reservation request received: ' + fmt(d.value) + ' at ' + tm + ', ' +
      (g === '11+' ? 'more than 10 guests' : g + (g === '1' ? ' guest' : ' guests')) + ', ' + ar + '. LIMONI will contact you to confirm.');
  });
})();

/* Trang chủ — review dạng vuốt ngang trên mobile (19/10): chấm chỉ vị trí, bấm chấm để tới thẻ tương ứng */
(() => {
  const cards = document.querySelector('.reviews .cards');
  if (!cards) return;
  const items = [...cards.querySelectorAll('.card')];
  if (items.length < 2) return;
  const dots = document.createElement('div');
  dots.className = 'cards-dots';
  dots.setAttribute('aria-label', T('Chọn đánh giá', 'Choose a review'));
  items.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', T('Đánh giá ', 'Review ') + (i + 1));
    b.addEventListener('click', () => cards.scrollTo({ left: c.offsetLeft - cards.offsetLeft - parseFloat(getComputedStyle(cards).paddingLeft), behavior: 'smooth' }));
    dots.appendChild(b);
  });
  cards.after(dots);
  const sync = () => {
    const pl = parseFloat(getComputedStyle(cards).paddingLeft) || 0;
    let best = 0, bd = Infinity;
    items.forEach((c, i) => { const d = Math.abs(c.offsetLeft - cards.offsetLeft - pl - cards.scrollLeft); if (d < bd) { bd = d; best = i; } });
    [...dots.children].forEach((b, i) => b.setAttribute('aria-current', i === best ? 'true' : 'false'));
  };
  cards.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
