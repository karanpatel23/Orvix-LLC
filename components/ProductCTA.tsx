import Button from '@/components/ui/Button';

/**
 * The quote/specification CTA pair, previously hand-copied onto all six product
 * pages with slightly different labels on each.
 *
 * TODO(karan): confirm. "Request Quote" and "Request Specification" both post to
 * the same contact form and read as one intent, which is a duplicate-CTA smell.
 * Either they should route to genuinely different flows (a spec-sheet request
 * that returns a document vs. a priced quote), or this should collapse to one
 * button. Needs your call on how the two differ commercially.
 */
export default function ProductCTA() {
  return (
    <div className="flex flex-wrap gap-element">
      <Button href="/contact" size="lg">
        Request Quote
      </Button>
      <Button href="/contact" variant="secondary" size="lg">
        Request Specification
      </Button>
    </div>
  );
}
