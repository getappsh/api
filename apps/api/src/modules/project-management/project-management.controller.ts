import { Body, Controller, Get, Post, Delete, Put, Param, Logger, UseInterceptors, Query, Version, UsePipes, ParseArrayPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiCreatedResponse, ApiOkResponse, ApiExcludeEndpoint, ApiHeader, ApiBody, ApiQuery } from "@nestjs/swagger";
import { AuthOrProject, AuthUser, Unprotected } from "../../utils/sso/sso.decorators";
import { RequireRole, RequireAnyRole, ApiRole } from '@app/common';
import { PROJECT_MANAGEMENT } from "@app/common/utils/paths";
import { ProjectManagementService } from "./project-management.service";
import {
  AddMemberToProjectDto, ProjectDto, EditProjectMemberDto,
  ProjectTokenDto, ProjectReleasesDto, MemberProjectResDto,
  MemberProjectsResDto, MemberResDto,
  CreateProjectDto,
  CreateRegulationDto,
  RegulationDto,
  RegulationTypeDto,
  UpdateRegulationDto,
  RegulationParams,
  ProjectMemberParams,
  ProjectIdentifierParams,
  SearchProjectsQueryDto,
  GetProjectsQueryDto,
  BaseProjectDto,
  TokenParams,
  CreateProjectTokenDto,
  UpdateProjectTokenDto,
  DetailedProjectDto,
  EditProjectDto,
  ProjectMemberPreferencesDto,
  UpdateOneOfManyRegulationDto,
  DocsParams,
  DocDto,
  CreateDocDto,
  UpdateDocDto,
  LabelDto,
  LabelNameDto,
} from "@app/common/dto/project-management";
import { DeviceResDto } from "@app/common/dto/project-management/dto/device-res.dto";
import { UserContextInterceptor } from "../../utils/interceptor/user-context.interceptor";
import { ApiOkResponsePaginated } from "@app/common/dto/pagination.dto";

@ApiTags('Project')
@ApiBearerAuth()
@UseInterceptors(UserContextInterceptor)
@Controller(PROJECT_MANAGEMENT)
export class ProjectManagementController {

  private readonly logger = new Logger(ProjectManagementController.name);
  constructor(
    private readonly projectManagementService: ProjectManagementService,
  ) { }

  @Post('')
  @RequireRole(ApiRole.CREATE_PROJECT)
  @ApiOperation({ summary: 'Create Project' })
  @ApiOkResponse({ type: ProjectDto })
  createProject(@AuthUser() user: any, @Body() projectDto: CreateProjectDto) {
    return this.projectManagementService.createProject(user, projectDto)
  }

  @Get('')
  @RequireRole(ApiRole.LIST_PROJECTS)
  @ApiOperation({ summary: "Get all User's projects" })
  @ApiOkResponse({ type: MemberProjectsResDto })
  getUserProjects(@AuthUser() user: any) {
    return this.projectManagementService.getUserProjects(user);
  }

  @Get()
  @Version('2')
  @RequireRole(ApiRole.LIST_PROJECTS)
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponsePaginated(ProjectDto)
  getProjects(@Query() query: GetProjectsQueryDto){
    this.logger.debug(`Getting all projects: ${JSON.stringify(query)}`);
    return this.projectManagementService.getProjects(query);
  }

  @Get('search')
  @RequireRole(ApiRole.LIST_PROJECTS)
  @ApiOperation({ summary: 'Search projects' })
  @ApiOkResponsePaginated(BaseProjectDto)
  searchProjects(@Query() query: SearchProjectsQueryDto) {
    this.logger.debug(`Searching projects: ${JSON.stringify(query)}`);
    return this.projectManagementService.searchProjects(query);
  }

  @Get('regulation-types')
  @ApiOperation({ summary: 'Get all Regulation Types' })
  @ApiOkResponse({ type: [RegulationTypeDto] })
  getAllRegulationTypes() {
    this.logger.debug("Getting all regulation types");
    return this.projectManagementService.getAllRegulationTypes();
  }
  
  // LABELS
  @Get('/labels')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'Get all labels' })
  @ApiOkResponse({ type: LabelDto, isArray: true })
  @ApiQuery({ name: 'name', required: false, description: 'Filter labels by name' })
  getLabels(@Query() query?: LabelNameDto) {
    this.logger.debug(`Getting labels with query: ${JSON.stringify(query)}`);
    return this.projectManagementService.getLabels(query);
  }

  @Post('/labels')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Create a new label' })
  @ApiCreatedResponse({ type: LabelDto })
  createLabel(@Body() labelNameDto: LabelNameDto) {
    this.logger.debug(`Creating label: ${labelNameDto.name}`);
    return this.projectManagementService.createLabel(labelNameDto);
  }

  @Put('/labels/:id')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Update a label' })
  @ApiOkResponse({ type: LabelDto })
  @ApiParam({ name: 'id', description: 'Label ID' })
  updateLabel(@Param('id') id: number, @Body() labelNameDto: LabelNameDto) {
    this.logger.debug(`Updating label ${id} with data: ${JSON.stringify(labelNameDto)}`);
    return this.projectManagementService.updateLabel(id, labelNameDto);
  }

  @Delete('/labels/:id')
  @RequireRole(ApiRole.DELETE_PROJECT)
  @ApiOperation({ summary: 'Delete a label' })
  @ApiOkResponse()
  @ApiParam({ name: 'id', description: 'Label ID' })
  deleteLabel(@Param('id') id: number) {
    this.logger.debug(`Deleting label with ID: ${id}`);
    return this.projectManagementService.deleteLabel(id);
  }


  @Get('/:projectIdentifier')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: 'Get Project details' })
  @ApiOkResponse({ type: DetailedProjectDto })
  getProject(@Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Getting project: ${params.projectIdentifier}`);
    return this.projectManagementService.getProject(params)
  }

  @Put('/:projectIdentifier')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Edit Project' })
  @ApiOkResponse({ type: ProjectDto })
  editProject(@Param() params: ProjectIdentifierParams, @Body() dto: EditProjectDto) {
    return this.projectManagementService.editProject(params, dto)
  }

  @Delete('/:projectIdentifier')
  @RequireRole(ApiRole.DELETE_PROJECT)
  @ApiOperation({ summary: 'Delete Project' })
  @ApiOkResponse()
  deleteProject(@Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.deleteProject(params)
  }


  @Post('/:projectIdentifier/createToken')
  @RequireRole(ApiRole.VIEW_PROJECT)
  @ApiOperation({ summary: "Create Upload token for a Project" })
  @ApiCreatedResponse({ type: ProjectTokenDto })
  createToken( @Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.createToken(params);
  }

  @Post('/:projectIdentifier/confirm')
  @ApiOperation({ summary: 'Confirm invitation for project' })
  @ApiOkResponse({type: ProjectDto})
  confirmMemberToProject(@Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.confirmMemberToProject(params)
  }

  
  @Get('/:projectIdentifier/member/preferences')
  @ApiOperation({ summary: 'Get member project preferences' })
  @ApiOkResponse({ type: ProjectMemberPreferencesDto })
  getMemberProjectPreferences(@Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.getMemberProjectPreferences(params)
  }

  @Put('/:projectIdentifier/member/preferences')
  @ApiOperation({ summary: 'Update member project preferences' })
  @ApiOkResponse({ type: ProjectMemberPreferencesDto })
  updateMemberProjectPreferences(@Body() dto: ProjectMemberPreferencesDto, @Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.updateMemberProjectPreferences(dto, params)
  }

  @Post(':projectIdentifier/member')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Add member to Project' })
  @ApiCreatedResponse({ type: MemberResDto })
  addMemberToProject(@Body() projectMemberDto: AddMemberToProjectDto, @Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.addMemberToProject(projectMemberDto, params)
  }

  @Delete('/:projectIdentifier/member/:memberId')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Remove member from Project' })
  @ApiOkResponse()
  removeMemberFromProject(@Param() params: ProjectMemberParams) {
    return this.projectManagementService.removeMemberFromProject(params)
  }

  @Put('/:projectIdentifier/member/:memberId')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Edit member details' })
  @ApiOkResponse({ type: MemberResDto })
  editMember(@Body() editProjectMemberDto: EditProjectMemberDto, @Param() params: ProjectMemberParams) {
    return this.projectManagementService.editMember(editProjectMemberDto, params)
  }
  
  @Get('/:projectIdentifier/projectReleases')
  @RequireRole(ApiRole.VIEW_RELEASE)
  @ApiOperation({ summary: 'Get project release' })
  @ApiOkResponse({ type: ProjectReleasesDto, isArray: true })
  getProjectReleases(@Param() params: ProjectIdentifierParams) {
    return this.projectManagementService.getProjectReleases(params);
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

  @Get('/:projectIdentifier/regulation')
  @AuthOrProject()
  @ApiHeader({name: 'X-Project-Token', required: false})
  @ApiOperation({ summary: 'Get all Project Regulations' })
  @ApiOkResponse({ type: RegulationDto, isArray: true })
  getProjectRegulations(@Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Getting all project regulations for project: ${JSON.stringify(params)}`);
    return this.projectManagementService.getProjectRegulations(params);
  }

  @Get('/:projectIdentifier/regulation/:regulation')
  @AuthOrProject()
  @ApiHeader({name: 'X-Project-Token', required: false})
  @ApiOperation({ summary: 'Get Regulation by ID' })
  @ApiOkResponse({ type: RegulationDto })
  getProjectRegulationByName(@Param() regulationParams: RegulationParams) {
    this.logger.debug(`Getting regulation by Project: ${regulationParams.projectIdentifier}, Regulation: ${regulationParams.regulation}`);
    return this.projectManagementService.getProjectRegulationByName(regulationParams);
  }

  @Post('/:projectIdentifier/regulation')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Create Regulation' })
  @ApiCreatedResponse({ type: RegulationDto })
  createProjectRegulation(@Param() params: ProjectIdentifierParams, @Body() createRegulationDto: CreateRegulationDto) {
    this.logger.debug(`Creating regulation for Project: ${params.projectIdentifier}`, JSON.stringify(createRegulationDto));
    return this.projectManagementService.createProjectRegulation(createRegulationDto, params);
  }

  @Put('/:projectIdentifier/regulation')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Edit Regulations' })
  @ApiOkResponse({ type: RegulationDto, isArray: true })
  @ApiBody({type: UpdateOneOfManyRegulationDto, isArray: true})
  editProjectRegulations(@Param() params: ProjectIdentifierParams, 
  @Body(new ParseArrayPipe({items: UpdateOneOfManyRegulationDto})) updateRegulationsDto: UpdateOneOfManyRegulationDto[]) {
    this.logger.debug(`Editing regulations for Project: ${params.projectIdentifier}`, JSON.stringify(updateRegulationsDto));
    return this.projectManagementService.editProjectRegulations(params, updateRegulationsDto);
  }

  @Put('/:projectIdentifier/regulation/:regulation')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Edit Regulation' })
  @ApiOkResponse({ type: RegulationDto })
  editProjectRegulation(@Param() regulationParams: RegulationParams, @Body() updateRegulationDto: UpdateRegulationDto) {
    this.logger.debug(`Editing regulation by Project: ${regulationParams.projectIdentifier} Regulation: ${regulationParams.regulation}`, JSON.stringify(updateRegulationDto));
    return this.projectManagementService.editProjectRegulation(regulationParams, updateRegulationDto);
  }

  @Delete('/:projectIdentifier/regulation/:regulation')
  @RequireRole(ApiRole.UPDATE_PROJECT)
  @ApiOperation({ summary: 'Delete Regulation by ID' })
  @ApiOkResponse()
  deleteProjectRegulation(@Param() regulationParams: RegulationParams) {
    this.logger.debug(`Deleting regulation by Project: ${regulationParams.projectIdentifier}, Regulation: ${regulationParams.regulation}`);
    return this.projectManagementService.deleteProjectRegulation(regulationParams);
  }

  // Tokens
  @Get('/:projectIdentifier/token/')
  @ApiOperation({ summary: 'Get all tokens for a project' })
  @ApiOkResponse({ type: ProjectTokenDto, isArray: true })
  getProjectTokens(@Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Fetching tokens for project: ${params.projectIdentifier}`);
    return this.projectManagementService.getProjectTokens(params);
  }

  @Get('/:projectIdentifier/token/:tokenId')
  @ApiOperation({ summary: 'Get a token by ID' })
  @ApiOkResponse({ type: ProjectTokenDto })
  getProjectTokenById(@Param() params: TokenParams) {
    this.logger.debug(`Fetching token by ID: ${params.tokenId} for project: ${params.projectIdentifier}`);
    return this.projectManagementService.getProjectTokenById(params);
  }

  @Post('/:projectIdentifier/token/')
  @ApiOperation({ summary: 'Create a token for a project' })
  @ApiCreatedResponse({ type: ProjectTokenDto })
  createProjectToken(
    @Param() params: ProjectIdentifierParams,
    @Body() dto: CreateProjectTokenDto,
  ) {
    this.logger.debug( `Creating token for project: ${params.projectIdentifier}`);
    return this.projectManagementService.createProjectToken(params, dto);
  }

  @Put('/:projectIdentifier/token/:tokenId')
  @ApiOperation({ summary: 'Update a token' })
  @ApiOkResponse({ type: ProjectTokenDto })
  updateProjectToken(
    @Param() params: TokenParams,
    @Body() updateProjectTokenDto: UpdateProjectTokenDto,
  ) {
    this.logger.debug(`Updating token with ID: ${params.tokenId} for project: ${params.projectIdentifier}`);
    return this.projectManagementService.updateProjectToken(
      params,
      updateProjectTokenDto,
    );
  }

  @Delete('/:projectIdentifier/token/:tokenId')
  @ApiOperation({ summary: 'Delete a token by ID' })
  @ApiOkResponse()
  deleteProjectToken(@Param() params: TokenParams) {
    this.logger.debug(
      `Deleting token with ID: ${params.tokenId} for project: ${params.projectIdentifier}`,
    );
    return this.projectManagementService.deleteProjectToken(params);
  }

  // DOCS 

  @Get('/:projectIdentifier/docs')
  @ApiOperation({ summary: 'Get all documents for a project' })
  @ApiOkResponse({ type: DocDto, isArray: true })
  getDocs(@Param() params: ProjectIdentifierParams) {
    this.logger.debug(`Fetching docs for project: ${params.projectIdentifier}`);
    return this.projectManagementService.getDocs(params);
  }

  @Get('/:projectIdentifier/docs/:id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiOkResponse({ type: DocDto })
  getDocById(@Param() params: DocsParams) {
    this.logger.debug(`Fetching doc by ID: ${params.id} for project: ${params.projectIdentifier}`);
    return this.projectManagementService.getDocById(params);
  }

  @Post('/:projectIdentifier/docs')
  @ApiOperation({ summary: 'Create a document for a project' })
  @ApiCreatedResponse({ type: DocDto })
  createDoc(
    @Param() params: ProjectIdentifierParams,
    @Body() dto: CreateDocDto,
  ) {
    this.logger.debug( `Creating doc for project: ${params.projectIdentifier}`);
    return this.projectManagementService.createDoc(params, dto);
  }

  @Put('/:projectIdentifier/docs/:id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiOkResponse({ type: DocDto })
  updateDoc(
    @Param() params: DocsParams,
    @Body() updateDocDto: UpdateDocDto,
  ) {
    this.logger.debug(`Updating doc with ID: ${params.id} for project: ${params.projectIdentifier}`);
    return this.projectManagementService.updateDoc(
      params,
      updateDocDto,
    ); 
  }
  
  @Delete('/:projectIdentifier/docs/:id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiOkResponse()
  deleteDoc(@Param() params: DocsParams) {
    this.logger.debug(
      `Deleting doc with ID: ${params.id} for project: ${params.projectIdentifier}`,
    );
    return this.projectManagementService.deleteDoc(params);
  }

  @Get('checkHealth')
  @Unprotected()
  @ApiExcludeEndpoint()
  checkHealth(){
    this.logger.log("Project management service - Health checking")
    return this.projectManagementService.checkHealth()
  }
}