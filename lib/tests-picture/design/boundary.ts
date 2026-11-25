/**
 * A prototype of the model's structure: the half that holds an API's boundaries.
 *
 * A boundary is where a value crosses: a request or a response of one operation at one
 * path. This half holds what an API description says of them. It is written against the
 * objects and fields the OpenAPI definitions declare and against what the specification's
 * text adds, and it names nothing in OpenAPI's vocabulary where the thing has a name of
 * its own.
 *
 * Everything here that a description can state once and use twice is a part with an
 * identity, and everything that uses one holds an edge to it. Nothing in `src` reads
 * this.
 */

import type {
  Constant,
  DefinitionId,
  Edge,
  MediaRange,
  Method,
  ParameterLocation,
  Shape,
  Status,
  TemplatePart,
} from './model.js';

/** Words for a person. */
interface Words {
  readonly summary?: string;
  readonly description?: string;
}

/** Fields a description adds that no format defines, by name. */
type Extensions = ReadonlyMap<string, Constant>;

/** A use of a part: an edge to it, and words that replace the part's own where given. */
export interface Use {
  readonly edge: Edge;
  readonly instead?: Words;
}

/** A link for a person to follow. Castr never resolves it. */
interface Link {
  readonly url: string;
  readonly description?: string;
}

export interface Server {
  readonly address: readonly TemplatePart[];
  readonly name?: string;
  readonly description?: string;
  readonly variables: ReadonlyMap<
    string,
    {
      readonly default: string;
      readonly allowed?: readonly string[];
      readonly description?: string;
    }
  >;
  readonly extensions: Extensions;
}

/**
 * How a value becomes text in an address, a header or a cookie: a style of RFC 6570 as
 * the formats extend it, with its two switches. All three are always present: a reader
 * fills what its source left unsaid and the record says it was unsaid.
 */
interface Styled {
  readonly style:
    | 'matrix'
    | 'label'
    | 'simple'
    | 'form'
    | 'spaceDelimited'
    | 'pipeDelimited'
    | 'deepObject'
    | 'cookie';
  readonly explode: boolean;
  readonly reserved: boolean;
}

/** What carries a parameter's or a header's value: a shape and a style, or one media type. */
export type Carried =
  | { readonly by: 'shape'; readonly shape: Shape; readonly styled: Styled }
  | { readonly by: 'media'; readonly range: MediaRange; readonly media: Use };

/** An example of a value. */
interface Example extends Words {
  readonly value:
    | { readonly given: 'data'; readonly data: Constant }
    | { readonly given: 'serialised'; readonly text: string }
    | { readonly given: 'elsewhere'; readonly url: string }
    /** Given without saying which of data and serialised it is. */
    | { readonly given: 'unsaid'; readonly value: Constant };
  readonly extensions: Extensions;
}

interface Carrier {
  readonly description?: string;
  readonly required: boolean;
  readonly deprecated: boolean;
  readonly carried: Carried;
  readonly examples: ReadonlyMap<string, Use>;
  readonly extensions: Extensions;
}

export interface Parameter extends Carrier {
  readonly name: string;
  readonly location: ParameterLocation;
  /** A client may send it empty in place of leaving it out. */
  readonly mayBeEmpty: boolean;
}

/** A header: a parameter whose name is the key it is held under. */
type Header = Carrier;

/**
 * How one part of a multipart or form body is written. Its mode is meaning: stating any
 * of a style's three facts makes the part styled, and stating none makes it media.
 */
interface Encoding {
  readonly as:
    | { readonly mode: 'media'; readonly ranges: readonly MediaRange[] }
    | { readonly mode: 'styled'; readonly styled: Styled };
  readonly headers: ReadonlyMap<string, Use>;
  readonly within?: Encodings;
  readonly extensions: Extensions;
}

/** Encodings for the parts of a body, by the name of a property or by position. */
type Encodings =
  | { readonly by: 'name'; readonly names: ReadonlyMap<string, Encoding> }
  | { readonly by: 'position'; readonly positions: readonly Encoding[]; readonly after?: Encoding };

export interface Media {
  /** The whole content, where a shape is given for it. */
  readonly whole?: Shape;
  /** Each value of content that is a sequence of values. */
  readonly each?: Shape;
  readonly encodings?: Encodings;
  readonly examples: ReadonlyMap<string, Use>;
  readonly extensions: Extensions;
}

type Content = readonly { readonly range: MediaRange; readonly media: Use }[];

export interface Body {
  readonly description?: string;
  readonly required: boolean;
  readonly content: Content;
  readonly extensions: Extensions;
}

/** A value read from a request or a response while an API runs. */
type Runtime =
  | { readonly from: 'url' | 'method' | 'status' }
  | {
      readonly from: 'request' | 'response';
      readonly part:
        | { readonly of: 'header'; readonly name: string }
        | { readonly of: 'query' | 'path'; readonly name: string }
        | { readonly of: 'body'; readonly steps: readonly (string | number)[] };
    };

/** A value a link passes on: stated, read at run time, or text with such readings in it. */
type Passed =
  | { readonly passed: 'constant'; readonly value: Constant }
  | { readonly passed: 'runtime'; readonly value: Runtime }
  | { readonly passed: 'text'; readonly parts: readonly (string | Runtime)[] };

/** From a response to an operation that may follow it. */
interface Follow {
  /** The operation, which a description may name or point at. */
  readonly operation: Edge;
  readonly parameters: readonly {
    readonly name: string;
    readonly location?: ParameterLocation;
    readonly value: Passed;
  }[];
  readonly body?: Passed;
  readonly description?: string;
  readonly server?: Server;
  readonly extensions: Extensions;
}

export interface Response extends Words {
  readonly headers: ReadonlyMap<string, Use>;
  readonly content: Content;
  readonly follows: ReadonlyMap<string, Use>;
  readonly extensions: Extensions;
}

/** Requests an API's provider may send back, each to an address made at run time. */
interface Callback {
  readonly calls: readonly { readonly to: readonly (string | Runtime)[]; readonly item: Use }[];
  readonly extensions: Extensions;
}

/** One way to be let in, with what it asks: scopes, or roles, by name. */
type Requirement = readonly { readonly scheme: Edge; readonly asks: readonly string[] }[];

/**
 * What lets a caller in: any one of these requirements, each of which needs all its
 * schemes. An empty requirement lets a caller in with nothing; no requirements at all
 * says nothing is needed.
 */
export type Security = readonly Requirement[];

interface Flow {
  readonly scopes: ReadonlyMap<string, string>;
  readonly refresh?: string;
}

interface Scheme {
  readonly description?: string;
  readonly deprecated: boolean;
  readonly by:
    | {
        readonly scheme: 'key';
        readonly name: string;
        readonly location: 'query' | 'header' | 'cookie';
      }
    | { readonly scheme: 'http'; readonly name: string; readonly bearerFormat?: string }
    | { readonly scheme: 'mutual-tls' }
    | { readonly scheme: 'open-id'; readonly discovery: string }
    | {
        readonly scheme: 'oauth2';
        readonly metadata?: string;
        readonly implicit?: Flow & { readonly authorise: string };
        readonly password?: Flow & { readonly token: string };
        readonly clientCredentials?: Flow & { readonly token: string };
        readonly authorisationCode?: Flow & { readonly authorise: string; readonly token: string };
        readonly deviceAuthorisation?: Flow & { readonly device: string; readonly token: string };
      };
  readonly extensions: Extensions;
}

export interface Operation extends Words {
  /** The name a description gives the operation, if it gives one. */
  readonly name?: string;
  readonly tags: readonly Edge[];
  readonly more?: Link;
  readonly parameters: readonly Use[];
  readonly body?: Use;
  readonly responses: readonly { readonly on: Status; readonly response: Use }[];
  readonly callbacks: ReadonlyMap<string, Use>;
  readonly deprecated: boolean;
  /** Absent where the operation says nothing and the API's own applies. */
  readonly security?: Security;
  /** Absent where the operation says nothing and its path's, or the API's, apply. */
  readonly servers?: readonly Server[];
  readonly extensions: Extensions;
}

/** What a description says of one path: of the path itself, and of each method at it. */
export interface PathItem extends Words {
  readonly servers?: readonly Server[];
  readonly parameters: readonly Use[];
  readonly operations: readonly { readonly method: Method; readonly operation: Use }[];
  readonly extensions: Extensions;
}

interface Tag extends Words {
  readonly name: string;
  readonly more?: Link;
  readonly parent?: Edge;
  readonly kind?: string;
  readonly extensions: Extensions;
}

/** A part of a description that has an identity and can be used more than once. */
export type Part =
  | { readonly part: 'path-item'; readonly is: PathItem }
  | { readonly part: 'operation'; readonly is: Operation }
  | { readonly part: 'parameter'; readonly is: Parameter }
  | { readonly part: 'header'; readonly is: Header }
  | { readonly part: 'body'; readonly is: Body }
  | { readonly part: 'media'; readonly is: Media }
  | { readonly part: 'response'; readonly is: Response }
  | { readonly part: 'example'; readonly is: Example }
  | { readonly part: 'follow'; readonly is: Follow }
  | { readonly part: 'callback'; readonly is: Callback }
  | { readonly part: 'scheme'; readonly is: Scheme }
  | { readonly part: 'tag'; readonly is: Tag };

interface PartDefinition {
  readonly id: DefinitionId;
  readonly aliases: readonly string[];
  readonly part: Part;
}

/** What a description says of the API as a whole. */
export interface Api extends Words {
  readonly title: string;
  readonly version: string;
  readonly terms?: string;
  readonly contact?: { readonly name?: string; readonly url?: string; readonly email?: string };
  readonly licence?: {
    readonly name: string;
    readonly held:
      | { readonly as: 'identifier'; readonly spdx: string }
      | { readonly as: 'url'; readonly url: string }
      | { readonly as: 'unsaid' };
  };
  readonly more?: Link;
  /** Always at least one: a description that names none has one, at `/`. */
  readonly servers: readonly Server[];
  readonly security: Security;
  /** In the order the description gives them, which a tool may show them in. */
  readonly tags: readonly Use[];
  /** The paths the API has, each with what is said of it. A path with nothing said is here too. */
  readonly paths: readonly { readonly path: readonly TemplatePart[]; readonly item: Use }[];
  /** Requests the provider may send that answer no call, by name. */
  readonly webhooks: ReadonlyMap<string, Use>;
  readonly extensions: Extensions;
}

/**
 * A fact the model holds that its source left unsaid, and how the reader came by it: the
 * text gives it outright, it follows from another fact of the same part, or it is read
 * from the shape the part applies to.
 */
interface Unsaid {
  readonly of: DefinitionId;
  readonly fact:
    | 'servers'
    | 'required'
    | 'deprecated'
    | 'may-be-empty'
    | 'style'
    | 'explode'
    | 'reserved'
    | 'media-ranges';
  readonly from: 'the text' | 'another fact of the part' | 'the shape it applies to';
}

/** The boundary half of a model. */
export interface Boundaries {
  readonly api: Api;
  readonly parts: readonly PartDefinition[];
  /**
   * What was read beside the meaning. Two descriptions whose API and parts are equal are
   * one value, whatever their records say.
   */
  readonly record: { readonly unsaid: readonly Unsaid[] };
}
