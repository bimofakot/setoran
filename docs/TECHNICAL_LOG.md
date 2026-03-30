# Technical Log - Keuanganku Development Session

**Read this in:** [English](TECHNICAL_LOG.md) | [Bahasa Indonesia](TECHNICAL_LOG.id.md)

**Date:** 31 Maret 2026  
**Project:** Keuanganku - Personal Finance Tracking Application  
**Tech Stack:** React 19 | TypeScript | Tailwind CSS v4 | Firebase | Vite

---

## Table of Contents

1. [Firebase Timestamp Type Mismatch](#firebase-timestamp-type-mismatch)
2. [TypeScript Type Error in Date Range Filter](#typescript-type-error-in-date-range-filter)
3. [Unused Variable Cleanup](#unused-variable-cleanup)
4. [Key Learnings](#key-learnings)

---

## Firebase Timestamp Type Mismatch

### Problem

When implementing Firestore CRUD operations in `src/hooks/useTransactions.ts`, a critical type mismatch occurred between Firebase's `Timestamp` objects and JavaScript's native `Date` objects.

**Error Message:**
```
Type 'Timestamp' is not assignable to type 'Date'.
  Property 'toJSON' is missing in type 'Timestamp'.
```

**Root Cause:**
Firestore stores dates as `Timestamp` objects (Firebase's custom class), but our TypeScript `Transaction` interface defined the `date` field as type `Date`. When fetching documents from Firestore, the `date` field came back as `Timestamp`, not `Date`, causing type incompatibilities throughout the application.

```typescript
// ❌ BEFORE - Type Mismatch
interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;           // Expected Date
  description: string;
}

// In useTransactions.ts
const snapshot = await getDocs(query(
  collection(db, 'transactions'),
  where('userId', '==', userId)
));

// data.date is actually Timestamp, not Date!
const transaction = doc.data() as Transaction;
```

### Solution

Implemented explicit `Timestamp` to `Date` conversion at the data transformation boundary, ensuring type safety throughout the application.

**Implementation:**

```typescript
// ✅ AFTER - Proper Type Conversion

import { Timestamp } from 'firebase/firestore';

// In useTransactions.ts - fetchTransactions hook
const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const snapshot = await getDocs(query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    ));

    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to JavaScript Date
      // Handle both Timestamp objects and Date objects for flexibility
      const date = data.date instanceof Timestamp 
        ? data.date.toDate() 
        : new Date(data.date);

      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: date,                    // Now properly typed as Date
        description: data.description,
      } as Transaction;
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// In useTransactions.ts - addTransaction function
const addTransaction = async (
  transactionData: Omit<Transaction, 'id'>
): Promise<boolean> => {
  try {
    // Reverse conversion: Date to Timestamp when storing
    await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date),  // Convert to Timestamp for storage
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
  }
};

// In useTransactions.ts - updateTransaction function
const updateTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<boolean> => {
  try {
    const updateData: any = { ...updates };
    
    // Only convert date if it's included in the updates
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    
    await updateDoc(doc(db, 'transactions', id), updateData);
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};
```

### Technical Details

**Why This Matters:**

1. **Type Safety**: By converting at the boundary, the rest of the application treats `date` as a standard `Date` object, maintaining TypeScript's type safety.

2. **Firebase Best Practice**: Firestore's `Timestamp` class is specifically designed for cloud storage and includes additional metadata. Converting to `Date` for local usage is the recommended pattern.

3. **Bidirectional Conversion**: 
   - **Reading**: `Timestamp.toDate()` when fetching from Firestore
   - **Writing**: `Timestamp.fromDate()` when saving to Firestore

4. **Null Safety**: The `instanceof` check handles edge cases where data might already be a Date object.

**Performance Impact:**
- Negligible performance overhead from type conversion
- Enables React's efficient re-rendering with proper Date type
- Simplifies debugging with consistent Date types throughout the codebase

---

## TypeScript Type Error in Date Range Filter

### Problem

The `DateRangeFilter` component's date range selector had an incomplete type union definition that caused TypeScript compilation errors.

**Error Message:**
```
Type 'string' is not assignable to type '"today" | "week" | "month" | "year"'.
Did you mean 'custom'?
```

**Root Cause:**
The `getDateRange()` utility function in `src/utils/helpers.ts` didn't have a case for the `'custom'` date range type, but the `DateRange` type union included it. This created a type coverage gap.

```typescript
// ❌ BEFORE - Incomplete Type Coverage
type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

function getDateRange(range: DateRange): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: now };
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: now };
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { start: yearStart, end: now };
    // ❌ 'custom' case missing!
  }
}
```

### Solution

Extended the function to handle the `'custom'` case, ensuring complete type coverage and allowing for custom date range selection.

**Implementation:**

```typescript
// ✅ AFTER - Complete Type Coverage

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateRangeValue {
  start: Date;
  end: Date;
}

function getDateRange(
  range: DateRange,
  customStart?: Date,
  customEnd?: Date
): DateRangeValue {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now };

    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday = 0
      return { start: weekStart, end: now };

    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: now };

    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { start: yearStart, end: now };

    case 'custom':
      // Handle custom date range
      // Use provided dates or fall back to current month
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd };
      }
      // Default fallback to current month if no custom dates provided
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: defaultStart, end: now };

    default:
      // Exhaustive check - TypeScript ensures all cases are covered
      const _exhaustive: never = range;
      return _exhaustive;
  }
}
```

**Usage in DateRangeFilter Component:**

```typescript
// src/components/DateRangeFilter.tsx
const [selectedRange, setSelectedRange] = useState<DateRange>('month');
const [customStart, setCustomStart] = useState<Date>(new Date());
const [customEnd, setCustomEnd] = useState<Date>(new Date());

const handleRangeChange = (range: DateRange) => {
  setSelectedRange(range);
  
  const dateRange = getDateRange(
    range,
    range === 'custom' ? customStart : undefined,
    range === 'custom' ? customEnd : undefined
  );
  
  onDateRangeChange(dateRange);
};
```

### Technical Details

**Why This Matters:**

1. **Exhaustive Type Coverage**: TypeScript's type system now guarantees all possible `DateRange` values are handled. The `never` type in the `default` case ensures the compiler catches missing cases.

2. **Discriminated Unions**: The pattern leverages TypeScript's discriminated union types, enabling the compiler to narrow types based on the `range` parameter.

3. **Flexibility**: The function now supports both predefined ranges and custom user-specified ranges with seamless fallback logic.

4. **Developer Experience**: IDEs can now provide complete autocomplete and type hints throughout the application.

**Testing Edge Cases:**
```typescript
// All valid calls now properly type-check
getDateRange('today');                    // ✓ Today's transactions
getDateRange('week');                     // ✓ This week's transactions
getDateRange('month');                    // ✓ This month's transactions
getDateRange('year');                     // ✓ This year's transactions
getDateRange('custom', startDate, endDate); // ✓ Custom date range
```

---

## Unused Variable Cleanup

### Problem

Three unused variables were detected during TypeScript compilation, adding unnecessary code and creating maintenance burden.

**Issues Found:**

1. **`updateTransaction` in Dashboard.tsx**
   - Destructured from `useTransactions()` hook but never used in the component
   - Creates confusion about available API surface

2. **`exportFormat` state in ExportShare.tsx**
   - State variable declared but unused in the component logic
   - Suggests incomplete implementation or obsolete code

3. **`loading` prop in TransactionList.tsx**
   - Prop passed from parent but never used in the component
   - Indicates incomplete loading state implementation

### Solution

Removed all unused variables and optimized imports for clarity and code cleanliness.

**Implementation:**

```typescript
// ❌ BEFORE - Unused updateTransaction in Dashboard.tsx
import { useTransactions } from '../hooks/useTransactions';

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction,      // ← Never used
    deleteTransaction, 
    loading 
  } = useTransactions(userId);

  // ... component code that only uses addTransaction and deleteTransaction
}

// ✅ AFTER - Clean imports with only needed functions
import { useTransactions } from '../hooks/useTransactions';

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,        // Only what we need
    loading 
  } = useTransactions(userId);

  // ... component code
}
```

```typescript
// ❌ BEFORE - Unused exportFormat state in ExportShare.tsx
const ExportShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv'); // ← Unused
  const [transactions] = rest;

  // Exports handled directly without format state
  const handleExportCSV = () => { /* ... */ };
  const handleExportJSON = () => { /* ... */ };
}

// ✅ AFTER - State removed, exports handled directly
const ExportShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // No format state needed - each export function handles its own format

  const handleExportCSV = () => { /* ... */ };
  const handleExportJSON = () => { /* ... */ };
}
```

```typescript
// ❌ BEFORE - Unused loading prop in TransactionList.tsx
interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;           // ← Declared but never used
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,                     // ← Destructured but unused
  onEdit,
  onDelete,
}) => {
  // No loading spinner or conditional rendering based on loading prop
  return (
    <div className="space-y-4">
      {transactions.map(/* ... */)}
    </div>
  );
};

// ✅ AFTER - Removed unused prop
interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  // Clean, purpose-driven component
  return (
    <div className="space-y-4">
      {transactions.map(/* ... */)}
    </div>
  );
};
```

### Technical Details

**Benefits of Cleanup:**

1. **Code Clarity**: Unused variables create ambiguity about what the component actually does
2. **Maintenance**: Reduces cognitive load for developers reading the code
3. **Type Safety**: TypeScript's type checking is more effective with precise declarations
4. **Bundle Size**: While minimal, removing unused code keeps the bundle lean
5. **Compiler Warnings**: Eliminates false positives and makes real warnings more visible

**Tooling**:
These issues were caught with `npm run lint` and TypeScript's `noUnusedLocals` compiler option:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Key Learnings

### 1. Third-Party ODM Pattern in TypeScript

**Lesson**: When integrating third-party libraries (like Firebase) with strong type systems (like TypeScript), always implement a conversion boundary between the library's types and your application's types.

**Application**:
- Created conversion layer in `useTransactions.ts` specifically for Timestamp handling
- Enables type safety throughout the rest of the application
- Makes the integration point explicit and testable

**Takeaway**: "Think of your application's type system as a contract - third-party libraries are external partners that need type translation at the boundary."

### 2. Exhaustive Type Coverage in Unions

**Lesson**: TypeScript's ability to enforce exhaustive type coverage in switch statements is a powerful tool for preventing bugs.

**Application**:
- Used discriminated unions with `never` type in default case
- Compiler now guarantees all DateRange values are handled
- Adding new date ranges automatically creates compilation errors in uncovered switch statements

**Takeaway**: "Lean into TypeScript's type system for compile-time verification - it catches bugs that unit tests might miss."

### 3. Code Hygiene Through Tooling

**Lesson**: Enabling strict compiler options and linting creates a feedback loop that maintains code quality throughout development.

**Application**:
- `noUnusedLocals` and `noUnusedParameters` caught dead code immediately
- Developers get instant feedback in IDE before pushing code
- Prevents accumulation of technical debt

**Takeaway**: "Configure your toolchain early and strictly - it's easier to maintain high standards throughout development than to refactor later."

### 4. Performance Considerations

**Lesson**: Type conversions have minimal performance impact modern JavaScript engines, but architectural clarity has major developer productivity impact.

**Key Insight**:
While `Timestamp.toDate()` does create new Date objects on every fetch, the performance impact is negligible (microseconds) compared to the network round-trip to Firestore (milliseconds). The tradeoff for type safety and code clarity is always worth it.

---

## Conclusion

This development session highlighted the importance of:
- Understanding the integration points between libraries and your type system
- Leveraging TypeScript's strict mode for compile-time safety
- Maintaining clean, purposeful code through consistent practices

These three bug fixes represent common challenges in modern full-stack TypeScript development and demonstrate how proper typing prevents runtime errors and improves maintainability.

**Performance Impact**: Negligible (all fixes involve developer ergonomics, not runtime optimization)  
**Type Safety**: ✅ Improved  
**Codebase Clarity**: ✅ Improved  
**Developer Experience**: ✅ Improved  

---

*Last Updated: 2026*
