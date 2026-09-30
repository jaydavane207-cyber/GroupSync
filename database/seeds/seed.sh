#!/usr/bin/env bash
# Runs all seed files against the Supabase database
echo "Executing GroupSync Database Seeds..."

psql "$DATABASE_URL" -f users.sql
psql "$DATABASE_URL" -f teams.sql
psql "$DATABASE_URL" -f projects.sql
psql "$DATABASE_URL" -f quizzes.sql

echo "Seed execution completed."
