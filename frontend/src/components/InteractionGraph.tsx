'use client';

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';

export interface RiskItem {
  drugA: string;
  drugB: string;
  severity: string;
  description: string;
}

interface ProGraphProps {
  medications: string[];
  risks: RiskItem[]; 
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

    // We need all unique drugs from both medications AND risks to ensure all nodes exist
    const uniqueDrugs = new Set(medications);
    risks.forEach(r => {
      uniqueDrugs.add(r.drugA);
      uniqueDrugs.add(r.drugB);
    });
    
    const allDrugs = Array.from(uniqueDrugs);

    allDrugs.forEach((med, index) => {
      const angle = (index / allDrugs.length) * 2 * Math.PI;
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
    risks.forEach((risk, i) => {
      // Color coding based on severity
      let strokeColor = '#777';
      if (risk.severity.toLowerCase() === 'high') strokeColor = 'red';
      else if (risk.severity.toLowerCase() === 'moderate') strokeColor = 'orange';
      else if (risk.severity.toLowerCase() === 'low') strokeColor = 'yellow';

      edges.push({
        id: `e-${i}`,
        source: risk.drugA,
        target: risk.drugB,
        label: risk.severity,
        animated: true,
        style: { stroke: strokeColor, strokeWidth: 2 },
        labelStyle: { fill: strokeColor, fontWeight: 700 }
      });
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
