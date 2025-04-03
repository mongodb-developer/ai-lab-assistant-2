import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Configure mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  er: {
    diagramPadding: 20,
    layoutDirection: 'TB',
    minEntityWidth: 100,
    minEntityHeight: 75,
    entityPadding: 15,
    stroke: 'gray',
    fill: '#fefefe',
    fontSize: 12
  }
});

export default function MermaidDiagram({ definition }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !definition) return;

    const renderDiagram = async () => {
      try {
        // Clear the container
        containerRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        containerRef.current.id = id;

        // Convert the raw ERD text into Mermaid format
        const mermaidDef = convertToMermaidERD(definition);
        
        // Render the diagram
        const { svg } = await mermaid.render(id, mermaidDef);
        containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        containerRef.current.innerHTML = '<div class="error">Error rendering diagram</div>';
      }
    };

    renderDiagram();
  }, [definition]);

  // Convert raw ERD text to Mermaid ERD format
  const convertToMermaidERD = (rawText) => {
    // Start with the Mermaid ERD header
    let mermaidCode = 'erDiagram\n';

    // Split the text into entity definitions
    const entities = rawText.split('}').filter(Boolean);

    entities.forEach(entityDef => {
      // Extract entity name and its fields
      const match = entityDef.match(/(\w+)\s*{([\s\S]*)/);
      if (!match) return;

      const [_, entityName, fieldsText] = match;
      const fields = fieldsText.trim().split(/\s+/);

      // Process fields and relationships
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        
        // Handle relationships (fields ending with FK)
        if (field.endsWith('FK')) {
          const relatedEntity = field.replace('FK', '');
          mermaidCode += `${entityName} ||--o{ ${relatedEntity} : references\n`;
        }
        // Add field definitions
        else if (field !== '{') {
          // Skip relationship keywords and special characters
          if (!['object', 'string', 'number', 'boolean', '{', '}'].includes(field)) {
            mermaidCode += `${entityName} {\n    ${field} ${fields[i + 1] || 'string'}\n}\n`;
          }
        }
      }
    });

    return mermaidCode;
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        background: 'white',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    />
  );
} 