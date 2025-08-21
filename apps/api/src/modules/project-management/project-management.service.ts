import { ProjectManagementTopics } from "@app/common/microservice-client/topics";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ProjectMemberDto, ProjectDto, EditProjectMemberDto, ProjectConfigDto } from "@app/common/dto/project-management";
import { MicroserviceClient, MicroserviceName } from "@app/common/microservice-client";


@Injectable()
export class ProjectManagementService implements OnModuleInit{

  constructor(
    @Inject(MicroserviceName.PROJECT_MANAGEMENT_SERVICE) private readonly projectManagementClient: MicroserviceClient) {
   }
  

  createProject(user: any, projectDto: ProjectDto){
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_PROJECT,
      JSON.stringify({member: user, project: projectDto})
    )
  }

  getProjectConfigOption(){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_CONFIG_OPTION, '')
  }

  setProjectConfigOption(body: ProjectConfigDto) {
    return this.projectManagementClient.send(
      ProjectManagementTopics.SET_PROJECT_CONFIG_OPTION, body)
  }

  addMemberToProject(user: any, projectMemberDto: ProjectMemberDto, params:  {projectId: string}){
    projectMemberDto.projectId = parseInt(params.projectId);
    return this.projectManagementClient.send(
      ProjectManagementTopics.ADD_NEW_MEMBER,
      {user: user, projectMember: projectMemberDto}
    )
  }

  removeMemberFromProject(user: any, params: {projectId: string, memberId: string}){
    return this.projectManagementClient.send(
      ProjectManagementTopics.REMOVE_MEMBER,
      {user: user, projectMember: params}
    )
  }

  editMember(user: any, editProjectMemberDto: EditProjectMemberDto, params: {projectId: string, memberId: string}){
    editProjectMemberDto.projectId = parseInt(params.projectId);
    editProjectMemberDto.memberId = parseInt(params.memberId);
    return this.projectManagementClient.send(
      ProjectManagementTopics.EDIT_MEMBER,
      {user: user, projectMember: editProjectMemberDto}
    )
  }

  getUserProjects(user: any){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_USER_PROJECTS,
      user.email
    )
  }

  createToken(user: any, data: {projectId: string}){
    return this.projectManagementClient.send(
      ProjectManagementTopics.CREATE_TOKEN,
      {user: user, projectId: data.projectId}
    )
  }

  getProjectReleases(user: any, params: {projectId: string}){
    return this.projectManagementClient.send(
      ProjectManagementTopics.GET_PROJECT_RELEASES,
      {user: user, projectId: parseInt(params.projectId)}
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

  checkHealth() {
    return this.projectManagementClient.send(ProjectManagementTopics.CHECK_HEALTH, {})
  }

  async onModuleInit() {
    this.projectManagementClient.subscribeToResponseOf(Object.values(ProjectManagementTopics));
    await this.projectManagementClient.connect();
  }
}