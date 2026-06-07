// Capacitor uchun KIRISH nuqtasi. Next [locale] eksportida root index.html
// bo'lmaydi → mobil ilova oq ekran ko'rsatardi. Bu skript build'дан keyin
// out/index.html yaratadi: saqlangan tilga (yoki uz) yo'naltiradi.
import { writeFileSync } from 'node:fs';

const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Neyron AI</title>
<style>html,body{margin:0;height:100%;background:#06080F}</style>
<script>
  (function () {
    var allowed = ['uz', 'ru', 'en'];
    var lang = 'uz';
    try { var s = localStorage.getItem('lang'); if (s) lang = s; } catch (e) {}
    if (allowed.indexOf(lang) < 0) lang = 'uz';
    location.replace('./' + lang + '/');
  })();
</script>
</head>
<body></body>
</html>
`;

writeFileSync(new URL('../out/index.html', import.meta.url), html);
console.log('out/index.html yaratildi (Capacitor kirish nuqtasi)');
