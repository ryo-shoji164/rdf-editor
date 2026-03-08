export const BOT_TEMPLATE = `@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix bot:  <https://w3id.org/bot#> .
@prefix inst: <http://example.org/project/building/> .

inst:Site a bot:Site ;
    rdfs:label "Main Campus Site" ;
    bot:hasBuilding inst:BuildingA .

inst:BuildingA a bot:Building ;
    rdfs:label "Building A" ;
    bot:hasStorey inst:Storey1, inst:Storey2 .

inst:Storey1 a bot:Storey ;
    rdfs:label "Ground Floor" ;
    bot:hasSpace inst:Room101, inst:Room102 .

inst:Storey2 a bot:Storey ;
    rdfs:label "First Floor" ;
    bot:hasSpace inst:Room201 .

inst:Room101 a bot:Space ;
    rdfs:label "Lobby" .

inst:Room102 a bot:Space ;
    rdfs:label "Cafeteria" .

inst:Room201 a bot:Space ;
    rdfs:label "Conference Room" .
`

export const BRICK_TEMPLATE = `@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
@prefix brick: <https://brickschema.org/schema/Brick#> .
@prefix inst:  <http://example.org/building/> .

inst:AHU_1 a brick:AHU ;
    rdfs:label "Air Handling Unit 1" ;
    brick:feeds inst:VAV_101, inst:VAV_102 .

inst:VAV_101 a brick:VAV ;
    rdfs:label "VAV Box 101" ;
    brick:feeds inst:Room_101 .

inst:VAV_102 a brick:VAV ;
    rdfs:label "VAV Box 102" ;
    brick:feeds inst:Room_102 .

inst:Room_101 a brick:Room ;
    rdfs:label "Office 101" .

inst:Room_102 a brick:Room ;
    rdfs:label "Office 102" .

inst:TempSensor_101 a brick:Temperature_Sensor ;
    rdfs:label "Room 101 Temperature Sensor" ;
    brick:isPointOf inst:Room_101 .

inst:DamperCmd_101 a brick:Damper_Position_Command ;
    rdfs:label "VAV 101 Damper Command" ;
    brick:isPointOf inst:VAV_101 .
`
