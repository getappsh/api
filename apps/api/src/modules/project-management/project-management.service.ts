import { ProjectManagementTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { AddMemberToProjectDto, EditProjectMemberDto, CreateProjectDto, CreateRegulationDto, UpdateRegulationDto, RegulationParams, ProjectMemberParams, ProjectIdentifierParams, GetProjectsQueryDto, SearchProjectsQueryDto, TokenParams, CreateProjectTokenDto, UpdateProjectTokenDto, EditProjectDto, ProjectMemberPreferencesDto, UpdateOneOfManyRegulationDto, DocsParams, CreateDocDto, UpdateDocDto, LabelNameDto} from "@app/common/dto/project-management";
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

  async onModuleInit() {
    this.projectManagementClient.subscribeToResponseOf(Object.values(ProjectManagementTopics));
    await this.projectManagementClient.connect();
  }
}