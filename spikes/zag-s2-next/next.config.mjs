// Telemetry off (also set NEXT_TELEMETRY_DISABLED=1 in the shell to be sure).
process.env.NEXT_TELEMETRY_DISABLED = '1';

/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ['@tessen-ui/spike-zag-s2'],
  typescript: { ignoreBuildErrors: true },
};
