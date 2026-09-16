// Runtime configuration, read by src/lib/config.ts.
//
// This file is intentionally NOT baked into the JS bundle so the same build
// artifact can be deployed anywhere without a rebuild:
//   - Docker/EKS: docker-entrypoint.sh regenerates this file from the
//     API_URL env var via envsubst when the container starts.
//   - S3/CloudFront: have your deploy pipeline overwrite this file with the
//     environment's API URL before/after uploading the `dist/` build.
//
// Left as `null` here so local `npm run dev` / `vite preview` fall back to
// VITE_API_URL (see .env.example).
window.__APP_CONFIG__ = {
  API_URL: null,
};
