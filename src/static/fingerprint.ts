// Client-side fingerprint script, inlined as a string to be served as /static/fingerprint.js
export const FINGERPRINT_JS = `
(function() {
  'use strict';

  // ---- Utility ----
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function truncate(str, n) {
    return str && str.length > n ? str.slice(0, n) + '...' : (str || '—');
  }

  // ---- Canvas Fingerprint ----
  function canvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f6821f';
      ctx.fillRect(0, 0, 240, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('CF Challenge Demo 🔥', 10, 35);
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(200, 30, 20, 0, Math.PI * 2);
      ctx.stroke();
      return hash(canvas.toDataURL()).toUpperCase();
    } catch (e) {
      return 'BLOCKED';
    }
  }

  // ---- WebGL Fingerprint ----
  function webglFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { renderer: 'NO_WEBGL', vendor: '—', hash: '—' };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      return {
        renderer: truncate(renderer, 40),
        vendor: truncate(vendor, 30),
        hash: hash(renderer + vendor).toUpperCase(),
      };
    } catch (e) {
      return { renderer: 'ERROR', vendor: '—', hash: '—' };
    }
  }

  // ---- Audio Fingerprint ----
  function audioFingerprint(cb) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(0);
      const buf = new Float32Array(analyser.frequencyBinCount);
      setTimeout(function() {
        analyser.getFloatFrequencyData(buf);
        oscillator.stop();
        ctx.close();
        const fp = hash(buf.slice(0, 30).join(','));
        cb(fp.toUpperCase());
      }, 100);
    } catch (e) {
      cb('BLOCKED');
    }
  }

  // ---- Font Detection ----
  function detectFonts() {
    const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Lucida Console', 'Tahoma'];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseFont = 'monospace';
    ctx.font = '72px ' + baseFont;
    const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;
    const detected = fonts.filter(function(font) {
      ctx.font = '72px ' + font + ', ' + baseFont;
      return ctx.measureText('mmmmmmmmmmlli').width !== baseWidth;
    });
    return detected.length + '/' + fonts.length;
  }

  // ---- Headless / Bot Detection ----
  function detectHeadless() {
    const signals = [];

    // WebDriver
    if (navigator.webdriver) signals.push('webdriver=true');

    // Missing plugins
    if (navigator.plugins.length === 0) signals.push('no-plugins');

    // Languages check
    if (!navigator.languages || navigator.languages.length === 0) signals.push('no-languages');

    // Notification permission automation
    try {
      if (window.Notification && Notification.permission === 'default') {
        // Normal
      }
    } catch (e) {
      signals.push('notification-err');
    }

    // Chrome object check
    if (typeof window.chrome === 'undefined' && /Chrome/.test(navigator.userAgent)) {
      signals.push('no-chrome-obj');
    }

    // Permissions inconsistency
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'notifications' }).then(function(perm) {
        if (perm.state === 'denied' && Notification.permission !== 'denied') {
          addBotSignal('perm-inconsist');
        }
      }).catch(function() {});
    }

    // Phantom/Selenium artifacts
    if (window._phantom || window.__nightmare || window.callPhantom) signals.push('phantom');
    if (document.__selenium_unwrapped || document.__webdriver_evaluate) signals.push('selenium');

    return signals;
  }

  // ---- WebRTC Local IP ----
  function getWebRTCIP(cb) {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(function(offer) { return pc.setLocalDescription(offer); });
      pc.onicecandidate = function(e) {
        if (!e || !e.candidate) return;
        const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
        if (match) {
          pc.close();
          cb(match[1]);
        }
      };
      setTimeout(function() { cb('—'); }, 1000);
    } catch (e) {
      cb('BLOCKED');
    }
  }

  // ---- Render to DOM ----
  function fpRow(key, val, cls) {
    return '<div class="fp-row"><span class="fp-key">' + key + '</span><span class="fp-val' + (cls ? ' ' + cls : '') + '">' + val + '</span></div>';
  }

  var botSignalsList = [];
  function addBotSignal(s) {
    botSignalsList.push(s);
    renderBotSignals();
  }

  function renderBotSignals() {
    var el = document.getElementById('bot-signals');
    if (!el) return;
    var isBot = botSignalsList.length > 0;
    var verdict = isBot
      ? '<div class="fp-row"><span class="fp-key">判定</span><span class="fp-val bad">可疑 Bot ⚠</span></div>'
      : '<div class="fp-row"><span class="fp-key">判定</span><span class="fp-val good">正常浏览器 ✓</span></div>';
    var signals = botSignalsList.map(function(s) {
      return fpRow(s, '检测到', 'bad');
    }).join('');
    el.innerHTML = verdict + signals;
  }

  function collectAndRender() {
    var canvas = canvasFingerprint();
    var webgl = webglFingerprint();
    var botSignals = detectHeadless();
    botSignalsList = botSignals;

    var ua = navigator.userAgent;
    var platform = navigator.platform || '—';
    var lang = navigator.language || '—';
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
    var screen_res = window.screen.width + 'x' + window.screen.height;
    var color_depth = window.screen.colorDepth + 'bit';
    var pixel_ratio = window.devicePixelRatio || 1;
    var cpu_cores = navigator.hardwareConcurrency || '—';
    var mem = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : '—';
    var touch = navigator.maxTouchPoints > 0 ? 'Yes (' + navigator.maxTouchPoints + ')' : 'No';
    var cookies = navigator.cookieEnabled ? 'Yes' : 'No';
    var dnt = navigator.doNotTrack === '1' ? 'On' : 'Off';
    var plugins = navigator.plugins.length;
    var fonts = detectFonts();

    var rows = [
      fpRow('Canvas', canvas, 'warn'),
      fpRow('WebGL Hash', webgl.hash, 'warn'),
      fpRow('GPU', webgl.renderer),
      fpRow('屏幕', screen_res),
      fpRow('色深', color_depth),
      fpRow('DPR', pixel_ratio + 'x'),
      fpRow('语言', lang),
      fpRow('时区', truncate(tz, 20)),
      fpRow('平台', platform),
      fpRow('CPU', cpu_cores + ' cores'),
      fpRow('内存', mem),
      fpRow('触控', touch),
      fpRow('插件数', plugins),
      fpRow('字体', fonts),
      fpRow('Cookie', cookies),
      fpRow('DNT', dnt),
      fpRow('WebDriver', navigator.webdriver ? '<span class="bad">true ⚠</span>' : 'false'),
    ].join('');

    var el = document.getElementById('client-fp');
    if (el) el.innerHTML = rows;

    renderBotSignals();

    // Audio fingerprint (async)
    audioFingerprint(function(fp) {
      var el2 = document.getElementById('client-fp');
      if (el2) {
        var audioRow = fpRow('Audio Hash', fp, 'warn');
        el2.innerHTML += audioRow;
      }
    });

    // WebRTC IP (async)
    getWebRTCIP(function(ip) {
      var el3 = document.getElementById('client-fp');
      if (el3) {
        el3.innerHTML += fpRow('WebRTC IP', ip, ip !== '—' && ip !== 'BLOCKED' ? 'warn' : '');
      }
    });

    // Check bot signals after async checks
    if (botSignals.length > 0) {
      botSignals.forEach(function(s) { addBotSignal(s); });
    } else {
      renderBotSignals();
    }
  }

  // Run after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collectAndRender);
  } else {
    collectAndRender();
  }
})();
`;
