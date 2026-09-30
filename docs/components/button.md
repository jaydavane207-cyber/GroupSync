# Button Components

## `<Button />`
Core button element with variants and loading state.

### Props
- `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'` | `'danger'`
- `size`: `'sm'` | `'md'` | `'lg'`
- `isLoading`: boolean
- `disabled`: boolean

```jsx
import { Button } from '@/components/buttons/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Create Team
</Button>
```
