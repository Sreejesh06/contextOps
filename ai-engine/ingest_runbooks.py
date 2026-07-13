import os
import psycopg2
from pgvector.psycopg2 import register_vector
from langchain_community.document_loaders import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings

DB_URL = os.getenv("DATABASE_URL", "dbname=contextops user=postgres")

def init_db(conn):
    with conn.cursor() as cur:
        # Enable vector extension
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        # Register the vector type with psycopg2
        register_vector(conn)
        
        # Create KnowledgeBase table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS KnowledgeBase (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                embedding vector(384)
            );
        """)
    conn.commit()

def main():
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(DB_URL)
    
    print("Initializing Database and vector extension...")
    init_db(conn)
    
    print("Loading runbook.md...")
    loader = TextLoader("runbook.md")
    docs = loader.load()
    
    # We will just use the entire markdown file as one chunk for this example
    content = docs[0].page_content
    
    print("Generating embeddings using HuggingFace model...")
    embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Embed the content
    vector = embeddings_model.embed_query(content)
    
    print("Inserting into KnowledgeBase...")
    with conn.cursor() as cur:
        # We use %s for parameterized queries in psycopg2
        cur.execute(
            "INSERT INTO KnowledgeBase (content, embedding) VALUES (%s, %s)",
            (content, vector)
        )
    conn.commit()
    conn.close()
    
    print("Ingestion complete!")

if __name__ == "__main__":
    main()
