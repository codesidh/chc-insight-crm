# Examples and Demo Components Organization

## Rule: Examples Folder Structure

All example components, demo components, and showcase implementations must be organized in the `components/examples/` folder structure.

### Folder Organization

```
frontend/src/components/examples/
├── design-system/          # Design system demos and showcases
├── charts/                 # Chart and data visualization examples
├── forms/                  # Form component examples
├── layouts/                # Layout pattern examples
├── ui/                     # UI component usage examples
└── workflows/              # Workflow and process examples
```

### Naming Conventions

- **Demo Components**: Use `-demo` suffix (e.g., `chart-demo.tsx`, `form-demo.tsx`)
- **Example Components**: Use `-example` suffix (e.g., `dashboard-example.tsx`)
- **Showcase Components**: Use `-showcase` suffix (e.g., `design-system-showcase.tsx`)

### Implementation Rules

1. **No Production Code**: Examples should never be imported into production components
2. **Self-Contained**: Each example should be self-contained with its own data and dependencies
3. **Documentation**: Include JSDoc comments explaining the example's purpose
4. **Responsive**: All examples must be responsive and work across device sizes
5. **Accessibility**: Examples must demonstrate proper accessibility practices

### File Structure Example

```typescript
// frontend/src/components/examples/design-system/design-system-showcase.tsx
/**
 * Design System Showcase
 * 
 * Demonstrates the complete design system including:
 * - Color palettes and theming
 * - Typography scale
 * - Component variants
 * - Chart visualizations
 * - Layout patterns
 */
export function DesignSystemShowcase() {
  // Implementation
}
```

### Usage Guidelines

- Examples are for development, testing, and documentation purposes only
- Use examples to validate design system consistency
- Examples should showcase best practices and proper component usage
- Include examples in Storybook or documentation sites, not in production builds

### Enforcement

- All example/demo components must be placed in `components/examples/`
- Production components should not import from `components/examples/`
- Build process should exclude examples from production bundles
- Code reviews must verify proper example organization