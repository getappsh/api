import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery/discovery.service';
import { DiscoveryController } from './discovery/discovery.controller';
import { GroupController } from './group/group.controller';
import { GroupService } from './group/group.service';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';
import { BugReportController } from './bug-report/bug-report.controller';
import { BugReportService } from './bug-report/bug-report.service';

@Module({
  controllers: [DiscoveryController, GroupController, DeviceController, BugReportController],
  providers: [DiscoveryService, GroupService, DeviceService, BugReportService]
})
export class DeviceModule {}
