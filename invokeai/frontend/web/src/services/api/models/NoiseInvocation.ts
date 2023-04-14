/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Generates latent noise.
 */
export type NoiseInvocation = {
  /**
   * The id of this node. Must be unique among all nodes.
   */
  id: string;
  type?: 'noise';
  /**
   * The seed to use
   */
  seed?: number;
  /**
   * The width of the resulting noise
   */
  width?: number;
  /**
   * The height of the resulting noise
   */
  height?: number;
};

