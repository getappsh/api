import { ProjectManagementTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { AddMemberToProjectDto, EditProjectMemberDto, CreateProjectDto, CreateRegulationDto, UpdateRegulationDto, RegulationParams, ProjectMemberParams, ProjectIdentifierParams, GetProjectsQueryDto, SearchProjectsQueryDto, TokenParams, CreateProjectTokenDto, UpdateProjectTokenDto, EditProjectDto, ProjectMemberPreferencesDto, UpdateOneOfManyRegulationDto, DocsParams, CreateDocDto, UpdateDocDto, LabelNameDto, TriggerGitSyncDto, UpsertConfigGroupDto, DeleteConfigGroupDto, UpsertConfigEntryDto, DeleteConfigEntryDto, ApplyConfigRevisionDto, GetConfigRevisionsQueryDto, GetConfigRevisionQueryDto, AddConfigMapAssociationDto} from "@app/common/dto/project-management";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";
import { UserSearchDto } from "@app/common/oidc/oidc.interface";


@Injectable()
export class ProjectManagementService implements OnModuleInit{
  
  constructor(
    @Inject(MicroserviceName.PROJECT_MANAGEMENT_SERVICE) private readonly projectManagementClient: MicroserviceClient) {
    }
    
    getAllUsers(params: UserSearchDto) {
      return this.projectManagementClient.send(ProjectManagementTopics.GET_USERS, params)
    }

  createProject(user: any, projectDto: CreateProjectDto){
    projectDto.username = user?.email;
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT,
      projectDto
    )
  }

  addMemberToProject(projectMemberDto: AddMemberToProjectDto, params: ProjectIdentifierParams){
    projectMemberDto.projectIdentifier = params.projectIdentifier;
    return this.projectManagementClient.send(
      ProjectManagementTopics.ADD_PROJECT_NEW_MEMBER,
      projectMemberDto
    )
  }

  confirmMemberToProject(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.CONFIRM_PROJECT_MEMBER,
      params
    )
  }

  removeMemberFromProject(params: ProjectMemberParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.REMOVE_PROJECT_MEMBER,
      params
    )
  }

  editMember(editProjectMemberDto: EditProjectMemberDto, params: ProjectMemberParams){
    editProjectMemberDto.projectIdentifier = params.projectIdentifier;
    editProjectMemberDto.memberId = params.memberId;
    return this.projectManagementClient.send(
      ProjectManagementTopics.EDIT_PROJECT_MEMBER,
      editProjectMemberDto
    )
  }

  getMemberProjectPreferences(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_MEMBER_PROJECT_PREFERENCES,
      params
    )
  }
  updateMemberProjectPreferences(dto: ProjectMemberPreferencesDto, params: ProjectIdentifierParams){
    dto.projectIdentifier = params.projectIdentifier
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_MEMBER_PROJECT_PREFERENCES,
      dto
    )
  }

  getProjects(query: GetProjectsQueryDto){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECTS,
      query
    )
  }

  searchProjects(query: SearchProjectsQueryDto){
    return this.projectManagementClient.send(
      ProjectManagementTopics.SEARCH_PROJECTS, 
      query
    )
  }

  getProject(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_BY_IDENTIFIER,
      params
    )
  }

  editProject(params: ProjectIdentifierParams, dto: EditProjectDto){
    dto.projectIdentifier = params.projectIdentifier
    return this.projectManagementClient.send(
      ProjectManagementTopics.EDIT_PROJECT,
      dto
    )
  }

  deleteProject(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.DELETE_PROJECT,
      params
    )
  }

  getUserProjects(user: any){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_USER_PROJECTS,
      user.email
    )
  }

  createToken(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT_TOKEN,
      params
    )
  }

  getProjectReleases(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_RELEASES,
      params
    )
  }

  getDevicesByCatalogId(catalogId: string){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_DEVICES_BY_CATALOG_ID,
      catalogId
    )
  }

  getDevicesByProject(projectId: number){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_DEVICES_BY_PROJECT,
      projectId
    )
  }

  getDeviceByPlatform(platform: string){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_DEVICES_BY_PLATFORM,
      platform
    )
  }


  getAllRegulationTypes(){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_REGULATION_TYPES,
      {}
    )
  }

  getProjectRegulations(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_REGULATIONS,
      params
    )
  }

  getProjectRegulationByName(params: RegulationParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_REGULATION_BY_NAME,
      params
    )
  }

  createProjectRegulation(createRegulationDto: CreateRegulationDto, params: ProjectIdentifierParams){
    createRegulationDto.projectIdentifier = params.projectIdentifier;
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT_REGULATION,
      createRegulationDto
    )
  }

  editProjectRegulations(params: ProjectIdentifierParams, updateRegulationsDto: UpdateOneOfManyRegulationDto[]){
    
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_PROJECT_REGULATIONS,
      {projectIdentifier: params.projectIdentifier, regulations: updateRegulationsDto}
    )
  }

  editProjectRegulation(params: RegulationParams, updateRegulationDto: UpdateRegulationDto){
    updateRegulationDto.regulation = params.regulation;
    updateRegulationDto.projectIdentifier = params.projectIdentifier;
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_PROJECT_REGULATION,
      updateRegulationDto
    )
  }


  deleteProjectRegulation(params: RegulationParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.DELETE_PROJECT_REGULATION,
      params
    )
  }

  
  // PROJECT TOKENS
  getProjectTokens(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_TOKENS,
      params
    )
  }

  getProjectTokenById(params: TokenParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_TOKEN_BY_ID,
      params
    )
  }

  createProjectToken(params: ProjectIdentifierParams, dto: CreateProjectTokenDto){
    dto.projectIdentifier = params.projectIdentifier
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT_TOKEN,
      dto
    )
  }


  updateProjectToken(params: TokenParams, dto: UpdateProjectTokenDto){
    dto.projectIdentifier = params.projectIdentifier;
    dto.id = params.tokenId;
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_PROJECT_TOKEN,
      dto
    )
  }

  deleteProjectToken(params: TokenParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.DELETE_PROJECT_TOKEN,
      params
    ) 
  }

  // DOCS

  getDocs(params: ProjectIdentifierParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_DOCS,
      params
    )
  }

  getDocById(params: DocsParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_DOC_BY_ID,
      params
    )
  }

  createDoc(params: ProjectIdentifierParams, dto: CreateDocDto){
    dto.projectIdentifier = params.projectIdentifier
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT_DOC,
      dto
    )
  }

  updateDoc(params: DocsParams, dto: UpdateDocDto){
    dto.projectIdentifier = params.projectIdentifier;
    dto.id = params.id;
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_PROJECT_DOC,
      dto
    )
  }

  deleteDoc(params: DocsParams){
    return this.projectManagementClient.send(
      ProjectManagementTopics.DELETE_PROJECT_DOC,
      params
    ) 
  }

  checkHealth() {
    return this.projectManagementClient.send(ProjectManagementTopics.CHECK_HEALTH, {})
  }

  // LABELS
  getLabels(query?: LabelNameDto) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_LABELS,
      query
    )
  }

  createLabel(labelNameDto: LabelNameDto) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_LABEL,
      labelNameDto
    )
  }

  updateLabel(id: number, labelNameDto: LabelNameDto) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.UPDATE_LABEL,
      { id, ...labelNameDto }
    )
  }

  deleteLabel(id: number) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.DELETE_LABEL,
      { id }
    )
  }

  // GIT INTEGRATION
  
  triggerGitSyncByWebhook(webhookToken: string) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.TRIGGER_GIT_SYNC_BY_WEBHOOK,
      { webhookToken }
    );
  }


  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------

  upsertConfigGroup(projectIdentifier: string | number, dto: UpsertConfigGroupDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_UPSERT_GROUP, { projectIdentifier, ...dto });
  }

  deleteConfigGroup(projectIdentifier: string | number, dto: DeleteConfigGroupDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_DELETE_GROUP, { projectIdentifier, ...dto });
  }

  upsertConfigEntry(projectIdentifier: string | number, groupName: string, dto: UpsertConfigEntryDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_UPSERT_ENTRY, { projectIdentifier, groupName, ...dto });
  }

  deleteConfigEntry(projectIdentifier: string | number, dto: DeleteConfigEntryDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_DELETE_ENTRY, { projectIdentifier, ...dto });
  }

  applyConfigRevision(projectIdentifier: string | number, dto: ApplyConfigRevisionDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_APPLY_REVISION, { projectIdentifier, ...dto });
  }

  createDraftRevision(projectIdentifier: string | number) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_CREATE_DRAFT_REVISION, { projectIdentifier });
  }

  deleteDraftRevision(projectIdentifier: string | number) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_DELETE_DRAFT_REVISION, { projectIdentifier });
  }

  getConfigRevisions(projectIdentifier: string | number, query: GetConfigRevisionsQueryDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_GET_REVISIONS, { projectIdentifier, ...query });
  }

  getConfigRevisionById(revisionId: number, query: GetConfigRevisionQueryDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_GET_REVISION_BY_ID, { revisionId, ...query });
  }

  addConfigMapAssociation(configMapProjectIdentifier: string | number, dto: AddConfigMapAssociationDto) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_ADD_MAP_ASSOCIATION, { configMapProjectIdentifier, ...dto });
  }

  removeConfigMapAssociation(associationId: number) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_REMOVE_MAP_ASSOCIATION, { associationId });
  }

  getConfigMapAssociations(configMapProjectIdentifier: string | number) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_GET_MAP_ASSOCIATIONS, { configMapProjectIdentifier });
  }

  getConfigMapsForProject(projectIdentifier: string | number) {
    return this.projectManagementClient.send(ProjectManagementTopics.CONFIG_GET_CONFIG_MAPS_FOR_PROJECT, { projectIdentifier });
  }

  async onModuleInit() {
    this.projectManagementClient.subscribeToResponseOf(Object.values(ProjectManagementTopics));
    await this.projectManagementClient.connect();
  }
}