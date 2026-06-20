const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files.push(...walk(p));
    } else {
      files.push(p);
    }
  }
  return files;
}

function replaceInFile(file, replacements) {
  let src = fs.readFileSync(file, 'utf8');
  let orig = src;
  for (const { find, repl, flags } of replacements) {
    const re = typeof find === 'string' ? new RegExp(escapeRegExp(find), flags || 'g') : find;
    src = src.replace(re, repl);
  }
  if (src !== orig) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('patched:', path.relative(root, file));
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const allFiles = walk(root).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));

// 1) Fix packages/llm/src/memory.ts: add typed response cast to avoid body?.id errors.
const llmMemoryPath = path.join(root, 'packages/llm/src/memory.ts');
if (fs.existsSync(llmMemoryPath)) {
  let src = fs.readFileSync(llmMemoryPath, 'utf8');
  if (!/type\s+MemoryCreateResponse\s*=/.test(src)) {
    src = src.replace(/(const\s+body\s*=\s*await\s+res\.json\(\)\.catch\(\(\)\s*=>\s*\(\{\}\s+as\s+any\)\);?)/m,
`type MemoryCreateResponse = { id?: string; locationId?: string };
const body = await res.json().catch(() => ({} as MemoryCreateResponse)) as MemoryCreateResponse;`);
    fs.writeFileSync(llmMemoryPath, src, 'utf8');
    console.log('patched:', path.relative(root, llmMemoryPath));
  } else {
    console.log('skipping llm/memory patch (already applied)');
  }
}

// 2) Replace "lastInsertRowid as string" -> String(result.lastInsertRowid) across repo
replaceInFileBatch(allFiles, [
  { find: /lastInsertRowid\s+as\s+string/g, repl: () => 'String(result.lastInsertRowid)' },
  { find: /result\.lastInsertRowid\s+as\s+string/g, repl: 'String(result.lastInsertRowid)' },
]);

// 3) Replace common import.meta.url usages with __repoDir fallback var insertion per file
for (const file of allFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (/import\.meta\.url/.test(content) && !/__repoDir\s*=/.test(content)) {
      let newContent = content;
      const insert = `const __repoDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();\n`;
      const importMatches = [...newContent.matchAll(/^(import .*;?\n)/gm)];
      if (importMatches.length > 0) {
        const last = importMatches[importMatches.length - 1];
        const idx = last.index + last[0].length;
        newContent = newContent.slice(0, idx) + insert + newContent.slice(idx);
      } else {
        newContent = insert + newContent;
      }
      newContent = newContent
        .replace(/new\s+URL\(import\.meta\.url\)\.pathname/g, '__repoDir')
        .replace(/fileURLToPath\(import\.meta\.url\)/g, '__repoDir')
        .replace(/import\.meta\.url/g, '__repoDir /* import.meta.url */');
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('patched import.meta usage:', path.relative(root, file));
    }
  } catch (err) {
    // ignore unreadable files
  }
}

// 4) Ensure DualWriteStorage extends EventEmitter and adds super() in constructor (best-effort)
for (const file of allFiles.filter(f => f.toLowerCase().includes('dualwritestorage'))) {
  try {
    let src = fs.readFileSync(file, 'utf8');
    let patched = false;
    if (/export\s+class\s+DualWriteStorage(?!\s+extends)/.test(src)) {
      src = src.replace(/export\s+class\s+DualWriteStorage/, "import { EventEmitter } from 'events';\n\nexport class DualWriteStorage extends EventEmitter");
      patched = true;
    }
    src = src.replace(/constructor\s*\(([\s\S]*?)\)\s*{\s*([^}]*?)}/m, (m, args, body) => {
      if (!/super\s*\(/.test(body)) {
        patched = true;
        return `constructor(${args}){ super();\n${body}}`;
      }
      return m;
    });
    if (patched) {
      fs.writeFileSync(file, src, 'utf8');
      console.log('patched DualWriteStorage file:', path.relative(root, file));
    }
  } catch (err) {
    // ignore
  }
}

// 5) Ensure apps/web/proxy.ts exports required function name 'proxy' and has safe implementation
const proxyPath = path.join(root, 'apps/web/proxy.ts');
if (fs.existsSync(proxyPath)) {
  let src = fs.readFileSync(proxyPath, 'utf8');
  if (!/export\s+async\s+function\s+proxy\(/.test(src)) {
    const fallback = `export async function proxy(request: Request) {
  const target = process.env.PROXY_TARGET;
  if (!target) return new Response(null, { status: 204 });
  try {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const upstream = new URL(path, target).toString();
    const res = await fetch(upstream, { method: request.method, headers: request.headers, body: request.body, redirect: 'manual' });
    const headers = new Headers();
    res.headers.forEach((v, k) => headers.set(k, v));
    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    return new Response('proxy error', { status: 502 });
  }
}\n`;
    src = src + '\n' + fallback;
    fs.writeFileSync(proxyPath, src, 'utf8');
    console.log('ensured proxy export in apps/web/proxy.ts');
  } else {
    console.log('proxy.ts already exports proxy function');
  }
}

// 6) Generic cleanup: replace occurrences of "stmt.free();" for potential undefined stmt with safe guard
replaceInFileBatch(allFiles, [
  { find: /stmt\.free\(\);/g, repl: "if (stmt && typeof stmt.free === 'function') { try { stmt.free(); } catch {} }" },
]);

// helper to run simple replacements batch
function replaceInFileBatch(files, replacements) {
  for (const file of files) {
    try {
      replaceInFile(file, replacements);
    } catch (err) {
      // ignore binary / unreadable files
    }
  }
}

console.log('\nDone. Review git diff, run builds:\n  pnpm --filter @unimatrix/llm build\n  pnpm --filter @unimatrix/server build\n  pnpm --filter web build\n  pnpm run build\n');
process.exit(0);