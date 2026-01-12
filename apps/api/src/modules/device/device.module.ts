import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery/discovery.service';
import { DiscoveryController } from './discovery/discovery.controller';
import { GroupController } from './group/group.controller';
import { GroupService } from './group/group.service';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';
import { BugReportController } from './bug-report/bug-report.controller';
import { BugReportService } from './bug-report/bug-report.service';
import { OfferingService } from '../offering/offering.service';
import { HierarchyController } from './hierarchy/hierarchy.controller';
import { HierarchyService } from './hierarchy/hierarchy.service';

@Module({
  controllers: [DiscoveryController, GroupController, DeviceController, BugReportController, HierarchyController],
  providers: [DiscoveryService, GroupService, DeviceService, BugReportService, OfferingService, HierarchyService]
})
export class DeviceModule {}
