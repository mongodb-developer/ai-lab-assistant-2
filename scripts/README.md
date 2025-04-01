# Document Import Script

This script helps you import multiple documents from a directory structure into the MongoDB AI Lab Assistant RAG system. It recursively searches for supported document files, extracts their content, creates chunks, generates embeddings, and stores everything in the database.

## Features

- Recursive directory scanning
- Support for multiple file formats:
  - Markdown (`.md`, `.markdown`)
  - Text files (`.txt`)
  - PDF documents (`.pdf`)
  - Word documents (`.doc`, `.docx`)
- Automatic chunking with configurable size and overlap
- Embedding generation for each chunk
- Uses directory structure as tags
- Dry run option to test without modifying the database

## Prerequisites

Before running the script, make sure:

1. Your MongoDB database is properly configured with the required collections
2. You have the vector search index set up in MongoDB Atlas:
   - Index name: `chunk_embedding_index`
   - Collection: `rag_chunks`
   - Field: `embedding`
   - Dimensions: 1536
   - Similarity metric: `cosine`
3. You have a valid OpenAI API key in your `.env.local` file

## Usage

You can run the script using npm:

```bash
npm run import-docs -- --dir=/path/to/docs --category=YourCategory --tags=tag1,tag2
```

Or directly:

```bash
node scripts/import-docs.js --dir=/path/to/docs --category=YourCategory
```

### Command Line Options

| Option       | Description                              | Default        | Required |
|--------------|------------------------------------------|----------------|----------|
| `--dir`      | Directory path to scan                   | -              | Yes      |
| `--category` | Category for the documents               | -              | Yes      |
| `--tags`     | Comma-separated list of tags             | ""             | No       |
| `--chunk`    | Chunk size in characters                 | 1000           | No       |
| `--overlap`  | Overlap size in characters               | 200            | No       |
| `--author`   | Author name for the documents            | "System Import"| No       |
| `--dryrun`   | Run without making any changes           | false          | No       |

### Examples

Import all markdown files from a docs directory:
```bash
npm run import-docs -- --dir=./docs --category=MongoDB-Labs --tags=tutorials,docs
```

Do a dry run first to check what will be imported:
```bash
npm run import-docs -- --dir=./docs --category=MongoDB-Labs --dryrun
```

Customize chunk size:
```bash
npm run import-docs -- --dir=./docs --category=MongoDB-Labs --chunk=1500 --overlap=300
```

## How it Works

1. The script recursively searches for supported files in the specified directory
2. For each file:
   - Content is extracted based on file type
   - A RagDocument record is created in the database
   - The content is split into chunks with the specified size and overlap
   - Embeddings are generated for each chunk
   - Chunks and embeddings are stored in the RagChunk collection
3. Metadata is automatically added:
   - Directory structure is used as additional tags
   - File name becomes the document title
   - Relative path is recorded in metadata
   - Chunk count is tracked

## Notes

- For large document sets, the script might take a while to run, especially during the embedding generation
- Be mindful of OpenAI API usage limits and costs when processing many files
- Each chunk will consume a separate call to the OpenAI embeddings API