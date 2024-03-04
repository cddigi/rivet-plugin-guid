// **** IMPORTANT ****
// Make sure you do `import type` and do not pull in the entire Rivet core library here.
// Export a function that takes in a Rivet object, and you can access rivet library functionality
// from there.
import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

// This defines your new type of node.
export type GuidPluginNode = ChartNode<"guidPlugin", GuidPluginNodeData>;

// This defines the data that your new node will store.
export type GuidPluginNodeData = {
  guid: string;
  uppercase: boolean;
  useUppercase?: boolean;
  version: string;
};

// Make sure you export functions that take in the Rivet library, so that you do not
// import the entire Rivet core library in your plugin.
export function guidPluginNode(rivet: typeof Rivet) {
  const GuidPluginNodeImpl: PluginNodeImpl<GuidPluginNode> = {
    create(): GuidPluginNode {
      const node: GuidPluginNode = {
        id: rivet.newId<NodeId>(),
        data: {
          guid: "",
          uppercase: false,
          version: "v4",
        },
        title: "GUID",
        type: "guidPlugin",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(
      data: GuidPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project,
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useUppercase) {
        inputs.push({
          id: "uppercase" as PortId,
          dataType: "boolean",
          title: "Uppercase",
        });
      }

      return inputs;
    },

    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(
      _data: GuidPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project,
    ): NodeOutputDefinition[] {
      return [
        {
          id: "guid" as PortId,
          dataType: "string",
          title: "GUID",
        },
      ];
    },

    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "GUID",
        group: "Text",
        infoBoxBody:
          "Output a version 1 (date-time and MAC address) or 4 (random) GUID.",
        infoBoxTitle: "GUID Plugin",
      };
    },

    // This function defines all editors that appear when you edit your node.
    getEditors(_data: GuidPluginNodeData): EditorDefinition<GuidPluginNode>[] {
      return [
        {
          type: "toggle",
          dataKey: "uppercase",
          useInputToggleDataKey: "useUppercase",
          label: "Uppercase",
        },
        {
          type: "dropdown",
          dataKey: "version",
          label: "Version",
          options: [
            { value: "v1", label: "Version 1 (date-time and MAC address)" },
            { value: "v4", label: "Version 4 (random)" },
          ],
        },
      ];
    },

    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(
      data: GuidPluginNodeData,
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        GUID
        Version: ${data.version}
        Uppercase: ${data.useUppercase ? "(Using Input)" : data.uppercase}
      `;
    },

    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(
      data: GuidPluginNodeData,
      inputData: Inputs,
      _context: InternalProcessContext,
    ): Promise<Outputs> {
      const ver = rivet.getInputOrData(data, inputData, "version", "string");
      const upper = rivet.getInputOrData(
        data,
        inputData,
        "uppercase",
        "boolean",
      );
      if (ver === "v1") {
        const guid = generateUUIDv1();
        if (upper) {
          return {
            ["guid" as PortId]: {
              type: "string",
              value: guid.toUpperCase(),
            },
          };
        } else {
          return {
            ["guid" as PortId]: {
              type: "string",
              value: guid,
            },
          };
        }
      } else {
        const guid = generateUUIDv4();
        if (upper) {
          return {
            ["guid" as PortId]: {
              type: "string",
              value: guid.toUpperCase(),
            },
          };
        } else {
          return {
            ["guid" as PortId]: {
              type: "string",
              value: guid,
            },
          };
        }
      }
    },
  };

  // Once a node is defined, you must pass it to rivet.pluginNodeDefinition, which will return a valid
  // PluginNodeDefinition object.
  const guidPluginNode = rivet.pluginNodeDefinition(
    GuidPluginNodeImpl,
    "Create GUID",
  );

  // This definition should then be used in the `register` function of your plugin definition.
  return guidPluginNode;
}

function generateUUIDv1(): string {
  const timestamp = Date.now();
  const machineIdentifier = Math.floor(Math.random() * 0xffffff);
  return `${timestamp}-${machineIdentifier}-1xxx-yxxx-xxxxxxxxxxxx`.replace(
    /[xy]/g,
    function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
}

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
