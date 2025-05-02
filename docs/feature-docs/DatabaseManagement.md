# Database Schema Management

## Purpose of schema.sql

The `schema.sql` file in our project serves multiple important purposes:

1. **Version Control**

   - Database structure is tracked in git
   - Changes to schema are documented and reviewable
   - History of database evolution is preserved

2. **Documentation**

   - SQL file documents table structures
   - Field descriptions and constraints are commented
   - Relationships between tables are clearly defined

3. **Reproducibility**

   - Same schema can be used across environments
   - New developers can quickly set up identical database
   - Testing environments can be created consistently

4. **Future Automation Options**
   - Can be used with migration tools like Alembic
   - Could be integrated into CI/CD pipelines
   - Enables infrastructure-as-code practices

## Current Setup

Currently, we're using manual schema application in Supabase's SQL editor. While this works for initial setup, we could improve this process by:

1. Setting up Alembic for database migrations
2. Creating migration scripts for schema changes
3. Automating schema updates in deployment

## Next Steps

Would you like to:

1. Continue with manual schema management for now
2. Set up Alembic for automated migrations
3. Create a script to automate schema application to Supabase

Choose based on your current priorities:

- Manual is simpler for early development
- Alembic adds complexity but better for long term
- Custom script could balance ease and automation
