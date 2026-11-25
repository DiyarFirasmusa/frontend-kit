// A Nitro plugin (registered in vite.config.ts): runs once when the server starts, before any request.
// A bad runtime value, or the real site without a contact webhook, stops the server with one clear line
// instead of failing later or losing messages. Relative imports: Nitro bundles this file itself.
import { definePlugin } from 'nitro';
import { checkServerEnv, getServerEnv } from './env.server.ts';

export default definePlugin(() => {
  const problems = checkServerEnv();
  if (problems.length > 0) {
    console.error(
      `Server not started: invalid environment (see .env.example):\n- ${problems.join('\n- ')}`,
    );
    process.exit(1);
  }
  if (getServerEnv().CONTACT_WEBHOOK_URL === undefined) {
    console.warn(
      'Contact form in demo mode: messages are accepted and discarded. Set CONTACT_WEBHOOK_URL to deliver them.',
    );
  }
});
