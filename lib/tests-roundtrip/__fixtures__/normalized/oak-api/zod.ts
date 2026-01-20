import { z } from 'zod';
// Type Definitions
export type SequenceUnitsResponseSchema = unknown[];
export type TranscriptResponseSchema = {
  /** The transcript for the lesson video */ transcript: string;
  /** The contents of the .vtt file for the lesson video, which maps captions to video timestamps. */ vtt: string;
};
export type SearchTranscriptResponseSchema = {
  /** The lesson title */ lessonTitle: string;
  /** The lesson slug identifier */ lessonSlug: string;
  /** The snippet of the transcript that matched the search term */ transcriptSnippet?: string;
}[];
export type SequenceAssetsResponseSchema = {
  /** The unique slug identifier for the lesson */ lessonSlug: string;
  /** The title for the lesson */ lessonTitle: string;
  /** Licence information for any third-party content contained in the lessons' downloadable resources */ attribution?: string[];
  /** List of assets */ assets: {
    type: string;
    /** The label for the asset */ label: string;
    /** The download endpoint for the asset. */ url: string;
  }[];
}[];
export type SubjectAssetsResponseSchema = {
  /** The unique slug identifier for the lesson */ lessonSlug: string;
  /** The title for the lesson */ lessonTitle: string;
  /** Licence information for any third-party content contained in the lessons' downloadable resources */ attribution?: string[];
  /** List of assets */ assets: {
    type: string;
    /** The label for the asset */ label: string;
    /** The download endpoint for the asset. */ url: string;
  }[];
}[];
export type LessonAssetsResponseSchema = {
  /** Licence information for any third-party content contained in the lessons' downloadable resources */ attribution?: string[];
  /** List of assets */ assets?: {
    type: string;
    /** The label for the asset */ label: string;
    /** The download endpoint for the asset. */ url: string;
  }[];
};
export type LessonAssetResponseSchema = unknown;
export type AllSubjectsResponseSchema = {
  /** The subject title */ subjectTitle: string;
  /** The subject slug identifier */ subjectSlug: string;
  /** Information about the years, key stages and key stage 4 variance for each sequence */ sequenceSlugs: {
    /** The unique identifier for each sequence */ sequenceSlug: string;
    /** The years for which this subject has content available for */ years: number[];
    /** The key stage slug identifiers for which this subject has content available for. */ keyStages: {
      /** The key stage title for the given key stage */ keyStageTitle: string;
      /** The unique identifier for a given key stage */ keyStageSlug: string;
    }[];
    /** The unique identifier for the phase to which this sequence belongs */ phaseSlug: string;
    /** The title for the phase to which this sequence belongs */ phaseTitle: string;
    /** The key stage 4 study pathway that this sequence represents. May be null. */ ks4Options: {
      title: string;
      slug: string;
    };
  }[];
  /** The years for which this subject has content available for */ years: number[];
  /** The key stage slug identifiers for which this subject has content available for. */ keyStages: {
    /** The key stage title for the given key stage */ keyStageTitle: string;
    /** The unique identifier for a given key stage */ keyStageSlug: string;
  }[];
}[];
export type SubjectResponseSchema = {
  /** The subject title */ subjectTitle: string;
  /** The subject slug identifier */ subjectSlug: string;
  /** Information about the years, key stages and key stage 4 variance for each sequence */ sequenceSlugs: {
    /** The unique identifier for each sequence */ sequenceSlug: string;
    /** The years for which this subject has content available for */ years: number[];
    /** The key stage slug identifiers for which this subject has content available for. */ keyStages: {
      /** The key stage title for the given key stage */ keyStageTitle: string;
      /** The unique identifier for a given key stage */ keyStageSlug: string;
    }[];
    /** The unique identifier for the phase to which this sequence belongs */ phaseSlug: string;
    /** The title for the phase to which this sequence belongs */ phaseTitle: string;
    /** The key stage 4 study pathway that this sequence represents. May be null. */ ks4Options: {
      title: string;
      slug: string;
    };
  }[];
  /** The years for which this subject has content available for */ years: number[];
  /** The key stage slug identifiers for which this subject has content available for. */ keyStages: {
    /** The key stage title for the given key stage */ keyStageTitle: string;
    /** The unique identifier for a given key stage */ keyStageSlug: string;
  }[];
};
export type SubjectSequenceResponseSchema = {
  /** The unique identifier for each sequence */ sequenceSlug: string;
  /** The years for which this subject has content available for */ years: number[];
  /** The key stage slug identifiers for which this subject has content available for. */ keyStages: {
    /** The key stage title for the given key stage */ keyStageTitle: string;
    /** The unique identifier for a given key stage */ keyStageSlug: string;
  }[];
  /** The unique identifier for the phase to which this sequence belongs */ phaseSlug: string;
  /** The title for the phase to which this sequence belongs */ phaseTitle: string;
  /** The key stage 4 study pathway that this sequence represents. May be null. */ ks4Options: {
    title: string;
    slug: string;
  };
}[];
export type SubjectKeyStagesResponseSchema = {
  /** The key stage title for the given key stage */ keyStageTitle: string;
  /** The unique identifier for a given key stage */ keyStageSlug: string;
}[];
export type SubjectYearsResponseSchema = number[];
export type KeyStageResponseSchema = {
  /** The key stage slug identifier */ slug: string;
  /** The key stage title */ title: string;
}[];
export type KeyStageSubjectLessonsResponseSchema = {
  /** The unit slug identifier */ unitSlug: string;
  /** The unit title */ unitTitle: string;
  /** List of lessons for the specified unit */ lessons: {
    /** The lesson slug identifier */ lessonSlug: string;
    /** The lesson title */ lessonTitle: string;
  }[];
}[];
export type AllKeyStageAndSubjectUnitsResponseSchema = {
  /** The year identifier */ yearSlug: string;
  /** The year title */ yearTitle: string;
  /** List of units for the specified year */ units: {
    unitSlug: string;
    unitTitle: string;
  }[];
}[];
export type QuestionForLessonsResponseSchema = {
  /** The starter quiz questions - which test prior knowledge */ starterQuiz: unknown[];
  /** The exit quiz questions - which test on the knowledge learned in the lesson */ exitQuiz: unknown[];
};
export type QuestionsForSequenceResponseSchema = {
  /** The lesson slug identifier */ lessonSlug: string;
  /** The title of the lesson */ lessonTitle: string;
  /** The starter quiz questions - which test prior knowledge */ starterQuiz: unknown[];
  /** The exit quiz questions - which test on the knowledge learned in the lesson */ exitQuiz: unknown[];
}[];
export type QuestionsForKeyStageAndSubjectResponseSchema = {
  /** The lesson slug identifier */ lessonSlug: string;
  /** The title of the lesson */ lessonTitle: string;
  /** The starter quiz questions - which test prior knowledge */ starterQuiz: unknown[];
  /** The exit quiz questions - which test on the knowledge learned in the lesson */ exitQuiz: unknown[];
}[];
export type LessonSummaryResponseSchema = {
  /** The lesson title */ lessonTitle: string;
  /** The unit slug identifier */ unitSlug: string;
  /** The unit title */ unitTitle: string;
  /** The subject slug identifier */ subjectSlug: string;
  /** The subject slug identifier */ subjectTitle: string;
  /** The key stage slug identifier */ keyStageSlug: string;
  /** The key stage title */ keyStageTitle: string;
  /** The lesson's keywords and their descriptions */ lessonKeywords: {
    /** The keyword */ keyword: string;
    /** A definition of the keyword */ description: string;
  }[];
  /** The lesson's key learning points */ keyLearningPoints: {
    /** A key learning point */ keyLearningPoint: string;
  }[];
  /** The lesson’s anticipated common misconceptions and suggested teacher responses */ misconceptionsAndCommonMistakes: {
    /** A common misconception */ misconception: string;
    response: string;
  }[];
  /** Suggested teacher response to a common misconception */ pupilLessonOutcome?: string;
  /** Helpful teaching tips for the lesson */ teacherTips: {
    teacherTip: string;
  }[];
  /** Full guidance about the types of lesson content for the teacher to consider (where appropriate) */ contentGuidance: unknown;
  /** The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information. */ supervisionLevel: unknown;
  /** Whether the lesson currently has any downloadable assets availableNote: this field reflects the current availability of downloadable assets, which reflects the availability of early-release content available for the hackathon. All lessons will eventually have downloadable assets available. */ downloadsAvailable: boolean;
};
export type LessonSearchResponseSchema = {
  /** The lesson slug identifier */ lessonSlug: string;
  /** The lesson title */ lessonTitle: string;
  /** The snippet of the transcript that matched the search term */ similarity: number;
  /** The units that the lesson is part of. See sample response below */ units: {
    unitSlug: string;
    unitTitle: string;
    examBoardTitle: unknown;
    keyStageSlug: string;
    subjectSlug: string;
  }[];
}[];
export type UnitSummaryResponseSchema = {
  /** The unit slug identifier */ unitSlug: string;
  /** The unit title */ unitTitle: string;
  /** The slug identifier for the year to which the unit belongs */ yearSlug: string;
  /** The year to which the unit belongs */ year: unknown;
  /** The slug identifier for the phase to which the unit belongs */ phaseSlug: string;
  /** The subject identifier */ subjectSlug: string;
  /** The slug identifier for the the key stage to which the unit belongs */ keyStageSlug: string;
  /** Unit summary notes */ notes?: string;
  /** A short description of the unit. Not yet available for all subjects. */ description?: string;
  /** The prior knowledge required for the unit */ priorKnowledgeRequirements: string[];
  /** National curriculum attainment statements covered in this unit */ nationalCurriculumContent: string[];
  /** An explanation of where the unit sits within the sequence and why it has been placed there. */ whyThisWhyNow?: string;
  /** The threads that are associated with the unit */ threads?: {
    slug: string;
    title: string;
    order: number;
  }[];
  /** The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted. */ categories?: {
    categoryTitle: string;
    categorySlug?: string;
  }[];
  unitLessons: {
    /** The lesson slug identifier */ lessonSlug: string;
    /** The title for the lesson */ lessonTitle: string;
    /** Indicates the ordering of the lesson */ lessonOrder?: number;
    /** If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet. */ state: string;
  }[];
};
export type AllThreadsResponseSchema = {
  /** The thread title */ title: string;
  /** The thread slug identifier */ slug: string;
}[];
export type ThreadUnitsResponseSchema = {
  /** The unit title */ unitTitle: string;
  /** The unit slug identifier */ unitSlug: string;
  /** The position of the unit within the thread */ unitOrder: number;
}[];
export type RateLimitResponseSchema = {
  /** The maximum number of requests you can make in the current window. */ limit: number;
  /** The number of requests remaining in the current window. */ remaining: number;
  /** The time at which the current window resets, in milliseconds since the Unix epoch. */ reset: number;
};
// Zod Schemas
export const SequenceUnitsResponseSchema = z
  .array(
    z.union([
      z
        .object({
          year: z
            .union([z.number(), z.literal('all-years')])
            .meta({ description: 'The year group' }),
          title: z.string().optional().meta({
            description: 'An optional alternative title for the year sequence',
          }),
          units: z
            .array(
              z.union([
                z
                  .object({
                    unitTitle: z.string().meta({ description: 'The title of the unit' }),
                    unitOrder: z.number().meta({
                      description: 'The position of the unit within the sequence.',
                    }),
                    unitOptions: z
                      .array(
                        z
                          .object({
                            unitTitle: z.string(),
                            unitSlug: z.string(),
                          })
                          .strict(),
                      )
                      .meta({
                        description: 'The unique slug identifier for the unit',
                      }),
                    categories: z
                      .array(
                        z
                          .object({
                            categoryTitle: z.string().meta({
                              description: 'The title of the category',
                            }),
                            categorySlug: z.string().optional().meta({
                              description: 'The unique identifier for the category',
                            }),
                          })
                          .strict(),
                      )
                      .optional()
                      .meta({
                        description:
                          'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                      }),
                    threads: z
                      .array(
                        z
                          .object({
                            threadTitle: z.string().meta({
                              description: 'The title of the category',
                            }),
                            threadSlug: z.string().meta({
                              description: 'The unique identifier for the thread',
                            }),
                            order: z.number().meta({ description: 'Deprecated' }),
                          })
                          .strict(),
                      )
                      .optional()
                      .meta({
                        description:
                          'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                      }),
                  })
                  .strict(),
                z
                  .object({
                    unitTitle: z.string(),
                    unitOrder: z.number(),
                    unitSlug: z.string().meta({
                      description: 'The unique slug identifier for the unit',
                    }),
                    categories: z
                      .array(
                        z
                          .object({
                            categoryTitle: z.string().meta({
                              description: 'The title of the category',
                            }),
                            categorySlug: z.string().optional().meta({
                              description: 'The unique identifier for the category',
                            }),
                          })
                          .strict(),
                      )
                      .optional(),
                    threads: z
                      .array(
                        z
                          .object({
                            threadTitle: z.string().meta({
                              description: 'The title of the category',
                            }),
                            threadSlug: z.string().meta({
                              description: 'The unique identifier for the thread',
                            }),
                            order: z.number().meta({ description: 'Deprecated' }),
                          })
                          .strict(),
                      )
                      .optional(),
                  })
                  .strict(),
              ]),
            )
            .meta({
              description: 'A list of units that make up a full sequence, grouped by year.',
            }),
        })
        .strict(),
      z
        .object({
          year: z.number(),
          title: z.string().optional(),
          examSubjects: z
            .array(
              z.union([
                z
                  .object({
                    examSubjectTitle: z.string(),
                    examSubjectSlug: z.string().optional(),
                    tiers: z.array(
                      z
                        .object({
                          tierTitle: z.string().meta({ description: 'The title of the tier' }),
                          tierSlug: z.string().meta({ description: 'The tier identifier' }),
                          units: z.array(
                            z.union([
                              z
                                .object({
                                  unitTitle: z.string().meta({
                                    description: 'The title of the unit',
                                  }),
                                  unitOrder: z.number().meta({
                                    description: 'The position of the unit within the sequence.',
                                  }),
                                  unitOptions: z
                                    .array(
                                      z
                                        .object({
                                          unitTitle: z.string(),
                                          unitSlug: z.string(),
                                        })
                                        .strict(),
                                    )
                                    .meta({
                                      description: 'The unique slug identifier for the unit',
                                    }),
                                  categories: z
                                    .array(
                                      z
                                        .object({
                                          categoryTitle: z.string().meta({
                                            description: 'The title of the category',
                                          }),
                                          categorySlug: z.string().optional().meta({
                                            description: 'The unique identifier for the category',
                                          }),
                                        })
                                        .strict(),
                                    )
                                    .optional()
                                    .meta({
                                      description:
                                        'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                    }),
                                  threads: z
                                    .array(
                                      z
                                        .object({
                                          threadTitle: z.string().meta({
                                            description: 'The title of the category',
                                          }),
                                          threadSlug: z.string().meta({
                                            description: 'The unique identifier for the thread',
                                          }),
                                          order: z.number().meta({
                                            description: 'Deprecated',
                                          }),
                                        })
                                        .strict(),
                                    )
                                    .optional()
                                    .meta({
                                      description:
                                        'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                    }),
                                })
                                .strict(),
                              z
                                .object({
                                  unitTitle: z.string(),
                                  unitOrder: z.number(),
                                  unitSlug: z.string().meta({
                                    description: 'The unique slug identifier for the unit',
                                  }),
                                  categories: z
                                    .array(
                                      z
                                        .object({
                                          categoryTitle: z.string().meta({
                                            description: 'The title of the category',
                                          }),
                                          categorySlug: z.string().optional().meta({
                                            description: 'The unique identifier for the category',
                                          }),
                                        })
                                        .strict(),
                                    )
                                    .optional(),
                                  threads: z
                                    .array(
                                      z
                                        .object({
                                          threadTitle: z.string().meta({
                                            description: 'The title of the category',
                                          }),
                                          threadSlug: z.string().meta({
                                            description: 'The unique identifier for the thread',
                                          }),
                                          order: z.number().meta({
                                            description: 'Deprecated',
                                          }),
                                        })
                                        .strict(),
                                    )
                                    .optional(),
                                })
                                .strict(),
                            ]),
                          ),
                        })
                        .strict(),
                    ),
                  })
                  .strict(),
                z
                  .object({
                    examSubjectTitle: z.string(),
                    examSubjectSlug: z.string().optional(),
                    units: z.array(
                      z.union([
                        z
                          .object({
                            unitTitle: z.string().meta({ description: 'The title of the unit' }),
                            unitOrder: z.number().meta({
                              description: 'The position of the unit within the sequence.',
                            }),
                            unitOptions: z
                              .array(
                                z
                                  .object({
                                    unitTitle: z.string(),
                                    unitSlug: z.string(),
                                  })
                                  .strict(),
                              )
                              .meta({
                                description: 'The unique slug identifier for the unit',
                              }),
                            categories: z
                              .array(
                                z
                                  .object({
                                    categoryTitle: z.string().meta({
                                      description: 'The title of the category',
                                    }),
                                    categorySlug: z.string().optional().meta({
                                      description: 'The unique identifier for the category',
                                    }),
                                  })
                                  .strict(),
                              )
                              .optional()
                              .meta({
                                description:
                                  'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                              }),
                            threads: z
                              .array(
                                z
                                  .object({
                                    threadTitle: z.string().meta({
                                      description: 'The title of the category',
                                    }),
                                    threadSlug: z.string().meta({
                                      description: 'The unique identifier for the thread',
                                    }),
                                    order: z.number().meta({ description: 'Deprecated' }),
                                  })
                                  .strict(),
                              )
                              .optional()
                              .meta({
                                description:
                                  'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                              }),
                          })
                          .strict(),
                        z
                          .object({
                            unitTitle: z.string(),
                            unitOrder: z.number(),
                            unitSlug: z.string().meta({
                              description: 'The unique slug identifier for the unit',
                            }),
                            categories: z
                              .array(
                                z
                                  .object({
                                    categoryTitle: z.string().meta({
                                      description: 'The title of the category',
                                    }),
                                    categorySlug: z.string().optional().meta({
                                      description: 'The unique identifier for the category',
                                    }),
                                  })
                                  .strict(),
                              )
                              .optional(),
                            threads: z
                              .array(
                                z
                                  .object({
                                    threadTitle: z.string().meta({
                                      description: 'The title of the category',
                                    }),
                                    threadSlug: z.string().meta({
                                      description: 'The unique identifier for the thread',
                                    }),
                                    order: z.number().meta({ description: 'Deprecated' }),
                                  })
                                  .strict(),
                              )
                              .optional(),
                          })
                          .strict(),
                      ]),
                    ),
                  })
                  .strict(),
              ]),
            )
            .meta({
              description:
                "Only used in secondary science. Contains a full year's unit sequences based on which subject is being studied at KS4.",
            }),
        })
        .strict(),
      z
        .object({
          year: z.number(),
          title: z.string().optional(),
          tiers: z.array(
            z
              .object({
                tierTitle: z.string().meta({ description: 'The title of the tier' }),
                tierSlug: z.string().meta({ description: 'The tier identifier' }),
                units: z.array(
                  z.union([
                    z
                      .object({
                        unitTitle: z.string().meta({ description: 'The title of the unit' }),
                        unitOrder: z.number().meta({
                          description: 'The position of the unit within the sequence.',
                        }),
                        unitOptions: z
                          .array(
                            z
                              .object({
                                unitTitle: z.string(),
                                unitSlug: z.string(),
                              })
                              .strict(),
                          )
                          .meta({
                            description: 'The unique slug identifier for the unit',
                          }),
                        categories: z
                          .array(
                            z
                              .object({
                                categoryTitle: z.string().meta({
                                  description: 'The title of the category',
                                }),
                                categorySlug: z.string().optional().meta({
                                  description: 'The unique identifier for the category',
                                }),
                              })
                              .strict(),
                          )
                          .optional()
                          .meta({
                            description:
                              'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                          }),
                        threads: z
                          .array(
                            z
                              .object({
                                threadTitle: z.string().meta({
                                  description: 'The title of the category',
                                }),
                                threadSlug: z.string().meta({
                                  description: 'The unique identifier for the thread',
                                }),
                                order: z.number().meta({ description: 'Deprecated' }),
                              })
                              .strict(),
                          )
                          .optional()
                          .meta({
                            description:
                              'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                          }),
                      })
                      .strict(),
                    z
                      .object({
                        unitTitle: z.string(),
                        unitOrder: z.number(),
                        unitSlug: z.string().meta({
                          description: 'The unique slug identifier for the unit',
                        }),
                        categories: z
                          .array(
                            z
                              .object({
                                categoryTitle: z.string().meta({
                                  description: 'The title of the category',
                                }),
                                categorySlug: z.string().optional().meta({
                                  description: 'The unique identifier for the category',
                                }),
                              })
                              .strict(),
                          )
                          .optional(),
                        threads: z
                          .array(
                            z
                              .object({
                                threadTitle: z.string().meta({
                                  description: 'The title of the category',
                                }),
                                threadSlug: z.string().meta({
                                  description: 'The unique identifier for the thread',
                                }),
                                order: z.number().meta({ description: 'Deprecated' }),
                              })
                              .strict(),
                          )
                          .optional(),
                      })
                      .strict(),
                  ]),
                ),
              })
              .strict(),
          ),
        })
        .strict(),
    ]),
  )
  .meta({
    examples: [
      [
        {
          year: 1,
          units: [
            {
              unitTitle: 'Speaking and Listening',
              unitOrder: 1,
              unitSlug: 'speaking-and-listening',
              categories: [{ categoryTitle: 'Reading, writing & oracy' }],
              threads: [
                {
                  threadTitle: 'Developing spoken language',
                  threadSlug: 'developing-spoken-language',
                  order: 8,
                },
              ],
            },
          ],
        },
      ],
    ],
  });
export const TranscriptResponseSchema = z
  .object({
    transcript: z.string().meta({ description: 'The transcript for the lesson video' }),
    vtt: z.string().meta({
      description:
        'The contents of the .vtt file for the lesson video, which maps captions to video timestamps.',
    }),
  })
  .strict()
  .meta({
    examples: [
      {
        transcript:
          "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
        vtt: "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
      },
    ],
  });
export const SearchTranscriptResponseSchema = z
  .array(
    z
      .object({
        lessonTitle: z.string().meta({
          description: 'The lesson title',
          examples: ['The Roman invasion of Britain '],
        }),
        lessonSlug: z.string().meta({
          description: 'The lesson slug identifier',
          examples: ['the-roman-invasion-of-britain'],
        }),
        transcriptSnippet: z
          .string()
          .optional()
          .meta({
            description: 'The snippet of the transcript that matched the search term',
            examples: ['The Romans were ready,'],
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonTitle: 'The Roman invasion of Britain ',
          lessonSlug: 'the-roman-invasion-of-britain',
          transcriptSnippet: 'The Romans were ready,',
        },
        {
          lessonTitle: 'The changes to life brought about by Roman settlement',
          lessonSlug: 'the-changes-to-life-brought-about-by-roman-settlement',
          transcriptSnippet: 'when the Romans came.',
        },
        {
          lessonTitle: "Boudica's rebellion against Roman rule",
          lessonSlug: 'boudicas-rebellion-against-roman-rule',
          transcriptSnippet: 'kings who resisted the Romans were,',
        },
        {
          lessonTitle: 'How far religion changed under Roman rule',
          lessonSlug: 'how-far-religion-changed-under-roman-rule',
          transcriptSnippet: 'for the Romans.',
        },
      ],
    ],
  });
export const SequenceAssetsResponseSchema = z
  .array(
    z
      .object({
        lessonSlug: z.string().meta({ description: 'The unique slug identifier for the lesson' }),
        lessonTitle: z.string().meta({ description: 'The title for the lesson' }),
        attribution: z.array(z.string()).optional().meta({
          description:
            "Licence information for any third-party content contained in the lessons' downloadable resources",
        }),
        assets: z
          .array(
            z
              .object({
                type: z
                  .enum([
                    'slideDeck',
                    'exitQuiz',
                    'exitQuizAnswers',
                    'starterQuiz',
                    'starterQuizAnswers',
                    'supplementaryResource',
                    'video',
                    'worksheet',
                    'worksheetAnswers',
                  ])
                  .meta({ examples: ['slideDeck'] }),
                label: z.string().meta({ description: 'The label for the asset' }),
                url: z.string().meta({
                  description: 'The download endpoint for the asset.',
                }),
              })
              .strict(),
          )
          .meta({ description: 'List of assets' }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonSlug: 'using-numerals',
          lessonTitle: 'Using numerals',
          assets: [
            {
              label: 'Worksheet',
              type: 'worksheet',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
            },
            {
              label: 'Worksheet Answers',
              type: 'worksheetAnswers',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
            },
            {
              label: 'Video',
              type: 'video',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
            },
          ],
        },
      ],
    ],
  });
export const SubjectAssetsResponseSchema = z
  .array(
    z
      .object({
        lessonSlug: z.string().meta({ description: 'The unique slug identifier for the lesson' }),
        lessonTitle: z.string().meta({ description: 'The title for the lesson' }),
        attribution: z.array(z.string()).optional().meta({
          description:
            "Licence information for any third-party content contained in the lessons' downloadable resources",
        }),
        assets: z
          .array(
            z
              .object({
                type: z
                  .enum([
                    'slideDeck',
                    'exitQuiz',
                    'exitQuizAnswers',
                    'starterQuiz',
                    'starterQuizAnswers',
                    'supplementaryResource',
                    'video',
                    'worksheet',
                    'worksheetAnswers',
                  ])
                  .meta({ examples: ['slideDeck'] }),
                label: z.string().meta({ description: 'The label for the asset' }),
                url: z.string().meta({
                  description: 'The download endpoint for the asset.',
                }),
              })
              .strict(),
          )
          .meta({ description: 'List of assets' }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonSlug: 'using-numerals',
          lessonTitle: 'Using numerals',
          assets: [
            {
              label: 'Worksheet',
              type: 'worksheet',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
            },
            {
              label: 'Worksheet Answers',
              type: 'worksheetAnswers',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
            },
            {
              label: 'Video',
              type: 'video',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
            },
          ],
        },
      ],
    ],
  });
export const LessonAssetsResponseSchema = z
  .object({
    attribution: z.array(z.string()).optional().meta({
      description:
        "Licence information for any third-party content contained in the lessons' downloadable resources",
    }),
    assets: z
      .array(
        z
          .object({
            type: z
              .enum([
                'slideDeck',
                'exitQuiz',
                'exitQuizAnswers',
                'starterQuiz',
                'starterQuizAnswers',
                'supplementaryResource',
                'video',
                'worksheet',
                'worksheetAnswers',
              ])
              .meta({ examples: ['slideDeck'] }),
            label: z.string().meta({ description: 'The label for the asset' }),
            url: z.string().meta({ description: 'The download endpoint for the asset.' }),
          })
          .strict(),
      )
      .optional()
      .meta({ description: 'List of assets' }),
  })
  .strict()
  .meta({
    examples: [
      {
        attribution: ['Copyright XYZ Authors', 'Creative Commons Attribution Example 4.0'],
        assets: [
          {
            label: 'Worksheet',
            type: 'worksheet',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
          },
          {
            label: 'Worksheet Answers',
            type: 'worksheetAnswers',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
          },
          {
            label: 'Video',
            type: 'video',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
          },
        ],
      },
    ],
  });
export const LessonAssetResponseSchema = z.unknown().meta({ examples: [{}] });
export const AllSubjectsResponseSchema = z
  .array(
    z
      .object({
        subjectTitle: z.string().meta({ description: 'The subject title' }),
        subjectSlug: z.string().meta({ description: 'The subject slug identifier' }),
        sequenceSlugs: z
          .array(
            z
              .object({
                sequenceSlug: z.string().meta({
                  description: 'The unique identifier for each sequence',
                }),
                years: z.array(z.number()).meta({
                  description: 'The years for which this subject has content available for',
                }),
                keyStages: z
                  .array(
                    z
                      .object({
                        keyStageTitle: z.string().meta({
                          description: 'The key stage title for the given key stage',
                        }),
                        keyStageSlug: z.string().meta({
                          description: 'The unique identifier for a given key stage',
                        }),
                      })
                      .strict(),
                  )
                  .meta({
                    description:
                      'The key stage slug identifiers for which this subject has content available for.',
                  }),
                phaseSlug: z.string().meta({
                  description: 'The unique identifier for the phase to which this sequence belongs',
                }),
                phaseTitle: z.string().meta({
                  description: 'The title for the phase to which this sequence belongs',
                }),
                ks4Options: z
                  .object({
                    title: z.string(),
                    slug: z.string(),
                  })
                  .strict()
                  .meta({
                    description:
                      'The key stage 4 study pathway that this sequence represents. May be null.',
                  }),
              })
              .strict(),
          )
          .meta({
            description:
              'Information about the years, key stages and key stage 4 variance for each sequence',
          }),
        years: z.array(z.number()).meta({
          description: 'The years for which this subject has content available for',
        }),
        keyStages: z
          .array(
            z
              .object({
                keyStageTitle: z.string().meta({
                  description: 'The key stage title for the given key stage',
                }),
                keyStageSlug: z.string().meta({
                  description: 'The unique identifier for a given key stage',
                }),
              })
              .strict(),
          )
          .meta({
            description:
              'The key stage slug identifiers for which this subject has content available for.',
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          subjectTitle: 'Art and design',
          subjectSlug: 'art',
          sequenceSlugs: [
            {
              sequenceSlug: 'art-primary',
              years: [1, 2, 3, 4, 5, 6],
              keyStages: [
                { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
              ],
              phaseSlug: 'primary',
              phaseTitle: 'Primary',
              ks4Options: null,
            },
            {
              sequenceSlug: 'art-secondary',
              years: [7, 8, 9, 10, 11],
              keyStages: [
                { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
                { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
              ],
              phaseSlug: 'secondary',
              phaseTitle: 'Secondary',
              ks4Options: null,
            },
          ],
          years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          keyStages: [
            { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
            { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
            { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
            { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
          ],
        },
      ],
    ],
  });
export const SubjectResponseSchema = z
  .object({
    subjectTitle: z.string().meta({ description: 'The subject title' }),
    subjectSlug: z.string().meta({ description: 'The subject slug identifier' }),
    sequenceSlugs: z
      .array(
        z
          .object({
            sequenceSlug: z
              .string()
              .meta({ description: 'The unique identifier for each sequence' }),
            years: z.array(z.number()).meta({
              description: 'The years for which this subject has content available for',
            }),
            keyStages: z
              .array(
                z
                  .object({
                    keyStageTitle: z.string().meta({
                      description: 'The key stage title for the given key stage',
                    }),
                    keyStageSlug: z.string().meta({
                      description: 'The unique identifier for a given key stage',
                    }),
                  })
                  .strict(),
              )
              .meta({
                description:
                  'The key stage slug identifiers for which this subject has content available for.',
              }),
            phaseSlug: z.string().meta({
              description: 'The unique identifier for the phase to which this sequence belongs',
            }),
            phaseTitle: z.string().meta({
              description: 'The title for the phase to which this sequence belongs',
            }),
            ks4Options: z
              .object({
                title: z.string(),
                slug: z.string(),
              })
              .strict()
              .meta({
                description:
                  'The key stage 4 study pathway that this sequence represents. May be null.',
              }),
          })
          .strict(),
      )
      .meta({
        description:
          'Information about the years, key stages and key stage 4 variance for each sequence',
      }),
    years: z.array(z.number()).meta({
      description: 'The years for which this subject has content available for',
    }),
    keyStages: z
      .array(
        z
          .object({
            keyStageTitle: z.string().meta({
              description: 'The key stage title for the given key stage',
            }),
            keyStageSlug: z.string().meta({
              description: 'The unique identifier for a given key stage',
            }),
          })
          .strict(),
      )
      .meta({
        description:
          'The key stage slug identifiers for which this subject has content available for.',
      }),
  })
  .strict()
  .meta({
    examples: [
      {
        subjectTitle: 'Art and design',
        subjectSlug: 'art',
        sequenceSlugs: [
          {
            sequenceSlug: 'art-primary',
            years: [1, 2, 3, 4, 5, 6],
            keyStages: [
              { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
              { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
            ],
            phaseSlug: 'primary',
            phaseTitle: 'Primary',
            ks4Options: null,
          },
          {
            sequenceSlug: 'art-secondary',
            years: [1, 2, 3, 4, 5, 6],
            keyStages: [
              { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
              { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
            ],
            phaseSlug: 'secondary',
            phaseTitle: 'Secondary',
            ks4Options: null,
          },
        ],
        years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        keyStages: [
          { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
          { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
          { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
          { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
        ],
      },
    ],
  });
export const SubjectSequenceResponseSchema = z
  .array(
    z
      .object({
        sequenceSlug: z.string().meta({ description: 'The unique identifier for each sequence' }),
        years: z.array(z.number()).meta({
          description: 'The years for which this subject has content available for',
        }),
        keyStages: z
          .array(
            z
              .object({
                keyStageTitle: z.string().meta({
                  description: 'The key stage title for the given key stage',
                }),
                keyStageSlug: z.string().meta({
                  description: 'The unique identifier for a given key stage',
                }),
              })
              .strict(),
          )
          .meta({
            description:
              'The key stage slug identifiers for which this subject has content available for.',
          }),
        phaseSlug: z.string().meta({
          description: 'The unique identifier for the phase to which this sequence belongs',
        }),
        phaseTitle: z.string().meta({
          description: 'The title for the phase to which this sequence belongs',
        }),
        ks4Options: z
          .object({
            title: z.string(),
            slug: z.string(),
          })
          .strict()
          .meta({
            description:
              'The key stage 4 study pathway that this sequence represents. May be null.',
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          sequenceSlug: 'art-primary',
          years: [1, 2, 3, 4, 5, 6],
          keyStages: [
            { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
            { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
          ],
          phaseSlug: 'primary',
          phaseTitle: 'Primary',
          ks4Options: null,
        },
        {
          sequenceSlug: 'art-secondary',
          years: [1, 2, 3, 4, 5, 6],
          keyStages: [
            { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
            { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
          ],
          phaseSlug: 'secondary',
          phaseTitle: 'Secondary',
          ks4Options: null,
        },
      ],
    ],
  });
export const SubjectKeyStagesResponseSchema = z
  .array(
    z
      .object({
        keyStageTitle: z
          .string()
          .meta({ description: 'The key stage title for the given key stage' }),
        keyStageSlug: z
          .string()
          .meta({ description: 'The unique identifier for a given key stage' }),
      })
      .strict(),
  )
  .meta({
    description: 'The key stage slug identifiers for which this subject has content available for',
    examples: [
      [
        { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
        { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
        { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
        { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
      ],
    ],
  });
export const SubjectYearsResponseSchema = z.array(z.number()).meta({
  description: 'The years for which this sequence has content available for',
  examples: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
});
export const KeyStageResponseSchema = z
  .array(
    z
      .object({
        slug: z.string().meta({
          description: 'The key stage slug identifier',
          examples: ['ks1'],
        }),
        title: z.string().meta({
          description: 'The key stage title',
          examples: ['Key Stage 1'],
        }),
      })
      .strict(),
  )
  .meta({ examples: [[{ slug: 'ks1', title: 'Key Stage 1' }]] });
export const KeyStageSubjectLessonsResponseSchema = z
  .array(
    z
      .object({
        unitSlug: z.string().meta({
          description: 'The unit slug identifier',
          examples: ['simple-compound-and-adverbial-complex-sentences'],
        }),
        unitTitle: z.string().meta({
          description: 'The unit title',
          examples: ['Simple, compound and adverbial complex sentences'],
        }),
        lessons: z
          .array(
            z
              .object({
                lessonSlug: z.string().meta({
                  description: 'The lesson slug identifier',
                  examples: ['four-types-of-simple-sentence'],
                }),
                lessonTitle: z.string().meta({
                  description: 'The lesson title',
                  examples: ['Four types of simple sentence'],
                }),
              })
              .strict(),
          )
          .meta({
            description: 'List of lessons for the specified unit',
            examples: [
              [
                {
                  lessonSlug: 'four-types-of-simple-sentence',
                  lessonTitle: 'Four types of simple sentence',
                },
                {
                  lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
                  lessonTitle: 'Three ways for co-ordination in compound sentences',
                },
              ],
            ],
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          unitSlug: 'simple-compound-and-adverbial-complex-sentences',
          unitTitle: 'Simple, compound and adverbial complex sentences',
          lessons: [
            {
              lessonSlug: 'four-types-of-simple-sentence',
              lessonTitle: 'Four types of simple sentence',
            },
            {
              lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
              lessonTitle: 'Three ways for co-ordination in compound sentences',
            },
          ],
        },
      ],
    ],
  });
export const AllKeyStageAndSubjectUnitsResponseSchema = z
  .array(
    z
      .object({
        yearSlug: z.string().meta({ description: 'The year identifier', examples: ['year-3'] }),
        yearTitle: z.string().meta({ description: 'The year title', examples: ['Year 3'] }),
        units: z
          .array(
            z
              .object({
                unitSlug: z.string(),
                unitTitle: z.string(),
              })
              .strict(),
          )
          .meta({ description: 'List of units for the specified year' }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          units: [
            {
              unitSlug: '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
              unitTitle: '2, 4 and 8 times tables: using times tables to solve problems',
            },
            {
              unitSlug:
                'bridging-100-counting-on-and-back-in-10s-adding-subtracting-multiples-of-10',
              unitTitle:
                'Bridging 100: counting on and back in 10s, adding/subtracting multiples of 10',
            },
          ],
          yearSlug: 'year-3',
          yearTitle: 'Year 3',
        },
      ],
    ],
  });
export const QuestionForLessonsResponseSchema = z
  .object({
    starterQuiz: z
      .array(
        z
          .object({
            question: z.string().meta({ description: 'The question text' }),
            questionType: z
              .union([
                z.literal('multiple-choice'),
                z.literal('short-answer'),
                z.literal('match'),
                z.literal('order'),
              ])
              .meta({
                description:
                  'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
              }),
            questionImage: z
              .object({
                url: z.string(),
                width: z.number(),
                height: z.number(),
                alt: z.string().optional(),
                text: z.string().optional().meta({
                  description: 'Supplementary text for the image, if any',
                }),
                attribution: z.string().optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .and(
            z.union([
              z
                .object({
                  questionType: z.literal('multiple-choice'),
                  answers: z.array(
                    z
                      .object({
                        distractor: z.boolean().meta({
                          description:
                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                        }),
                      })
                      .strict()
                      .and(
                        z.union([
                          z
                            .object({
                              type: z.literal('text').meta({
                                description:
                                  'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                              }),
                              content: z.string().meta({ description: 'Quiz question answer' }),
                            })
                            .strict(),
                          z
                            .object({
                              type: z.literal('image'),
                              content: z
                                .object({
                                  url: z.string(),
                                  width: z.number(),
                                  height: z.number(),
                                  alt: z.string().optional(),
                                  text: z.string().optional().meta({
                                    description: 'Supplementary text for the image, if any',
                                  }),
                                  attribution: z.string().optional(),
                                })
                                .strict(),
                            })
                            .strict(),
                        ]),
                      ),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('short-answer'),
                  answers: z.array(
                    z
                      .object({
                        type: z.literal('text').meta({
                          description:
                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                        }),
                        content: z.string().meta({ description: 'Quiz question answer' }),
                      })
                      .strict(),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('match'),
                  answers: z.array(
                    z
                      .object({
                        matchOption: z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict()
                          .meta({ description: 'Matching options (LHS)' }),
                        correctChoice: z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict()
                          .meta({
                            description: 'Matching options (RHS), indicating the correct choice',
                          }),
                      })
                      .strict(),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('order'),
                  answers: z.array(
                    z
                      .object({
                        order: z.number().meta({
                          description: 'Indicates the correct ordering of the response',
                        }),
                      })
                      .strict()
                      .and(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                  ),
                })
                .strict(),
            ]),
          ),
      )
      .meta({
        description: 'The starter quiz questions - which test prior knowledge',
      }),
    exitQuiz: z
      .array(
        z
          .object({
            question: z.string().meta({ description: 'The question text' }),
            questionType: z
              .union([
                z.literal('multiple-choice'),
                z.literal('short-answer'),
                z.literal('match'),
                z.literal('order'),
              ])
              .meta({
                description:
                  'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
              }),
            questionImage: z
              .object({
                url: z.string(),
                width: z.number(),
                height: z.number(),
                alt: z.string().optional(),
                text: z.string().optional().meta({
                  description: 'Supplementary text for the image, if any',
                }),
                attribution: z.string().optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .and(
            z.union([
              z
                .object({
                  questionType: z.literal('multiple-choice'),
                  answers: z.array(
                    z
                      .object({
                        distractor: z.boolean().meta({
                          description:
                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                        }),
                      })
                      .strict()
                      .and(
                        z.union([
                          z
                            .object({
                              type: z.literal('text').meta({
                                description:
                                  'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                              }),
                              content: z.string().meta({ description: 'Quiz question answer' }),
                            })
                            .strict(),
                          z
                            .object({
                              type: z.literal('image'),
                              content: z
                                .object({
                                  url: z.string(),
                                  width: z.number(),
                                  height: z.number(),
                                  alt: z.string().optional(),
                                  text: z.string().optional().meta({
                                    description: 'Supplementary text for the image, if any',
                                  }),
                                  attribution: z.string().optional(),
                                })
                                .strict(),
                            })
                            .strict(),
                        ]),
                      ),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('short-answer'),
                  answers: z.array(
                    z
                      .object({
                        type: z.literal('text').meta({
                          description:
                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                        }),
                        content: z.string().meta({ description: 'Quiz question answer' }),
                      })
                      .strict(),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('match'),
                  answers: z.array(
                    z
                      .object({
                        matchOption: z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict()
                          .meta({ description: 'Matching options (LHS)' }),
                        correctChoice: z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict()
                          .meta({
                            description: 'Matching options (RHS), indicating the correct choice',
                          }),
                      })
                      .strict(),
                  ),
                })
                .strict(),
              z
                .object({
                  questionType: z.literal('order'),
                  answers: z.array(
                    z
                      .object({
                        order: z.number().meta({
                          description: 'Indicates the correct ordering of the response',
                        }),
                      })
                      .strict()
                      .and(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                  ),
                })
                .strict(),
            ]),
          ),
      )
      .meta({
        description: 'The exit quiz questions - which test on the knowledge learned in the lesson',
      }),
  })
  .strict()
  .meta({
    examples: [
      {
        starterQuiz: [
          {
            question: 'Tick the sentence with the correct punctuation.',
            questionType: 'multiple-choice',
            answers: [
              { distractor: true, type: 'text', content: 'the baby cried' },
              { distractor: true, type: 'text', content: 'The baby cried' },
              { distractor: false, type: 'text', content: 'The baby cried.' },
              { distractor: true, type: 'text', content: 'the baby cried.' },
            ],
          },
        ],
        exitQuiz: [
          {
            question: 'Which word is a verb?',
            questionType: 'multiple-choice',
            answers: [
              { distractor: true, type: 'text', content: 'shops' },
              { distractor: true, type: 'text', content: 'Jun' },
              { distractor: true, type: 'text', content: 'I' },
              { distractor: false, type: 'text', content: 'shout' },
            ],
          },
        ],
      },
    ],
  });
export const QuestionsForSequenceResponseSchema = z
  .array(
    z
      .object({
        lessonSlug: z.string().meta({ description: 'The lesson slug identifier' }),
        lessonTitle: z.string().meta({ description: 'The title of the lesson' }),
        starterQuiz: z
          .array(
            z
              .object({
                question: z.string().meta({ description: 'The question text' }),
                questionType: z
                  .union([
                    z.literal('multiple-choice'),
                    z.literal('short-answer'),
                    z.literal('match'),
                    z.literal('order'),
                  ])
                  .meta({
                    description:
                      'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                  }),
                questionImage: z
                  .object({
                    url: z.string(),
                    width: z.number(),
                    height: z.number(),
                    alt: z.string().optional(),
                    text: z.string().optional().meta({
                      description: 'Supplementary text for the image, if any',
                    }),
                    attribution: z.string().optional(),
                  })
                  .strict()
                  .optional(),
              })
              .strict()
              .and(
                z.union([
                  z
                    .object({
                      questionType: z.literal('multiple-choice'),
                      answers: z.array(
                        z
                          .object({
                            distractor: z.boolean().meta({
                              description:
                                'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                            }),
                          })
                          .strict()
                          .and(
                            z.union([
                              z
                                .object({
                                  type: z.literal('text').meta({
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                  }),
                                  content: z.string().meta({
                                    description: 'Quiz question answer',
                                  }),
                                })
                                .strict(),
                              z
                                .object({
                                  type: z.literal('image'),
                                  content: z
                                    .object({
                                      url: z.string(),
                                      width: z.number(),
                                      height: z.number(),
                                      alt: z.string().optional(),
                                      text: z.string().optional().meta({
                                        description: 'Supplementary text for the image, if any',
                                      }),
                                      attribution: z.string().optional(),
                                    })
                                    .strict(),
                                })
                                .strict(),
                            ]),
                          ),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('short-answer'),
                      answers: z.array(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('match'),
                      answers: z.array(
                        z
                          .object({
                            matchOption: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({ description: 'Matching options (LHS)' }),
                            correctChoice: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                              }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('order'),
                      answers: z.array(
                        z
                          .object({
                            order: z.number().meta({
                              description: 'Indicates the correct ordering of the response',
                            }),
                          })
                          .strict()
                          .and(
                            z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict(),
                          ),
                      ),
                    })
                    .strict(),
                ]),
              ),
          )
          .meta({
            description: 'The starter quiz questions - which test prior knowledge',
          }),
        exitQuiz: z
          .array(
            z
              .object({
                question: z.string().meta({ description: 'The question text' }),
                questionType: z
                  .union([
                    z.literal('multiple-choice'),
                    z.literal('short-answer'),
                    z.literal('match'),
                    z.literal('order'),
                  ])
                  .meta({
                    description:
                      'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                  }),
                questionImage: z
                  .object({
                    url: z.string(),
                    width: z.number(),
                    height: z.number(),
                    alt: z.string().optional(),
                    text: z.string().optional().meta({
                      description: 'Supplementary text for the image, if any',
                    }),
                    attribution: z.string().optional(),
                  })
                  .strict()
                  .optional(),
              })
              .strict()
              .and(
                z.union([
                  z
                    .object({
                      questionType: z.literal('multiple-choice'),
                      answers: z.array(
                        z
                          .object({
                            distractor: z.boolean().meta({
                              description:
                                'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                            }),
                          })
                          .strict()
                          .and(
                            z.union([
                              z
                                .object({
                                  type: z.literal('text').meta({
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                  }),
                                  content: z.string().meta({
                                    description: 'Quiz question answer',
                                  }),
                                })
                                .strict(),
                              z
                                .object({
                                  type: z.literal('image'),
                                  content: z
                                    .object({
                                      url: z.string(),
                                      width: z.number(),
                                      height: z.number(),
                                      alt: z.string().optional(),
                                      text: z.string().optional().meta({
                                        description: 'Supplementary text for the image, if any',
                                      }),
                                      attribution: z.string().optional(),
                                    })
                                    .strict(),
                                })
                                .strict(),
                            ]),
                          ),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('short-answer'),
                      answers: z.array(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('match'),
                      answers: z.array(
                        z
                          .object({
                            matchOption: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({ description: 'Matching options (LHS)' }),
                            correctChoice: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                              }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('order'),
                      answers: z.array(
                        z
                          .object({
                            order: z.number().meta({
                              description: 'Indicates the correct ordering of the response',
                            }),
                          })
                          .strict()
                          .and(
                            z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict(),
                          ),
                      ),
                    })
                    .strict(),
                ]),
              ),
          )
          .meta({
            description:
              'The exit quiz questions - which test on the knowledge learned in the lesson',
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonTitle: '3D shapes can be composed from 2D nets',
          lessonSlug: '3d-shapes-can-be-composed-from-2d-nets',
          starterQuiz: [
            {
              question: 'Select all of the names of shapes that are polygons.',
              questionType: 'multiple-choice',
              answers: [
                { type: 'text', content: 'Cube ', distractor: true },
                { type: 'text', content: ' Square', distractor: false },
                { type: 'text', content: 'Triangle', distractor: false },
                { type: 'text', content: 'Semi-circle', distractor: true },
              ],
            },
          ],
          exitQuiz: [
            {
              question: 'What is a net?',
              questionType: 'multiple-choice',
              answers: [
                {
                  type: 'text',
                  content: 'A 3D shape made of 2D shapes folded together. ',
                  distractor: false,
                },
                {
                  type: 'text',
                  content: 'A 2D shape made of 3D shapes folded togehther.',
                  distractor: true,
                },
                { type: 'text', content: 'A type of cube.', distractor: true },
              ],
            },
          ],
        },
      ],
    ],
  });
export const QuestionsForKeyStageAndSubjectResponseSchema = z
  .array(
    z
      .object({
        lessonSlug: z.string().meta({ description: 'The lesson slug identifier' }),
        lessonTitle: z.string().meta({ description: 'The title of the lesson' }),
        starterQuiz: z
          .array(
            z
              .object({
                question: z.string().meta({ description: 'The question text' }),
                questionType: z
                  .union([
                    z.literal('multiple-choice'),
                    z.literal('short-answer'),
                    z.literal('match'),
                    z.literal('order'),
                  ])
                  .meta({
                    description:
                      'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                  }),
                questionImage: z
                  .object({
                    url: z.string(),
                    width: z.number(),
                    height: z.number(),
                    alt: z.string().optional(),
                    text: z.string().optional().meta({
                      description: 'Supplementary text for the image, if any',
                    }),
                    attribution: z.string().optional(),
                  })
                  .strict()
                  .optional(),
              })
              .strict()
              .and(
                z.union([
                  z
                    .object({
                      questionType: z.literal('multiple-choice'),
                      answers: z.array(
                        z
                          .object({
                            distractor: z.boolean().meta({
                              description:
                                'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                            }),
                          })
                          .strict()
                          .and(
                            z.union([
                              z
                                .object({
                                  type: z.literal('text').meta({
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                  }),
                                  content: z.string().meta({
                                    description: 'Quiz question answer',
                                  }),
                                })
                                .strict(),
                              z
                                .object({
                                  type: z.literal('image'),
                                  content: z
                                    .object({
                                      url: z.string(),
                                      width: z.number(),
                                      height: z.number(),
                                      alt: z.string().optional(),
                                      text: z.string().optional().meta({
                                        description: 'Supplementary text for the image, if any',
                                      }),
                                      attribution: z.string().optional(),
                                    })
                                    .strict(),
                                })
                                .strict(),
                            ]),
                          ),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('short-answer'),
                      answers: z.array(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('match'),
                      answers: z.array(
                        z
                          .object({
                            matchOption: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({ description: 'Matching options (LHS)' }),
                            correctChoice: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                              }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('order'),
                      answers: z.array(
                        z
                          .object({
                            order: z.number().meta({
                              description: 'Indicates the correct ordering of the response',
                            }),
                          })
                          .strict()
                          .and(
                            z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict(),
                          ),
                      ),
                    })
                    .strict(),
                ]),
              ),
          )
          .meta({
            description: 'The starter quiz questions - which test prior knowledge',
          }),
        exitQuiz: z
          .array(
            z
              .object({
                question: z.string().meta({ description: 'The question text' }),
                questionType: z
                  .union([
                    z.literal('multiple-choice'),
                    z.literal('short-answer'),
                    z.literal('match'),
                    z.literal('order'),
                  ])
                  .meta({
                    description:
                      'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                  }),
                questionImage: z
                  .object({
                    url: z.string(),
                    width: z.number(),
                    height: z.number(),
                    alt: z.string().optional(),
                    text: z.string().optional().meta({
                      description: 'Supplementary text for the image, if any',
                    }),
                    attribution: z.string().optional(),
                  })
                  .strict()
                  .optional(),
              })
              .strict()
              .and(
                z.union([
                  z
                    .object({
                      questionType: z.literal('multiple-choice'),
                      answers: z.array(
                        z
                          .object({
                            distractor: z.boolean().meta({
                              description:
                                'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                            }),
                          })
                          .strict()
                          .and(
                            z.union([
                              z
                                .object({
                                  type: z.literal('text').meta({
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                  }),
                                  content: z.string().meta({
                                    description: 'Quiz question answer',
                                  }),
                                })
                                .strict(),
                              z
                                .object({
                                  type: z.literal('image'),
                                  content: z
                                    .object({
                                      url: z.string(),
                                      width: z.number(),
                                      height: z.number(),
                                      alt: z.string().optional(),
                                      text: z.string().optional().meta({
                                        description: 'Supplementary text for the image, if any',
                                      }),
                                      attribution: z.string().optional(),
                                    })
                                    .strict(),
                                })
                                .strict(),
                            ]),
                          ),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('short-answer'),
                      answers: z.array(
                        z
                          .object({
                            type: z.literal('text').meta({
                              description:
                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                            }),
                            content: z.string().meta({ description: 'Quiz question answer' }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('match'),
                      answers: z.array(
                        z
                          .object({
                            matchOption: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({ description: 'Matching options (LHS)' }),
                            correctChoice: z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict()
                              .meta({
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                              }),
                          })
                          .strict(),
                      ),
                    })
                    .strict(),
                  z
                    .object({
                      questionType: z.literal('order'),
                      answers: z.array(
                        z
                          .object({
                            order: z.number().meta({
                              description: 'Indicates the correct ordering of the response',
                            }),
                          })
                          .strict()
                          .and(
                            z
                              .object({
                                type: z.literal('text').meta({
                                  description:
                                    'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                }),
                                content: z.string().meta({
                                  description: 'Quiz question answer',
                                }),
                              })
                              .strict(),
                          ),
                      ),
                    })
                    .strict(),
                ]),
              ),
          )
          .meta({
            description:
              'The exit quiz questions - which test on the knowledge learned in the lesson',
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonSlug: 'predicting-the-size-of-a-product',
          lessonTitle: 'Predicting the size of a product',
          starterQuiz: [
            {
              question: 'Match the number to its written representation.',
              questionType: 'match',
              answers: [
                {
                  matchOption: { type: 'text', content: 'seven tenths' },
                  correctChoice: { type: 'text', content: '0.7' },
                },
                {
                  matchOption: { type: 'text', content: 'nine tenths' },
                  correctChoice: { type: 'text', content: '0.9' },
                },
                {
                  matchOption: { type: 'text', content: 'seven ones' },
                  correctChoice: { type: 'text', content: '7' },
                },
                {
                  matchOption: { type: 'text', content: 'seven hundredths' },
                  correctChoice: { type: 'text', content: '0.07' },
                },
                {
                  matchOption: { type: 'text', content: 'nine hundredths' },
                  correctChoice: { type: 'text', content: '0.09' },
                },
              ],
            },
          ],
          exitQuiz: [
            {
              question: 'Use the fact that 9 × 8 = 72, to match the expressions to their product.',
              questionType: 'match',
              answers: [
                {
                  matchOption: { type: 'text', content: '9 × 80' },
                  correctChoice: { type: 'text', content: '720' },
                },
                {
                  matchOption: { type: 'text', content: '9 × 800 ' },
                  correctChoice: { type: 'text', content: '7,200' },
                },
                {
                  matchOption: { type: 'text', content: '9 × 0.8' },
                  correctChoice: { type: 'text', content: '7.2' },
                },
                {
                  matchOption: { type: 'text', content: '9 × 0' },
                  correctChoice: { type: 'text', content: '0' },
                },
                {
                  matchOption: { type: 'text', content: '9 × 0.08' },
                  correctChoice: { type: 'text', content: '0.72' },
                },
              ],
            },
          ],
        },
      ],
    ],
  });
export const LessonSummaryResponseSchema = z
  .object({
    lessonTitle: z.string().meta({ description: 'The lesson title' }),
    unitSlug: z.string().meta({ description: 'The unit slug identifier' }),
    unitTitle: z.string().meta({ description: 'The unit title' }),
    subjectSlug: z.string().meta({ description: 'The subject slug identifier' }),
    subjectTitle: z.string().meta({ description: 'The subject slug identifier' }),
    keyStageSlug: z.string().meta({ description: 'The key stage slug identifier' }),
    keyStageTitle: z.string().meta({ description: 'The key stage title' }),
    lessonKeywords: z
      .array(
        z
          .object({
            keyword: z.string().meta({ description: 'The keyword' }),
            description: z.string().meta({ description: 'A definition of the keyword' }),
          })
          .strict(),
      )
      .meta({ description: "The lesson's keywords and their descriptions" }),
    keyLearningPoints: z
      .array(
        z
          .object({
            keyLearningPoint: z.string().meta({ description: 'A key learning point' }),
          })
          .strict(),
      )
      .meta({ description: "The lesson's key learning points" }),
    misconceptionsAndCommonMistakes: z
      .array(
        z
          .object({
            misconception: z.string().meta({ description: 'A common misconception' }),
            response: z.string(),
          })
          .strict(),
      )
      .meta({
        description:
          'The lesson’s anticipated common misconceptions and suggested teacher responses',
      }),
    pupilLessonOutcome: z.string().optional().meta({
      description: 'Suggested teacher response to a common misconception',
    }),
    teacherTips: z
      .array(
        z
          .object({
            teacherTip: z.string(),
          })
          .strict()
          .meta({ description: 'A teaching tip' }),
      )
      .meta({ description: 'Helpful teaching tips for the lesson' }),
    contentGuidance: z
      .union([
        z.array(
          z
            .object({
              contentGuidanceArea: z.string().meta({ description: 'Category of content guidance' }),
              supervisionlevel_id: z.number().meta({
                description:
                  'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
              }),
              contentGuidanceLabel: z.string().meta({ description: 'Content guidance label' }),
              contentGuidanceDescription: z.string().meta({
                description:
                  'A detailed description of the type of content that we suggest needs guidance.',
              }),
            })
            .strict(),
        ),
        z.unknown(),
      ])
      .meta({
        description:
          'Full guidance about the types of lesson content for the teacher to consider (where appropriate)',
      }),
    supervisionLevel: z.union([z.string(), z.unknown()]).meta({
      description:
        'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
    }),
    downloadsAvailable: z.boolean().meta({
      description:
        'Whether the lesson currently has any downloadable assets availableNote: this field reflects the current availability of downloadable assets, which reflects the availability of early-release content available for the hackathon. All lessons will eventually have downloadable assets available.',
    }),
  })
  .strict()
  .meta({
    examples: [
      {
        lessonTitle: "Joining using 'and'",
        unitSlug: 'simple-sentences',
        unitTitle: 'Simple sentences',
        subjectSlug: 'english',
        subjectTitle: 'English',
        keyStageSlug: 'ks1',
        keyStageTitle: 'Key Stage 1',
        lessonKeywords: [
          {
            keyword: 'joining word',
            description: 'a word that joins words or ideas',
          },
          { keyword: 'build on', description: 'add to' },
          { keyword: 'related', description: 'linked to' },
        ],
        keyLearningPoints: [
          { keyLearningPoint: 'And is a type of joining word.' },
          { keyLearningPoint: 'A joining word can join two simple sentences.' },
          {
            keyLearningPoint: 'Each simple sentence is about one idea and makes complete sense.',
          },
          {
            keyLearningPoint:
              'The second idea builds on to the first idea if ‘and’ is used to join them.',
          },
          {
            keyLearningPoint:
              'Grammatically accurate sentences start with capital letters and most often end with full stops.',
          },
        ],
        misconceptionsAndCommonMistakes: [
          {
            misconception: 'Pupils may struggle to link related ideas together.',
            response:
              'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
          },
        ],
        pupilLessonOutcome: "I can join two simple sentences with 'and'.",
        teacherTips: [
          {
            teacherTip:
              'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
          },
        ],
        contentGuidance: null,
        supervisionLevel: null,
        downloadsAvailable: true,
      },
    ],
  });
export const LessonSearchResponseSchema = z
  .array(
    z
      .object({
        lessonSlug: z.string().meta({ description: 'The lesson slug identifier' }),
        lessonTitle: z.string().meta({ description: 'The lesson title' }),
        similarity: z.number().meta({
          description: 'The snippet of the transcript that matched the search term',
        }),
        units: z
          .array(
            z
              .object({
                unitSlug: z.string(),
                unitTitle: z.string(),
                examBoardTitle: z.union([z.string(), z.unknown()]),
                keyStageSlug: z.string(),
                subjectSlug: z.string(),
              })
              .strict(),
          )
          .meta({
            description: 'The units that the lesson is part of. See sample response below',
          }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          lessonSlug: 'performing-your-chosen-gothic-poem',
          lessonTitle: 'Performing your chosen Gothic poem',
          similarity: 0.20588236,
          units: [
            {
              unitSlug: 'gothic-poetry',
              unitTitle: 'Gothic poetry',
              examBoardTitle: null,
              keyStageSlug: 'ks3',
              subjectSlug: 'english',
            },
          ],
        },
        {
          lessonSlug: 'the-twisted-tree-the-novel-as-a-gothic-text',
          lessonTitle: "'The Twisted Tree': the novel as a Gothic text",
          similarity: 0.19444445,
          units: [
            {
              unitSlug: 'the-twisted-tree-fiction-reading',
              unitTitle: "'The Twisted Tree': fiction reading",
              examBoardTitle: null,
              keyStageSlug: 'ks3',
              subjectSlug: 'english',
            },
          ],
        },
      ],
    ],
  });
export const UnitSummaryResponseSchema = z
  .object({
    unitSlug: z.string().meta({
      description: 'The unit slug identifier',
      examples: ['simple-compound-and-adverbial-complex-sentences'],
    }),
    unitTitle: z.string().meta({
      description: 'The unit title',
      examples: ['Simple, compound and adverbial complex sentences'],
    }),
    yearSlug: z.string().meta({
      description: 'The slug identifier for the year to which the unit belongs',
      examples: ['year-3'],
    }),
    year: z.union([z.number(), z.string()]).meta({
      description: 'The year to which the unit belongs',
      examples: [3],
    }),
    phaseSlug: z.string().meta({
      description: 'The slug identifier for the phase to which the unit belongs',
      examples: ['primary'],
    }),
    subjectSlug: z.string().meta({ description: 'The subject identifier', examples: ['english'] }),
    keyStageSlug: z.string().meta({
      description: 'The slug identifier for the the key stage to which the unit belongs',
      examples: ['ks2'],
    }),
    notes: z.string().optional().meta({ description: 'Unit summary notes' }),
    description: z.string().optional().meta({
      description: 'A short description of the unit. Not yet available for all subjects.',
    }),
    priorKnowledgeRequirements: z.array(z.string()).meta({
      description: 'The prior knowledge required for the unit',
      examples: [
        [
          'A simple sentence is about one idea and makes complete sense.',
          'Any simple sentence contains one verb and at least one noun.',
          'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
        ],
      ],
    }),
    nationalCurriculumContent: z.array(z.string()).meta({
      description: 'National curriculum attainment statements covered in this unit',
      examples: [
        [
          'Ask relevant questions to extend their understanding and knowledge',
          'Articulate and justify answers, arguments and opinions',
          'Speak audibly and fluently with an increasing command of Standard English',
        ],
      ],
    }),
    whyThisWhyNow: z.string().optional().meta({
      description:
        'An explanation of where the unit sits within the sequence and why it has been placed there.',
    }),
    threads: z
      .array(
        z
          .object({
            slug: z.string(),
            title: z.string(),
            order: z.number(),
          })
          .strict(),
      )
      .optional()
      .meta({
        description: 'The threads that are associated with the unit',
        examples: [
          [
            {
              slug: 'developing-grammatical-knowledge',
              title: 'Developing grammatical knowledge',
              order: 10,
            },
          ],
        ],
      }),
    categories: z
      .array(
        z
          .object({
            categoryTitle: z.string(),
            categorySlug: z.string().optional(),
          })
          .strict(),
      )
      .optional()
      .meta({
        description:
          'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
      }),
    unitLessons: z.array(
      z
        .object({
          lessonSlug: z.string().meta({
            description: 'The lesson slug identifier',
            examples: ['four-types-of-simple-sentence'],
          }),
          lessonTitle: z.string().meta({
            description: 'The title for the lesson',
            examples: ['Four types of simple sentence'],
          }),
          lessonOrder: z
            .number()
            .optional()
            .meta({
              description: 'Indicates the ordering of the lesson',
              examples: [1],
            }),
          state: z.enum(['published', 'new']).meta({
            description:
              "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
            examples: ['published'],
          }),
        })
        .strict()
        .meta({ description: 'All the lessons contained in the unit' }),
    ),
  })
  .strict()
  .meta({
    examples: [
      {
        unitSlug: 'simple-compound-and-adverbial-complex-sentences',
        unitTitle: 'Simple, compound and adverbial complex sentences',
        yearSlug: 'year-3',
        year: 3,
        phaseSlug: 'primary',
        subjectSlug: 'english',
        keyStageSlug: 'ks2',
        priorKnowledgeRequirements: [
          'A simple sentence is about one idea and makes complete sense.',
          'Any simple sentence contains one verb and at least one noun.',
          'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
        ],
        nationalCurriculumContent: [
          'Ask relevant questions to extend their understanding and knowledge',
          'Articulate and justify answers, arguments and opinions',
          'Speak audibly and fluently with an increasing command of Standard English',
        ],
        threads: [
          {
            slug: 'developing-grammatical-knowledge',
            title: 'Developing grammatical knowledge',
            order: 10,
          },
        ],
        unitLessons: [
          {
            lessonSlug: 'four-types-of-simple-sentence',
            lessonTitle: 'Four types of simple sentence',
            lessonOrder: 1,
            state: 'published',
          },
          {
            lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
            lessonTitle: 'Three ways for co-ordination in compound sentences',
            lessonOrder: 2,
            state: 'new',
          },
        ],
      },
    ],
  });
export const AllThreadsResponseSchema = z
  .array(
    z
      .object({
        title: z.string().meta({ description: 'The thread title' }),
        slug: z.string().meta({ description: 'The thread slug identifier' }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          title: 'Number: Multiplication and division',
          slug: 'number-multiplication-and-division',
        },
      ],
    ],
  });
export const ThreadUnitsResponseSchema = z
  .array(
    z
      .object({
        unitTitle: z.string().meta({ description: 'The unit title' }),
        unitSlug: z.string().meta({ description: 'The unit slug identifier' }),
        unitOrder: z.number().meta({ description: 'The position of the unit within the thread' }),
      })
      .strict(),
  )
  .meta({
    examples: [
      [
        {
          unitTitle: 'Unitising and coin recognition - counting in 2s, 5s and 10s',
          unitSlug: 'unitising-and-coin-recognitions-counting-in-2s-5s-and-10s',
          unitOrder: 1,
        },
        {
          unitTitle: 'Solving problems in a range of contexts',
          unitSlug: 'unitising-and-coin-recognition-solving-problems-involving-money',
          unitOrder: 2,
        },
      ],
    ],
  });
export const RateLimitResponseSchema = z
  .object({
    limit: z.number().meta({
      description: 'The maximum number of requests you can make in the current window.',
      examples: [1000],
    }),
    remaining: z.number().meta({
      description: 'The number of requests remaining in the current window.',
      examples: [953],
    }),
    reset: z.number().meta({
      description:
        'The time at which the current window resets, in milliseconds since the Unix epoch.',
      examples: [1740164400000],
    }),
  })
  .strict()
  .meta({ examples: [{ limit: 1000, remaining: 953, reset: 1740164400000 }] });
// Endpoints
export const endpoints = [
  {
    method: 'get',
    path: '/changelog',
    requestFormat: 'json',
    parameters: [],
    response: z
      .array(
        z
          .object({
            version: z.string(),
            date: z.string(),
            changes: z.array(z.string()),
          })
          .strict(),
      )
      .meta({
        examples: [
          [
            {
              version: '0.5.0',
              date: '2025-03-06',
              changes: [
                'PPTX used for slideDeck assets',
                'All video assets now fully downloadable in mp4 format',
                'New /threads/* endpoints',
              ],
            },
            {
              version: '0.4.0',
              date: '2025-02-07',
              changes: [
                'Added /sequences/* and /subjects/* endpoints, and add support for unit optionality',
              ],
            },
          ],
        ],
      }),
    errors: [],
    responses: {
      200: {
        schema: z
          .array(
            z
              .object({
                version: z.string(),
                date: z.string(),
                changes: z.array(z.string()),
              })
              .strict(),
          )
          .meta({
            examples: [
              [
                {
                  version: '0.5.0',
                  date: '2025-03-06',
                  changes: [
                    'PPTX used for slideDeck assets',
                    'All video assets now fully downloadable in mp4 format',
                    'New /threads/* endpoints',
                  ],
                },
                {
                  version: '0.4.0',
                  date: '2025-02-07',
                  changes: [
                    'Added /sequences/* and /subjects/* endpoints, and add support for unit optionality',
                  ],
                },
              ],
            ],
          }),
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'changelog-changelog',
    description: 'History of significant changes to the API with associated dates and versions',
  },
  {
    method: 'get',
    path: '/changelog/latest',
    requestFormat: 'json',
    parameters: [],
    response: z
      .object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()),
      })
      .strict()
      .meta({
        examples: [
          {
            version: '0.5.0',
            date: '2025-03-06',
            changes: [
              'PPTX used for slideDeck assets',
              'All video assets now fully downloadable in mp4 format',
              'New /threads/* endpoints',
            ],
          },
        ],
      }),
    errors: [],
    responses: {
      200: {
        schema: z
          .object({
            version: z.string(),
            date: z.string(),
            changes: z.array(z.string()),
          })
          .strict()
          .meta({
            examples: [
              {
                version: '0.5.0',
                date: '2025-03-06',
                changes: [
                  'PPTX used for slideDeck assets',
                  'All video assets now fully downloadable in mp4 format',
                  'New /threads/* endpoints',
                ],
              },
            ],
          }),
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'changelog-latest',
    description: 'Get the latest version and latest change note for the API',
  },
  {
    method: 'get',
    path: '/key-stages',
    requestFormat: 'json',
    parameters: [],
    response: KeyStageResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: KeyStageResponseSchema,
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'getKeyStages-getKeyStages',
    description:
      'This endpoint returns all the key stages (titles and slugs) that are currently available on Oak',
  },
  {
    method: 'get',
    path: '/key-stages/{keyStage}/subject/{subject}/assets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'keyStage',
        type: 'Path',
        schema: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        description:
          "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      },
      {
        name: 'subject',
        type: 'Path',
        schema: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
            examples: ['english'],
          }),
        description:
          "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
      },
      {
        name: 'type',
        type: 'Query',
        schema: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({ examples: ['slideDeck'] }),
        description:
          'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
      },
      {
        name: 'unit',
        type: 'Query',
        schema: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['word-class'],
          }),
      },
    ],
    response: SubjectAssetsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SubjectAssetsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        keyStage: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        subject: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
            examples: ['english'],
          }),
      }),
      queryParams: z.object({
        type: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({ examples: ['slideDeck'] }),
        unit: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['word-class'],
          }),
      }),
    },
    alias: 'getAssets-getSubjectAssets',
    description:
      'This endpoint returns signed download URLs and types for available assets for a given key stage and subject, grouped by lesson. You can also optionally filter by type and unit.',
  },
  {
    method: 'get',
    path: '/key-stages/{keyStage}/subject/{subject}/lessons',
    requestFormat: 'json',
    parameters: [
      {
        name: 'keyStage',
        type: 'Path',
        schema: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        description:
          "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      },
      {
        name: 'subject',
        type: 'Path',
        schema: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
            examples: ['english'],
          }),
        description:
          "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
      },
      {
        name: 'unit',
        type: 'Query',
        schema: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['word-class'],
          }),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z
          .number()
          .optional()
          .meta({
            description:
              'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',
            examples: [50],
          }),
        description:
          'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z
          .number()
          .max(100)
          .optional()
          .meta({
            description: 'Offset applied to lessons within each unit (not to the unit list).',
            examples: [10],
          }),
        description: 'Offset applied to lessons within each unit (not to the unit list).',
      },
    ],
    response: KeyStageSubjectLessonsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: KeyStageSubjectLessonsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        keyStage: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        subject: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
            examples: ['english'],
          }),
      }),
      queryParams: z.object({
        unit: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['word-class'],
          }),
        offset: z
          .number()
          .optional()
          .meta({
            description:
              'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',
            examples: [50],
          }),
        limit: z
          .number()
          .max(100)
          .optional()
          .meta({
            description: 'Offset applied to lessons within each unit (not to the unit list).',
            examples: [10],
          }),
      }),
    },
    alias: 'getKeyStageSubjectLessons-getKeyStageSubjectLessons',
    description:
      'This endpoint returns an array of available published lessons for a given subject and key stage, grouped by unit.',
  },
  {
    method: 'get',
    path: '/key-stages/{keyStage}/subject/{subject}/questions',
    requestFormat: 'json',
    parameters: [
      {
        name: 'keyStage',
        type: 'Path',
        schema: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        description:
          "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      },
      {
        name: 'subject',
        type: 'Path',
        schema: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here",
            examples: ['art'],
          }),
        description:
          "Subject slug to search by, e.g. 'science' - note that casing is important here",
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z
          .number()
          .optional()
          .meta({ examples: [50] }),
        description:
          'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z
          .number()
          .max(100)
          .optional()
          .meta({ examples: [10] }),
        description: 'Limit the number of lessons, e.g. return a maximum of 100 lessons',
      },
    ],
    response: QuestionsForKeyStageAndSubjectResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: QuestionsForKeyStageAndSubjectResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        keyStage: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
          examples: ['ks1'],
        }),
        subject: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here",
            examples: ['art'],
          }),
      }),
      queryParams: z.object({
        offset: z
          .number()
          .optional()
          .meta({ examples: [50] }),
        limit: z
          .number()
          .max(100)
          .optional()
          .meta({ examples: [10] }),
      }),
    },
    alias: 'getQuestions-getQuestionsForKeyStageAndSubject',
    description:
      'This endpoint returns quiz questions and answers for each lesson within a requested subject and key stage.',
  },
  {
    method: 'get',
    path: '/key-stages/{keyStage}/subject/{subject}/units',
    requestFormat: 'json',
    parameters: [
      {
        name: 'keyStage',
        type: 'Path',
        schema: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description: "Key stage slug to filter by, e.g. 'ks2'",
          examples: ['ks1'],
        }),
        description: "Key stage slug to filter by, e.g. 'ks2'",
      },
      {
        name: 'subject',
        type: 'Path',
        schema: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
            examples: ['art'],
          }),
        description:
          "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
      },
    ],
    response: AllKeyStageAndSubjectUnitsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: AllKeyStageAndSubjectUnitsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        keyStage: z.enum(['ks1', 'ks2', 'ks3', 'ks4']).meta({
          description: "Key stage slug to filter by, e.g. 'ks2'",
          examples: ['ks1'],
        }),
        subject: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .meta({
            description:
              "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
            examples: ['art'],
          }),
      }),
    },
    alias: 'getAllKeyStageAndSubjectUnits-getAllKeyStageAndSubjectUnits',
    description:
      'This endpoint returns an array of units containing available published lessons for a given key stage and subject, grouped by year. Units without published lessons will not be returned by this endpoint.',
  },
  {
    method: 'get',
    path: '/lessons/{lesson}/assets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'lesson',
        type: 'Path',
        schema: z.string().meta({
          description: 'The lesson slug identifier',
          examples: ['child-workers-in-the-victorian-era'],
        }),
        description: 'The lesson slug identifier',
      },
      {
        name: 'type',
        type: 'Query',
        schema: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({ examples: ['slideDeck'] }),
        description:
          'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
      },
    ],
    response: LessonAssetsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: LessonAssetsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        lesson: z.string().meta({
          description: 'The lesson slug identifier',
          examples: ['child-workers-in-the-victorian-era'],
        }),
      }),
      queryParams: z.object({
        type: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({ examples: ['slideDeck'] }),
      }),
    },
    alias: 'getAssets-getLessonAssets',
    description:
      'This endpoint returns the types of available assets for a given lesson, and the download endpoints for each. \n        This endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.\n          ',
  },
  {
    method: 'get',
    path: '/lessons/{lesson}/assets/{type}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'lesson',
        type: 'Path',
        schema: z.string().meta({
          description: 'The lesson slug',
          examples: ['child-workers-in-the-victorian-era'],
        }),
        description: 'The lesson slug',
      },
      {
        name: 'type',
        type: 'Path',
        schema: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .meta({ examples: ['slideDeck'] }),
        description:
          'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
      },
    ],
    response: LessonAssetResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: LessonAssetResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        lesson: z.string().meta({
          description: 'The lesson slug',
          examples: ['child-workers-in-the-victorian-era'],
        }),
        type: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .meta({ examples: ['slideDeck'] }),
      }),
    },
    alias: 'getAssets-getLessonAsset',
    description:
      'This endpoint will stream the downloadable asset for the given lesson and type. \nThere is no response returned for this endpoint as it returns a content attachment.',
  },
  {
    method: 'get',
    path: '/lessons/{lesson}/quiz',
    requestFormat: 'json',
    parameters: [
      {
        name: 'lesson',
        type: 'Path',
        schema: z.string().meta({
          description: 'The lesson slug identifier',
          examples: ['imagining-you-are-the-characters-the-three-billy-goats-gruff'],
        }),
        description: 'The lesson slug identifier',
      },
    ],
    response: QuestionForLessonsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: QuestionForLessonsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        lesson: z.string().meta({
          description: 'The lesson slug identifier',
          examples: ['imagining-you-are-the-characters-the-three-billy-goats-gruff'],
        }),
      }),
    },
    alias: 'getQuestions-getQuestionsForLessons',
    description:
      'The endpoint returns the quiz questions and answers for a given lesson. The answers data indicates which answers are correct, and which are distractors.',
  },
  {
    method: 'get',
    path: '/lessons/{lesson}/summary',
    requestFormat: 'json',
    parameters: [
      {
        name: 'lesson',
        type: 'Path',
        schema: z.string().meta({
          description: 'The slug of the lesson',
          examples: ['joining-using-and'],
        }),
        description: 'The slug of the lesson',
      },
    ],
    response: LessonSummaryResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: LessonSummaryResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        lesson: z.string().meta({
          description: 'The slug of the lesson',
          examples: ['joining-using-and'],
        }),
      }),
    },
    alias: 'getLessons-getLesson',
    description: 'This endpoint returns a summary for a given lesson',
  },
  {
    method: 'get',
    path: '/lessons/{lesson}/transcript',
    requestFormat: 'json',
    parameters: [
      {
        name: 'lesson',
        type: 'Path',
        schema: z.string().meta({
          description: 'The slug of the lesson',
          examples: ['checking-understanding-of-basic-transformations'],
        }),
        description: 'The slug of the lesson',
      },
    ],
    response: TranscriptResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: TranscriptResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        lesson: z.string().meta({
          description: 'The slug of the lesson',
          examples: ['checking-understanding-of-basic-transformations'],
        }),
      }),
    },
    alias: 'getLessonTranscript-getLessonTranscript',
    description:
      'This endpoint returns the video transcript and video captions file for a given lesson.',
  },
  {
    method: 'get',
    path: '/rate-limit',
    requestFormat: 'json',
    parameters: [],
    response: RateLimitResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: RateLimitResponseSchema,
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'getRateLimit-getRateLimit',
    description:
      'Check your current rate limit status (note that your rate limit is also included in the headers of every response).\n\nThis specific endpoint does not cost any requests.',
  },
  {
    method: 'get',
    path: '/search/lessons',
    requestFormat: 'json',
    parameters: [
      {
        name: 'q',
        type: 'Query',
        schema: z.string().meta({
          description: 'Search query text snippet',
          examples: ['gothic'],
        }),
        description: 'Search query text snippet',
      },
      {
        name: 'keyStage',
        type: 'Query',
        schema: z
          .enum(['ks1', 'ks2', 'ks3', 'ks4'])
          .optional()
          .meta({
            description:
              "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
            examples: ['ks2'],
          }),
      },
      {
        name: 'subject',
        type: 'Query',
        schema: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .optional()
          .meta({
            description:
              "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
            examples: ['english'],
          }),
      },
      {
        name: 'unit',
        type: 'Query',
        schema: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['Gothic poetry'],
          }),
      },
    ],
    response: LessonSearchResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: LessonSearchResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      queryParams: z.object({
        q: z.string().meta({
          description: 'Search query text snippet',
          examples: ['gothic'],
        }),
        keyStage: z
          .enum(['ks1', 'ks2', 'ks3', 'ks4'])
          .optional()
          .meta({
            description:
              "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
            examples: ['ks2'],
          }),
        subject: z
          .enum([
            'art',
            'citizenship',
            'computing',
            'cooking-nutrition',
            'design-technology',
            'english',
            'french',
            'geography',
            'german',
            'history',
            'maths',
            'music',
            'physical-education',
            'religious-education',
            'rshe-pshe',
            'science',
            'spanish',
          ])
          .optional()
          .meta({
            description:
              "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
            examples: ['english'],
          }),
        unit: z
          .string()
          .optional()
          .meta({
            description: 'Optional unit slug to additionally filter by',
            examples: ['Gothic poetry'],
          }),
      }),
    },
    alias: 'getLessons-searchByTextSimilarity',
    description:
      'Search for a term and find the 20 most similar lessons with titles that contain similar text.',
  },
  {
    method: 'get',
    path: '/search/transcripts',
    requestFormat: 'json',
    parameters: [
      {
        name: 'q',
        type: 'Query',
        schema: z.string().meta({
          description: 'A snippet of text to search for in the lesson video transcripts',
          examples: ['Who were the romans?'],
        }),
        description: 'A snippet of text to search for in the lesson video transcripts',
      },
    ],
    response: SearchTranscriptResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SearchTranscriptResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      queryParams: z.object({
        q: z.string().meta({
          description: 'A snippet of text to search for in the lesson video transcripts',
          examples: ['Who were the romans?'],
        }),
      }),
    },
    alias: 'searchTranscripts-searchTranscripts',
    description:
      'Search for a term and find the 5 most similar lessons whose video transcripts contain similar text.',
  },
  {
    method: 'get',
    path: '/sequences/{sequence}/assets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'sequence',
        type: 'Path',
        schema: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
        description:
          'The sequence slug identifier, including the key stage 4 option where relevant.',
      },
      {
        name: 'year',
        type: 'Query',
        schema: z
          .number()
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: [3],
          }),
      },
      {
        name: 'type',
        type: 'Query',
        schema: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({
            description:
              'Optional asset type specifier\n\nAvailable values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers',
            examples: ['slideDeck'],
          }),
        description:
          'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
      },
    ],
    response: SequenceAssetsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SequenceAssetsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        sequence: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
      }),
      queryParams: z.object({
        year: z
          .number()
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: [3],
          }),
        type: z
          .enum([
            'slideDeck',
            'exitQuiz',
            'exitQuizAnswers',
            'starterQuiz',
            'starterQuizAnswers',
            'supplementaryResource',
            'video',
            'worksheet',
            'worksheetAnswers',
          ])
          .optional()
          .meta({
            description:
              'Optional asset type specifier\n\nAvailable values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers',
            examples: ['slideDeck'],
          }),
      }),
    },
    alias: 'getAssets-getSequenceAssets',
    description:
      'This endpoint returns all assets for a given sequence, and the download endpoints for each. The assets are grouped by lesson.\nThis endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.',
  },
  {
    method: 'get',
    path: '/sequences/{sequence}/questions',
    requestFormat: 'json',
    parameters: [
      {
        name: 'sequence',
        type: 'Path',
        schema: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
        description:
          'The sequence slug identifier, including the key stage 4 option where relevant.',
      },
      {
        name: 'year',
        type: 'Query',
        schema: z
          .number()
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: [3],
          }),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z
          .number()
          .optional()
          .meta({ examples: [50] }),
        description:
          'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z
          .number()
          .max(100)
          .optional()
          .meta({ examples: [10] }),
        description: 'Limit the number of lessons, e.g. return a maximum of 100 lessons',
      },
    ],
    response: QuestionsForSequenceResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: QuestionsForSequenceResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        sequence: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
      }),
      queryParams: z.object({
        year: z
          .number()
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: [3],
          }),
        offset: z
          .number()
          .optional()
          .meta({ examples: [50] }),
        limit: z
          .number()
          .max(100)
          .optional()
          .meta({ examples: [10] }),
      }),
    },
    alias: 'getQuestions-getQuestionsForSequence',
    description:
      'This endpoint returns all quiz questions for a given sequence. The assets are separated into starter quiz and entry quiz arrays, grouped by lesson.',
  },
  {
    method: 'get',
    path: '/sequences/{sequence}/units',
    requestFormat: 'json',
    parameters: [
      {
        name: 'sequence',
        type: 'Path',
        schema: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
        description:
          'The sequence slug identifier, including the key stage 4 option where relevant.',
      },
      {
        name: 'year',
        type: 'Query',
        schema: z
          .enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'all-years'])
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: ['1'],
          }),
      },
    ],
    response: SequenceUnitsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SequenceUnitsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        sequence: z.string().meta({
          description:
            'The sequence slug identifier, including the key stage 4 option where relevant.',
          examples: ['english-primary'],
        }),
      }),
      queryParams: z.object({
        year: z
          .enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'all-years'])
          .optional()
          .meta({
            description:
              'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
            examples: ['1'],
          }),
      }),
    },
    alias: 'getSequences-getSequenceUnits',
    description:
      'This endpoint returns high-level information for all of the units in a sequence. Units are returned in the intended sequence order and are grouped by year.',
  },
  {
    method: 'get',
    path: '/subjects',
    requestFormat: 'json',
    parameters: [],
    response: AllSubjectsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: AllSubjectsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'getSubjects-getAllSubjects',
    description:
      'This endpoint returns an array of all available subjects and their associated sequences, key stages and years.',
  },
  {
    method: 'get',
    path: '/subjects/{subject}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'subject',
        type: 'Path',
        schema: z.string().meta({
          description: 'The slug identifier for the subject',
          examples: ['art'],
        }),
        description: 'The slug identifier for the subject',
      },
    ],
    response: SubjectResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SubjectResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        subject: z.string().meta({
          description: 'The slug identifier for the subject',
          examples: ['art'],
        }),
      }),
    },
    alias: 'getSubjects-getSubject',
    description:
      'This endpoint returns the sequences, key stages and years that are currently available for a given subject.',
  },
  {
    method: 'get',
    path: '/subjects/{subject}/key-stages',
    requestFormat: 'json',
    parameters: [
      {
        name: 'subject',
        type: 'Path',
        schema: z.string().meta({
          description: 'The subject slug identifier',
          examples: ['art'],
        }),
        description: 'The subject slug identifier',
      },
    ],
    response: SubjectKeyStagesResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SubjectKeyStagesResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        subject: z.string().meta({
          description: 'The subject slug identifier',
          examples: ['art'],
        }),
      }),
    },
    alias: 'getSubjects-getSubjectKeyStages',
    description:
      'This endpoint returns a list of key stages that are currently available for a given subject.',
  },
  {
    method: 'get',
    path: '/subjects/{subject}/sequences',
    requestFormat: 'json',
    parameters: [
      {
        name: 'subject',
        type: 'Path',
        schema: z.string().meta({
          description: 'The slug identifier for the subject',
          examples: ['art'],
        }),
        description: 'The slug identifier for the subject',
      },
    ],
    response: SubjectSequenceResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SubjectSequenceResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        subject: z.string().meta({
          description: 'The slug identifier for the subject',
          examples: ['art'],
        }),
      }),
    },
    alias: 'getSubjects-getSubjectSequence',
    description:
      'This endpoint returns an array of sequence objects that are currently available for a given subject. For secondary sequences, this includes information about key stage 4 variance such as exam board sequences and non-GCSE ‘core’ unit sequences.',
  },
  {
    method: 'get',
    path: '/subjects/{subject}/years',
    requestFormat: 'json',
    parameters: [
      {
        name: 'subject',
        type: 'Path',
        schema: z.string().meta({
          description: 'Subject slug to filter by',
          examples: ['cooking-nutrition'],
        }),
        description: 'Subject slug to filter by',
      },
    ],
    response: SubjectYearsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: SubjectYearsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        subject: z.string().meta({
          description: 'Subject slug to filter by',
          examples: ['cooking-nutrition'],
        }),
      }),
    },
    alias: 'getSubjects-getSubjectYears',
    description:
      'This endpoint returns an array of years that are currently available for a given subject.',
  },
  {
    method: 'get',
    path: '/threads',
    requestFormat: 'json',
    parameters: [],
    response: AllThreadsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: AllThreadsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {},
    alias: 'getThreads-getAllThreads',
    description:
      'This endpoint returns an array of all threads, across all subjects. Threads signpost groups of units that link to one another, building a common body of knowledge over time. They are an important component of how Oak’s curricula are sequenced.',
  },
  {
    method: 'get',
    path: '/threads/{threadSlug}/units',
    requestFormat: 'json',
    parameters: [
      {
        name: 'threadSlug',
        type: 'Path',
        schema: z.string().meta({ examples: ['number-multiplication-and-division'] }),
      },
    ],
    response: ThreadUnitsResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: ThreadUnitsResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        threadSlug: z.string().meta({ examples: ['number-multiplication-and-division'] }),
      }),
    },
    alias: 'getThreads-getThreadUnits',
    description: 'This endpoint returns all of the units that belong to a given thread.',
  },
  {
    method: 'get',
    path: '/units/{unit}/summary',
    requestFormat: 'json',
    parameters: [
      {
        name: 'unit',
        type: 'Path',
        schema: z.string().meta({
          description: 'The unit slug',
          examples: ['simple-compound-and-adverbial-complex-sentences'],
        }),
        description: 'The unit slug',
      },
    ],
    response: UnitSummaryResponseSchema,
    errors: [],
    responses: {
      200: {
        schema: UnitSummaryResponseSchema,
        description: 'Successful response',
      },
    },
    request: {
      pathParams: z.object({
        unit: z.string().meta({
          description: 'The unit slug',
          examples: ['simple-compound-and-adverbial-complex-sentences'],
        }),
      }),
    },
    alias: 'getUnits-getUnit',
    description:
      'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: 'get_sequences_get_sequence_units',
      title: 'Units within a sequence',
      description:
        'This endpoint returns high-level information for all of the units in a sequence. Units are returned in the intended sequence order and are grouped by year.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              sequence: {
                type: 'string',
                description:
                  'The sequence slug identifier, including the key stage 4 option where relevant.',
                example: 'english-primary',
              },
            },
            required: ['sequence'],
          },
          query: {
            type: 'object',
            properties: {
              year: {
                type: 'string',
                description:
                  'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
                example: '1',
                enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'all-years'],
              },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                year: 1,
                units: [
                  {
                    unitTitle: 'Speaking and Listening',
                    unitOrder: 1,
                    unitSlug: 'speaking-and-listening',
                    categories: [{ categoryTitle: 'Reading, writing & oracy' }],
                    threads: [
                      {
                        threadTitle: 'Developing spoken language',
                        threadSlug: 'developing-spoken-language',
                        order: 8,
                      },
                    ],
                  },
                ],
              },
            ],
            items: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    year: {
                      description: 'The year group',
                      anyOf: [{ type: 'number' }, { type: 'string', enum: ['all-years'] }],
                    },
                    title: {
                      type: 'string',
                      description: 'An optional alternative title for the year sequence',
                    },
                    units: {
                      type: 'array',
                      description: 'A list of units that make up a full sequence, grouped by year.',
                      items: {
                        anyOf: [
                          {
                            type: 'object',
                            properties: {
                              unitTitle: {
                                type: 'string',
                                description: 'The title of the unit',
                              },
                              unitOrder: {
                                type: 'number',
                                description: 'The position of the unit within the sequence.',
                              },
                              unitOptions: {
                                type: 'array',
                                description: 'The unique slug identifier for the unit',
                                items: {
                                  type: 'object',
                                  properties: {
                                    unitTitle: { type: 'string' },
                                    unitSlug: { type: 'string' },
                                  },
                                  required: ['unitTitle', 'unitSlug'],
                                },
                              },
                              categories: {
                                type: 'array',
                                description:
                                  'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                items: {
                                  type: 'object',
                                  properties: {
                                    categoryTitle: {
                                      type: 'string',
                                      description: 'The title of the category',
                                    },
                                    categorySlug: {
                                      type: 'string',
                                      description: 'The unique identifier for the category',
                                    },
                                  },
                                  required: ['categoryTitle'],
                                },
                              },
                              threads: {
                                type: 'array',
                                description:
                                  'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                items: {
                                  type: 'object',
                                  properties: {
                                    threadTitle: {
                                      type: 'string',
                                      description: 'The title of the category',
                                    },
                                    threadSlug: {
                                      type: 'string',
                                      description: 'The unique identifier for the thread',
                                    },
                                    order: {
                                      type: 'number',
                                      description: 'Deprecated',
                                    },
                                  },
                                  required: ['threadTitle', 'threadSlug', 'order'],
                                },
                              },
                            },
                            required: ['unitTitle', 'unitOrder', 'unitOptions'],
                          },
                          {
                            type: 'object',
                            properties: {
                              unitTitle: { type: 'string' },
                              unitOrder: { type: 'number' },
                              unitSlug: {
                                type: 'string',
                                description: 'The unique slug identifier for the unit',
                              },
                              categories: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    categoryTitle: {
                                      type: 'string',
                                      description: 'The title of the category',
                                    },
                                    categorySlug: {
                                      type: 'string',
                                      description: 'The unique identifier for the category',
                                    },
                                  },
                                  required: ['categoryTitle'],
                                },
                              },
                              threads: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    threadTitle: {
                                      type: 'string',
                                      description: 'The title of the category',
                                    },
                                    threadSlug: {
                                      type: 'string',
                                      description: 'The unique identifier for the thread',
                                    },
                                    order: {
                                      type: 'number',
                                      description: 'Deprecated',
                                    },
                                  },
                                  required: ['threadTitle', 'threadSlug', 'order'],
                                },
                              },
                            },
                            required: ['unitTitle', 'unitOrder', 'unitSlug'],
                          },
                        ],
                      },
                    },
                  },
                  required: ['year', 'units'],
                },
                {
                  type: 'object',
                  properties: {
                    year: { type: 'number' },
                    title: { type: 'string' },
                    examSubjects: {
                      type: 'array',
                      description:
                        "Only used in secondary science. Contains a full year's unit sequences based on which subject is being studied at KS4.",
                      items: {
                        anyOf: [
                          {
                            type: 'object',
                            properties: {
                              examSubjectTitle: { type: 'string' },
                              examSubjectSlug: { type: 'string' },
                              tiers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    tierTitle: {
                                      type: 'string',
                                      description: 'The title of the tier',
                                    },
                                    tierSlug: {
                                      type: 'string',
                                      description: 'The tier identifier',
                                    },
                                    units: {
                                      type: 'array',
                                      items: {
                                        anyOf: [
                                          {
                                            type: 'object',
                                            properties: {
                                              unitTitle: {
                                                type: 'string',
                                                description: 'The title of the unit',
                                              },
                                              unitOrder: {
                                                type: 'number',
                                                description:
                                                  'The position of the unit within the sequence.',
                                              },
                                              unitOptions: {
                                                type: 'array',
                                                description:
                                                  'The unique slug identifier for the unit',
                                                items: {
                                                  type: 'object',
                                                  properties: {
                                                    unitTitle: {
                                                      type: 'string',
                                                    },
                                                    unitSlug: {
                                                      type: 'string',
                                                    },
                                                  },
                                                  required: ['unitTitle', 'unitSlug'],
                                                },
                                              },
                                              categories: {
                                                type: 'array',
                                                description:
                                                  'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                                items: {
                                                  type: 'object',
                                                  properties: {
                                                    categoryTitle: {
                                                      type: 'string',
                                                      description: 'The title of the category',
                                                    },
                                                    categorySlug: {
                                                      type: 'string',
                                                      description:
                                                        'The unique identifier for the category',
                                                    },
                                                  },
                                                  required: ['categoryTitle'],
                                                },
                                              },
                                              threads: {
                                                type: 'array',
                                                description:
                                                  'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                                items: {
                                                  type: 'object',
                                                  properties: {
                                                    threadTitle: {
                                                      type: 'string',
                                                      description: 'The title of the category',
                                                    },
                                                    threadSlug: {
                                                      type: 'string',
                                                      description:
                                                        'The unique identifier for the thread',
                                                    },
                                                    order: {
                                                      type: 'number',
                                                      description: 'Deprecated',
                                                    },
                                                  },
                                                  required: ['threadTitle', 'threadSlug', 'order'],
                                                },
                                              },
                                            },
                                            required: ['unitTitle', 'unitOrder', 'unitOptions'],
                                          },
                                          {
                                            type: 'object',
                                            properties: {
                                              unitTitle: { type: 'string' },
                                              unitOrder: { type: 'number' },
                                              unitSlug: {
                                                type: 'string',
                                                description:
                                                  'The unique slug identifier for the unit',
                                              },
                                              categories: {
                                                type: 'array',
                                                items: {
                                                  type: 'object',
                                                  properties: {
                                                    categoryTitle: {
                                                      type: 'string',
                                                      description: 'The title of the category',
                                                    },
                                                    categorySlug: {
                                                      type: 'string',
                                                      description:
                                                        'The unique identifier for the category',
                                                    },
                                                  },
                                                  required: ['categoryTitle'],
                                                },
                                              },
                                              threads: {
                                                type: 'array',
                                                items: {
                                                  type: 'object',
                                                  properties: {
                                                    threadTitle: {
                                                      type: 'string',
                                                      description: 'The title of the category',
                                                    },
                                                    threadSlug: {
                                                      type: 'string',
                                                      description:
                                                        'The unique identifier for the thread',
                                                    },
                                                    order: {
                                                      type: 'number',
                                                      description: 'Deprecated',
                                                    },
                                                  },
                                                  required: ['threadTitle', 'threadSlug', 'order'],
                                                },
                                              },
                                            },
                                            required: ['unitTitle', 'unitOrder', 'unitSlug'],
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  required: ['tierTitle', 'tierSlug', 'units'],
                                },
                              },
                            },
                            required: ['examSubjectTitle', 'tiers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              examSubjectTitle: { type: 'string' },
                              examSubjectSlug: { type: 'string' },
                              units: {
                                type: 'array',
                                items: {
                                  anyOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        unitTitle: {
                                          type: 'string',
                                          description: 'The title of the unit',
                                        },
                                        unitOrder: {
                                          type: 'number',
                                          description:
                                            'The position of the unit within the sequence.',
                                        },
                                        unitOptions: {
                                          type: 'array',
                                          description: 'The unique slug identifier for the unit',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              unitTitle: { type: 'string' },
                                              unitSlug: { type: 'string' },
                                            },
                                            required: ['unitTitle', 'unitSlug'],
                                          },
                                        },
                                        categories: {
                                          type: 'array',
                                          description:
                                            'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              categoryTitle: {
                                                type: 'string',
                                                description: 'The title of the category',
                                              },
                                              categorySlug: {
                                                type: 'string',
                                                description:
                                                  'The unique identifier for the category',
                                              },
                                            },
                                            required: ['categoryTitle'],
                                          },
                                        },
                                        threads: {
                                          type: 'array',
                                          description:
                                            'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              threadTitle: {
                                                type: 'string',
                                                description: 'The title of the category',
                                              },
                                              threadSlug: {
                                                type: 'string',
                                                description: 'The unique identifier for the thread',
                                              },
                                              order: {
                                                type: 'number',
                                                description: 'Deprecated',
                                              },
                                            },
                                            required: ['threadTitle', 'threadSlug', 'order'],
                                          },
                                        },
                                      },
                                      required: ['unitTitle', 'unitOrder', 'unitOptions'],
                                    },
                                    {
                                      type: 'object',
                                      properties: {
                                        unitTitle: { type: 'string' },
                                        unitOrder: { type: 'number' },
                                        unitSlug: {
                                          type: 'string',
                                          description: 'The unique slug identifier for the unit',
                                        },
                                        categories: {
                                          type: 'array',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              categoryTitle: {
                                                type: 'string',
                                                description: 'The title of the category',
                                              },
                                              categorySlug: {
                                                type: 'string',
                                                description:
                                                  'The unique identifier for the category',
                                              },
                                            },
                                            required: ['categoryTitle'],
                                          },
                                        },
                                        threads: {
                                          type: 'array',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              threadTitle: {
                                                type: 'string',
                                                description: 'The title of the category',
                                              },
                                              threadSlug: {
                                                type: 'string',
                                                description: 'The unique identifier for the thread',
                                              },
                                              order: {
                                                type: 'number',
                                                description: 'Deprecated',
                                              },
                                            },
                                            required: ['threadTitle', 'threadSlug', 'order'],
                                          },
                                        },
                                      },
                                      required: ['unitTitle', 'unitOrder', 'unitSlug'],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['examSubjectTitle', 'units'],
                          },
                        ],
                      },
                    },
                  },
                  required: ['year', 'examSubjects'],
                },
                {
                  type: 'object',
                  properties: {
                    year: { type: 'number' },
                    title: { type: 'string' },
                    tiers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          tierTitle: {
                            type: 'string',
                            description: 'The title of the tier',
                          },
                          tierSlug: {
                            type: 'string',
                            description: 'The tier identifier',
                          },
                          units: {
                            type: 'array',
                            items: {
                              anyOf: [
                                {
                                  type: 'object',
                                  properties: {
                                    unitTitle: {
                                      type: 'string',
                                      description: 'The title of the unit',
                                    },
                                    unitOrder: {
                                      type: 'number',
                                      description: 'The position of the unit within the sequence.',
                                    },
                                    unitOptions: {
                                      type: 'array',
                                      description: 'The unique slug identifier for the unit',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          unitTitle: { type: 'string' },
                                          unitSlug: { type: 'string' },
                                        },
                                        required: ['unitTitle', 'unitSlug'],
                                      },
                                    },
                                    categories: {
                                      type: 'array',
                                      description:
                                        'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          categoryTitle: {
                                            type: 'string',
                                            description: 'The title of the category',
                                          },
                                          categorySlug: {
                                            type: 'string',
                                            description: 'The unique identifier for the category',
                                          },
                                        },
                                        required: ['categoryTitle'],
                                      },
                                    },
                                    threads: {
                                      type: 'array',
                                      description:
                                        'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          threadTitle: {
                                            type: 'string',
                                            description: 'The title of the category',
                                          },
                                          threadSlug: {
                                            type: 'string',
                                            description: 'The unique identifier for the thread',
                                          },
                                          order: {
                                            type: 'number',
                                            description: 'Deprecated',
                                          },
                                        },
                                        required: ['threadTitle', 'threadSlug', 'order'],
                                      },
                                    },
                                  },
                                  required: ['unitTitle', 'unitOrder', 'unitOptions'],
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    unitTitle: { type: 'string' },
                                    unitOrder: { type: 'number' },
                                    unitSlug: {
                                      type: 'string',
                                      description: 'The unique slug identifier for the unit',
                                    },
                                    categories: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          categoryTitle: {
                                            type: 'string',
                                            description: 'The title of the category',
                                          },
                                          categorySlug: {
                                            type: 'string',
                                            description: 'The unique identifier for the category',
                                          },
                                        },
                                        required: ['categoryTitle'],
                                      },
                                    },
                                    threads: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          threadTitle: {
                                            type: 'string',
                                            description: 'The title of the category',
                                          },
                                          threadSlug: {
                                            type: 'string',
                                            description: 'The unique identifier for the thread',
                                          },
                                          order: {
                                            type: 'number',
                                            description: 'Deprecated',
                                          },
                                        },
                                        required: ['threadTitle', 'threadSlug', 'order'],
                                      },
                                    },
                                  },
                                  required: ['unitTitle', 'unitOrder', 'unitSlug'],
                                },
                              ],
                            },
                          },
                        },
                        required: ['tierTitle', 'tierSlug', 'units'],
                      },
                    },
                  },
                  required: ['year', 'tiers'],
                },
              ],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/sequences/{sequence}/units',
      originalPath: '/sequences/{sequence}/units',
      operationId: 'getSequences-getSequenceUnits',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_lesson_transcript_get_lesson_transcript',
      title: 'Lesson transcript',
      description:
        'This endpoint returns the video transcript and video captions file for a given lesson.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              lesson: {
                type: 'string',
                description: 'The slug of the lesson',
                example: 'checking-understanding-of-basic-transformations',
              },
            },
            required: ['lesson'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          transcript: {
            type: 'string',
            description: 'The transcript for the lesson video',
          },
          vtt: {
            type: 'string',
            description:
              'The contents of the .vtt file for the lesson video, which maps captions to video timestamps.',
          },
        },
        required: ['transcript', 'vtt'],
        example: {
          transcript:
            "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
          vtt: "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/lessons/{lesson}/transcript',
      originalPath: '/lessons/{lesson}/transcript',
      operationId: 'getLessonTranscript-getLessonTranscript',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'search_transcripts_search_transcripts',
      title: 'Lesson search using lesson video transcripts',
      description:
        'Search for a term and find the 5 most similar lessons whose video transcripts contain similar text.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'object',
            properties: {
              q: {
                type: 'string',
                description: 'A snippet of text to search for in the lesson video transcripts',
                example: 'Who were the romans?',
              },
            },
            required: ['q'],
          },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonTitle: 'The Roman invasion of Britain ',
                lessonSlug: 'the-roman-invasion-of-britain',
                transcriptSnippet: 'The Romans were ready,',
              },
              {
                lessonTitle: 'The changes to life brought about by Roman settlement',
                lessonSlug: 'the-changes-to-life-brought-about-by-roman-settlement',
                transcriptSnippet: 'when the Romans came.',
              },
              {
                lessonTitle: "Boudica's rebellion against Roman rule",
                lessonSlug: 'boudicas-rebellion-against-roman-rule',
                transcriptSnippet: 'kings who resisted the Romans were,',
              },
              {
                lessonTitle: 'How far religion changed under Roman rule',
                lessonSlug: 'how-far-religion-changed-under-roman-rule',
                transcriptSnippet: 'for the Romans.',
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonTitle: {
                  type: 'string',
                  description: 'The lesson title',
                  example: 'The Roman invasion of Britain ',
                },
                lessonSlug: {
                  type: 'string',
                  description: 'The lesson slug identifier',
                  example: 'the-roman-invasion-of-britain',
                },
                transcriptSnippet: {
                  type: 'string',
                  description: 'The snippet of the transcript that matched the search term',
                  example: 'The Romans were ready,',
                },
              },
              required: ['lessonTitle', 'lessonSlug'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/search/transcripts',
      originalPath: '/search/transcripts',
      operationId: 'searchTranscripts-searchTranscripts',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_assets_get_sequence_assets',
      title: 'Assets within a sequence',
      description:
        'This endpoint returns all assets for a given sequence, and the download endpoints for each. The assets are grouped by lesson.\nThis endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              sequence: {
                type: 'string',
                description:
                  'The sequence slug identifier, including the key stage 4 option where relevant.',
                example: 'english-primary',
              },
            },
            required: ['sequence'],
          },
          query: {
            type: 'object',
            properties: {
              year: {
                type: 'number',
                description:
                  'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
                example: 3,
              },
              type: {
                type: 'string',
                description:
                  'Optional asset type specifier\n\nAvailable values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers',
                example: 'slideDeck',
                enum: [
                  'slideDeck',
                  'exitQuiz',
                  'exitQuizAnswers',
                  'starterQuiz',
                  'starterQuizAnswers',
                  'supplementaryResource',
                  'video',
                  'worksheet',
                  'worksheetAnswers',
                ],
              },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonSlug: 'using-numerals',
                lessonTitle: 'Using numerals',
                assets: [
                  {
                    label: 'Worksheet',
                    type: 'worksheet',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
                  },
                  {
                    label: 'Worksheet Answers',
                    type: 'worksheetAnswers',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
                  },
                  {
                    label: 'Video',
                    type: 'video',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The unique slug identifier for the lesson',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The title for the lesson',
                },
                attribution: {
                  type: 'array',
                  description:
                    "Licence information for any third-party content contained in the lessons' downloadable resources",
                  items: { type: 'string' },
                },
                assets: {
                  type: 'array',
                  description: 'List of assets',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        example: 'slideDeck',
                        enum: [
                          'slideDeck',
                          'exitQuiz',
                          'exitQuizAnswers',
                          'starterQuiz',
                          'starterQuizAnswers',
                          'supplementaryResource',
                          'video',
                          'worksheet',
                          'worksheetAnswers',
                        ],
                      },
                      label: {
                        type: 'string',
                        description: 'The label for the asset',
                      },
                      url: {
                        type: 'string',
                        description: 'The download endpoint for the asset.',
                      },
                    },
                    required: ['type', 'label', 'url'],
                  },
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'assets'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/sequences/{sequence}/assets',
      originalPath: '/sequences/{sequence}/assets',
      operationId: 'getAssets-getSequenceAssets',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_assets_get_subject_assets',
      title: 'Assets',
      description:
        'This endpoint returns signed download URLs and types for available assets for a given key stage and subject, grouped by lesson. You can also optionally filter by type and unit.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              keyStage: {
                type: 'string',
                description:
                  "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
                example: 'ks1',
                enum: ['ks1', 'ks2', 'ks3', 'ks4'],
              },
              subject: {
                type: 'string',
                description:
                  "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
                example: 'english',
                enum: [
                  'art',
                  'citizenship',
                  'computing',
                  'cooking-nutrition',
                  'design-technology',
                  'english',
                  'french',
                  'geography',
                  'german',
                  'history',
                  'maths',
                  'music',
                  'physical-education',
                  'religious-education',
                  'rshe-pshe',
                  'science',
                  'spanish',
                ],
              },
            },
            required: ['keyStage', 'subject'],
          },
          query: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: 'slideDeck',
                enum: [
                  'slideDeck',
                  'exitQuiz',
                  'exitQuizAnswers',
                  'starterQuiz',
                  'starterQuizAnswers',
                  'supplementaryResource',
                  'video',
                  'worksheet',
                  'worksheetAnswers',
                ],
              },
              unit: {
                type: 'string',
                description: 'Optional unit slug to additionally filter by',
                example: 'word-class',
              },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonSlug: 'using-numerals',
                lessonTitle: 'Using numerals',
                assets: [
                  {
                    label: 'Worksheet',
                    type: 'worksheet',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
                  },
                  {
                    label: 'Worksheet Answers',
                    type: 'worksheetAnswers',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
                  },
                  {
                    label: 'Video',
                    type: 'video',
                    url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The unique slug identifier for the lesson',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The title for the lesson',
                },
                attribution: {
                  type: 'array',
                  description:
                    "Licence information for any third-party content contained in the lessons' downloadable resources",
                  items: { type: 'string' },
                },
                assets: {
                  type: 'array',
                  description: 'List of assets',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        example: 'slideDeck',
                        enum: [
                          'slideDeck',
                          'exitQuiz',
                          'exitQuizAnswers',
                          'starterQuiz',
                          'starterQuizAnswers',
                          'supplementaryResource',
                          'video',
                          'worksheet',
                          'worksheetAnswers',
                        ],
                      },
                      label: {
                        type: 'string',
                        description: 'The label for the asset',
                      },
                      url: {
                        type: 'string',
                        description: 'The download endpoint for the asset.',
                      },
                    },
                    required: ['type', 'label', 'url'],
                  },
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'assets'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/key-stages/{keyStage}/subject/{subject}/assets',
      originalPath: '/key-stages/{keyStage}/subject/{subject}/assets',
      operationId: 'getAssets-getSubjectAssets',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_assets_get_lesson_assets',
      title: 'Downloadable lesson assets',
      description:
        'This endpoint returns the types of available assets for a given lesson, and the download endpoints for each. \n        This endpoint contains licence information for any third-party content contained in the lesson’s downloadable resources. Third-party content is exempt from the open-government license, and users will need to consider whether their use is covered by the stated licence, or if they need to procure their own agreement.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              lesson: {
                type: 'string',
                description: 'The lesson slug identifier',
                example: 'child-workers-in-the-victorian-era',
              },
            },
            required: ['lesson'],
          },
          query: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: 'slideDeck',
                enum: [
                  'slideDeck',
                  'exitQuiz',
                  'exitQuizAnswers',
                  'starterQuiz',
                  'starterQuizAnswers',
                  'supplementaryResource',
                  'video',
                  'worksheet',
                  'worksheetAnswers',
                ],
              },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          attribution: {
            type: 'array',
            description:
              "Licence information for any third-party content contained in the lessons' downloadable resources",
            items: { type: 'string' },
          },
          assets: {
            type: 'array',
            description: 'List of assets',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'slideDeck',
                  enum: [
                    'slideDeck',
                    'exitQuiz',
                    'exitQuizAnswers',
                    'starterQuiz',
                    'starterQuizAnswers',
                    'supplementaryResource',
                    'video',
                    'worksheet',
                    'worksheetAnswers',
                  ],
                },
                label: {
                  type: 'string',
                  description: 'The label for the asset',
                },
                url: {
                  type: 'string',
                  description: 'The download endpoint for the asset.',
                },
              },
              required: ['type', 'label', 'url'],
            },
          },
        },
        required: [],
        example: {
          attribution: ['Copyright XYZ Authors', 'Creative Commons Attribution Example 4.0'],
          assets: [
            {
              label: 'Worksheet',
              type: 'worksheet',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
            },
            {
              label: 'Worksheet Answers',
              type: 'worksheetAnswers',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
            },
            {
              label: 'Video',
              type: 'video',
              url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
            },
          ],
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/lessons/{lesson}/assets',
      originalPath: '/lessons/{lesson}/assets',
      operationId: 'getAssets-getLessonAssets',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_assets_get_lesson_asset',
      title: 'Lesson asset by type',
      description:
        'This endpoint will stream the downloadable asset for the given lesson and type. \nThere is no response returned for this endpoint as it returns a content attachment.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              lesson: {
                type: 'string',
                description: 'The lesson slug',
                example: 'child-workers-in-the-victorian-era',
              },
              type: {
                type: 'string',
                example: 'slideDeck',
                enum: [
                  'slideDeck',
                  'exitQuiz',
                  'exitQuizAnswers',
                  'starterQuiz',
                  'starterQuizAnswers',
                  'supplementaryResource',
                  'video',
                  'worksheet',
                  'worksheetAnswers',
                ],
              },
            },
            required: ['lesson', 'type'],
          },
        },
        required: ['path'],
      },
      outputSchema: { type: 'object', properties: { value: { example: {} } } },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/lessons/{lesson}/assets/{type}',
      originalPath: '/lessons/{lesson}/assets/{type}',
      operationId: 'getAssets-getLessonAsset',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_subjects_get_all_subjects',
      title: 'Subjects',
      description:
        'This endpoint returns an array of all available subjects and their associated sequences, key stages and years.',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                subjectTitle: 'Art and design',
                subjectSlug: 'art',
                sequenceSlugs: [
                  {
                    sequenceSlug: 'art-primary',
                    years: [1, 2, 3, 4, 5, 6],
                    keyStages: [
                      { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                      { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
                    ],
                    phaseSlug: 'primary',
                    phaseTitle: 'Primary',
                    ks4Options: null,
                  },
                  {
                    sequenceSlug: 'art-secondary',
                    years: [7, 8, 9, 10, 11],
                    keyStages: [
                      { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
                      { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
                    ],
                    phaseSlug: 'secondary',
                    phaseTitle: 'Secondary',
                    ks4Options: null,
                  },
                ],
                years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                keyStages: [
                  { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                  { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
                  { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
                  { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                subjectTitle: {
                  type: 'string',
                  description: 'The subject title',
                },
                subjectSlug: {
                  type: 'string',
                  description: 'The subject slug identifier',
                },
                sequenceSlugs: {
                  type: 'array',
                  description:
                    'Information about the years, key stages and key stage 4 variance for each sequence',
                  items: {
                    type: 'object',
                    properties: {
                      sequenceSlug: {
                        type: 'string',
                        description: 'The unique identifier for each sequence',
                      },
                      years: {
                        type: 'array',
                        description: 'The years for which this subject has content available for',
                        items: { type: 'number' },
                      },
                      keyStages: {
                        type: 'array',
                        description:
                          'The key stage slug identifiers for which this subject has content available for.',
                        items: {
                          type: 'object',
                          properties: {
                            keyStageTitle: {
                              type: 'string',
                              description: 'The key stage title for the given key stage',
                            },
                            keyStageSlug: {
                              type: 'string',
                              description: 'The unique identifier for a given key stage',
                            },
                          },
                          required: ['keyStageTitle', 'keyStageSlug'],
                        },
                      },
                      phaseSlug: {
                        type: 'string',
                        description:
                          'The unique identifier for the phase to which this sequence belongs',
                      },
                      phaseTitle: {
                        type: 'string',
                        description: 'The title for the phase to which this sequence belongs',
                      },
                      ks4Options: {
                        type: 'object',
                        description:
                          'The key stage 4 study pathway that this sequence represents. May be null.',
                        properties: {
                          title: { type: 'string' },
                          slug: { type: 'string' },
                        },
                        required: ['title', 'slug'],
                      },
                    },
                    required: [
                      'sequenceSlug',
                      'years',
                      'keyStages',
                      'phaseSlug',
                      'phaseTitle',
                      'ks4Options',
                    ],
                  },
                },
                years: {
                  type: 'array',
                  description: 'The years for which this subject has content available for',
                  items: { type: 'number' },
                },
                keyStages: {
                  type: 'array',
                  description:
                    'The key stage slug identifiers for which this subject has content available for.',
                  items: {
                    type: 'object',
                    properties: {
                      keyStageTitle: {
                        type: 'string',
                        description: 'The key stage title for the given key stage',
                      },
                      keyStageSlug: {
                        type: 'string',
                        description: 'The unique identifier for a given key stage',
                      },
                    },
                    required: ['keyStageTitle', 'keyStageSlug'],
                  },
                },
              },
              required: ['subjectTitle', 'subjectSlug', 'sequenceSlugs', 'years', 'keyStages'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/subjects',
      originalPath: '/subjects',
      operationId: 'getSubjects-getAllSubjects',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_subjects_get_subject',
      title: 'Subject',
      description:
        'This endpoint returns the sequences, key stages and years that are currently available for a given subject.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'The slug identifier for the subject',
                example: 'art',
              },
            },
            required: ['subject'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          subjectTitle: { type: 'string', description: 'The subject title' },
          subjectSlug: {
            type: 'string',
            description: 'The subject slug identifier',
          },
          sequenceSlugs: {
            type: 'array',
            description:
              'Information about the years, key stages and key stage 4 variance for each sequence',
            items: {
              type: 'object',
              properties: {
                sequenceSlug: {
                  type: 'string',
                  description: 'The unique identifier for each sequence',
                },
                years: {
                  type: 'array',
                  description: 'The years for which this subject has content available for',
                  items: { type: 'number' },
                },
                keyStages: {
                  type: 'array',
                  description:
                    'The key stage slug identifiers for which this subject has content available for.',
                  items: {
                    type: 'object',
                    properties: {
                      keyStageTitle: {
                        type: 'string',
                        description: 'The key stage title for the given key stage',
                      },
                      keyStageSlug: {
                        type: 'string',
                        description: 'The unique identifier for a given key stage',
                      },
                    },
                    required: ['keyStageTitle', 'keyStageSlug'],
                  },
                },
                phaseSlug: {
                  type: 'string',
                  description: 'The unique identifier for the phase to which this sequence belongs',
                },
                phaseTitle: {
                  type: 'string',
                  description: 'The title for the phase to which this sequence belongs',
                },
                ks4Options: {
                  type: 'object',
                  description:
                    'The key stage 4 study pathway that this sequence represents. May be null.',
                  properties: {
                    title: { type: 'string' },
                    slug: { type: 'string' },
                  },
                  required: ['title', 'slug'],
                },
              },
              required: [
                'sequenceSlug',
                'years',
                'keyStages',
                'phaseSlug',
                'phaseTitle',
                'ks4Options',
              ],
            },
          },
          years: {
            type: 'array',
            description: 'The years for which this subject has content available for',
            items: { type: 'number' },
          },
          keyStages: {
            type: 'array',
            description:
              'The key stage slug identifiers for which this subject has content available for.',
            items: {
              type: 'object',
              properties: {
                keyStageTitle: {
                  type: 'string',
                  description: 'The key stage title for the given key stage',
                },
                keyStageSlug: {
                  type: 'string',
                  description: 'The unique identifier for a given key stage',
                },
              },
              required: ['keyStageTitle', 'keyStageSlug'],
            },
          },
        },
        required: ['subjectTitle', 'subjectSlug', 'sequenceSlugs', 'years', 'keyStages'],
        example: {
          subjectTitle: 'Art and design',
          subjectSlug: 'art',
          sequenceSlugs: [
            {
              sequenceSlug: 'art-primary',
              years: [1, 2, 3, 4, 5, 6],
              keyStages: [
                { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
              ],
              phaseSlug: 'primary',
              phaseTitle: 'Primary',
              ks4Options: null,
            },
            {
              sequenceSlug: 'art-secondary',
              years: [1, 2, 3, 4, 5, 6],
              keyStages: [
                { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
              ],
              phaseSlug: 'secondary',
              phaseTitle: 'Secondary',
              ks4Options: null,
            },
          ],
          years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          keyStages: [
            { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
            { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
            { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
            { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
          ],
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/subjects/{subject}',
      originalPath: '/subjects/{subject}',
      operationId: 'getSubjects-getSubject',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_subjects_get_subject_sequence',
      title: 'Sequencing information for a given subject',
      description:
        'This endpoint returns an array of sequence objects that are currently available for a given subject. For secondary sequences, this includes information about key stage 4 variance such as exam board sequences and non-GCSE ‘core’ unit sequences.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'The slug identifier for the subject',
                example: 'art',
              },
            },
            required: ['subject'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                sequenceSlug: 'art-primary',
                years: [1, 2, 3, 4, 5, 6],
                keyStages: [
                  { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                  { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
                ],
                phaseSlug: 'primary',
                phaseTitle: 'Primary',
                ks4Options: null,
              },
              {
                sequenceSlug: 'art-secondary',
                years: [1, 2, 3, 4, 5, 6],
                keyStages: [
                  { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
                  { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
                ],
                phaseSlug: 'secondary',
                phaseTitle: 'Secondary',
                ks4Options: null,
              },
            ],
            items: {
              type: 'object',
              properties: {
                sequenceSlug: {
                  type: 'string',
                  description: 'The unique identifier for each sequence',
                },
                years: {
                  type: 'array',
                  description: 'The years for which this subject has content available for',
                  items: { type: 'number' },
                },
                keyStages: {
                  type: 'array',
                  description:
                    'The key stage slug identifiers for which this subject has content available for.',
                  items: {
                    type: 'object',
                    properties: {
                      keyStageTitle: {
                        type: 'string',
                        description: 'The key stage title for the given key stage',
                      },
                      keyStageSlug: {
                        type: 'string',
                        description: 'The unique identifier for a given key stage',
                      },
                    },
                    required: ['keyStageTitle', 'keyStageSlug'],
                  },
                },
                phaseSlug: {
                  type: 'string',
                  description: 'The unique identifier for the phase to which this sequence belongs',
                },
                phaseTitle: {
                  type: 'string',
                  description: 'The title for the phase to which this sequence belongs',
                },
                ks4Options: {
                  type: 'object',
                  description:
                    'The key stage 4 study pathway that this sequence represents. May be null.',
                  properties: {
                    title: { type: 'string' },
                    slug: { type: 'string' },
                  },
                  required: ['title', 'slug'],
                },
              },
              required: [
                'sequenceSlug',
                'years',
                'keyStages',
                'phaseSlug',
                'phaseTitle',
                'ks4Options',
              ],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/subjects/{subject}/sequences',
      originalPath: '/subjects/{subject}/sequences',
      operationId: 'getSubjects-getSubjectSequence',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_subjects_get_subject_key_stages',
      title: 'Key stages within a subject',
      description:
        'This endpoint returns a list of key stages that are currently available for a given subject.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'The subject slug identifier',
                example: 'art',
              },
            },
            required: ['subject'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            description:
              'The key stage slug identifiers for which this subject has content available for',
            example: [
              { keyStageTitle: 'Key Stage 1', keyStageSlug: 'ks1' },
              { keyStageTitle: 'Key Stage 2', keyStageSlug: 'ks2' },
              { keyStageTitle: 'Key Stage 3', keyStageSlug: 'ks3' },
              { keyStageTitle: 'Key Stage 4', keyStageSlug: 'ks4' },
            ],
            items: {
              type: 'object',
              properties: {
                keyStageTitle: {
                  type: 'string',
                  description: 'The key stage title for the given key stage',
                },
                keyStageSlug: {
                  type: 'string',
                  description: 'The unique identifier for a given key stage',
                },
              },
              required: ['keyStageTitle', 'keyStageSlug'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/subjects/{subject}/key-stages',
      originalPath: '/subjects/{subject}/key-stages',
      operationId: 'getSubjects-getSubjectKeyStages',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_subjects_get_subject_years',
      title: 'Year groups for a given subject',
      description:
        'This endpoint returns an array of years that are currently available for a given subject.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'Subject slug to filter by',
                example: 'cooking-nutrition',
              },
            },
            required: ['subject'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            description: 'The years for which this sequence has content available for',
            example: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            items: { type: 'number' },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/subjects/{subject}/years',
      originalPath: '/subjects/{subject}/years',
      operationId: 'getSubjects-getSubjectYears',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_key_stages_get_key_stages',
      title: 'Key stages',
      description:
        'This endpoint returns all the key stages (titles and slugs) that are currently available on Oak',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [{ slug: 'ks1', title: 'Key Stage 1' }],
            items: {
              type: 'object',
              properties: {
                slug: {
                  type: 'string',
                  description: 'The key stage slug identifier',
                  example: 'ks1',
                },
                title: {
                  type: 'string',
                  description: 'The key stage title',
                  example: 'Key Stage 1',
                },
              },
              required: ['slug', 'title'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/key-stages',
      originalPath: '/key-stages',
      operationId: 'getKeyStages-getKeyStages',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_key_stage_subject_lessons_get_key_stage_subject_lessons',
      title: 'Lessons',
      description:
        'This endpoint returns an array of available published lessons for a given subject and key stage, grouped by unit.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              keyStage: {
                type: 'string',
                description:
                  "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
                example: 'ks1',
                enum: ['ks1', 'ks2', 'ks3', 'ks4'],
              },
              subject: {
                type: 'string',
                description:
                  "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
                example: 'english',
                enum: [
                  'art',
                  'citizenship',
                  'computing',
                  'cooking-nutrition',
                  'design-technology',
                  'english',
                  'french',
                  'geography',
                  'german',
                  'history',
                  'maths',
                  'music',
                  'physical-education',
                  'religious-education',
                  'rshe-pshe',
                  'science',
                  'spanish',
                ],
              },
            },
            required: ['keyStage', 'subject'],
          },
          query: {
            type: 'object',
            properties: {
              unit: {
                type: 'string',
                description: 'Optional unit slug to additionally filter by',
                example: 'word-class',
              },
              offset: {
                type: 'number',
                description:
                  'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',
                default: 0,
                example: 50,
              },
              limit: {
                type: 'number',
                description: 'Offset applied to lessons within each unit (not to the unit list).',
                default: 10,
                example: 10,
                maximum: 100,
              },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                unitSlug: 'simple-compound-and-adverbial-complex-sentences',
                unitTitle: 'Simple, compound and adverbial complex sentences',
                lessons: [
                  {
                    lessonSlug: 'four-types-of-simple-sentence',
                    lessonTitle: 'Four types of simple sentence',
                  },
                  {
                    lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
                    lessonTitle: 'Three ways for co-ordination in compound sentences',
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                unitSlug: {
                  type: 'string',
                  description: 'The unit slug identifier',
                  example: 'simple-compound-and-adverbial-complex-sentences',
                },
                unitTitle: {
                  type: 'string',
                  description: 'The unit title',
                  example: 'Simple, compound and adverbial complex sentences',
                },
                lessons: {
                  type: 'array',
                  description: 'List of lessons for the specified unit',
                  example: [
                    {
                      lessonSlug: 'four-types-of-simple-sentence',
                      lessonTitle: 'Four types of simple sentence',
                    },
                    {
                      lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
                      lessonTitle: 'Three ways for co-ordination in compound sentences',
                    },
                  ],
                  items: {
                    type: 'object',
                    properties: {
                      lessonSlug: {
                        type: 'string',
                        description: 'The lesson slug identifier',
                        example: 'four-types-of-simple-sentence',
                      },
                      lessonTitle: {
                        type: 'string',
                        description: 'The lesson title',
                        example: 'Four types of simple sentence',
                      },
                    },
                    required: ['lessonSlug', 'lessonTitle'],
                  },
                },
              },
              required: ['unitSlug', 'unitTitle', 'lessons'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/key-stages/{keyStage}/subject/{subject}/lessons',
      originalPath: '/key-stages/{keyStage}/subject/{subject}/lessons',
      operationId: 'getKeyStageSubjectLessons-getKeyStageSubjectLessons',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_all_key_stage_and_subject_units_get_all_key_stage_and_subject_units',
      title: 'Units',
      description:
        'This endpoint returns an array of units containing available published lessons for a given key stage and subject, grouped by year. Units without published lessons will not be returned by this endpoint.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              keyStage: {
                type: 'string',
                description: "Key stage slug to filter by, e.g. 'ks2'",
                example: 'ks1',
                enum: ['ks1', 'ks2', 'ks3', 'ks4'],
              },
              subject: {
                type: 'string',
                description:
                  "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
                example: 'art',
                enum: [
                  'art',
                  'citizenship',
                  'computing',
                  'cooking-nutrition',
                  'design-technology',
                  'english',
                  'french',
                  'geography',
                  'german',
                  'history',
                  'maths',
                  'music',
                  'physical-education',
                  'religious-education',
                  'rshe-pshe',
                  'science',
                  'spanish',
                ],
              },
            },
            required: ['keyStage', 'subject'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                units: [
                  {
                    unitSlug: '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
                    unitTitle: '2, 4 and 8 times tables: using times tables to solve problems',
                  },
                  {
                    unitSlug:
                      'bridging-100-counting-on-and-back-in-10s-adding-subtracting-multiples-of-10',
                    unitTitle:
                      'Bridging 100: counting on and back in 10s, adding/subtracting multiples of 10',
                  },
                ],
                yearSlug: 'year-3',
                yearTitle: 'Year 3',
              },
            ],
            items: {
              type: 'object',
              properties: {
                yearSlug: {
                  type: 'string',
                  description: 'The year identifier',
                  example: 'year-3',
                },
                yearTitle: {
                  type: 'string',
                  description: 'The year title',
                  example: 'Year 3',
                },
                units: {
                  type: 'array',
                  description: 'List of units for the specified year',
                  items: {
                    type: 'object',
                    properties: {
                      unitSlug: { type: 'string' },
                      unitTitle: { type: 'string' },
                    },
                    required: ['unitSlug', 'unitTitle'],
                  },
                },
              },
              required: ['yearSlug', 'yearTitle', 'units'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/key-stages/{keyStage}/subject/{subject}/units',
      originalPath: '/key-stages/{keyStage}/subject/{subject}/units',
      operationId: 'getAllKeyStageAndSubjectUnits-getAllKeyStageAndSubjectUnits',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_questions_get_questions_for_lessons',
      title: 'Quiz questions by lesson',
      description:
        'The endpoint returns the quiz questions and answers for a given lesson. The answers data indicates which answers are correct, and which are distractors.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              lesson: {
                type: 'string',
                description: 'The lesson slug identifier',
                example: 'imagining-you-are-the-characters-the-three-billy-goats-gruff',
              },
            },
            required: ['lesson'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          starterQuiz: {
            type: 'array',
            description: 'The starter quiz questions - which test prior knowledge',
            items: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    question: {
                      type: 'string',
                      description: 'The question text',
                    },
                    questionType: {
                      description:
                        'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                      anyOf: [
                        { type: 'string', enum: ['multiple-choice'] },
                        { type: 'string', enum: ['short-answer'] },
                        { type: 'string', enum: ['match'] },
                        { type: 'string', enum: ['order'] },
                      ],
                    },
                    questionImage: {
                      type: 'object',
                      properties: {
                        url: { type: 'string' },
                        width: { type: 'number' },
                        height: { type: 'number' },
                        alt: { type: 'string' },
                        text: {
                          type: 'string',
                          description: 'Supplementary text for the image, if any',
                        },
                        attribution: { type: 'string' },
                      },
                      required: ['url', 'width', 'height'],
                    },
                  },
                  required: ['question', 'questionType'],
                },
                {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        questionType: {
                          type: 'string',
                          enum: ['multiple-choice'],
                        },
                        answers: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                type: 'object',
                                properties: {
                                  distractor: {
                                    type: 'boolean',
                                    description:
                                      'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                  },
                                },
                                required: ['distractor'],
                              },
                              {
                                anyOf: [
                                  {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        description:
                                          'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                        enum: ['text'],
                                      },
                                      content: {
                                        type: 'string',
                                        description: 'Quiz question answer',
                                      },
                                    },
                                    required: ['type', 'content'],
                                  },
                                  {
                                    type: 'object',
                                    properties: {
                                      type: { type: 'string', enum: ['image'] },
                                      content: {
                                        type: 'object',
                                        properties: {
                                          url: { type: 'string' },
                                          width: { type: 'number' },
                                          height: { type: 'number' },
                                          alt: { type: 'string' },
                                          text: {
                                            type: 'string',
                                            description: 'Supplementary text for the image, if any',
                                          },
                                          attribution: { type: 'string' },
                                        },
                                        required: ['url', 'width', 'height'],
                                      },
                                    },
                                    required: ['type', 'content'],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: {
                          type: 'string',
                          enum: ['short-answer'],
                        },
                        answers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: {
                                type: 'string',
                                description:
                                  'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                enum: ['text'],
                              },
                              content: {
                                type: 'string',
                                description: 'Quiz question answer',
                              },
                            },
                            required: ['type', 'content'],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: { type: 'string', enum: ['match'] },
                        answers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              matchOption: {
                                type: 'object',
                                description: 'Matching options (LHS)',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                              correctChoice: {
                                type: 'object',
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                            },
                            required: ['matchOption', 'correctChoice'],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: { type: 'string', enum: ['order'] },
                        answers: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                type: 'object',
                                properties: {
                                  order: {
                                    type: 'number',
                                    description: 'Indicates the correct ordering of the response',
                                  },
                                },
                                required: ['order'],
                              },
                              {
                                type: 'object',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                            ],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                  ],
                },
              ],
            },
          },
          exitQuiz: {
            type: 'array',
            description:
              'The exit quiz questions - which test on the knowledge learned in the lesson',
            items: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    question: {
                      type: 'string',
                      description: 'The question text',
                    },
                    questionType: {
                      description:
                        'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                      anyOf: [
                        { type: 'string', enum: ['multiple-choice'] },
                        { type: 'string', enum: ['short-answer'] },
                        { type: 'string', enum: ['match'] },
                        { type: 'string', enum: ['order'] },
                      ],
                    },
                    questionImage: {
                      type: 'object',
                      properties: {
                        url: { type: 'string' },
                        width: { type: 'number' },
                        height: { type: 'number' },
                        alt: { type: 'string' },
                        text: {
                          type: 'string',
                          description: 'Supplementary text for the image, if any',
                        },
                        attribution: { type: 'string' },
                      },
                      required: ['url', 'width', 'height'],
                    },
                  },
                  required: ['question', 'questionType'],
                },
                {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        questionType: {
                          type: 'string',
                          enum: ['multiple-choice'],
                        },
                        answers: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                type: 'object',
                                properties: {
                                  distractor: {
                                    type: 'boolean',
                                    description:
                                      'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                  },
                                },
                                required: ['distractor'],
                              },
                              {
                                anyOf: [
                                  {
                                    type: 'object',
                                    properties: {
                                      type: {
                                        type: 'string',
                                        description:
                                          'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                        enum: ['text'],
                                      },
                                      content: {
                                        type: 'string',
                                        description: 'Quiz question answer',
                                      },
                                    },
                                    required: ['type', 'content'],
                                  },
                                  {
                                    type: 'object',
                                    properties: {
                                      type: { type: 'string', enum: ['image'] },
                                      content: {
                                        type: 'object',
                                        properties: {
                                          url: { type: 'string' },
                                          width: { type: 'number' },
                                          height: { type: 'number' },
                                          alt: { type: 'string' },
                                          text: {
                                            type: 'string',
                                            description: 'Supplementary text for the image, if any',
                                          },
                                          attribution: { type: 'string' },
                                        },
                                        required: ['url', 'width', 'height'],
                                      },
                                    },
                                    required: ['type', 'content'],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: {
                          type: 'string',
                          enum: ['short-answer'],
                        },
                        answers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: {
                                type: 'string',
                                description:
                                  'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                enum: ['text'],
                              },
                              content: {
                                type: 'string',
                                description: 'Quiz question answer',
                              },
                            },
                            required: ['type', 'content'],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: { type: 'string', enum: ['match'] },
                        answers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              matchOption: {
                                type: 'object',
                                description: 'Matching options (LHS)',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                              correctChoice: {
                                type: 'object',
                                description:
                                  'Matching options (RHS), indicating the correct choice',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                            },
                            required: ['matchOption', 'correctChoice'],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                    {
                      type: 'object',
                      properties: {
                        questionType: { type: 'string', enum: ['order'] },
                        answers: {
                          type: 'array',
                          items: {
                            allOf: [
                              {
                                type: 'object',
                                properties: {
                                  order: {
                                    type: 'number',
                                    description: 'Indicates the correct ordering of the response',
                                  },
                                },
                                required: ['order'],
                              },
                              {
                                type: 'object',
                                properties: {
                                  type: {
                                    type: 'string',
                                    description:
                                      'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                    enum: ['text'],
                                  },
                                  content: {
                                    type: 'string',
                                    description: 'Quiz question answer',
                                  },
                                },
                                required: ['type', 'content'],
                              },
                            ],
                          },
                        },
                      },
                      required: ['questionType', 'answers'],
                    },
                  ],
                },
              ],
            },
          },
        },
        required: ['starterQuiz', 'exitQuiz'],
        example: {
          starterQuiz: [
            {
              question: 'Tick the sentence with the correct punctuation.',
              questionType: 'multiple-choice',
              answers: [
                { distractor: true, type: 'text', content: 'the baby cried' },
                { distractor: true, type: 'text', content: 'The baby cried' },
                { distractor: false, type: 'text', content: 'The baby cried.' },
                { distractor: true, type: 'text', content: 'the baby cried.' },
              ],
            },
          ],
          exitQuiz: [
            {
              question: 'Which word is a verb?',
              questionType: 'multiple-choice',
              answers: [
                { distractor: true, type: 'text', content: 'shops' },
                { distractor: true, type: 'text', content: 'Jun' },
                { distractor: true, type: 'text', content: 'I' },
                { distractor: false, type: 'text', content: 'shout' },
              ],
            },
          ],
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/lessons/{lesson}/quiz',
      originalPath: '/lessons/{lesson}/quiz',
      operationId: 'getQuestions-getQuestionsForLessons',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_questions_get_questions_for_sequence',
      title: 'Questions within a sequence',
      description:
        'This endpoint returns all quiz questions for a given sequence. The assets are separated into starter quiz and entry quiz arrays, grouped by lesson.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              sequence: {
                type: 'string',
                description:
                  'The sequence slug identifier, including the key stage 4 option where relevant.',
                example: 'english-primary',
              },
            },
            required: ['sequence'],
          },
          query: {
            type: 'object',
            properties: {
              year: {
                type: 'number',
                description:
                  'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
                example: 3,
              },
              offset: { type: 'number', default: 0, example: 50 },
              limit: { type: 'number', default: 10, example: 10, maximum: 100 },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonTitle: '3D shapes can be composed from 2D nets',
                lessonSlug: '3d-shapes-can-be-composed-from-2d-nets',
                starterQuiz: [
                  {
                    question: 'Select all of the names of shapes that are polygons.',
                    questionType: 'multiple-choice',
                    answers: [
                      { type: 'text', content: 'Cube ', distractor: true },
                      { type: 'text', content: ' Square', distractor: false },
                      { type: 'text', content: 'Triangle', distractor: false },
                      {
                        type: 'text',
                        content: 'Semi-circle',
                        distractor: true,
                      },
                    ],
                  },
                ],
                exitQuiz: [
                  {
                    question: 'What is a net?',
                    questionType: 'multiple-choice',
                    answers: [
                      {
                        type: 'text',
                        content: 'A 3D shape made of 2D shapes folded together. ',
                        distractor: false,
                      },
                      {
                        type: 'text',
                        content: 'A 2D shape made of 3D shapes folded togehther.',
                        distractor: true,
                      },
                      {
                        type: 'text',
                        content: 'A type of cube.',
                        distractor: true,
                      },
                    ],
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The lesson slug identifier',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The title of the lesson',
                },
                starterQuiz: {
                  type: 'array',
                  description: 'The starter quiz questions - which test prior knowledge',
                  items: {
                    allOf: [
                      {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string',
                            description: 'The question text',
                          },
                          questionType: {
                            description:
                              'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                            anyOf: [
                              { type: 'string', enum: ['multiple-choice'] },
                              { type: 'string', enum: ['short-answer'] },
                              { type: 'string', enum: ['match'] },
                              { type: 'string', enum: ['order'] },
                            ],
                          },
                          questionImage: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              width: { type: 'number' },
                              height: { type: 'number' },
                              alt: { type: 'string' },
                              text: {
                                type: 'string',
                                description: 'Supplementary text for the image, if any',
                              },
                              attribution: { type: 'string' },
                            },
                            required: ['url', 'width', 'height'],
                          },
                        },
                        required: ['question', 'questionType'],
                      },
                      {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['multiple-choice'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        distractor: {
                                          type: 'boolean',
                                          description:
                                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                        },
                                      },
                                      required: ['distractor'],
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              description:
                                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                              enum: ['text'],
                                            },
                                            content: {
                                              type: 'string',
                                              description: 'Quiz question answer',
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              enum: ['image'],
                                            },
                                            content: {
                                              type: 'object',
                                              properties: {
                                                url: { type: 'string' },
                                                width: { type: 'number' },
                                                height: { type: 'number' },
                                                alt: { type: 'string' },
                                                text: {
                                                  type: 'string',
                                                  description:
                                                    'Supplementary text for the image, if any',
                                                },
                                                attribution: { type: 'string' },
                                              },
                                              required: ['url', 'width', 'height'],
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['short-answer'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                      description:
                                        'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                      enum: ['text'],
                                    },
                                    content: {
                                      type: 'string',
                                      description: 'Quiz question answer',
                                    },
                                  },
                                  required: ['type', 'content'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['match'] },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    matchOption: {
                                      type: 'object',
                                      description: 'Matching options (LHS)',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                    correctChoice: {
                                      type: 'object',
                                      description:
                                        'Matching options (RHS), indicating the correct choice',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  },
                                  required: ['matchOption', 'correctChoice'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['order'] },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        order: {
                                          type: 'number',
                                          description:
                                            'Indicates the correct ordering of the response',
                                        },
                                      },
                                      required: ['order'],
                                    },
                                    {
                                      type: 'object',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                        ],
                      },
                    ],
                  },
                },
                exitQuiz: {
                  type: 'array',
                  description:
                    'The exit quiz questions - which test on the knowledge learned in the lesson',
                  items: {
                    allOf: [
                      {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string',
                            description: 'The question text',
                          },
                          questionType: {
                            description:
                              'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                            anyOf: [
                              { type: 'string', enum: ['multiple-choice'] },
                              { type: 'string', enum: ['short-answer'] },
                              { type: 'string', enum: ['match'] },
                              { type: 'string', enum: ['order'] },
                            ],
                          },
                          questionImage: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              width: { type: 'number' },
                              height: { type: 'number' },
                              alt: { type: 'string' },
                              text: {
                                type: 'string',
                                description: 'Supplementary text for the image, if any',
                              },
                              attribution: { type: 'string' },
                            },
                            required: ['url', 'width', 'height'],
                          },
                        },
                        required: ['question', 'questionType'],
                      },
                      {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['multiple-choice'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        distractor: {
                                          type: 'boolean',
                                          description:
                                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                        },
                                      },
                                      required: ['distractor'],
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              description:
                                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                              enum: ['text'],
                                            },
                                            content: {
                                              type: 'string',
                                              description: 'Quiz question answer',
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              enum: ['image'],
                                            },
                                            content: {
                                              type: 'object',
                                              properties: {
                                                url: { type: 'string' },
                                                width: { type: 'number' },
                                                height: { type: 'number' },
                                                alt: { type: 'string' },
                                                text: {
                                                  type: 'string',
                                                  description:
                                                    'Supplementary text for the image, if any',
                                                },
                                                attribution: { type: 'string' },
                                              },
                                              required: ['url', 'width', 'height'],
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['short-answer'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                      description:
                                        'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                      enum: ['text'],
                                    },
                                    content: {
                                      type: 'string',
                                      description: 'Quiz question answer',
                                    },
                                  },
                                  required: ['type', 'content'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['match'] },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    matchOption: {
                                      type: 'object',
                                      description: 'Matching options (LHS)',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                    correctChoice: {
                                      type: 'object',
                                      description:
                                        'Matching options (RHS), indicating the correct choice',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  },
                                  required: ['matchOption', 'correctChoice'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['order'] },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        order: {
                                          type: 'number',
                                          description:
                                            'Indicates the correct ordering of the response',
                                        },
                                      },
                                      required: ['order'],
                                    },
                                    {
                                      type: 'object',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'starterQuiz', 'exitQuiz'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/sequences/{sequence}/questions',
      originalPath: '/sequences/{sequence}/questions',
      operationId: 'getQuestions-getQuestionsForSequence',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_questions_get_questions_for_key_stage_and_subject',
      title: 'Quiz questions by subject and key stage',
      description:
        'This endpoint returns quiz questions and answers for each lesson within a requested subject and key stage.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              keyStage: {
                type: 'string',
                description:
                  "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
                example: 'ks1',
                enum: ['ks1', 'ks2', 'ks3', 'ks4'],
              },
              subject: {
                type: 'string',
                description:
                  "Subject slug to search by, e.g. 'science' - note that casing is important here",
                example: 'art',
                enum: [
                  'art',
                  'citizenship',
                  'computing',
                  'cooking-nutrition',
                  'design-technology',
                  'english',
                  'french',
                  'geography',
                  'german',
                  'history',
                  'maths',
                  'music',
                  'physical-education',
                  'religious-education',
                  'rshe-pshe',
                  'science',
                  'spanish',
                ],
              },
            },
            required: ['keyStage', 'subject'],
          },
          query: {
            type: 'object',
            properties: {
              offset: { type: 'number', default: 0, example: 50 },
              limit: { type: 'number', default: 10, example: 10, maximum: 100 },
            },
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonSlug: 'predicting-the-size-of-a-product',
                lessonTitle: 'Predicting the size of a product',
                starterQuiz: [
                  {
                    question: 'Match the number to its written representation.',
                    questionType: 'match',
                    answers: [
                      {
                        matchOption: { type: 'text', content: 'seven tenths' },
                        correctChoice: { type: 'text', content: '0.7' },
                      },
                      {
                        matchOption: { type: 'text', content: 'nine tenths' },
                        correctChoice: { type: 'text', content: '0.9' },
                      },
                      {
                        matchOption: { type: 'text', content: 'seven ones' },
                        correctChoice: { type: 'text', content: '7' },
                      },
                      {
                        matchOption: {
                          type: 'text',
                          content: 'seven hundredths',
                        },
                        correctChoice: { type: 'text', content: '0.07' },
                      },
                      {
                        matchOption: {
                          type: 'text',
                          content: 'nine hundredths',
                        },
                        correctChoice: { type: 'text', content: '0.09' },
                      },
                    ],
                  },
                ],
                exitQuiz: [
                  {
                    question:
                      'Use the fact that 9 × 8 = 72, to match the expressions to their product.',
                    questionType: 'match',
                    answers: [
                      {
                        matchOption: { type: 'text', content: '9 × 80' },
                        correctChoice: { type: 'text', content: '720' },
                      },
                      {
                        matchOption: { type: 'text', content: '9 × 800 ' },
                        correctChoice: { type: 'text', content: '7,200' },
                      },
                      {
                        matchOption: { type: 'text', content: '9 × 0.8' },
                        correctChoice: { type: 'text', content: '7.2' },
                      },
                      {
                        matchOption: { type: 'text', content: '9 × 0' },
                        correctChoice: { type: 'text', content: '0' },
                      },
                      {
                        matchOption: { type: 'text', content: '9 × 0.08' },
                        correctChoice: { type: 'text', content: '0.72' },
                      },
                    ],
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The lesson slug identifier',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The title of the lesson',
                },
                starterQuiz: {
                  type: 'array',
                  description: 'The starter quiz questions - which test prior knowledge',
                  items: {
                    allOf: [
                      {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string',
                            description: 'The question text',
                          },
                          questionType: {
                            description:
                              'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                            anyOf: [
                              { type: 'string', enum: ['multiple-choice'] },
                              { type: 'string', enum: ['short-answer'] },
                              { type: 'string', enum: ['match'] },
                              { type: 'string', enum: ['order'] },
                            ],
                          },
                          questionImage: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              width: { type: 'number' },
                              height: { type: 'number' },
                              alt: { type: 'string' },
                              text: {
                                type: 'string',
                                description: 'Supplementary text for the image, if any',
                              },
                              attribution: { type: 'string' },
                            },
                            required: ['url', 'width', 'height'],
                          },
                        },
                        required: ['question', 'questionType'],
                      },
                      {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['multiple-choice'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        distractor: {
                                          type: 'boolean',
                                          description:
                                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                        },
                                      },
                                      required: ['distractor'],
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              description:
                                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                              enum: ['text'],
                                            },
                                            content: {
                                              type: 'string',
                                              description: 'Quiz question answer',
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              enum: ['image'],
                                            },
                                            content: {
                                              type: 'object',
                                              properties: {
                                                url: { type: 'string' },
                                                width: { type: 'number' },
                                                height: { type: 'number' },
                                                alt: { type: 'string' },
                                                text: {
                                                  type: 'string',
                                                  description:
                                                    'Supplementary text for the image, if any',
                                                },
                                                attribution: { type: 'string' },
                                              },
                                              required: ['url', 'width', 'height'],
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['short-answer'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                      description:
                                        'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                      enum: ['text'],
                                    },
                                    content: {
                                      type: 'string',
                                      description: 'Quiz question answer',
                                    },
                                  },
                                  required: ['type', 'content'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['match'] },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    matchOption: {
                                      type: 'object',
                                      description: 'Matching options (LHS)',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                    correctChoice: {
                                      type: 'object',
                                      description:
                                        'Matching options (RHS), indicating the correct choice',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  },
                                  required: ['matchOption', 'correctChoice'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['order'] },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        order: {
                                          type: 'number',
                                          description:
                                            'Indicates the correct ordering of the response',
                                        },
                                      },
                                      required: ['order'],
                                    },
                                    {
                                      type: 'object',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                        ],
                      },
                    ],
                  },
                },
                exitQuiz: {
                  type: 'array',
                  description:
                    'The exit quiz questions - which test on the knowledge learned in the lesson',
                  items: {
                    allOf: [
                      {
                        type: 'object',
                        properties: {
                          question: {
                            type: 'string',
                            description: 'The question text',
                          },
                          questionType: {
                            description:
                              'The type of quiz question which could be one of the following:\n- multiple-choice\n- order\n- match\n- explanatory-text\n- short-answer',
                            anyOf: [
                              { type: 'string', enum: ['multiple-choice'] },
                              { type: 'string', enum: ['short-answer'] },
                              { type: 'string', enum: ['match'] },
                              { type: 'string', enum: ['order'] },
                            ],
                          },
                          questionImage: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              width: { type: 'number' },
                              height: { type: 'number' },
                              alt: { type: 'string' },
                              text: {
                                type: 'string',
                                description: 'Supplementary text for the image, if any',
                              },
                              attribution: { type: 'string' },
                            },
                            required: ['url', 'width', 'height'],
                          },
                        },
                        required: ['question', 'questionType'],
                      },
                      {
                        oneOf: [
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['multiple-choice'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        distractor: {
                                          type: 'boolean',
                                          description:
                                            'Whether the multiple choice question response is the correct answer (false) or is a distractor (true)',
                                        },
                                      },
                                      required: ['distractor'],
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              description:
                                                'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                              enum: ['text'],
                                            },
                                            content: {
                                              type: 'string',
                                              description: 'Quiz question answer',
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                        {
                                          type: 'object',
                                          properties: {
                                            type: {
                                              type: 'string',
                                              enum: ['image'],
                                            },
                                            content: {
                                              type: 'object',
                                              properties: {
                                                url: { type: 'string' },
                                                width: { type: 'number' },
                                                height: { type: 'number' },
                                                alt: { type: 'string' },
                                                text: {
                                                  type: 'string',
                                                  description:
                                                    'Supplementary text for the image, if any',
                                                },
                                                attribution: { type: 'string' },
                                              },
                                              required: ['url', 'width', 'height'],
                                            },
                                          },
                                          required: ['type', 'content'],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: {
                                type: 'string',
                                enum: ['short-answer'],
                              },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                      description:
                                        'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                      enum: ['text'],
                                    },
                                    content: {
                                      type: 'string',
                                      description: 'Quiz question answer',
                                    },
                                  },
                                  required: ['type', 'content'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['match'] },
                              answers: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    matchOption: {
                                      type: 'object',
                                      description: 'Matching options (LHS)',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                    correctChoice: {
                                      type: 'object',
                                      description:
                                        'Matching options (RHS), indicating the correct choice',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  },
                                  required: ['matchOption', 'correctChoice'],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                          {
                            type: 'object',
                            properties: {
                              questionType: { type: 'string', enum: ['order'] },
                              answers: {
                                type: 'array',
                                items: {
                                  allOf: [
                                    {
                                      type: 'object',
                                      properties: {
                                        order: {
                                          type: 'number',
                                          description:
                                            'Indicates the correct ordering of the response',
                                        },
                                      },
                                      required: ['order'],
                                    },
                                    {
                                      type: 'object',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          description:
                                            'The format of the quiz answer \nNote: currently, we are only returning text-based quiz answers. In the future, we will also have image-based questions available.',
                                          enum: ['text'],
                                        },
                                        content: {
                                          type: 'string',
                                          description: 'Quiz question answer',
                                        },
                                      },
                                      required: ['type', 'content'],
                                    },
                                  ],
                                },
                              },
                            },
                            required: ['questionType', 'answers'],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'starterQuiz', 'exitQuiz'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/key-stages/{keyStage}/subject/{subject}/questions',
      originalPath: '/key-stages/{keyStage}/subject/{subject}/questions',
      operationId: 'getQuestions-getQuestionsForKeyStageAndSubject',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_lessons_get_lesson',
      title: 'Lesson summary',
      description: 'This endpoint returns a summary for a given lesson',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              lesson: {
                type: 'string',
                description: 'The slug of the lesson',
                example: 'joining-using-and',
              },
            },
            required: ['lesson'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          lessonTitle: { type: 'string', description: 'The lesson title' },
          unitSlug: { type: 'string', description: 'The unit slug identifier' },
          unitTitle: { type: 'string', description: 'The unit title' },
          subjectSlug: {
            type: 'string',
            description: 'The subject slug identifier',
          },
          subjectTitle: {
            type: 'string',
            description: 'The subject slug identifier',
          },
          keyStageSlug: {
            type: 'string',
            description: 'The key stage slug identifier',
          },
          keyStageTitle: { type: 'string', description: 'The key stage title' },
          lessonKeywords: {
            type: 'array',
            description: "The lesson's keywords and their descriptions",
            items: {
              type: 'object',
              properties: {
                keyword: { type: 'string', description: 'The keyword' },
                description: {
                  type: 'string',
                  description: 'A definition of the keyword',
                },
              },
              required: ['keyword', 'description'],
            },
          },
          keyLearningPoints: {
            type: 'array',
            description: "The lesson's key learning points",
            items: {
              type: 'object',
              properties: {
                keyLearningPoint: {
                  type: 'string',
                  description: 'A key learning point',
                },
              },
              required: ['keyLearningPoint'],
            },
          },
          misconceptionsAndCommonMistakes: {
            type: 'array',
            description:
              'The lesson’s anticipated common misconceptions and suggested teacher responses',
            items: {
              type: 'object',
              properties: {
                misconception: {
                  type: 'string',
                  description: 'A common misconception',
                },
                response: { type: 'string' },
              },
              required: ['misconception', 'response'],
            },
          },
          pupilLessonOutcome: {
            type: 'string',
            description: 'Suggested teacher response to a common misconception',
          },
          teacherTips: {
            type: 'array',
            description: 'Helpful teaching tips for the lesson',
            items: {
              type: 'object',
              description: 'A teaching tip',
              properties: { teacherTip: { type: 'string' } },
              required: ['teacherTip'],
            },
          },
          contentGuidance: {
            description:
              'Full guidance about the types of lesson content for the teacher to consider (where appropriate)',
            anyOf: [
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    contentGuidanceArea: {
                      type: 'string',
                      description: 'Category of content guidance',
                    },
                    supervisionlevel_id: {
                      type: 'number',
                      description:
                        'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
                    },
                    contentGuidanceLabel: {
                      type: 'string',
                      description: 'Content guidance label',
                    },
                    contentGuidanceDescription: {
                      type: 'string',
                      description:
                        'A detailed description of the type of content that we suggest needs guidance.',
                    },
                  },
                  required: [
                    'contentGuidanceArea',
                    'supervisionlevel_id',
                    'contentGuidanceLabel',
                    'contentGuidanceDescription',
                  ],
                },
              },
              { type: 'null' },
            ],
          },
          supervisionLevel: {
            description:
              'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
          downloadsAvailable: {
            type: 'boolean',
            description:
              'Whether the lesson currently has any downloadable assets availableNote: this field reflects the current availability of downloadable assets, which reflects the availability of early-release content available for the hackathon. All lessons will eventually have downloadable assets available.',
          },
        },
        required: [
          'lessonTitle',
          'unitSlug',
          'unitTitle',
          'subjectSlug',
          'subjectTitle',
          'keyStageSlug',
          'keyStageTitle',
          'lessonKeywords',
          'keyLearningPoints',
          'misconceptionsAndCommonMistakes',
          'teacherTips',
          'contentGuidance',
          'supervisionLevel',
          'downloadsAvailable',
        ],
        example: {
          lessonTitle: "Joining using 'and'",
          unitSlug: 'simple-sentences',
          unitTitle: 'Simple sentences',
          subjectSlug: 'english',
          subjectTitle: 'English',
          keyStageSlug: 'ks1',
          keyStageTitle: 'Key Stage 1',
          lessonKeywords: [
            {
              keyword: 'joining word',
              description: 'a word that joins words or ideas',
            },
            { keyword: 'build on', description: 'add to' },
            { keyword: 'related', description: 'linked to' },
          ],
          keyLearningPoints: [
            { keyLearningPoint: 'And is a type of joining word.' },
            {
              keyLearningPoint: 'A joining word can join two simple sentences.',
            },
            {
              keyLearningPoint: 'Each simple sentence is about one idea and makes complete sense.',
            },
            {
              keyLearningPoint:
                'The second idea builds on to the first idea if ‘and’ is used to join them.',
            },
            {
              keyLearningPoint:
                'Grammatically accurate sentences start with capital letters and most often end with full stops.',
            },
          ],
          misconceptionsAndCommonMistakes: [
            {
              misconception: 'Pupils may struggle to link related ideas together.',
              response:
                'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
            },
          ],
          pupilLessonOutcome: "I can join two simple sentences with 'and'.",
          teacherTips: [
            {
              teacherTip:
                'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
            },
          ],
          contentGuidance: null,
          supervisionLevel: null,
          downloadsAvailable: true,
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/lessons/{lesson}/summary',
      originalPath: '/lessons/{lesson}/summary',
      operationId: 'getLessons-getLesson',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_lessons_search_by_text_similarity',
      title: 'Lesson search using lesson title',
      description:
        'Search for a term and find the 20 most similar lessons with titles that contain similar text.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'object',
            properties: {
              q: {
                type: 'string',
                description: 'Search query text snippet',
                example: 'gothic',
              },
              keyStage: {
                type: 'string',
                description:
                  "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
                example: 'ks2',
                enum: ['ks1', 'ks2', 'ks3', 'ks4'],
              },
              subject: {
                type: 'string',
                description:
                  "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
                example: 'english',
                enum: [
                  'art',
                  'citizenship',
                  'computing',
                  'cooking-nutrition',
                  'design-technology',
                  'english',
                  'french',
                  'geography',
                  'german',
                  'history',
                  'maths',
                  'music',
                  'physical-education',
                  'religious-education',
                  'rshe-pshe',
                  'science',
                  'spanish',
                ],
              },
              unit: {
                type: 'string',
                description: 'Optional unit slug to additionally filter by',
                example: 'Gothic poetry',
              },
            },
            required: ['q'],
          },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                lessonSlug: 'performing-your-chosen-gothic-poem',
                lessonTitle: 'Performing your chosen Gothic poem',
                similarity: 0.20588236,
                units: [
                  {
                    unitSlug: 'gothic-poetry',
                    unitTitle: 'Gothic poetry',
                    examBoardTitle: null,
                    keyStageSlug: 'ks3',
                    subjectSlug: 'english',
                  },
                ],
              },
              {
                lessonSlug: 'the-twisted-tree-the-novel-as-a-gothic-text',
                lessonTitle: "'The Twisted Tree': the novel as a Gothic text",
                similarity: 0.19444445,
                units: [
                  {
                    unitSlug: 'the-twisted-tree-fiction-reading',
                    unitTitle: "'The Twisted Tree': fiction reading",
                    examBoardTitle: null,
                    keyStageSlug: 'ks3',
                    subjectSlug: 'english',
                  },
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The lesson slug identifier',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The lesson title',
                },
                similarity: {
                  type: 'number',
                  description: 'The snippet of the transcript that matched the search term',
                },
                units: {
                  type: 'array',
                  description: 'The units that the lesson is part of. See sample response below',
                  items: {
                    type: 'object',
                    properties: {
                      unitSlug: { type: 'string' },
                      unitTitle: { type: 'string' },
                      examBoardTitle: {
                        anyOf: [{ type: 'string' }, { type: 'null' }],
                      },
                      keyStageSlug: { type: 'string' },
                      subjectSlug: { type: 'string' },
                    },
                    required: [
                      'unitSlug',
                      'unitTitle',
                      'examBoardTitle',
                      'keyStageSlug',
                      'subjectSlug',
                    ],
                  },
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'similarity', 'units'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/search/lessons',
      originalPath: '/search/lessons',
      operationId: 'getLessons-searchByTextSimilarity',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_units_get_unit',
      title: 'Unit summary',
      description:
        'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              unit: {
                type: 'string',
                description: 'The unit slug',
                example: 'simple-compound-and-adverbial-complex-sentences',
              },
            },
            required: ['unit'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          unitSlug: {
            type: 'string',
            description: 'The unit slug identifier',
            example: 'simple-compound-and-adverbial-complex-sentences',
          },
          unitTitle: {
            type: 'string',
            description: 'The unit title',
            example: 'Simple, compound and adverbial complex sentences',
          },
          yearSlug: {
            type: 'string',
            description: 'The slug identifier for the year to which the unit belongs',
            example: 'year-3',
          },
          year: {
            description: 'The year to which the unit belongs',
            example: 3,
            anyOf: [{ type: 'number' }, { type: 'string' }],
          },
          phaseSlug: {
            type: 'string',
            description: 'The slug identifier for the phase to which the unit belongs',
            example: 'primary',
          },
          subjectSlug: {
            type: 'string',
            description: 'The subject identifier',
            example: 'english',
          },
          keyStageSlug: {
            type: 'string',
            description: 'The slug identifier for the the key stage to which the unit belongs',
            example: 'ks2',
          },
          notes: { type: 'string', description: 'Unit summary notes' },
          description: {
            type: 'string',
            description: 'A short description of the unit. Not yet available for all subjects.',
          },
          priorKnowledgeRequirements: {
            type: 'array',
            description: 'The prior knowledge required for the unit',
            example: [
              'A simple sentence is about one idea and makes complete sense.',
              'Any simple sentence contains one verb and at least one noun.',
              'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
            ],
            items: { type: 'string' },
          },
          nationalCurriculumContent: {
            type: 'array',
            description: 'National curriculum attainment statements covered in this unit',
            example: [
              'Ask relevant questions to extend their understanding and knowledge',
              'Articulate and justify answers, arguments and opinions',
              'Speak audibly and fluently with an increasing command of Standard English',
            ],
            items: { type: 'string' },
          },
          whyThisWhyNow: {
            type: 'string',
            description:
              'An explanation of where the unit sits within the sequence and why it has been placed there.',
          },
          threads: {
            type: 'array',
            description: 'The threads that are associated with the unit',
            example: [
              {
                slug: 'developing-grammatical-knowledge',
                title: 'Developing grammatical knowledge',
                order: 10,
              },
            ],
            items: {
              type: 'object',
              properties: {
                slug: { type: 'string' },
                title: { type: 'string' },
                order: { type: 'number' },
              },
              required: ['slug', 'title', 'order'],
            },
          },
          categories: {
            type: 'array',
            description:
              'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
            items: {
              type: 'object',
              properties: {
                categoryTitle: { type: 'string' },
                categorySlug: { type: 'string' },
              },
              required: ['categoryTitle'],
            },
          },
          unitLessons: {
            type: 'array',
            items: {
              type: 'object',
              description: 'All the lessons contained in the unit',
              properties: {
                lessonSlug: {
                  type: 'string',
                  description: 'The lesson slug identifier',
                  example: 'four-types-of-simple-sentence',
                },
                lessonTitle: {
                  type: 'string',
                  description: 'The title for the lesson',
                  example: 'Four types of simple sentence',
                },
                lessonOrder: {
                  type: 'number',
                  description: 'Indicates the ordering of the lesson',
                  example: 1,
                },
                state: {
                  type: 'string',
                  description:
                    "If the state is 'published' then it is also available on the /lessons/* endpoints. If the state is 'new' then it's not available yet.",
                  example: 'published',
                  enum: ['published', 'new'],
                },
              },
              required: ['lessonSlug', 'lessonTitle', 'state'],
            },
          },
        },
        required: [
          'unitSlug',
          'unitTitle',
          'yearSlug',
          'year',
          'phaseSlug',
          'subjectSlug',
          'keyStageSlug',
          'priorKnowledgeRequirements',
          'nationalCurriculumContent',
          'unitLessons',
        ],
        example: {
          unitSlug: 'simple-compound-and-adverbial-complex-sentences',
          unitTitle: 'Simple, compound and adverbial complex sentences',
          yearSlug: 'year-3',
          year: 3,
          phaseSlug: 'primary',
          subjectSlug: 'english',
          keyStageSlug: 'ks2',
          priorKnowledgeRequirements: [
            'A simple sentence is about one idea and makes complete sense.',
            'Any simple sentence contains one verb and at least one noun.',
            'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
          ],
          nationalCurriculumContent: [
            'Ask relevant questions to extend their understanding and knowledge',
            'Articulate and justify answers, arguments and opinions',
            'Speak audibly and fluently with an increasing command of Standard English',
          ],
          threads: [
            {
              slug: 'developing-grammatical-knowledge',
              title: 'Developing grammatical knowledge',
              order: 10,
            },
          ],
          unitLessons: [
            {
              lessonSlug: 'four-types-of-simple-sentence',
              lessonTitle: 'Four types of simple sentence',
              lessonOrder: 1,
              state: 'published',
            },
            {
              lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
              lessonTitle: 'Three ways for co-ordination in compound sentences',
              lessonOrder: 2,
              state: 'new',
            },
          ],
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/units/{unit}/summary',
      originalPath: '/units/{unit}/summary',
      operationId: 'getUnits-getUnit',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_threads_get_all_threads',
      title: 'Threads',
      description:
        'This endpoint returns an array of all threads, across all subjects. Threads signpost groups of units that link to one another, building a common body of knowledge over time. They are an important component of how Oak’s curricula are sequenced.',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                title: 'Number: Multiplication and division',
                slug: 'number-multiplication-and-division',
              },
            ],
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'The thread title' },
                slug: {
                  type: 'string',
                  description: 'The thread slug identifier',
                },
              },
              required: ['title', 'slug'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/threads',
      originalPath: '/threads',
      operationId: 'getThreads-getAllThreads',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_threads_get_thread_units',
      title: 'Units belonging to a given thread',
      description: 'This endpoint returns all of the units that belong to a given thread.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: {
              threadSlug: {
                type: 'string',
                example: 'number-multiplication-and-division',
              },
            },
            required: ['threadSlug'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                unitTitle: 'Unitising and coin recognition - counting in 2s, 5s and 10s',
                unitSlug: 'unitising-and-coin-recognitions-counting-in-2s-5s-and-10s',
                unitOrder: 1,
              },
              {
                unitTitle: 'Solving problems in a range of contexts',
                unitSlug: 'unitising-and-coin-recognition-solving-problems-involving-money',
                unitOrder: 2,
              },
            ],
            items: {
              type: 'object',
              properties: {
                unitTitle: { type: 'string', description: 'The unit title' },
                unitSlug: {
                  type: 'string',
                  description: 'The unit slug identifier',
                },
                unitOrder: {
                  type: 'number',
                  description: 'The position of the unit within the thread',
                },
              },
              required: ['unitTitle', 'unitSlug', 'unitOrder'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/threads/{threadSlug}/units',
      originalPath: '/threads/{threadSlug}/units',
      operationId: 'getThreads-getThreadUnits',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'changelog_changelog',
      description: 'History of significant changes to the API with associated dates and versions',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            example: [
              {
                version: '0.5.0',
                date: '2025-03-06',
                changes: [
                  'PPTX used for slideDeck assets',
                  'All video assets now fully downloadable in mp4 format',
                  'New /threads/* endpoints',
                ],
              },
              {
                version: '0.4.0',
                date: '2025-02-07',
                changes: [
                  'Added /sequences/* and /subjects/* endpoints, and add support for unit optionality',
                ],
              },
            ],
            items: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                date: { type: 'string' },
                changes: { type: 'array', items: { type: 'string' } },
              },
              required: ['version', 'date', 'changes'],
            },
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/changelog',
      originalPath: '/changelog',
      operationId: 'changelog-changelog',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'changelog_latest',
      description: 'Get the latest version and latest change note for the API',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          version: { type: 'string' },
          date: { type: 'string' },
          changes: { type: 'array', items: { type: 'string' } },
        },
        required: ['version', 'date', 'changes'],
        example: {
          version: '0.5.0',
          date: '2025-03-06',
          changes: [
            'PPTX used for slideDeck assets',
            'All video assets now fully downloadable in mp4 format',
            'New /threads/* endpoints',
          ],
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/changelog/latest',
      originalPath: '/changelog/latest',
      operationId: 'changelog-latest',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_rate_limit_get_rate_limit',
      description:
        'Check your current rate limit status (note that your rate limit is also included in the headers of every response).\n\nThis specific endpoint does not cost any requests.',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'The maximum number of requests you can make in the current window.',
            example: 1000,
          },
          remaining: {
            type: 'number',
            description: 'The number of requests remaining in the current window.',
            example: 953,
          },
          reset: {
            type: 'number',
            description:
              'The time at which the current window resets, in milliseconds since the Unix epoch.',
            example: 1740164400000,
          },
        },
        required: ['limit', 'remaining', 'reset'],
        example: { limit: 1000, remaining: 953, reset: 1740164400000 },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/rate-limit',
      originalPath: '/rate-limit',
      operationId: 'getRateLimit-getRateLimit',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              scopes: [],
            },
          ],
        },
      ],
    },
  },
] as const;
