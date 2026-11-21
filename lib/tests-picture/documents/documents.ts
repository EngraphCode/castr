/**
 * A whole document the picture runs Castr on, by a name for the table and its place
 * under the package.
 */
export interface PictureDocument {
  readonly name: string;
  readonly file: string;
}

const EXAMPLES = 'examples/openapi';

/**
 * Oak's document, which is the corpus the specification names, and the example documents
 * already in the repository. Where an example is held as YAML and as JSON, the YAML is
 * read. The example input library is not pinned yet; its documents join this list as
 * they are.
 */
export const DOCUMENTS: readonly PictureDocument[] = [
  {
    name: "Oak's curriculum API, v1 (1.1.1)",
    file: 'tests-transforms/__fixtures__/corpus/oak-curriculum-api-v1-1.1.1.json',
  },
  { name: 'tictactoe (3.2)', file: `${EXAMPLES}/v3.2/tictactoe.yaml` },
  { name: 'tictactoe (3.1)', file: `${EXAMPLES}/v3.1/tictactoe.yaml` },
  { name: 'webhook-example', file: `${EXAMPLES}/v3.1/webhook-example.yaml` },
  { name: 'non-oauth-scopes', file: `${EXAMPLES}/v3.1/non-oauth-scopes.yaml` },
  { name: 'awkward-component-names', file: `${EXAMPLES}/v3.1/awkward-component-names.yaml` },
  { name: 'multi-auth', file: 'examples/custom/openapi/v3.1/multi-auth.yaml' },
  { name: 'petstore', file: `${EXAMPLES}/v3.0/petstore.yaml` },
  { name: 'petstore-expanded', file: `${EXAMPLES}/v3.0/petstore-expanded.yaml` },
  { name: 'api-with-examples', file: `${EXAMPLES}/v3.0/api-with-examples.yaml` },
  { name: 'callback-example', file: `${EXAMPLES}/v3.0/callback-example.yaml` },
  { name: 'link-example', file: `${EXAMPLES}/v3.0/link-example.yaml` },
  { name: 'uspto', file: `${EXAMPLES}/v3.0/uspto.yaml` },
  { name: 'multi-file', file: `${EXAMPLES}/multi-file/main.yaml` },
  { name: 'Swagger Petstore', file: 'examples/swagger/petstore.yaml' },
];
