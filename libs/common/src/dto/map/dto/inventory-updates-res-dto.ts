import { ApiProperty } from "@nestjs/swagger"
import { MapDto } from "./map.dto"

export class InventoryUpdatesResDto {

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'boolean' },
    example: { "mapId_1": true, "mapId_2": false }
  })
  updates: Record<string, boolean>


  toString(): string {
    return JSON.stringify(this)
  }
}

export class InventoryUpdatesResV2Dto {

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'boolean' },
    example: { "mapId_1": true, "mapId_2": MapDto, "mapId_3": false }
  })
  updates: Record<string, boolean | MapDto>


  toString(): string {
    return JSON.stringify(this)
  }
}