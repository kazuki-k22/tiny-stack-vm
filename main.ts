// A tiny stack VM for make.fun's ISA v1: runs /input/<id>/program.bin on its input.bin and writes
// /output/<id>/stdout.bin and /output/<id>/exit.txt.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// opcode -> [immediate bytes, values popped, values pushed]
const T: number[][] = [];
const def = (ops: number[], imm: number, pops: number, pushes: number) => {
  for (const o of ops) T[o] = [imm, pops, pushes];
};
def([0x00, 0x34], 0, 0, 0);
def([0x01], 1, 0, 1);
def([0x02], 4, 0, 1);
def([0x03, 0x50, 0x51, 0x53], 0, 1, 0);
def([0x04], 0, 1, 2);
def([0x05], 0, 2, 2);
def([0x06], 0, 2, 3);
def([0x07], 0, 3, 3);
def([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x18, 0x19, 0x1a, 0x1c, 0x1d, 0x1e, 0x20, 0x21, 0x22], 0, 2, 1);
def([0x17, 0x1b, 0x40], 0, 1, 1);
def([0x30, 0x33], 2, 0, 0);
def([0x31, 0x32], 2, 1, 0);
def([0x41], 0, 2, 0);
def([0x52], 0, 0, 1);

function run(p: Uint8Array, inp: Uint8Array): [Uint8Array, number] {
  const n = p.length;
  const s = new Int32Array(256);
  const calls: number[] = [];
  const mem = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, ol = 0, ip = 0, pc = 0, steps = 0;
  const end = (code: number): [Uint8Array, number] => [out.subarray(0, ol), code];
  const emit = (bytes: number[]): boolean => {
    if (ol + bytes.length > 65536) return false;
    for (const x of bytes) out[ol++] = x;
    return true;
  };
  for (;;) {
    if (steps++ === 1e6) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = p[pc];
    const t = T[op];
    if (!t) return end(5);
    const [imm, pops, pushes] = t;
    if (pc + imm >= n) return end(9);
    if (sp < pops) return end(2);
    if (sp - pops + pushes > 256) return end(3);
    pc += 1 + imm;
    const u16 = p[pc - 2] | (p[pc - 1] << 8);
    const b = s[sp - 1];
    const a = s[sp - 2];
    if (pops === 2 && pushes === 1) {
      let r: number;
      if (op >= 0x13 && op <= 0x16 && b === 0) return end(4);
      switch (op) {
        case 0x10: r = (a + b) | 0; break;
        case 0x11: r = (a - b) | 0; break;
        case 0x12: r = Math.imul(a, b); break;
        case 0x13: r = (a / b) | 0; break;
        case 0x14: r = a % b | 0; break;
        case 0x15: r = ((a >>> 0) / (b >>> 0)) | 0; break;
        case 0x16: r = (a >>> 0) % (b >>> 0) | 0; break;
        case 0x18: r = a & b; break;
        case 0x19: r = a | b; break;
        case 0x1a: r = a ^ b; break;
        case 0x1c: r = a << b; break;
        case 0x1d: r = a >> b; break;
        case 0x1e: r = (a >>> b) | 0; break;
        case 0x20: r = +(a === b); break;
        case 0x21: r = +(a < b); break;
        default: r = +(a >>> 0 < b >>> 0);
      }
      s[(sp -= 1) - 1] = r;
      continue;
    }
    switch (op) {
      case 0x00: return end(0);
      case 0x01: s[sp++] = (p[pc - 1] << 24) >> 24; break;
      case 0x02: s[sp++] = p[pc - 4] | (p[pc - 3] << 8) | u16 << 16; break;
      case 0x03: sp--; break;
      case 0x04: s[sp++] = b; break;
      case 0x05: s[sp - 1] = a; s[sp - 2] = b; break;
      case 0x06: s[sp++] = a; break;
      case 0x07: { const x = s[sp - 3]; s[sp - 3] = a; s[sp - 2] = b; s[sp - 1] = x; break; }
      case 0x17: s[sp - 1] = -b | 0; break;
      case 0x1b: s[sp - 1] = ~b; break;
      case 0x30: pc += (u16 << 16) >> 16; break;
      case 0x31: if (s[--sp] === 0) pc += (u16 << 16) >> 16; break;
      case 0x32: if (s[--sp] !== 0) pc += (u16 << 16) >> 16; break;
      case 0x33: if (calls.length === 64) return end(7); calls.push(pc); pc = u16; break;
      case 0x34: if (!calls.length) return end(8); pc = calls.pop()!; break;
      case 0x40: if (b < 0 || b > 255) return end(6); s[sp - 1] = mem[b]; break;
      case 0x41: if (b < 0 || b > 255) return end(6); mem[b] = a; sp -= 2; break;
      case 0x50: if (!emit([...String(b)].map((ch) => ch.charCodeAt(0)))) return end(11); sp--; break;
      case 0x51: if (!emit([b & 255])) return end(11); sp--; break;
      case 0x52: s[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 0x53: return end(b & 255);
    }
  }
}

for (const id of readdirSync(I)) {
  const [stdout, code] = run(readFileSync(`${I}/${id}/program.bin`), readFileSync(`${I}/${id}/input.bin`));
  mkdirSync(`${O}/${id}`, { recursive: true });
  writeFileSync(`${O}/${id}/stdout.bin`, stdout);
  writeFileSync(`${O}/${id}/exit.txt`, `${code}`);
}
