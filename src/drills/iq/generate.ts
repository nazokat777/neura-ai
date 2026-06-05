// Mantiqiy ketma-ketlik generatori — suyuq intellekt (Gf) mashqi.
// HALOL: bu populyatsiya bo'yicha normalangan IQ EMAS — naqsh topish mashqi.
// To'liq generativ (kontent bazasi yo'q), til-neytral (raqamlar).

export interface SeqProblem {
  display: string; // "2, 4, 6, 8"
  answer: number;
  choices: number[];
}

function rnd(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateSequence(D: number): SeqProblem {
  const d = Math.max(1, Math.floor(D));
  const types = d < 4 ? ['arith', 'geo'] : d < 8 ? ['arith', 'geo', 'square', 'alt'] : ['geo', 'square', 'fib', 'alt', 'muladd'];
  const type = types[Math.floor(Math.random() * types.length)];
  let seq: number[] = [];

  if (type === 'arith') {
    const a = rnd(1, 9), step = rnd(2, 4 + d);
    seq = [a, a + step, a + 2 * step, a + 3 * step, a + 4 * step];
  } else if (type === 'geo') {
    const a = rnd(1, 4), r = rnd(2, 3);
    seq = [a, a * r, a * r * r, a * r ** 3, a * r ** 4];
  } else if (type === 'square') {
    const o = rnd(0, 3);
    seq = [1, 2, 3, 4, 5].map((n) => (n + o) * (n + o));
  } else if (type === 'fib') {
    let x = rnd(1, 4), y = rnd(2, 6);
    seq = [x, y];
    for (let i = 0; i < 3; i++) { const z = x + y; seq.push(z); x = y; y = z; }
  } else if (type === 'alt') {
    const a = rnd(1, 9), s1 = rnd(2, 6), s2 = rnd(2, 6);
    seq = [a, a + s1, a + s1 + s2, a + 2 * s1 + s2, a + 2 * s1 + 2 * s2];
  } else {
    // muladd: keyingi = oldingi*2 + k
    const a = rnd(1, 5), k = rnd(1, 4);
    seq = [a];
    for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] * 2 + k);
  }

  const answer = seq[seq.length - 1];
  const shown = seq.slice(0, seq.length - 1);
  const choiceSet = new Set<number>([answer]);
  while (choiceSet.size < 4) {
    const delta = rnd(1, Math.max(2, Math.round(Math.abs(answer) * 0.15) + 2));
    const cand = answer + (Math.random() < 0.5 ? -delta : delta);
    if (cand !== answer) choiceSet.add(cand);
  }
  const choices = [...choiceSet].sort(() => Math.random() - 0.5);
  return { display: shown.join(',  '), answer, choices };
}
