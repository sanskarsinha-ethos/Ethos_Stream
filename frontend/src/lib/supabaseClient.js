import { createClient } from '@supabase/supabase-js'

const EXPECTED_PROJECT_REF = 'klxzihjdnpkogwuqcuau'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

// ── Runtime configuration guard ──────────────────────────────────────────────

const configErrors = []

if (!supabaseUrl || supabaseUrl.trim() === '') {
  configErrors.push('VITE_SUPABASE_URL is absent or empty.')
}

if (!supabaseKey || supabaseKey.trim() === '') {
  configErrors.push('VITE_SUPABASE_ANON_KEY is absent or empty.')
}

if (supabaseUrl && supabaseUrl.endsWith('/')) {
  configErrors.push(
    `VITE_SUPABASE_URL has a trailing slash: "${supabaseUrl}". ` +
    `Remove it — Supabase SDK will produce malformed endpoint URLs.`
  )
}

if (supabaseUrl) {
  // Extract subdomain from https://<ref>.supabase.co
  const extractedRef = supabaseUrl
    .replace('https://', '')
    .split('.')[0]

  if (extractedRef !== EXPECTED_PROJECT_REF) {
    configErrors.push(
      `Supabase project ref mismatch. ` +
      `Expected: "${EXPECTED_PROJECT_REF}", ` +
      `Resolved: "${extractedRef}". ` +
      `VITE_SUPABASE_URL is pointing at the wrong instance.`
    )
  }
}

if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  configErrors.push(
    'VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT. ' +
    'Ensure you are using the anon/public key, not the service_role key or any other secret.'
  )
}

if (configErrors.length > 0) {
  const report = [
    '╔══════════════════════════════════════════════════════╗',
    '║     ETHOS STREAM — SUPABASE CONFIG GUARD FAILURE     ║',
    '╚══════════════════════════════════════════════════════╝',
    ...configErrors.map((e, i) => `  [${i + 1}] ${e}`),
    '',
    '  Resolution: verify .env.local matches the template below.',
    '  VITE_SUPABASE_URL=https://klxzihjdnpkogwuqcuau.supabase.co',
    '  VITE_SUPABASE_ANON_KEY=eyJ... (anon/public key from Supabase Dashboard → Settings → API)',
    '',
    '  If running inside Docker, verify docker-compose.yml build args',
    '  and Dockerfile.frontend ARG declarations are in sync.',
  ].join('\n')

  console.error(report)
  throw new Error(`Supabase client initialization aborted. ${configErrors.length} config error(s) detected. See console for details.`)
}

// ── Initialization telemetry (dev only) ──────────────────────────────────────
if (import.meta.env.DEV) {
  console.info(
    `%c✔ Supabase client initialized`,
    'color: #00E5CC; font-weight: bold;',
    {
      instance: EXPECTED_PROJECT_REF,
      url: supabaseUrl,
      keyPrefix: supabaseKey.substring(0, 24) + '...',
    }
  )
}

// ── Client export ─────────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
