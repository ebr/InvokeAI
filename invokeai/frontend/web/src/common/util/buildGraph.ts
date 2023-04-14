import { RootState } from 'app/store';
import { InvokeTabName, tabMap } from 'features/ui/store/tabMap';
import { find } from 'lodash';
import {
  Graph,
  ImageToImageInvocation,
  TextToImageInvocation,
} from 'services/api';
import { buildHiResNode, buildImg2ImgNode } from './nodes/image2Image';
import { buildIteration } from './nodes/iteration';
import { buildTxt2ImgNode } from './nodes/text2Image';

function mapTabToFunction(activeTabName: InvokeTabName) {
  switch (activeTabName) {
    case 'txt2img':
      return buildTxt2ImgNode;

    case 'img2img':
      return buildImg2ImgNode;

    default:
      return buildTxt2ImgNode;
  }
}

const buildBaseNode = (
  state: RootState
): Record<string, TextToImageInvocation | ImageToImageInvocation> => {
  const { activeTab } = state.ui;
  const activeTabName = tabMap[activeTab];

  return mapTabToFunction(activeTabName)(state);
};

type BuildGraphOutput = {
  graph: Graph;
  nodeIdsToSubscribe: string[];
};

export const buildGraph = (state: RootState): BuildGraphOutput => {
  const { generation, postprocessing } = state;
  const { iterations } = generation;
  const { hiresFix, hiresStrength } = postprocessing;

  const baseNode = buildBaseNode(state);

  let graph: Graph = { nodes: baseNode };
  const nodeIdsToSubscribe: string[] = [];

  if (iterations > 1) {
    graph = buildIteration({ graph, iterations });
  }

  if (hiresFix) {
    const { node, edge } = buildHiResNode(
      baseNode as Record<string, TextToImageInvocation>,
      hiresStrength
    );
    graph = {
      nodes: {
        ...graph.nodes,
        ...node,
      },
      edges: [...(graph.edges || []), edge],
    };
    nodeIdsToSubscribe.push(Object.keys(node)[0]);
  }

  console.log('buildGraph: ', graph);

  return { graph, nodeIdsToSubscribe };
};
