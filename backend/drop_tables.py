import sys
import os
sys.path.append(os.getcwd())

from app.database import engine, Base
from sqlalchemy import MetaData, inspect

def drop_all_tables():
    inspector = inspect(engine)
    db_meta = MetaData()
    
    # Get all tables currently in the database
    table_names = inspector.get_table_names()
    print("Tables found in database:", table_names)
    
    if not table_names:
        print("No tables to drop.")
        return
        
    confirm = input("WARNING: This will drop ALL tables in the database. Type 'yes' to confirm: ")
    if confirm.lower() != 'yes':
        print("Aborted.")
        return
        
    # We will reflect the database to get accurate metadata for dropping
    db_meta.reflect(bind=engine)
    print("Dropping all reflected tables...")
    db_meta.drop_all(bind=engine)
    print("All tables dropped successfully!")

if __name__ == "__main__":
    drop_all_tables()
