#!/usr/bin/env node
// Sanity check — submits a minimal text-to-video task and polls until done.
// Run with:  node --env-file=.env scripts/smoke-ark.mjs

const BASE = 'https://ark.cn-beijing.volces.com/api/v3'
const KEY = process.env.VOLC_ARK_API_KEY
if (!KEY) {
  console.error('Missing VOLC_ARK_API_KEY')
  process.exit(1)
}

const payload = {
  model: 'doubao-seedance-2-0-260128',
  content: [{ type: 'text', text: 'a cat walking on neon street, cyberpunk' }],
  resolution: '720p',
  ratio: '16:9',
  duration: 5,
  watermark: false
}

const submit = await fetch(`${BASE}/contents/generations/tasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
  body: JSON.stringify(payload)
})
const submitText = await submit.text()
if (!submit.ok) {
  console.error('Submit failed', submit.status, submitText)
  process.exit(2)
}
const { id } = JSON.parse(submitText)
console.log('Submitted', id)

while (true) {
  await new Promise(r => setTimeout(r, 3000))
  const res = await fetch(`${BASE}/contents/generations/tasks/${id}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  })
  const text = await res.text()
  if (!res.ok) { console.error('Poll failed', res.status, text); process.exit(3) }
  const data = JSON.parse(text)
  console.log(data.status)
  if (['succeeded', 'failed', 'cancelled', 'expired'].includes(data.status)) {
    console.log(JSON.stringify(data, null, 2))
    break
  }
}
