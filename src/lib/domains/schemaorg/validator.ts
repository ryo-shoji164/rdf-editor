/**
 * Schema.org SHACL Shapes
 *
 * Lightweight SHACL shapes for validating Schema.org structured data.
 * Checks for required properties on common Schema.org types:
 *
 * - schema:Thing    — must have schema:name
 * - schema:Article  — must have schema:headline; should have schema:datePublished
 * - schema:Person   — should have schema:givenName or schema:familyName
 * - schema:Product  — should have schema:name; Offer should have schema:price
 * - schema:Event    — must have schema:name and schema:startDate
 * - schema:LocalBusiness — must have schema:name and schema:address
 * - schema:Offer    — must have schema:price and schema:priceCurrency
 * - schema:AggregateRating — must have schema:ratingValue
 * - schema:PostalAddress   — should have schema:addressCountry
 */

export const SCHEMAORG_SHACL_SHAPES = `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

# ── schema:Thing ─────────────────────────────────────────────────
<https://schema.org/shapes/ThingShape>
  a sh:NodeShape ;
  sh:targetClass schema:Thing ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Thing should have at least one schema:name." ;
  ] .

# ── schema:Article ────────────────────────────────────────────────
<https://schema.org/shapes/ArticleShape>
  a sh:NodeShape ;
  sh:targetClass schema:Article ;
  sh:property [
    sh:path schema:headline ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Article must have a schema:headline." ;
  ] ;
  sh:property [
    sh:path schema:author ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Article should have at least one schema:author." ;
  ] ;
  sh:property [
    sh:path schema:datePublished ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Article should have a schema:datePublished." ;
  ] .

# ── schema:Person ─────────────────────────────────────────────────
<https://schema.org/shapes/PersonShape>
  a sh:NodeShape ;
  sh:targetClass schema:Person ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Person must have a schema:name." ;
  ] .

# ── schema:Organization ───────────────────────────────────────────
<https://schema.org/shapes/OrganizationShape>
  a sh:NodeShape ;
  sh:targetClass schema:Organization ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Organization must have a schema:name." ;
  ] .

# ── schema:LocalBusiness ──────────────────────────────────────────
<https://schema.org/shapes/LocalBusinessShape>
  a sh:NodeShape ;
  sh:targetClass schema:LocalBusiness ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:LocalBusiness must have a schema:name." ;
  ] ;
  sh:property [
    sh:path schema:address ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:LocalBusiness should have a schema:address." ;
  ] ;
  sh:property [
    sh:path schema:telephone ;
    sh:minCount 1 ;
    sh:severity sh:Info ;
    sh:message "schema:LocalBusiness should have a schema:telephone." ;
  ] .

# ── schema:Product ────────────────────────────────────────────────
<https://schema.org/shapes/ProductShape>
  a sh:NodeShape ;
  sh:targetClass schema:Product ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Product must have a schema:name." ;
  ] ;
  sh:property [
    sh:path schema:description ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Product should have a schema:description." ;
  ] ;
  sh:property [
    sh:path schema:image ;
    sh:minCount 1 ;
    sh:severity sh:Info ;
    sh:message "schema:Product should have a schema:image." ;
  ] .

# ── schema:Offer ──────────────────────────────────────────────────
<https://schema.org/shapes/OfferShape>
  a sh:NodeShape ;
  sh:targetClass schema:Offer ;
  sh:property [
    sh:path schema:price ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Offer must have a schema:price." ;
  ] ;
  sh:property [
    sh:path schema:priceCurrency ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Offer must have a schema:priceCurrency." ;
  ] .

# ── schema:Event ──────────────────────────────────────────────────
<https://schema.org/shapes/EventShape>
  a sh:NodeShape ;
  sh:targetClass schema:Event ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Event must have a schema:name." ;
  ] ;
  sh:property [
    sh:path schema:startDate ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Event must have a schema:startDate." ;
  ] ;
  sh:property [
    sh:path schema:location ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Event should have a schema:location." ;
  ] .

# ── schema:AggregateRating ────────────────────────────────────────
<https://schema.org/shapes/AggregateRatingShape>
  a sh:NodeShape ;
  sh:targetClass schema:AggregateRating ;
  sh:property [
    sh:path schema:ratingValue ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:AggregateRating must have a schema:ratingValue." ;
  ] ;
  sh:property [
    sh:path schema:reviewCount ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:AggregateRating should have a schema:reviewCount." ;
  ] .

# ── schema:PostalAddress ──────────────────────────────────────────
<https://schema.org/shapes/PostalAddressShape>
  a sh:NodeShape ;
  sh:targetClass schema:PostalAddress ;
  sh:property [
    sh:path schema:addressCountry ;
    sh:minCount 1 ;
    sh:severity sh:Info ;
    sh:message "schema:PostalAddress should have a schema:addressCountry." ;
  ] .

# ── schema:FAQPage ────────────────────────────────────────────────
<https://schema.org/shapes/FAQPageShape>
  a sh:NodeShape ;
  sh:targetClass schema:FAQPage ;
  sh:property [
    sh:path schema:mainEntity ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:FAQPage must have at least one schema:mainEntity (Question)." ;
  ] .

# ── schema:Question ───────────────────────────────────────────────
<https://schema.org/shapes/QuestionShape>
  a sh:NodeShape ;
  sh:targetClass schema:Question ;
  sh:property [
    sh:path schema:name ;
    sh:minCount 1 ;
    sh:severity sh:Violation ;
    sh:message "schema:Question must have a schema:name (the question text)." ;
  ] ;
  sh:property [
    sh:path schema:acceptedAnswer ;
    sh:minCount 1 ;
    sh:severity sh:Warning ;
    sh:message "schema:Question should have a schema:acceptedAnswer." ;
  ] .
`
