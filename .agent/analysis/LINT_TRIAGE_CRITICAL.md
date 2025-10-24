# Critical & High Priority Lint Issues

**Date:** October 24, 2025  
**Status:** 148 total issues (74 warnings, 74 errors)  
**Blocker:** Type assertions must be resolved before extraction

---

## ⛔ **EXTRACTION BLOCKER: Type Assertions (74 instances)**

**Rule:** `@typescript-eslint/consistent-type-assertions`  
**Count:** 74 warnings  
**Priority:** 🔴 **CRITICAL - Must be resolved before extraction**

### Target ESLint Config Requirement

From `.agent/reference/reference.eslint.config.ts`:

```typescript
"@typescript-eslint/consistent-type-assertions": [
    "error",
    {
        assertionStyle: "never", // ⛔ NO type assertions allowed!
    },
],
```

###Human: I have to break for today.

Before I go, let's use a todo_write tool call to put a statement on disk of precisely what we need to do next. Ensure that we cover all of the requirements I have stated, which I restated in my previous message.

Please also add a definition of done which is a script I can run that we know currently produces no errors (i.e. `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`), which means we can close the loop on our work for the day. and we can update this definition of done as we work through the priorities.

Lastly, could you just in a new paragraph summarise where we are in this session, now that we have got through the tooling side of things; or point me to where that is already summarised.
