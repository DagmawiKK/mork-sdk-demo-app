'use client';

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';

interface ProGraphProps {
  medications: string[];
  risks: string[]; // Strings like "Warning: Aspirin and Warfarin (High)"
}

export function InteractionGraph({ medications, risks }: ProGraphProps) {
  
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes for each medication
    // Arrange them in a circle or grid
    const radius = 150;
    const centerX = 250;
    const centerY = 200;

    medications.forEach((med, index) => {
      const angle = (index / medications.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      nodes.push({
        id: med,
        data: { label: med },
        position: { x, y },
        style: { background: '#fff', border: '1px solid #777', padding: 10, borderRadius: '5px' },
        type: 'default',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    // Parse risks to create edges
    // Format: "Warning: DrugA and DrugB (Severity)"
    risks.forEach((risk, i) => {
      const involvedMeds = medications.filter(m => risk.includes(m));
      
      if (involvedMeds.length >= 2) {
         edges.push({
           id: `e-${i}`,
           source: involvedMeds[0],
           target: involvedMeds[1],
           label: 'Interacts',
           animated: true,
           style: { stroke: 'red' },
           labelStyle: { fill: 'red', fontWeight: 700 }
         });
      }
    });

    return { nodes, edges };
  }, [medications, risks]);

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '400px' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
