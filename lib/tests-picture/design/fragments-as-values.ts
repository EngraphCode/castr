/**
 * OpenAPI fragments of the cases, written by hand as values of the boundary half.
 *
 * Each value is what a reader of the fragment would build. A part written in line has
 * its identity by where it is: under which path, which method, which response. Six
 * fragments are here, the ones that reach furthest into the boundary types; the rest
 * are owed.
 */

import {
  NOTHING,
  address,
  body,
  byShape,
  described,
  item,
  media,
  method,
  on,
  operation,
  parameter,
  placed,
  range,
  response,
  use,
} from './build-boundary.js';
import type { Boundaries } from './boundary.js';
import type { DefinitionId, Method, Shape, Status, Step } from './model.js';

const STRING: Shape = { kind: 'by-kind', kinds: { string: 'any' } };
const OBJECT: Shape = { kind: 'by-kind', kinds: { object: { rest: 'unstated' } } };
const JSON_MEDIA = range('application', 'json');

function at(path: string): Step {
  return { step: 'path', path: address(path) };
}

function via(name: Method): Step {
  return { step: 'method', method: name };
}

function answer(status: Status): Step {
  return { step: 'response', on: status };
}

function okAt(...place: Step[]): readonly [DefinitionId, ReturnType<typeof response>] {
  return [placed(...place, answer(on(200))), response('ok')];
}

/** F2. Every place a parameter may be, and both ways to describe one. */
const PET: Step = { step: 'path', path: address('/pets/', { variable: 'id' }) };
const PETS = [PET, via(method('get'))];
const param = (name: string, location: 'query' | 'header' | 'path' | 'cookie'): DefinitionId =>
  placed(...PETS, { step: 'parameter', name, location });
const FILTER_MEDIA = placed(
  ...PETS,
  { step: 'parameter', name: 'filter', location: 'query' },
  { step: 'media', range: JSON_MEDIA },
);

export const F2: Boundaries = described(
  { paths: [{ path: address('/pets/', { variable: 'id' }), item: use(placed(PET)) }] },
  [
    [
      placed(PET),
      item({ operations: [{ method: method('get'), operation: use(placed(...PETS)) }] }),
    ],
    [
      placed(...PETS),
      operation({
        parameters: [
          use(param('id', 'path')),
          use(param('q', 'query')),
          use(param('X-Trace', 'header')),
          use(param('session', 'cookie')),
          use(param('filter', 'query')),
        ],
        responses: [{ on: on(200), response: use(placed(...PETS, answer(on(200)))) }],
      }),
    ],
    [param('id', 'path'), parameter('id', 'path', byShape(STRING, 'path'))],
    [
      param('q', 'query'),
      parameter(
        'q',
        'query',
        byShape(OBJECT, 'query', { style: 'deepObject', explode: true, reserved: false }),
      ),
    ],
    [param('X-Trace', 'header'), parameter('X-Trace', 'header', byShape(STRING, 'header'))],
    [param('session', 'cookie'), parameter('session', 'cookie', byShape(STRING, 'cookie'))],
    [
      param('filter', 'query'),
      parameter('filter', 'query', { by: 'media', range: JSON_MEDIA, media: use(FILTER_MEDIA) }),
    ],
    [FILTER_MEDIA, media({ whole: OBJECT })],
    okAt(...PETS),
  ],
);

/** F4. A status given three ways, and a response with no body. */
const LIST = [at('/pets'), via(method('get'))];
const STATUSES: readonly (readonly [Status, string])[] = [
  [on(200), 'ok'],
  [on(204), 'nothing'],
  [{ status: 'class', hundreds: 4 }, 'your fault'],
  [{ status: 'rest' }, 'anything else'],
];
const LISTED = placed(...LIST, answer(on(200)), { step: 'media', range: JSON_MEDIA });

export const F4: Boundaries = described(
  { paths: [{ path: address('/pets'), item: use(placed(at('/pets'))) }] },
  [
    [
      placed(at('/pets')),
      item({ operations: [{ method: method('get'), operation: use(placed(...LIST)) }] }),
    ],
    [
      placed(...LIST),
      operation({
        responses: STATUSES.map(([status]) => ({
          on: status,
          response: use(placed(...LIST, answer(status))),
        })),
      }),
    ],
    ...STATUSES.map(
      ([status, words]) =>
        [
          placed(...LIST, answer(status)),
          response(
            words,
            status === STATUSES[0]?.[0]
              ? { content: [{ range: JSON_MEDIA, media: use(LISTED) }] }
              : {},
          ),
        ] as const,
    ),
    [LISTED, media({ whole: OBJECT })],
  ],
);

/** F6. Methods beyond the fixed ones. */
const PURGE: Method = { method: 'other', token: 'PURGE' };
const SEARCH = at('/search');

export const F6: Boundaries = described(
  { paths: [{ path: address('/search'), item: use(placed(SEARCH)) }] },
  [
    [
      placed(SEARCH),
      item({
        operations: [
          { method: method('query'), operation: use(placed(SEARCH, via(method('query')))) },
          { method: PURGE, operation: use(placed(SEARCH, via(PURGE))) },
        ],
      }),
    ],
    [
      placed(SEARCH, via(method('query'))),
      operation({
        responses: [
          { on: on(200), response: use(placed(SEARCH, via(method('query')), answer(on(200)))) },
        ],
      }),
    ],
    okAt(SEARCH, via(method('query'))),
    [
      placed(SEARCH, via(PURGE)),
      operation({
        responses: [{ on: on(204), response: use(placed(SEARCH, via(PURGE), answer(on(204)))) }],
      }),
    ],
    [placed(SEARCH, via(PURGE), answer(on(204))), response('gone')],
  ],
);

/** F7. Webhooks and callbacks. */
const HOOK: Step = { step: 'webhook', name: 'newPet' };
const SUBSCRIBE = [at('/subscribe'), via(method('post'))];
const ON_EVENT = [...SUBSCRIBE, { step: 'callback', name: 'onEvent' } as const];
const CALL = [...ON_EVENT, { step: 'call', index: 0 } as const];
const posts = (...place: Step[]): readonly (readonly [DefinitionId, ReturnType<typeof item>])[] => [
  [
    placed(...place),
    item({
      operations: [
        { method: method('post'), operation: use(placed(...place, via(method('post')))) },
      ],
    }),
  ],
  [
    placed(...place, via(method('post'))),
    operation({
      responses: [
        { on: on(200), response: use(placed(...place, via(method('post')), answer(on(200)))) },
      ],
    }),
  ],
  okAt(...place, via(method('post'))),
];

export const F7: Boundaries = described(
  {
    paths: [{ path: address('/subscribe'), item: use(placed(at('/subscribe'))) }],
    webhooks: new Map([['newPet', use(placed(HOOK))]]),
  },
  [
    ...posts(HOOK),
    [
      placed(at('/subscribe')),
      item({ operations: [{ method: method('post'), operation: use(placed(...SUBSCRIBE)) }] }),
    ],
    [
      placed(...SUBSCRIBE),
      operation({
        responses: [{ on: on(201), response: use(placed(...SUBSCRIBE, answer(on(201)))) }],
        callbacks: new Map([['onEvent', use(placed(...ON_EVENT))]]),
      }),
    ],
    [placed(...SUBSCRIBE, answer(on(201))), response('ok')],
    [
      placed(...ON_EVENT),
      {
        part: 'callback',
        is: {
          calls: [
            {
              // The address is read, when the API runs, from the body of the request.
              to: [{ from: 'request', part: { of: 'body', steps: ['url'] } }],
              item: use(placed(...CALL)),
            },
          ],
          extensions: NOTHING,
        },
      },
    ],
    ...posts(...CALL),
  ],
);

/** F8. A request body. */
const UP = [at('/up'), via(method('post'))];
const BODY = [...UP, { step: 'body' } as const];
const sent = (type: string, subtype: string): DefinitionId =>
  placed(...BODY, { step: 'media', range: range(type, subtype) });
const SHORT: Shape = { kind: 'by-kind', kinds: { string: { length: { most: 10n } } } };

export const F8: Boundaries = described(
  { paths: [{ path: address('/up'), item: use(placed(at('/up'))) }] },
  [
    [
      placed(at('/up')),
      item({ operations: [{ method: method('post'), operation: use(placed(...UP)) }] }),
    ],
    [
      placed(...UP),
      operation({
        body: use(placed(...BODY)),
        responses: [{ on: on(204), response: use(placed(...UP, answer(on(204)))) }],
      }),
    ],
    [placed(...UP, answer(on(204))), response('ok')],
    [
      placed(...BODY),
      body({
        required: true,
        content: [
          { range: range('multipart', 'form-data'), media: use(sent('multipart', 'form-data')) },
          { range: range('text', '*'), media: use(sent('text', '*')) },
          { range: range('text', 'plain'), media: use(sent('text', 'plain')) },
          { range: range('application', 'jsonl'), media: use(sent('application', 'jsonl')) },
        ],
      }),
    ],
    [
      sent('multipart', 'form-data'),
      media({
        whole: {
          kind: 'by-kind',
          kinds: {
            object: {
              // `file` says its content is `image/png`: the model has no element for that yet.
              fields: new Map([
                ['file', { presence: 'optional', shape: { kind: 'every' } }],
                ['meta', { presence: 'optional', shape: OBJECT }],
              ]),
              rest: 'unstated',
            },
          },
        },
        encodings: {
          by: 'name',
          names: new Map([
            [
              'meta',
              {
                as: { mode: 'media', ranges: [JSON_MEDIA] },
                headers: NOTHING,
                extensions: NOTHING,
              },
            ],
          ]),
        },
      }),
    ],
    [sent('text', '*'), media({ whole: STRING })],
    [sent('text', 'plain'), media({ whole: SHORT })],
    [sent('application', 'jsonl'), media({ each: OBJECT })],
  ],
);

/** F9. The whole query string as one parameter. */
const FIND = [at('/search'), via(method('get'))];
const WHOLE = placed(...FIND, { step: 'parameter', name: 'q', location: 'whole-query' });
const FORM = range('application', 'x-www-form-urlencoded');
const WHOLE_MEDIA = placed(
  ...FIND,
  { step: 'parameter', name: 'q', location: 'whole-query' },
  { step: 'media', range: FORM },
);

export const F9: Boundaries = described(
  { paths: [{ path: address('/search'), item: use(placed(at('/search'))) }] },
  [
    [
      placed(at('/search')),
      item({ operations: [{ method: method('get'), operation: use(placed(...FIND)) }] }),
    ],
    [
      placed(...FIND),
      operation({
        parameters: [use(WHOLE)],
        responses: [{ on: on(200), response: use(placed(...FIND, answer(on(200)))) }],
      }),
    ],
    [WHOLE, parameter('q', 'whole-query', { by: 'media', range: FORM, media: use(WHOLE_MEDIA) })],
    [
      WHOLE_MEDIA,
      media({
        whole: {
          kind: 'by-kind',
          kinds: {
            object: {
              fields: new Map([['term', { presence: 'optional', shape: STRING }]]),
              rest: 'unstated',
            },
          },
        },
      }),
    ],
    okAt(...FIND),
  ],
);
