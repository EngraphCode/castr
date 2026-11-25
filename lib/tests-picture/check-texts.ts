/**
 * Fetches each pinned specification text and recomputes its pin: `pnpm picture:check-texts`.
 *
 * The texts are not kept in the repository, so this needs the network and is not one of
 * the gates. Run it when a hand list is revised, and when a publisher may have changed a
 * text. It prints how each text differs from its pin and exits with 1 if any does.
 */

import { checkTextPin, readTextPinFile } from './rows/text-sections.js';

const FILES = ['openapi-sections.json', 'json-schema-sections.json'];

async function main(): Promise<void> {
  let drifted = 0;
  for (const pin of FILES.flatMap((file) => readTextPinFile(file))) {
    const response = await fetch(pin.url);
    if (!response.ok) {
      drifted += 1;
      console.error(`${pin.text}: ${pin.url} answered ${String(response.status)}`);
      continue;
    }
    const { differences } = checkTextPin(pin, new Uint8Array(await response.arrayBuffer()));
    drifted += differences.length > 0 ? 1 : 0;
    console.log(
      differences.length > 0 ? `${pin.text}: ${differences.join('; ')}` : `${pin.text}: as pinned`,
    );
  }
  process.exitCode = drifted > 0 ? 1 : 0;
}

await main();
