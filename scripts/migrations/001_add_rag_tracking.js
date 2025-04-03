const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate(dryRun = false) {
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB');

    // Check if collections already exist
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);

    // Create new collections only if they don't exist
    console.log('Creating new collections if they don\'t exist...');
    const collectionsToCreate = ['ragUsageMetrics', 'feedback', 'settings', 'libraries'];
    
    for (const collection of collectionsToCreate) {
      if (!existingCollections.includes(collection)) {
        if (dryRun) {
          console.log(`[DRY RUN] Would create collection: ${collection}`);
        } else {
          await db.createCollection(collection);
          console.log(`Created collection: ${collection}`);
        }
      } else {
        console.log(`Collection ${collection} already exists, skipping creation`);
      }
    }

    // Create indexes (this is safe to run multiple times)
    console.log('Creating/updating indexes...');
    const indexOperations = [
      {
        collection: 'ragUsageMetrics',
        indexes: [
          { key: { document_id: 1 } },
          { key: { chunk_id: 1 } },
          { key: { user_id: 1 } },
          { key: { chat_session_id: 1 } },
          { key: { created_at: 1 } }
        ]
      },
      {
        collection: 'feedback',
        indexes: [
          { key: { user_id: 1 } },
          { key: { workshop_id: 1 } },
          { key: { module_id: 1 } },
          { key: { created_at: 1 } }
        ]
      },
      {
        collection: 'settings',
        indexes: [
          { key: { key: 1 }, unique: true }
        ]
      },
      {
        collection: 'libraries',
        indexes: [
          { key: { name: 1 }, unique: true }
        ]
      }
    ];

    for (const op of indexOperations) {
      if (dryRun) {
        console.log(`[DRY RUN] Would create indexes for ${op.collection}:`, op.indexes);
      } else {
        await db.collection(op.collection).createIndexes(op.indexes, { background: true });
        console.log(`Created indexes for ${op.collection}`);
      }
    }

    // Add user_id field to existing chat sessions only if it doesn't exist
    console.log('Updating existing chat sessions...');
    const chatSessions = await db.collection('chatSessions').find({ user_id: { $exists: false } }).toArray();
    if (dryRun) {
      console.log(`[DRY RUN] Would update ${chatSessions.length} chat sessions with user_id: 'anonymous'`);
    } else {
      const result = await db.collection('chatSessions').updateMany(
        { user_id: { $exists: false } },
        { $set: { user_id: 'anonymous' } }
      );
      console.log(`Updated ${result.modifiedCount} chat sessions`);
    }

    console.log(dryRun ? 'Dry run completed successfully' : 'Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function rollback(dryRun = false) {
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB');

    // Instead of dropping collections, we'll just remove the user_id field
    // from chat sessions that were set to 'anonymous'
    console.log('Rolling back chat sessions...');
    const chatSessions = await db.collection('chatSessions').find({ user_id: 'anonymous' }).toArray();
    if (dryRun) {
      console.log(`[DRY RUN] Would remove user_id field from ${chatSessions.length} chat sessions`);
    } else {
      const result = await db.collection('chatSessions').updateMany(
        { user_id: 'anonymous' },
        { $unset: { user_id: "" } }
      );
      console.log(`Rolled back ${result.modifiedCount} chat sessions`);
    }

    // Note: We're not dropping any collections to preserve data
    console.log(dryRun ? 'Dry run completed successfully' : 'Rollback completed successfully');
    console.log('Note: Collections were not dropped to preserve data');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const action = args.find(arg => arg !== '--dry-run');

  if (action === 'rollback') {
    rollback(isDryRun).catch(console.error);
  } else {
    migrate(isDryRun).catch(console.error);
  }
}

module.exports = { migrate, rollback }; 