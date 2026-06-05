import type { MathParams } from './params';

export interface MathProblem {
  expr: string;
  answer: number;
  choices: number[];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateProblem(p: MathParams): MathProblem {
  const lo = p.allowNegative ? -p.maxOperand : 1;
  let answer = randInt(lo, p.maxOperand);
  let expr = `${answer}`;

  for (let i = 0; i < p.ops; i++) {
    const operand = randInt(p.allowNegative ? -p.maxOperand : 1, p.maxOperand);
    const plus = Math.random() < 0.5;
    if (plus) {
      answer += operand;
      expr += ` + ${operand < 0 ? `(${operand})` : operand}`;
    } else {
      answer -= operand;
      expr += ` − ${operand < 0 ? `(${operand})` : operand}`;
    }
  }

  // Yaqin chalg'ituvchi javoblar
  const choices = new Set<number>([answer]);
  const spread = Math.max(2, Math.round(Math.abs(answer) * 0.1) || 5);
  while (choices.size < 4) {
    const delta = randInt(-spread, spread) || spread;
    choices.add(answer + delta);
  }
  const shuffled = [...choices].sort(() => Math.random() - 0.5);
  return { expr, answer, choices: shuffled };
}
