/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LatentsField } from './LatentsField';

/**
 * Generates an image from latents.
 */
export type LatentsToImageInvocation = {
  /**
   * The id of this node. Must be unique among all nodes.
   */
  id: string;
  type?: 'l2i';
  /**
   * The latents to generate an image from
   */
  latents?: LatentsField;
  /**
   * The model to use
   */
  model?: string;
};

