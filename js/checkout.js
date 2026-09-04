/**
 * Захиалгын товчнуудыг Byl checkout руу холбоно.
 *
 * data-checkout атрибуттай товч дарахад /api/checkout руу хүсэлт явуулж,
 * хариунд ирсэн төлбөрийн хуудас руу шилжинэ. Token клиент талд байхгүй —
 * бүх дуудлага серверээр дамжина.
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/checkout';
  var notice = document.getElementById('notice');

  function showNotice(text, kind) {
    if (!notice) return;
    notice.textContent = text;
    notice.className = 'notice notice--' + kind;
    notice.hidden = false;
  }

  function hideNotice() {
    if (!notice) return;
    notice.hidden = true;
  }

  function startCheckout(button) {
    if (button.dataset.busy === '1') return;

    var originalLabel = button.textContent;
    button.dataset.busy = '1';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Түр хүлээнэ үү…';
    hideNotice();

    function restore() {
      delete button.dataset.busy;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = originalLabel;
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: button.dataset.checkout || 'rework' }),
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            if (!response.ok || !body.url) {
              throw new Error(body.error || 'checkout_failed');
            }
            return body.url;
          });
      })
      .then(function (url) {
        // Товчийг сэргээхгүй — хуудас шилжиж байна.
        window.location.href = url;
      })
      .catch(function (err) {
        restore();
        showNotice(
          'Захиалга үүсгэхэд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.',
          'error'
        );
        if (window.console) console.error('checkout:', err);
      });
  }

  var buttons = document.querySelectorAll('[data-checkout]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (event) {
      startCheckout(event.currentTarget);
    });
  }

  // Byl-ээс буцаж ирэхэд мэдэгдэл харуулна.
  var state = new URLSearchParams(window.location.search).get('checkout');

  if (state === 'success') {
    showNotice('Захиалга амжилттай! Баталгаажуулах и-мэйл тун удахгүй очно.', 'success');
  } else if (state === 'cancelled') {
    showNotice('Захиалга цуцлагдлаа. Хүсвэл дахин оролдоорой.', 'info');
  }

  if (state && window.history.replaceState) {
    // Хаягийг цэвэрлэнэ — сэргээх (refresh) үед мэдэгдэл дахин гарахгүй.
    var url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }
})();
