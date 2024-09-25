import psycopg2
import os
import pandas as pd
import numpy as np

def normalize_vector(v):
    norm = np.linalg.norm(v)
    if norm == 0: 
        return v  # Handle the case of zero vector
    return v / norm

def string_to_vector(vector_string):
    return [float(x) for x in vector_string.strip('[]').split(',')]

# Connect to PostgreSQL
conn = psycopg2.connect(
    user="postgres.hqeqjrbzmachofyfobed", password=os.getenv('SALTA_PG_PASSWORD'), host="aws-0-us-west-1.pooler.supabase.com", port=5432, dbname="postgres"
)
cur = conn.cursor()

# Step 1: Fetch id and 3072-dimensional vectors from the `company_profile` table
# cur.execute("SELECT id, web_summary_emb FROM company_profile WHERE web_summary_emb IS NOT NULL AND emb_v2 IS NULL")
cur.execute("SELECT id, web_summary_emb FROM company_profile WHERE web_summary_emb IS NOT NULL")
rows = cur.fetchall()




# Step 2: Truncate the vectors to 1536 dimensions
for row in rows:
    row_id = row[0]  # Assuming `id` is the first column
    vector = string_to_vector(row[1])  # Assuming `web_summary_emb` is the second column
    
    
    
    # Truncate the vector to 1536 dimensions
    truncated_vector = normalize_vector(vector[:1536]).tolist()
    
    # Step 3: Update the new column `emb_v2` with the truncated vector
    cur.execute("UPDATE company_profile SET emb_v2 = %s WHERE id = %s", (truncated_vector, row_id))

# Commit changes to the database
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Vector truncation and update complete.")
