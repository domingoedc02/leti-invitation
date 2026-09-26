// A single static page: prerender it at build time and ship plain files, so any
// static host can serve the invitation with no Node process anywhere near it.
export const prerender = true;
export const ssr = true;
export const csr = true;
