import { MicroserviceName, MicroserviceClient } from "@app/common/microservice-client";
import { DeviceBugReportTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { NewBugReportDto } from "@app/common/dto/bug-report";



@Injectable()
export class BugReportService{
  private readonly logger = new Logger(BugReportService.name);

  constructor(@Inject(MicroserviceName.DEVICE_SERVICE) private readonly deviceClient: MicroserviceClient){}

  reportNewBug(bugReportDto: NewBugReportDto){
    return this.deviceClient.send(DeviceBugReportTopics.NEW_BUG_REPORT, bugReportDto);
  }

  getBugReport(bugId: string){
    return this.deviceClient.send(DeviceBugReportTopics.GET_BUG_REPORT, bugId)
  }


}