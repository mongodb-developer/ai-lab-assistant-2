import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { uri, database } = await request.json();

    if (!uri || !database) {
      return NextResponse.json(
        { error: 'MongoDB URI and database name are required' },
        { status: 400 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(database);
    const collections = await db.listCollections().toArray();

    let erdDefinition = 'erDiagram\n';

    for (const collection of collections) {
      const sample = await db
        .collection(collection.name)
        .findOne({}, { projection: { _id: 0 } });

      if (!sample) continue;

      // Get all field names and their types
      const fields = Object.entries(sample).map(([key, value]) => {
        let type = typeof value;
        if (Array.isArray(value)) {
          type = 'array';
        } else if (value instanceof Date) {
          type = 'date';
        } else if (value === null) {
          type = 'null';
        } else if (typeof value === 'object') {
          type = 'object';
        }
        return { name: key, type };
      });

      // Add entity definition
      erdDefinition += `  ${collection.name} {\n`;
      fields.forEach(field => {
        erdDefinition += `    ${field.type} ${field.name}\n`;
      });
      erdDefinition += '  }\n';

      // Look for potential relationships based on field names
      fields.forEach(field => {
        if (field.name.toLowerCase().endsWith('id') || field.name.toLowerCase().endsWith('ids')) {
          const referencedCollection = field.name.toLowerCase()
            .replace('id', '')
            .replace('ids', '')
            .replace('_', '');

          // Check if the referenced collection exists
          if (collections.some(c => c.name.toLowerCase() === referencedCollection)) {
            const relationship = field.type === 'array' ? '||--o{' : '||--||';
            erdDefinition += `  ${collection.name} ${relationship} ${referencedCollection} : references\n`;
          }
        }
      });
    }

    await client.close();

    return NextResponse.json({ erd: erdDefinition });
  } catch (error) {
    console.error('ERD generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ERD: ' + error.message },
      { status: 500 }
    );
  }
} 