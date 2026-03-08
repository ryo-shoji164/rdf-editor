export const NGSI_LD_TEMPLATE = `@prefix ngsi-ld: <https://uri.etsi.org/ngsi-ld/> .
@prefix schema:  <http://schema.org/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix urn:     <urn:ngsi-ld:> .

urn:Vehicle:A4567 a ngsi-ld:Entity, schema:Vehicle ;
    ngsi-ld:id "urn:ngsi-ld:Vehicle:A4567" ;
    ngsi-ld:type "Vehicle" ;

    # Property: brandName
    schema:brandName [
        a ngsi-ld:Property ;
        ngsi-ld:hasValue "Mercedes" ;
        ngsi-ld:observedAt "2024-03-08T10:00:00Z"^^xsd:dateTime
    ] ;

    # Property: speed
    schema:speed [
        a ngsi-ld:Property ;
        ngsi-ld:hasValue 55 ;
        ngsi-ld:unitCode "KMH" ;
        ngsi-ld:observedAt "2024-03-08T10:05:00Z"^^xsd:dateTime
    ] ;

    # Relationship: drivenBy
    schema:drivenBy [
        a ngsi-ld:Relationship ;
        ngsi-ld:hasObject urn:Person:JohnDoe ;
        ngsi-ld:providedBy [
            a ngsi-ld:Relationship ;
            ngsi-ld:hasObject urn:System:FleetManagement
        ]
    ] ;

    # GeoProperty: location
    ngsi-ld:location [
        a ngsi-ld:GeoProperty ;
        ngsi-ld:hasValue [
            a ngsi-ld:Point ;
            ngsi-ld:coordinates "-3.691944, 40.418889"
        ]
    ] .

urn:Person:JohnDoe a ngsi-ld:Entity, schema:Person ;
    ngsi-ld:id "urn:ngsi-ld:Person:JohnDoe" ;
    ngsi-ld:type "Person" ;
    schema:name [
        a ngsi-ld:Property ;
        ngsi-ld:hasValue "John Doe"
    ] .
`
