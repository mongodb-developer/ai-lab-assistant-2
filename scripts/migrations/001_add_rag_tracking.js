const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate() {
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB');

    // Create new collections
    console.log('Creating new collections...');
    await db.createCollection('ragUsageMetrics');
    await db.createCollection('feedback');
    await db.createCollection('settings');
    await db.createCollection('libraries');

    // Create indexes
    console.log('Creating indexes...');
    await db.collection('ragUsageMetrics').createIndexes([
      { key: { document_id: 1 } },
      { key: { chunk_id: 1 } },
      { key: { user_id: 1 } },
      { key: { chat_session_id: 1 } },
      { key: { created_at: 1 } }
    ]);

    await db.collection('feedback').createIndexes([
      { key: { user_id: 1 } },
      { key: { workshop_id: 1 } },
      { key: { module_id: 1 } },
      { key: { created_at: 1 } }
    ]);

    await db.collection('settings').createIndexes([
      { key: { key: 1 }, unique: true }
    ]);

    await db.collection('libraries').createIndexes([
      { key: { name: 1 }, unique: true }
    ]);

    // Add user_id field to existing chat sessions
    console.log('Updating existing chat sessions...');
    const result = await db.collection('chatSessions').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: 'anonymous' } }
    );
    console.log(`Updated ${result.modifiedCount} chat sessions`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function rollback() {
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB');

    // Drop new collections
    console.log('Dropping new collections...');
    await db.collection('ragUsageMetrics').drop();
    await db.collection('feedback').drop();
    await db.collection('settings').drop();
    await db.collection('libraries').drop();

    // Remove user_id field from chat sessions
    console.log('Rolling back chat sessions...');
    const result = await db.collection('chatSessions').updateMany(
      { user_id: 'anonymous' },
      { $unset: { user_id: "" } }
    );
    console.log(`Rolled back ${result.modifiedCount} chat sessions`);

    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  const action = process.argv[2];
  if (action === 'rollback') {
    rollback().catch(console.error);
  } else {
    migrate().catch(console.error);
  }
}

module.exports = { migrate, rollback }; 