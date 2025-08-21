import { Body, Controller, Get, Post, Delete, Put, Param, Logger } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiCreatedResponse, ApiOkResponse, ApiExcludeEndpoint } from "@nestjs/swagger";
import { PROJECT_MANAGEMENT } from "../../utils/paths";
import { AuthUser, Unprotected } from "../../utils/sso/sso.decorators";
import { ProjectManagementService } from "./project-management.service";
import {
  ProjectMemberDto, ProjectDto, EditProjectMemberDto, ProjectConfigDto,
  ProjectConfigResDto, ProjectTokenDto, ProjectReleasesDto, MemberProjectResDto,
  MemberProjectsResDto, MemberResDto, ProjectResDto
} from "@app/common/dto/project-management";
import { DeviceResDto } from "@app/common/dto/project-management/dto/device-res.dto";


@ApiTags('Project Management')
@ApiBearerAuth()
@Controller(PROJECT_MANAGEMENT)
export class ProjectManagementController {

  private readonly logger = new Logger(ProjectManagementController.name);
  constructor(
    private readonly projectManagementService: ProjectManagementService,
  ) { }

  @Post('project')
  @ApiOperation({ summary: 'Create Project' })
  @ApiOkResponse({ type: ProjectResDto })
  createProject(@AuthUser() user: any, @Body() projectDto: ProjectDto) {
    return this.projectManagementService.createProject(user, projectDto)
  }

  @Get('project')
  @ApiOperation({ summary: "Get all User's projects" })
  @ApiOkResponse({ type: MemberProjectsResDto })
  getUserProjects(@AuthUser() user: any) {
    return this.projectManagementService.getUserProjects(user);
  }

  @Get('projectConfigOption')
  @ApiOperation({ summary: "Get project's config option" })
  @ApiOkResponse({ type: ProjectConfigResDto })
  getProjectConfigOption() {
    this.logger.debug("Get project config option")
    return this.projectManagementService.getProjectConfigOption();
  }

  @Post('projectConfigOption')
  @ApiOperation({ summary: "Set project's config option" })
  @ApiOkResponse({ type: ProjectConfigDto })
  setProjectConfigOption(@Body() body: ProjectConfigDto) {
    this.logger.debug("Set project config option")
    return this.projectManagementService.setProjectConfigOption(body);
  }

  @Post('project/:projectId/createToken')
  @ApiOperation({ summary: "Create Upload token for a Project" })
  @ApiParam({ name: 'projectId' })
  @ApiCreatedResponse({ type: ProjectTokenDto })
  createToken(@AuthUser() user: any, @Param() params: { projectId: string }) {
    return this.projectManagementService.createToken(user, params);
  }

  @Post('project/:projectId/member')
  @ApiOperation({ summary: 'Add member to Project' })
  @ApiParam({ name: 'projectId' })
  @ApiCreatedResponse({ type: MemberProjectResDto })
  addMemberToProject(@AuthUser() user: any, @Body() projectMemberDto: ProjectMemberDto, @Param() params: { projectId: string }) {
    return this.projectManagementService.addMemberToProject(user, projectMemberDto, params)
  }

  @Delete('project/:projectId/member/:memberId')
  @ApiOperation({ summary: 'Remove member from Project' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'memberId' })
  @ApiCreatedResponse()
  removeMemberFromProject(@AuthUser() user: any, @Param() params: { projectId: string, memberId: string }) {
    return this.projectManagementService.removeMemberFromProject(user, params)
  }

  @Put('project/:projectId/member/:memberId')
  @ApiOperation({ summary: 'Edit member details' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ type: MemberResDto })
  editMember(@AuthUser() user: any, @Body() editProjectMemberDto: EditProjectMemberDto, @Param() params: { projectId: string, memberId: string }) {
    return this.projectManagementService.editMember(user, editProjectMemberDto, params)
  }
  @Get('project/:projectId/projectReleases')
  @ApiOperation({ summary: 'Get project release' })
  @ApiParam({ name: 'projectId' })
  @ApiOkResponse({ type: ProjectReleasesDto, isArray: true })
  getProjectReleases(@AuthUser() user: any, @Param() params: { projectId: string }) {
    return this.projectManagementService.getProjectReleases(user, params);
  }

  @Get('devices/catalogId/:catalogId')
  @ApiOperation({ summary: 'Get all devices with catalogId' })
  @ApiParam({ name: 'catalogId', type: String })
  @ApiOkResponse({ type: DeviceResDto, isArray: true })
  getDevicesByCatalogId(@Param('catalogId') catalogId: string) {
    return this.projectManagementService.getDevicesByCatalogId(catalogId);
  }

  @Get('devices/project/:projectId')
  @ApiOperation({ summary: 'Get all devices using component of the projectId' })
  @ApiParam({ name: 'projectId', type: Number })
  @ApiOkResponse({ type: DeviceResDto, isArray: true })
  getDevicesByProject(@Param('projectId') projectId: number) {
    return this.projectManagementService.getDevicesByProject(projectId);
  }

  @Get('devices/platform/:platform')
  @ApiOperation({ summary: 'Get all devices in platform' })
  @ApiParam({ name: 'platform', type: String })
  @ApiOkResponse({ type: DeviceResDto, isArray: true })
  getDeviceByPlatform(@Param('platform') platform: string) {
    return this.projectManagementService.getDeviceByPlatform(platform);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Project management service - Health checking")
    return this.projectManagementService.checkHealth()
  }
}