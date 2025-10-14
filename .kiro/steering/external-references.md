# External References and Resources

This document contains external projects, libraries, and resources that can inform and accelerate the development of CHC Insight CRM features.

## Form Builder References

### shadcn/ui Form Builder
**Repository**: https://github.com/hasanharman/form-builder.git
**Relevance**: Direct implementation reference for our MVP form builder

**Key Features to Study:**
- Drag-and-drop form builder interface using @dnd-kit
- shadcn/ui component integration patterns
- Form field type implementations (text, select, checkbox, etc.)
- Real-time form preview functionality
- Form validation and schema generation
- TypeScript implementation patterns

**Implementation Guidance:**
- Use as reference for MVP-3.2 (Implement basic form builder)
- Study component architecture for hierarchical form management
- Adapt drag-and-drop patterns for our question type library
- Reference validation patterns for our Zod schema integration
- Learn from their shadcn/ui component usage patterns

**Specific Components to Reference:**
- Form builder canvas and sidebar layout
- Question type palette and configuration panels
- Drag-and-drop question ordering
- Form preview and validation display
- Export/import functionality patterns

### Integration with Our MVP

**Phase 3: Form Builder Frontend (MVP-3)**
- Task 3.1: Use their navigation patterns for form hierarchy
- Task 3.2: Adapt their drag-and-drop implementation for our question types
- Task 3.3: Reference their template management patterns

**Customizations Needed:**
- Extend for our hierarchical taxonomy (Categories → Types → Templates → Instances)
- Add healthcare-specific question types and validation
- Integrate with our backend form management services
- Add conditional logic support for question branching
- Implement version control for form templates

## Additional Resources

### Healthcare Form Standards
- HL7 FHIR Questionnaire Resource: https://www.hl7.org/fhir/questionnaire.html
- CMS Quality Measures: https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments

### Technical Implementation References
- React Hook Form with shadcn/ui: https://ui.shadcn.com/docs/components/form
- TanStack Query patterns: https://tanstack.com/query/latest/docs/react/overview
- @dnd-kit documentation: https://docs.dndkit.com/

## Usage Guidelines

1. **Study Before Implementation**: Review the form builder project structure before starting MVP Phase 3
2. **Adapt, Don't Copy**: Use patterns and approaches but customize for our healthcare use case
3. **Maintain Standards**: Ensure any adapted code follows our frontend standards (see frontend-standards.md)
4. **Document Adaptations**: Note any significant changes or customizations made from reference implementations