import os
import glob
import psycopg2
import json
from pgvector.psycopg2 import register_vector
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings

DB_URL = os.getenv("DATABASE_URL", "dbname=contextops user=postgres")

def init_db(conn):
    with conn.cursor() as cur:
        # Enable vector extension
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        register_vector(conn)
    conn.commit()

def main():
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(DB_URL)
    
    print("Initializing Database and vector extension...")
    init_db(conn)
    
    if not os.path.exists("runbooks"):
        os.makedirs("runbooks")
        print("Created 'runbooks' directory. Please place markdown runbooks there.")
    
    files = glob.glob("runbooks/*.md")
    if os.path.exists("runbook.md"):
        files.append("runbook.md")
        
    if not files:
        print("No runbooks found to ingest!")
        return
        
    print(f"Loading {len(files)} runbook files...")
    all_docs = []
    for filepath in files:
        try:
            loader = TextLoader(filepath)
            docs = loader.load()
            for d in docs:
                d.metadata = {"source": filepath}
            all_docs.extend(docs)
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
            
    print(f"Loaded {len(all_docs)} documents. Splitting into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"Created {len(chunks)} chunks.")
    
    print("Generating embeddings using HuggingFace model...")
    embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    print("Deleting old KnowledgeBase entries...")
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE \"KnowledgeBase\";")
        
        print("Inserting chunks into KnowledgeBase...")
        for chunk in chunks:
            content = chunk.page_content
            metadata = json.dumps(chunk.metadata)
            vector = embeddings_model.embed_query(content)
            
            cur.execute(
                "INSERT INTO \"KnowledgeBase\" (id, content, metadata, embedding) VALUES (gen_random_uuid(), %s, %s, %s)",
                (content, metadata, vector)
            )
    conn.commit()
    conn.close()
    
    print("Ingestion complete!")

if __name__ == "__main__":
    main()
