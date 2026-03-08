export const ARTICLE_TEMPLATE = `@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.com/article/123> a schema:Article ;
    schema:headline "Understanding Schema.org for Better SEO"@en ;
    schema:datePublished "2024-03-08T08:00:00Z"^^xsd:dateTime ;
    schema:dateModified "2024-03-08T09:30:00Z"^^xsd:dateTime ;
    schema:author [
        a schema:Person ;
        schema:name "Jane Doe" ;
        schema:url <https://example.com/author/janedoe>
    ] ;
    schema:publisher [
        a schema:Organization ;
        schema:name "Tech Insights Blog" ;
        schema:logo [
            a schema:ImageObject ;
            schema:url <https://example.com/logo.png>
        ]
    ] ;
    schema:image <https://example.com/article/123/thumbnail.jpg> ;
    schema:description "A comprehensive guide to using Schema.org to improve search engine visibility."@en .
`

export const PRODUCT_TEMPLATE = `@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.com/product/xyz-headphones> a schema:Product ;
    schema:name "XYZ Noise-Cancelling Headphones"@en ;
    schema:image <https://example.com/images/xyz-headphones.jpg> ;
    schema:description "Premium noise-cancelling wireless headphones with 30-hour battery life."@en ;
    schema:sku "XYZ-NC-001" ;
    schema:mpn "NC001" ;
    schema:brand [
        a schema:Brand ;
        schema:name "XYZ Audio"
    ] ;
    schema:offers [
        a schema:Offer ;
        schema:url <https://example.com/product/xyz-headphones> ;
        schema:priceCurrency "USD" ;
        schema:price "299.99"^^xsd:decimal ;
        schema:priceValidUntil "2024-12-31"^^xsd:date ;
        schema:itemCondition schema:NewCondition ;
        schema:availability schema:InStock
    ] ;
    schema:aggregateRating [
        a schema:AggregateRating ;
        schema:ratingValue "4.8"^^xsd:decimal ;
        schema:reviewCount 1250
    ] .
`

export const LOCAL_BUSINESS_TEMPLATE = `@prefix schema: <http://schema.org/> .

<https://example.com/biz/joe-coffee> a schema:LocalBusiness ;
    schema:name "Joe's Coffee Shop"@en ;
    schema:image <https://example.com/images/storefront.jpg> ;
    schema:telephone "+1-555-0123" ;
    schema:email "contact@joescoffee.example.com" ;
    schema:address [
        a schema:PostalAddress ;
        schema:streetAddress "123 Main St" ;
        schema:addressLocality "Anytown" ;
        schema:addressRegion "CA" ;
        schema:postalCode "12345" ;
        schema:addressCountry "US"
    ] ;
    schema:geo [
        a schema:GeoCoordinates ;
        schema:latitude 37.7749 ;
        schema:longitude -122.4194
    ] ;
    schema:openingHoursSpecification [
        a schema:OpeningHoursSpecification ;
        schema:dayOfWeek schema:Monday, schema:Tuesday, schema:Wednesday, schema:Thursday, schema:Friday ;
        schema:opens "07:00:00" ;
        schema:closes "19:00:00"
    ], [
        a schema:OpeningHoursSpecification ;
        schema:dayOfWeek schema:Saturday, schema:Sunday ;
        schema:opens "08:00:00" ;
        schema:closes "17:00:00"
    ] ;
    schema:priceRange "$$" .
`

export const EVENT_TEMPLATE = `@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.com/event/tech-conference-2024> a schema:Event ;
    schema:name "Tech Conference 2024"@en ;
    schema:startDate "2024-09-15T09:00:00Z"^^xsd:dateTime ;
    schema:endDate "2024-09-17T17:00:00Z"^^xsd:dateTime ;
    schema:eventAttendanceMode schema:MixedEventAttendanceMode ;
    schema:eventStatus schema:EventScheduled ;
    schema:location [
        a schema:Place ;
        schema:name "Convention Center" ;
        schema:address [
            a schema:PostalAddress ;
            schema:streetAddress "100 Convention Blvd" ;
            schema:addressLocality "Metropolis" ;
            schema:addressRegion "NY" ;
            schema:postalCode "10001" ;
            schema:addressCountry "US"
        ]
    ], [
        a schema:VirtualLocation ;
        schema:url <https://example.com/event/tech-conference-2024/live>
    ] ;
    schema:image <https://example.com/images/tech-conf-2024.jpg> ;
    schema:description "The annual gathering of tech enthusiasts and professionals."@en ;
    schema:offers [
        a schema:Offer ;
        schema:url <https://example.com/event/tech-conference-2024/tickets> ;
        schema:price "199.00"^^xsd:decimal ;
        schema:priceCurrency "USD" ;
        schema:availability schema:InStock ;
        schema:validFrom "2024-01-01T00:00:00Z"^^xsd:dateTime
    ] ;
    schema:organizer [
        a schema:Organization ;
        schema:name "Tech Events LLC" ;
        schema:url <https://example.com/organizer>
    ] .
`

export const PERSON_TEMPLATE = `@prefix schema: <http://schema.org/> .

<https://example.com/person/johndoe> a schema:Person ;
    schema:name "John Doe" ;
    schema:givenName "John" ;
    schema:familyName "Doe" ;
    schema:jobTitle "Senior Software Engineer"@en ;
    schema:worksFor [
        a schema:Organization ;
        schema:name "Acme Corp"
    ] ;
    schema:alumniOf [
        a schema:CollegeOrUniversity ;
        schema:name "State University"
    ] ;
    schema:image <https://example.com/images/johndoe.jpg> ;
    schema:url <https://johndoe.example.com> ;
    schema:sameAs <https://www.linkedin.com/in/johndoe>,
                 <https://github.com/johndoe> ;
    schema:email "john.doe@example.com" ;
    schema:telephone "+1-555-9876" ;
    schema:knowsAbout "Semantic Web", "React", "TypeScript" .
`

export const FAQ_PAGE_TEMPLATE = `@prefix schema: <http://schema.org/> .

<https://example.com/faq> a schema:FAQPage ;
    schema:mainEntity [
        a schema:Question ;
        schema:name "What is Schema.org?"@en ;
        schema:acceptedAnswer [
            a schema:Answer ;
            schema:text "Schema.org is a collaborative, community activity with a mission to create, maintain, and promote schemas for structured data on the Internet, on web pages, in email messages, and beyond."@en
        ]
    ], [
        a schema:Question ;
        schema:name "Why should I use structured data?"@en ;
        schema:acceptedAnswer [
            a schema:Answer ;
            schema:text "Structured data helps search engines understand the content of your page better, which can lead to rich snippets in search results and improved visibility."@en
        ]
    ], [
        a schema:Question ;
        schema:name "What formats are supported?"@en ;
        schema:acceptedAnswer [
            a schema:Answer ;
            schema:text "Schema.org vocabularies can be used with many different encodings, including RDFa, Microdata, JSON-LD, and Turtle."@en
        ]
    ] .
`
