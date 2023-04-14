/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Subtracts two numbers
 */
export type SubtractInvocation = {
  /**
   * The id of this node. Must be unique among all nodes.
   */
  id: string;
  type?: 'sub';
  /**
   * The first number
   */
  'a'?: number;
  /**
   * The second number
   */
  'b'?: number;
};

