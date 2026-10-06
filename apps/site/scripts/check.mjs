import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const typescriptDirectory = dirname(require.resolve('typescript/package.json'))
const tsc = join(typescriptDirectory, 'bin/tsc')
const result = spawnSync(
  process.execPath,
  [tsc, '--noEmit', '--runExternalCode', '--pretty', 'false'],
  { encoding: 'utf8' }
)

if (result.error) throw result.error

const diagnosticStart = /^(.*)\(\d+,\d+\): error TS\d+:/
const diagnostics = []
let current
let hasUnclassifiedOutput = false

for (const line of result.stdout.split('\n')) {
  const match = diagnosticStart.exec(line)

  if (match) {
    current = { dependency: /(^|[\\/])node_modules[\\/]/.test(match[1]), lines: [line] }
    diagnostics.push(current)
  } else if (current && (!line || /^\s/.test(line))) {
    current.lines.push(line)
  } else if (line) {
    current = undefined
    hasUnclassifiedOutput = true
    process.stderr.write(`${line}\n`)
  }
}

if (result.stderr) {
  hasUnclassifiedOutput = true
  process.stderr.write(result.stderr)
}

const projectDiagnostics = diagnostics.filter(({ dependency }) => !dependency)
const dependencyDiagnosticCount = diagnostics.length - projectDiagnostics.length

for (const diagnostic of projectDiagnostics) {
  process.stderr.write(`${diagnostic.lines.join('\n')}\n`)
}

// The experimental mapper currently checks imported .astro source in node_modules.
// Treat those diagnostics like skipLibCheck while retaining all project diagnostics.
if (dependencyDiagnosticCount > 0) {
  console.warn(
    `Ignored ${dependencyDiagnosticCount} diagnostic${dependencyDiagnosticCount === 1 ? '' : 's'} from imported dependencies.`
  )
}

process.exitCode = projectDiagnostics.length > 0 || hasUnclassifiedOutput ? (result.status ?? 1) : 0
