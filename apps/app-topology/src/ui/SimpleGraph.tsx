import * as React from "react"
import { ComponentType, useEffect, useMemo, useState } from "react"

import {
  BreadthFirstLayout,
  ColaGroupsLayout,
  ColaLayout,
  ConcentricLayout,
  DagreLayout,
  DefaultEdge,
  defaultElementFactory,
  DefaultNode,
  DragObjectWithType,
  Edge,
  EdgeModel,
  EdgeStyle,
  ForceLayout,
  Graph,
  GRAPH_LAYOUT_END_EVENT,
  GraphComponent,
  graphDropTargetSpec,
  GraphElement,
  GridLayout,
  type Model,
  ModelKind,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  Node,
  NodeModel,
  NodeShape,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  withDndDrop,
  withDragNode,
  withPanZoom,
  withTargetDrag
} from "@patternfly/react-topology"
import { Button, ToolbarItem } from '@patternfly/react-core'

const NODES: NodeModel[] = [];
const EDGES: EdgeModel[] = [];

export const SimpleGraphPage: React.FC = () => {

  const [loaded, setLoaded] = useState(false)

  // https://v5-archive.patternfly.org/topology/about-topology
  // https://ialab.it.monash.edu/webcola/index.html

  // 2. Declare a controller, which can be initialized via the useVisualizationController() method.
  // const controller = useVisualizationController()
  // useVisualizationController() takes the Visualization Controller from <ControllerContext.Provider>, but this
  // value is not provided yet
  const controller = useMemo(() => {
    const controller = new Visualization();

    // 6. There are 3 register methods that the controller accesses.
    //    These 2 must be declared explicitly:
    //     - registerLayoutFactory: Sets the layout of your topology view (e.g. Force, Dagre, Cola, etc.).
    //       You can use defaultLayoutFactory as a parameter if your application supports all layouts.
    //       You can also update defaultLayout to a custom implementation if you only want to support a subset
    //       of the available layout options.
    //     - registerComponentFactory: Lets you customize the components in your topology view (e.g. nodes,
    //       groups, and edges). You can use defaultComponentFactory as a parameter.
    //    The remaining method is initialized in Visualization.ts, so it doesn't need to be declared unless
    //    you want to support a custom implementation that modifies the types:
    //     - registerElementFactory: Sets the types of the elements being used (e.g. graphs, nodes, edges).
    //       defaultElementFactory uses types from ModelKind and is exported in index.ts.

    // https://github.com/patternfly/react-topology/blob/v5.4.1/packages/demo-app-ts/src/layouts/defaultLayoutFactory.ts
    controller.registerLayoutFactory((type: string, graph: Graph) => {
      switch (type) {
        case 'BreadthFirst':
          return new BreadthFirstLayout(graph);
        case 'Cola':
          return new ColaLayout(graph);
        case 'ColaNoForce':
          return new ColaLayout(graph, { layoutOnDrag: false });
        case 'Concentric':
          return new ConcentricLayout(graph);
        case 'Dagre':
          return new DagreLayout(graph);
        case 'Force':
          return new ForceLayout(graph);
        case 'Grid':
          return new GridLayout(graph);
        case 'ColaGroups':
          return new ColaGroupsLayout(graph, { layoutOnDrag: false });
        default:
          return new ColaLayout(graph, { layoutOnDrag: false });
      }
    })
    controller.registerComponentFactory((kind: ModelKind, type: string): ComponentType<{ element: GraphElement }> => {
      switch (type) {
          // case 'multi-edge':
          //   return MultiEdge;
          // case 'group':
          //   return Group;
          // case 'group-hull':
          //   return GroupHull;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withDndDrop(graphDropTargetSpec())(withPanZoom()(GraphComponent));
            case ModelKind.node:
              return withDndDrop(nodeDropTargetSpec(['connector-target-drop']))(withDragNode(nodeDragSourceSpec('node', true, true))(DefaultNode));
              // return DefaultNode;
            case ModelKind.edge:
              return withTargetDrag<
                  DragObjectWithType,
                  Node,
                  { dragging?: boolean },
                  {
                    element: Edge;
                  }
              >({
                item: { type: 'connector-target-drop' },
                begin: (_monitor, props) => {
                  props.element.raise();
                  return props.element;
                },
                drag: (event, _monitor, props) => {
                  props.element.setEndPoint(event.x, event.y);
                },
                end: (dropResult, monitor, props) => {
                  if (monitor.didDrop() && dropResult && props) {
                    props.element.setTarget(dropResult);
                  }
                  props.element.setEndPoint();
                },
                collect: monitor => ({
                  dragging: monitor.isDragging()
                })
                // @ts-ignore
              })(DefaultEdge);
              // return DefaultEdge;
            default:
              return undefined;
          }
      }
    })
    controller.registerElementFactory(defaultElementFactory)

    const model: Model = {
      nodes: NODES,
      edges: EDGES,
      graph: {
        id: "g1",
        type: 'graph',
        layout: 'Cola'
      }
    }

    controller.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
      controller.getGraph().fit(80);
    });

    // just as in BrokerDiagram.tsx
    controller.fromModel(model, false)

    return controller
  }, []);

  useEffect(() => {
    if (!loaded) {
      setTimeout(() => {
        setLoaded(true)
      }, 0)
      return
    }
    if (loaded) {
      // 1. First transform your back-end data into a Model object. This will contain the information needed to display
      //    the nodes and edges in your Topology view. Each node and edge contains a set of properties used by Topology,
      //    as well as a data field, which Topology can be used to customize the nodes and edges.
      const newBrokerNodes: NodeModel[] = []
      const newBrokerEdges: EdgeModel[] = []
      const model: Model = {
        nodes: newBrokerNodes,
        edges: newBrokerEdges,
        graph: {
          id: "g1",
          type: 'graph',
          layout: 'Cola'
        }
      }

      newBrokerNodes.push({ id: 'broker', type: ModelKind.node, shape: NodeShape.ellipse, /*x: 200, y: 20, */width: 20, height: 20 })
      for (let n = 0; n < 2; n++) {
        newBrokerNodes.push({ id: `queue-${n}`, type: ModelKind.node, /*x: 20 * n, y: 240, */width: 15, height: 15 })
        newBrokerEdges.push({ id: `edge-${n}`, type: ModelKind.edge, source: 'broker', target: `queue-${n}`, edgeStyle: EdgeStyle.dotted })
        controller.fromModel(model, false)
      }

      // 3. Create nodes by calling the fromModel method on the controller you initialized. fromModel will take the Model
      //    that you created as a parameter. Your data model should include a graph object, on which you will
      //    need to set id, type, and layout.
      // 7. Create nodes by calling the fromModel method on the controller. fromModel will take your data model
      //    as a parameter. Your data model should include a graph object, on which you will
      //    need to set id, type, and layout.
      console.time("[grgr] fromModel")
      controller.fromModel(model, true)
      console.timeEnd("[grgr] fromModel")
    }
  }, [controller, loaded]);

  // react-topology uses useCallback, useMemo and useRef
  // useCallback and useMemo are used to optimize child components (https://18.react.dev/reference/react/useCallback)
  // both accept a function and
  // - useCallback caches the function itself
  // - useMemo caches the function result (so it's called)
  // - memo is better to memoize JSX components than useMemo

  // 4. To create your Topology view component, wrap TopologyView around <VisualizationSurface>, which
  //    can accept a state parameter.
  // 9. Use <VisualizationSurface> to provide the SVG component required for your topology components.
  //    <VisualizationSurface> can take a state parameter, which enables you to pass your state settings
  //    to the controller.
  // const state = {}
  // const surface = (
  //     <TopologyView>
  //       <VisualizationSurface state={state}>
  //       </VisualizationSurface>
  //     </TopologyView>
  // )
  // const surface = (
  //     <VisualizationSurface/>
  // )

  // 5. Wrap your TopologyView with your controller. In the example below, this is done via the
  //    VisualizationProvider which consumes the Controller via context.
  // 8. To create your topology view component, add a <VisualizationProvider>,
  //    which is a useful context provider. It allows access to the created controller and is required
  //    when using the <VisualizationSurface> component.
  //
  // <VisualizationProvider> is <ControllerContext.Provider value={controllerRef.current}>{children}</<ControllerContext.Provider>
  // with a value taken from useRef for passed (or initialized to `new Visualization()`) controller
  // <ControllerContext> is `createContext<Controller>(undefined as any)`
  //
  // GH:patternfly/react-topology/packages/demo-app-ts/src/demos/Basics.tsx shows some components that are:
  // - direct children of <VisualizationProvider>
  // - previous sibling of <VisualizationSurface>
  // such component that provides topology model:
  // - is actually null
  // - calls useComponentFactory hook (so should be in <VisualizationProvider>)
  //   - controller is taken from useContext(ControllerContext)
  //   - useEffect() calls controller.registerComponentFactory(factory), where factory is passed to useComponentFactory()
  // - calls useModel(myModel)
  //   - controller = useVisualizationController() (useContext(ControllerContext))
  //   - useEffect() calls controller.fromModel(myModel)
  // - myModel is memoized
  //
  // From what I see from the demos, <VisualizationProvider> at top level is fine, but adding top-level
  // <TopologyView> is better, as it can share state, provide additional UI elements, so the weirdness of having
  // "null" component preceeding <VisualizationSurface> is not that weird anymore
  const contextToolbar = (
      <ToolbarItem>
        <Button onClick={() => setLoaded(false)}>Refresh</Button>
      </ToolbarItem>
  )
  const viewToolbar = (
      <div>[view toolbar]</div>
  )
  const sideBar = (
      <div>[side bar]</div>
  )
  const controlBar = (
      <div>[control bar]</div>
  )
  return (
      <div id="view">
        <TopologyView contextToolbar={contextToolbar} viewToolbar={viewToolbar}
                      sideBarResizable={true} sideBar={sideBar} sideBarOpen={true}
                      controlBar={controlBar}>
          <VisualizationProvider controller={controller}>
            <VisualizationSurface />
          </VisualizationProvider>
        </TopologyView>
      </div>
  )
}
