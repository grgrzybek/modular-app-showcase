import * as React from 'react';
import { useMemo, useState } from "react";
import {
  TreeView,
  TreeViewDataItem,
  Button,
  Flex,
  FlexItem,
  Title,
  Label,
  Checkbox
} from "@patternfly/react-core";

function getSubtreeIds(node, out = []) {
  out.push(node.id);
  node.children?.forEach((c) => getSubtreeIds(c, out));
  return out;
}

/* ---------------------------
   Build raw tree (no flags)
----------------------------*/

function buildRawTree() {
  const make = (prefix: string, depth: number) =>
      depth === 0
          ? undefined
          : Array.from({ length: 2 }).map((_, i) => {
            const id = `${prefix}-${i + 1}`;
            return {
              id,
              name: id,
              children: make(id, depth - 1)
            };
          });

  return make("node", 4);
}

/* ---------------------------
   Flatten helper
----------------------------*/

function flatten(nodes, parent = [], map = {}) {
  nodes.forEach((n) => {
    const path = [...parent, n.id];
    if (n.children) {
      map[n.id] = { node: n, path };
      flatten(n.children, path, map);
    }
  });
  return map;
}

/* ---------------------------
   Apply expansion flags
----------------------------*/

function applyExpanded(nodes, expandedIds) {
  return nodes.map((n) => ({
    ...n,
    defaultExpanded: expandedIds.includes(n.id),
    children: n.children
        ? applyExpanded(n.children, expandedIds)
        : undefined
  }));
}

/* ---------------------------
   Component
----------------------------*/

export default function TreeDemo() {
  const rawTree = useMemo(() => buildRawTree(), []);
  const flat = useMemo(() => flatten(rawTree), [rawTree]);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeItems, setActiveItems] = useState<TreeViewDataItem[]>([]);

  /* IMPORTANT: rebuild data whenever expansion changes */

  const treeData = useMemo(
      () => applyExpanded(rawTree, expandedIds),
      [rawTree, expandedIds]
  );

  const treeKey = expandedIds.join("|"); // force remount

  const allIds = Object.keys(flat);

  /* Expand helpers */

  const expandWithParents = (id: string) => {
    const path = flat[id].path;
    setExpandedIds((prev) =>
        Array.from(new Set([...prev, ...path]))
    );
  };

  /* Tree callbacks */

  const onExpand = (_e, item) =>
      setExpandedIds((prev) => [...prev, item.id]);

  const onCollapse = (_e, item) =>
      setExpandedIds((prev) => prev.filter((x) => x !== item.id));

  const onSelect = (_e, item) =>
      setActiveItems((prev) =>
          prev.includes(item)
              ? prev.filter((x) => x !== item)
              : [...prev, item]
      );

  /* Buttons */

  const expandAll = () => setExpandedIds(allIds);
  const collapseAll = () => setExpandedIds([]);

  /* ------------------- */

  return (
      <Flex style={{ padding: 20 }}>
        {/* LEFT */}
        <FlexItem flex={{ default: "flex_1" }}>
          <Title headingLevel="h2">Tree</Title>

          <TreeView
              key={treeKey}
              data={treeData}
              activeItems={activeItems}
              onSelect={onSelect}
              onExpand={onExpand}
              onCollapse={onCollapse}
              hasGuides
          />
        </FlexItem>

        {/* RIGHT */}
        <FlexItem flex={{ default: "flex_2" }}>
          <Title headingLevel="h2">State</Title>

          <Flex style={{ marginBottom: 20 }}>
            <Button onClick={expandAll}>Expand all</Button>
            <Button variant="secondary" onClick={collapseAll}>
              Collapse all
            </Button>
          </Flex>

          <Title headingLevel="h3">Expanded</Title>
          {expandedIds.map((id) => (
              <Label key={id}>
                {id} — {flat[id].path.join(" / ")}
              </Label>
          ))}

          <Title headingLevel="h3">Table</Title>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Expanded</th>
              </tr>
            </thead>
            <tbody>
              {allIds.map((id) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>
                      <Checkbox id={id} isChecked={expandedIds.includes(id)} onChange={(checked) => {
                        if (checked) {
                          expandWithParents(id);
                        } else {
                          const idsToRemove = getSubtreeIds(flat[id].node);

                          setExpandedIds((prev) =>
                              prev.filter((x) => !idsToRemove.includes(x))
                          );
                          onCollapse(null, id)
                        }
                      }}
                      />
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </FlexItem>
      </Flex>
  );
}
