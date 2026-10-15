(function () {
  var ENDPOINT = 'https://suite.atom-uas.com/api/contacto';
  var MSG_OK = 'Mensaje enviado. Te responderemos pronto.';
  var MSG_ERR = 'No se pudo enviar. Escríbenos a info@atom-uas.com.';
  var MSG_429 = 'Demasiados envíos, prueba más tarde.';

  function setup(form) {
    if (form.getAttribute('data-contacto-js')) return;
    form.setAttribute('data-contacto-js', '1');

    // Honeypot: fuera de la vista
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1;
    hp.setAttribute('autocomplete', 'off'); hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0;overflow:hidden;';
    form.appendChild(hp);

    var msg = document.createElement('div');
    msg.setAttribute('role', 'alert');
    msg.style.display = 'none';
    form.appendChild(msg);

    function show(text, ok) {
      msg.className = 'elementor-message ' + (ok ? 'elementor-message-success' : 'elementor-message-danger');
      msg.textContent = text;
      msg.style.display = '';
      if (!ok) msg.style.color = '#d9534f';
    }
    function val(sel) { var e = form.querySelector(sel); return e ? e.value.trim() : ''; }

    // Captura en document: se ejecuta antes que el handler de Elementor (jQuery en el form)
    document.addEventListener('submit', function (ev) {
      if (ev.target !== form) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn = form.querySelector('button[type="submit"]');
      var chk = form.querySelector('input[type="checkbox"]');
      var emailEl = form.querySelector('input[type="email"]');
      var data = {
        nombre: val('input[name="form_fields[name]"]'),
        email: emailEl ? emailEl.value.trim() : '',
        // el campo con id/name "email" es en realidad el teléfono (type=tel)
        telefono: val('input[name="form_fields[email]"]'),
        mensaje: val('textarea[name="form_fields[message]"]'),
        acepta: !!(chk && chk.checked),
        website: hp.value
      };
      if (btn) btn.disabled = true;
      msg.style.display = 'none';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.status === 429) { show(MSG_429, false); return; }
        if (!r.ok) throw new Error('http ' + r.status);
        show(MSG_OK, true);
        form.reset();
      }).catch(function () {
        show(MSG_ERR, false);
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    }, true);
  }

  function init() {
    var forms = document.querySelectorAll('form.elementor-form');
    for (var i = 0; i < forms.length; i++) setup(forms[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
