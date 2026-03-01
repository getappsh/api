import { BUG_REPORT } from "@app/common/utils/paths";
import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { BugReportService } from "./bug-report.service";
import { BugReportDto, NewBugReportDto, NewBugReportResDto } from "@app/common/dto/bug-report";



@ApiTags("Device - Bug Report")
@ApiBearerAuth()
@Controller(BUG_REPORT)
export class BugReportController{
  private readonly logger = new Logger(BugReportController.name);

  constructor(private readonly bugReportService: BugReportService) {}


  @Post()
  @ApiOperation({
    summary: "Report New Bug",
    description: "This endpoint allows a user to report a new bug associated with a specific device."
  })
  @ApiCreatedResponse({type: NewBugReportResDto})
  reportNewBug(@Body() bugReportDto: NewBugReportDto) {
    this.logger.debug(`New bug report for device id ${bugReportDto.deviceId}`)
    return this.bugReportService.reportNewBug(bugReportDto);
  }


  @Get('/:bugId')
  @ApiOkResponse({type: BugReportDto})
  @ApiOperation({
    summary: "Get Bug Report",
    description: "This endpoint allows a user to fetch the details of a bug report using its unique identifier."
  })
  @ApiParam({ name: 'bugId', type: String})
  getBugReport(@Param("bugId") bugId: string){
    this.logger.debug(`Get bug report, bugId: ${bugId}`)
    return this.bugReportService.getBugReport(bugId)
  }

}