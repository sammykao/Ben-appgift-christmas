# Managing Workout Types and Journal Questions

This document provides a comprehensive guide for adding, modifying, and managing workout types and journal questions in The MentalPitch database.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Understanding the Schema](#understanding-the-schema)
3. [Adding System Default Workout Types](#adding-system-default-workout-types)
4. [Adding System Default Questions](#adding-system-default-questions)
5. [User Customization via API](#user-customization-via-api)
6. [Modifying Existing Data](#modifying-existing-data)
7. [Best Practices](#best-practices)
8. [Migration Strategy](#migration-strategy)

---

## Architecture Overview

### Design Principles

The workout types and questions system follows a **dual-layer architecture**:

1. **System Defaults Layer**: Immutable, app-provided defaults (owner_id = null, is_system_default = true)
2. **User Customization Layer**: Mutable, user-created customizations (owner_id = auth.uid(), is_system_default = false)

### Why This Architecture?

**Separation of Concerns**: System defaults provide a consistent baseline experience while allowing users to personalize their journaling workflow.

**Security**: Row-Level Security (RLS) policies automatically filter data based on ownership. Users can read system defaults but cannot modify them. Users can only modify their own custom types/questions.

**Performance**: System defaults are cached and rarely change, reducing database load. User customizations are scoped per user, enabling efficient queries.

**Scalability**: New system defaults can be added via migrations without affecting existing user data. User customizations are isolated per user.

**Maintainability**: Clear distinction between app-provided and user-provided data simplifies debugging and support.

---

## Understanding the Schema

### Workout Types Table (`workout_types`)

```sql
CREATE TABLE public.workout_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 100,
  is_system_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Key Fields**:
- `owner_id`: `null` = system default, `uuid` = user-owned
- `is_system_default`: `true` = system-provided, `false` = user-created
- `sort_order`: Lower values appear first (used for UI ordering)
- Unique constraint: `(owner_id, lower(name))` prevents duplicate names per owner

### Journal Questions Table (`journal_questions`)

```sql
CREATE TABLE public.journal_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  workout_type_id uuid REFERENCES public.workout_types(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  help_text text,
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  is_system_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Key Fields**:
- `workout_type_id`: `null` = generic question (applies to all types), `uuid` = type-specific
- `prompt`: The actual question text shown to users
- `help_text`: Optional guidance or clarification
- `sort_order`: Controls display order within a workout type

**Relationships**:
- Many-to-one with `workout_types` (optional, null = generic)
- One-to-many with `journal_entry_answers` (answers reference questions)

---

## Adding System Default Workout Types

### Method 1: SQL Migration (Recommended for Production)

Create a new migration file in `db/`:

```sql
-- db/009_add_new_workout_type.sql
-- Example: Adding a "Meditation" workout type

INSERT INTO public.workout_types (
  id,
  owner_id,
  name,
  description,
  sort_order,
  is_system_default
)
VALUES (
  gen_random_uuid(),
  NULL, -- System default
  'Meditation',
  'Mindfulness and meditation sessions.',
  70, -- After Imagery (60), before any user customizations (100+)
  true
)
ON CONFLICT DO NOTHING;
```

**Why ON CONFLICT DO NOTHING?**: Makes migrations idempotent. Safe to run multiple times without errors.

**Sort Order Strategy**: 
- System defaults: 10-90 (in increments of 10 for flexibility)
- User customizations: 100+ (auto-assigned)
- Lower numbers appear first in UI

### Method 2: Direct Database Insert (Development Only)

```sql
INSERT INTO public.workout_types (owner_id, name, description, sort_order, is_system_default)
VALUES (NULL, 'Meditation', 'Mindfulness sessions', 70, true);
```

**When to Use**: Quick testing in development. Never use in production without a migration.

### Verification

```sql
-- Check if workout type was added
SELECT * FROM public.workout_types 
WHERE name = 'Meditation' AND owner_id IS NULL;

-- Verify RLS (should only see system defaults + your own)
SELECT * FROM public.workout_types;
```

---

## Adding System Default Questions

### Method 1: SQL Migration (Recommended)

```sql
-- db/010_add_meditation_questions.sql
-- Adding questions for the Meditation workout type

WITH wt AS (
  SELECT id FROM public.workout_types 
  WHERE name = 'Meditation' AND owner_id IS NULL
  LIMIT 1
)
INSERT INTO public.journal_questions (
  owner_id,
  workout_type_id,
  prompt,
  help_text,
  is_required,
  sort_order,
  is_system_default
)
SELECT
  NULL, -- System default
  wt.id,
  'How did I feel before starting my meditation?',
  NULL,
  false,
  10,
  true
FROM wt
UNION ALL
SELECT
  NULL,
  wt.id,
  'What was my primary focus during meditation?',
  'E.g., breath, body scan, visualization',
  false,
  20,
  true
FROM wt
UNION ALL
SELECT
  NULL,
  wt.id,
  'How do I feel after completing my meditation?',
  NULL,
  false,
  30,
  true
FROM wt
ON CONFLICT DO NOTHING;
```

**Architecture Note**: Using CTE (Common Table Expression) with `wt` ensures we reference the correct workout_type_id even if IDs change between environments.

### Method 2: Generic Questions (Not Tied to a Workout Type)

```sql
-- Generic questions apply to all workout types
INSERT INTO public.journal_questions (
  owner_id,
  workout_type_id, -- NULL = generic
  prompt,
  sort_order,
  is_system_default
)
VALUES
  (NULL, NULL, 'What was my energy level today?', 5, true),
  (NULL, NULL, 'Did I achieve my goals for this session?', 10, true)
ON CONFLICT DO NOTHING;
```

**Use Case**: Questions that make sense across all workout types (e.g., mood, energy level).

### Question Organization Strategy

**Sort Order Guidelines**:
- Generic questions: 1-9 (appear first)
- Type-specific questions: 10, 20, 30... (increments of 10 for flexibility)
- Lower sort_order = appears first in UI

**Question Design Principles**:
1. **Clarity**: Questions should be unambiguous and easy to understand
2. **Actionability**: Answers should provide insights for improvement
3. **Consistency**: Similar workout types should have similar question structures
4. **Brevity**: Keep prompts concise but informative

---

## User Customization via API

Users can create custom workout types and questions through the API layer. This is handled automatically by RLS policies.

### Example: User Creates Custom Workout Type

```typescript
import { createWorkoutType } from '@/api';

const customType = await createWorkoutType({
  name: 'Yoga',
  description: 'Yoga practice sessions',
  sort_order: 100 // User customizations start at 100+
});
```

**What Happens**:
- `owner_id` is automatically set to `auth.uid()` (via RLS default)
- `is_system_default` is forced to `false` (enforced in API)
- RLS policy ensures user can only read their own custom types

### Example: User Creates Custom Questions

```typescript
import { createQuestion } from '@/api';

const question = await createQuestion({
  workout_type_id: customType.id,
  prompt: 'What yoga poses did I practice today?',
  help_text: 'List the main poses or sequences',
  sort_order: 10
});
```

**Architecture Note**: Users can create questions for:
1. System default workout types (personalizing defaults)
2. Their own custom workout types
3. Generic questions (workout_type_id = null)

---

## Modifying Existing Data

### Modifying System Defaults

**CRITICAL**: System defaults should NEVER be modified directly in production. Instead:

1. **Create a new migration** that updates the data
2. **Document the change** and reason
3. **Test thoroughly** in staging first

```sql
-- db/011_update_training_question.sql
-- Example: Updating a question prompt

UPDATE public.journal_questions
SET prompt = 'Did I feel focused and present during practice today?'
WHERE prompt = 'Did I feel focused during practice today?'
  AND workout_type_id IN (
    SELECT id FROM public.workout_types WHERE name = 'Training' AND owner_id IS NULL
  )
  AND owner_id IS NULL
  AND is_system_default = true;
```

**Why This Approach?**:
- Version control: Changes are tracked in git
- Rollback: Can revert migrations if needed
- Audit trail: Clear history of what changed and when
- Testing: Can test migrations in staging before production

### Modifying User Customizations

Users modify their own customizations via the API:

```typescript
import { updateWorkoutType, updateQuestion } from '@/api';

// Update custom workout type
await updateWorkoutType(customTypeId, {
  name: 'Advanced Yoga',
  description: 'Advanced yoga practices'
});

// Update custom question
await updateQuestion(questionId, {
  prompt: 'What advanced poses did I attempt?',
  sort_order: 15
});
```

**RLS Enforcement**: Users can only update their own customizations. System defaults are protected.

---

## Best Practices

### 1. Naming Conventions

**Workout Types**:
- Use title case: "Training", "Game", "Meditation"
- Be specific: "Strength Training" not "Workout"
- Avoid duplicates: Check existing names before adding

**Questions**:
- Start with action words: "Did I...", "What did I...", "How did I..."
- Keep prompts under 100 characters when possible
- Use consistent phrasing across similar workout types

### 2. Sort Order Management

**System Defaults**:
- Reserve 10-90 for system defaults (increments of 10)
- Leave gaps (10, 20, 30...) for future insertions
- Document sort order decisions in migration comments

**User Customizations**:
- Auto-assign 100+ for user-created items
- Users can reorder via `updateWorkoutType` / `updateQuestion`

### 3. Question Design

**Effective Questions**:
- Focus on reflection and learning
- Encourage specific, actionable answers
- Balance open-ended and structured prompts

**Question Types**:
- **Yes/No**: "Did I feel focused?" (simple, quick)
- **Reflection**: "What did I do well?" (open-ended, detailed)
- **Rating**: "How motivated was I? (1-10)" (quantitative)
- **Action**: "What will I work on next time?" (forward-looking)

### 4. Performance Considerations

**Indexing**:
- Queries filter by `owner_id` and `workout_type_id` (both indexed)
- `sort_order` is indexed for efficient ordering
- Use `SELECT` with specific columns when possible (not `SELECT *`)

**Caching Strategy**:
- System defaults rarely change → cache aggressively
- User customizations change frequently → cache with short TTL
- Invalidate cache on user customization updates

### 5. Security Best Practices

**RLS Policies**:
- Never disable RLS (security risk)
- Test RLS policies in staging before production
- Document any RLS policy changes

**Data Validation**:
- Validate input at API layer (before database)
- Use database constraints as defense-in-depth
- Sanitize user input to prevent injection

---

## Migration Strategy

### Development Workflow

1. **Create Migration File**: `db/XXX_description.sql`
2. **Write SQL**: Use idempotent patterns (`ON CONFLICT DO NOTHING`)
3. **Test Locally**: Run migration against local database
4. **Verify**: Check data integrity and RLS behavior
5. **Commit**: Include migration in version control

### Production Deployment

1. **Review**: Code review all migrations
2. **Backup**: Backup production database (safety measure)
3. **Staging**: Test migration in staging environment first
4. **Deploy**: Run migrations in production during low-traffic window
5. **Monitor**: Watch for errors or performance issues
6. **Verify**: Confirm data integrity post-migration

### Rollback Strategy

**If Migration Fails**:
1. Identify the failure point
2. Manually fix data if needed
3. Document the issue
4. Create a rollback migration if necessary

**Rollback Migration Example**:
```sql
-- db/012_rollback_meditation_type.sql
-- Remove Meditation workout type if needed

DELETE FROM public.journal_questions
WHERE workout_type_id IN (
  SELECT id FROM public.workout_types WHERE name = 'Meditation' AND owner_id IS NULL
);

DELETE FROM public.workout_types
WHERE name = 'Meditation' AND owner_id IS NULL;
```

**Note**: Only rollback system defaults. User customizations should remain intact.

---

## Common Patterns

### Pattern 1: Adding a Complete Workout Type with Questions

```sql
-- Step 1: Add workout type
INSERT INTO public.workout_types (owner_id, name, description, sort_order, is_system_default)
VALUES (NULL, 'NewType', 'Description', 70, true)
ON CONFLICT DO NOTHING;

-- Step 2: Add questions for that type
WITH wt AS (SELECT id FROM public.workout_types WHERE name = 'NewType' AND owner_id IS NULL LIMIT 1)
INSERT INTO public.journal_questions (owner_id, workout_type_id, prompt, sort_order, is_system_default)
SELECT NULL, wt.id, 'Question 1?', 10, true FROM wt
UNION ALL
SELECT NULL, wt.id, 'Question 2?', 20, true FROM wt
ON CONFLICT DO NOTHING;
```

### Pattern 2: Adding Questions to Existing Workout Type

```sql
WITH wt AS (
  SELECT id FROM public.workout_types 
  WHERE name = 'Training' AND owner_id IS NULL 
  LIMIT 1
)
INSERT INTO public.journal_questions (owner_id, workout_type_id, prompt, sort_order, is_system_default)
SELECT NULL, wt.id, 'New question?', 70, true FROM wt
ON CONFLICT DO NOTHING;
```

### Pattern 3: Reordering Questions

```sql
-- Update sort_order to reorder
UPDATE public.journal_questions
SET sort_order = 15
WHERE prompt = 'Specific question text'
  AND workout_type_id = (SELECT id FROM public.workout_types WHERE name = 'Training' AND owner_id IS NULL)
  AND owner_id IS NULL;
```

---

## Troubleshooting

### Issue: Duplicate Workout Type Names

**Symptom**: Error "duplicate key value violates unique constraint"

**Cause**: Unique constraint on `(owner_id, lower(name))`

**Solution**: 
- For system defaults: Use different name or check existing
- For user customizations: API handles this automatically

### Issue: Questions Not Appearing

**Checklist**:
1. Verify `workout_type_id` matches correct workout type
2. Check `sort_order` (lower = appears first)
3. Verify RLS policies allow read access
4. Confirm `is_system_default = true` for system questions

### Issue: Cannot Modify System Defaults

**Expected Behavior**: System defaults are read-only for users

**Solution**: 
- Users should create custom questions instead
- System defaults can only be modified via migrations (admin/developer)

---

## Summary

**Key Takeaways**:

1. **System Defaults**: Added via SQL migrations, immutable by users, version-controlled
2. **User Customizations**: Created via API, mutable by users, scoped per user
3. **RLS Security**: Automatic filtering ensures users only see/modify appropriate data
4. **Performance**: Indexed queries and caching strategies optimize read operations
5. **Maintainability**: Clear separation between system and user data simplifies management

**When to Add System Defaults**:
- New workout types needed by all users
- New questions that improve the default experience
- Bug fixes or improvements to existing defaults

**When Users Should Customize**:
- Personal preferences for question wording
- Additional questions specific to their needs
- Custom workout types not provided by the app

This architecture provides a robust foundation for both consistent defaults and flexible personalization.
