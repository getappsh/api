import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery/discovery.service';
import { DiscoveryController } from './discovery/discovery.controller';
import { DiscoveryController as DiscoveryControllerV2 } from './discovery/discovery.controller.v2';
import { GroupController } from './group/group.controller';
import { GroupService } from './group/group.service';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';
import { BugReportController } from './bug-report/bug-report.controller';
import { BugReportService } from './bug-report/bug-report.service';
import { OfferingService } from '../offering/offering.service';
import { HierarchyController } from './hierarchy/hierarchy.controller';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { RestrictionsController } from './restrictions/restrictions.controller';
import { RestrictionsService } from './restrictions/restrictions.service';
import { PendingVersionController } from './pending-version/pending-version.controller';
import { PendingVersionService } from './pending-version/pending-version.service';

@Module({
  controllers: [RestrictionsController, DiscoveryController, DiscoveryControllerV2, GroupController, DeviceController, BugReportController, HierarchyController, PendingVersionController],
  providers: [RestrictionsService, DiscoveryService, GroupService, DeviceService, BugReportService, OfferingService, HierarchyService, PendingVersionService]
})
export class DeviceModule {}
