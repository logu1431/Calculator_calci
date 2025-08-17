(function () {
  const display = document.querySelector('.display');
  const buttons = document.querySelectorAll('.click');

  // Helper: safely evaluate a math expression
  function safeEval(expr) {
    const allowed = /^[0-9+\-*/.%\s]+$/;
    if (!allowed.test(expr)) throw new Error('Invalid chars');

    if (/^[*/.%]/.test(expr)) throw new Error('Bad start');
    if (/[+\-*/.%]$/.test(expr)) throw new Error('Bad end');

    // prevent invalid sequences like "++" but allow negative numbers
    if (/[+\-*/.%]{2,}/.test(expr.replace(/(^|\D)-/g, '')))
      throw new Error('Bad ops');

    // Final evaluation
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + expr + ')')();
  }

  // Insert value into display
  function append(val) {
    if (display.value === '0' && /[0-9]/.test(val)) {
      display.value = val;
    } else {
      display.value += val;
    }
  }

  // Percent
  function applyPercent() {
    const s = display.value;
    const m = s.match(/(\d+\.?\d*)$/);
    if (!m) return;
    const num = parseFloat(m[1]);
    const pct = (num / 100).toString();
    display.value = s.slice(0, -m[1].length) + pct;
  }

  // Backspace
  function backspace() {
    if (!display.value) return;
    display.value = display.value.slice(0, -1) || '';
  }

  // Clear
  function clearAll() {
    display.value = '';
  }

  // Compute
  function compute() {
    try {
      const expr = display.value.trim();
      if (!expr) return;
      const result = safeEval(expr);
      if (!isFinite(result)) throw new Error('Math error');
      display.value = String(result);
    } catch (e) {
      display.value = 'Error';
      setTimeout(() => (display.value = ''), 800);
    }
  }

  // Button clicks
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = btn.textContent.trim();

      if (t === 'C') return clearAll();
      if (t === 'R') return backspace();
      if (t === '%') return applyPercent();
      if (t === '=') return compute();

      // prevent double operators
      if ('+-*/.'.includes(t)) {
        const v = display.value;
        if (!v && '+*/.'.includes(t)) return;
        if (v && '+-*/.'.includes(v.slice(-1))) {
          if (t === '-' && v.slice(-1) !== '-') return append(t);
          display.value = v.slice(0, -1) + t;
          return;
        }
      }

      append(t);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;

    if (/[0-9]/.test(key)) return append(key);
    if (['+', '-', '*', '/', '.'].includes(key)) {
      const v = display.value;
      if (!v && '+*/.'.includes(key)) return;
      if (v && '+-*/.'.includes(v.slice(-1))) {
        if (key === '-' && v.slice(-1) !== '-') return append(key);
        display.value = v.slice(0, -1) + key;
        return;
      }
      return append(key);
    }
    if (key === 'Enter' || key === '=') return compute();
    if (key === 'Backspace') return backspace();
    if (key.toLowerCase() === 'c' || key === 'Escape') return clearAll();
    if (key === '%') return applyPercent();
  });
})();
