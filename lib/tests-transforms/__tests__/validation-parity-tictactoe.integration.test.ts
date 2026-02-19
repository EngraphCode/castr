/**
 * Validation Parity Integration Tests - TicTacToe (3.1 Features)
 *
 * PROVES that generated Zod schemas for OpenAPI 3.1 features validate correctly.
 * Tests enum validation, nested arrays with min/max constraints, and .meta() usage.
 *
 * Key tests:
 * - Enum values (mark: '.', 'X', 'O')
 * - Nested array constraints (board: 3x3 grid, min/max items)
 * - Integer range validation (coordinate: min:1, max:3)
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

// Import generated Zod schemas from tictactoe fixture
import {
  mark as markSchema,
  board as boardSchema,
  coordinate as coordinateSchema,
  status as statusSchema,
  winner as winnerSchema,
  errorMessage as errorMessageSchema,
} from '../__fixtures__/normalized/tictactoe-3.1/zod.js';

// ============================================================================
// Mark Schema Tests (enum: '.', 'X', 'O')
// ============================================================================

describe('Mark Schema Validation (enum)', () => {
  describe('valid data passes', () => {
    it('accepts empty square marker: "."', () => {
      expect(() => markSchema.parse('.')).not.toThrow();
    });

    it('accepts X marker', () => {
      expect(() => markSchema.parse('X')).not.toThrow();
    });

    it('accepts O marker', () => {
      expect(() => markSchema.parse('O')).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for invalid enum value: lowercase "x"', () => {
      expect(() => markSchema.parse('x')).toThrow();
    });

    it('throws for invalid enum value: lowercase "o"', () => {
      expect(() => markSchema.parse('o')).toThrow();
    });

    it('throws for invalid enum value: empty string', () => {
      expect(() => markSchema.parse('')).toThrow();
    });

    it('throws for invalid enum value: number', () => {
      expect(() => markSchema.parse(1)).toThrow();
    });
  });
});

// ============================================================================
// Coordinate Schema Tests (integer, min:1, max:3)
// ============================================================================

describe('Coordinate Schema Validation (integer range)', () => {
  describe('valid data passes', () => {
    it('accepts minimum value: 1', () => {
      expect(() => coordinateSchema.parse(1)).not.toThrow();
    });

    it('accepts middle value: 2', () => {
      expect(() => coordinateSchema.parse(2)).not.toThrow();
    });

    it('accepts maximum value: 3', () => {
      expect(() => coordinateSchema.parse(3)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for value below minimum: 0', () => {
      expect(() => coordinateSchema.parse(0)).toThrow();
    });

    it('throws for value above maximum: 4', () => {
      expect(() => coordinateSchema.parse(4)).toThrow();
    });

    it('throws for non-integer value: 1.5', () => {
      expect(() => coordinateSchema.parse(1.5)).toThrow();
    });

    it('throws for negative value: -1', () => {
      expect(() => coordinateSchema.parse(-1)).toThrow();
    });

    it('throws for string value: "1"', () => {
      expect(() => coordinateSchema.parse('1')).toThrow();
    });
  });
});

// ============================================================================
// Board Schema Tests (array of arrays, 3x3 grid with min/max constraints)
// ============================================================================

describe('Board Schema Validation (nested arrays with constraints)', () => {
  describe('valid data passes', () => {
    it('accepts valid 3x3 board with empty squares', () => {
      const validBoard = [
        ['.', '.', '.'],
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(validBoard)).not.toThrow();
    });

    it('accepts valid 3x3 board with mixed markers', () => {
      const validBoard = [
        ['X', '.', 'O'],
        ['.', 'X', '.'],
        ['O', '.', 'X'],
      ];

      expect(() => boardSchema.parse(validBoard)).not.toThrow();
    });
  });

  describe('invalid data throws (array size constraints)', () => {
    it('throws for board with too few rows (2 rows)', () => {
      const invalidBoard = [
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });

    it('throws for board with too many rows (4 rows)', () => {
      const invalidBoard = [
        ['.', '.', '.'],
        ['.', '.', '.'],
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });

    it('throws for row with too few columns (2 columns)', () => {
      const invalidBoard = [
        ['.', '.'],
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });

    it('throws for row with too many columns (4 columns)', () => {
      const invalidBoard = [
        ['.', '.', '.', '.'],
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });

    it('throws for invalid mark value in board', () => {
      const invalidBoard = [
        ['X', 'Y', 'O'], // 'Y' is not a valid mark
        ['.', '.', '.'],
        ['.', '.', '.'],
      ];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });

    it('throws for empty board', () => {
      const invalidBoard: unknown[] = [];

      expect(() => boardSchema.parse(invalidBoard)).toThrow();
    });
  });
});

// ============================================================================
// Winner Schema Tests (same enum as mark, used for game state)
// ============================================================================

describe('Winner Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts no winner yet: "."', () => {
      expect(() => winnerSchema.parse('.')).not.toThrow();
    });

    it('accepts X as winner', () => {
      expect(() => winnerSchema.parse('X')).not.toThrow();
    });

    it('accepts O as winner', () => {
      expect(() => winnerSchema.parse('O')).not.toThrow();
    });
  });
});

// ============================================================================
// Status Schema Tests (object with optional winner and board)
// ============================================================================

describe('Status Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts empty object (all fields optional)', () => {
      expect(() => statusSchema.parse({})).not.toThrow();
    });

    it('accepts object with only winner', () => {
      expect(() => statusSchema.parse({ winner: 'X' })).not.toThrow();
    });

    it('accepts object with winner and board', () => {
      const validStatus = {
        winner: 'X',
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['X', 'O', 'X'],
        ],
      };

      expect(() => statusSchema.parse(validStatus)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for extra properties (strict mode)', () => {
      expect(() => statusSchema.parse({ winner: 'X', extra: 'field' })).toThrow();
    });

    it('throws for invalid winner value', () => {
      expect(() => statusSchema.parse({ winner: 'Z' })).toThrow();
    });
  });
});

// ============================================================================
// ErrorMessage Schema Tests (string with maxLength 256)
// ============================================================================

describe('ErrorMessage Schema Validation (string maxLength)', () => {
  describe('valid data passes', () => {
    it('accepts short error message', () => {
      expect(() => errorMessageSchema.parse('Not found')).not.toThrow();
    });

    it('accepts error message at exactly 256 characters', () => {
      const maxLengthMessage = 'a'.repeat(256);
      expect(() => errorMessageSchema.parse(maxLengthMessage)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for error message exceeding 256 characters', () => {
      const tooLongMessage = 'a'.repeat(257);
      expect(() => errorMessageSchema.parse(tooLongMessage)).toThrow();
    });

    it('throws for non-string value', () => {
      expect(() => errorMessageSchema.parse(123)).toThrow();
    });
  });
});
