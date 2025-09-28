import { DeviceMapStateEnum } from "@app/common/database/entities"
import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class InventoryUpdatesReqDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string


  @ApiProperty({
    type: "object", additionalProperties: {
      enum: Object.values(DeviceMapStateEnum),
      title: "map state",
    },
    example: { "mapId_1": DeviceMapStateEnum.DELIVERY, "mapId_2": DeviceMapStateEnum.IMPORT }
  })
  @IsNotEmpty()
  inventory: Record<string, DeviceMapStateEnum>

  toString(): string {
    return JSON.stringify(this)
  }
}

export class ProductDetails {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productType: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ingestionDate: string

  toString(): string {
    return JSON.stringify(this)
  }
}

export class InventoryDetailsDto {

  @ApiProperty({ enum: DeviceMapStateEnum })
  @IsString()
  @IsNotEmpty()
  @IsEnum(DeviceMapStateEnum)
  status: DeviceMapStateEnum

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  src?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  footprint?: string
 
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  size?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  productDetails?: ProductDetails

  toString(): string {
    return JSON.stringify(this)
  }
}

@ApiExtraModels(InventoryDetailsDto)
export class InventoryUpdatesReqV2Dto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string


  @ApiProperty({
    type: "object",
    additionalProperties: { $ref: getSchemaPath(InventoryDetailsDto) },
    example: { "mapId_1": { /* InventoryDetailsDto */ }, "mapId_2": { /* InventoryDetailsDto */ } }
  })
  @IsNotEmpty()
  inventory: Record<string, InventoryDetailsDto>

  toString(): string {
    return JSON.stringify(this)
  }
}