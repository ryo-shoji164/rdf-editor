import type { DomainPlugin, DomainTemplate } from '../../../types/domain'
import { BOT_TEMPLATE, BRICK_TEMPLATE } from './templates'

const templates: DomainTemplate[] = [
  {
    id: 'bot-basic',
    label: 'BOT (Building Topology)',
    description: 'Basic Building Topology Ontology template',
    turtleContent: BOT_TEMPLATE,
  },
  {
    id: 'brick-hvac',
    label: 'Brick Schema',
    description: 'Brick Schema HVAC equipment template',
    turtleContent: BRICK_TEMPLATE,
  },
]

export const bimPlugin: DomainPlugin = {
  id: 'bim',
  label: 'BIM / Smart Building',
  namespaces: {
    bot: 'https://w3id.org/bot#',
    brick: 'https://brickschema.org/schema/Brick#',
    inst: 'http://example.org/building/',
  },
  templates,
}
