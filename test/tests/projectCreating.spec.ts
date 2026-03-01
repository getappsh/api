import { SuperAgentTest } from "supertest";
import { promises as fs } from "fs";

import { CONFIG_OPTION, CREATE_TOKEN, MANIFEST, PROJECT, PROJECT_MANAGEMENT, RELEASES, UPDATE_UPLOAD_STATUS, UPLOAD } from "@app/common/utils/paths";

import { MemberProjectResDto, ProjectDto, ProjectReleasesDto, ProjectResDto } from "@app/common/dto/project-management";
import { UpdateUploadStatusDto } from "@app/common/dto/upload";

import { UploadStatus } from "@app/common/database/entities/enums.entity";

export interface ConfigOption {
  operationsSystem: string,
  platforms: string,
  formations: string,
  categories: string,
}

export const configOption: ConfigOption = {
  operationsSystem: "windows",
  platforms: "Merkava",
  formations: "yatush",
  categories: "tank",
};

export const createProjectUntilUploadTest = async (request: SuperAgentTest, awsReq: SuperAgentTest) => {
  await setProjectConfigOptionTest(request, configOption);
  await getProjectConfigOptionTest(request, configOption);

  let { currentProject, configOptionByProject } = await createAndGetProjectTest(request);

  const releases = await getProjectReleases(request, currentProject.id);

  await prepareManifestToUpload(currentProject.componentName, configOptionByProject, releases)

  await UploadManifestTest(request, awsReq, currentProject.tokens[0])

}

const setProjectConfigOptionTest = async (request: SuperAgentTest, configOption: ConfigOption) => {
  await request.post(PROJECT_MANAGEMENT + CONFIG_OPTION).send(configOption).expect(201);
}

export const getProjectConfigOptionTest = async (request: SuperAgentTest, setConfigOption: ConfigOption) => {
  const configOption = (await request.get(PROJECT_MANAGEMENT + CONFIG_OPTION)).body;
  for (const key in configOption) {
    expect(configOption[key].length).toBeGreaterThan(0)
    expect(configOption[key]).toContain(setConfigOption[key])
  }
}

export const createAndGetProjectTest = async (request: SuperAgentTest) => {
  let project: ProjectResDto;
  const componentName = process.env.COMPONENT_NAME;
  const newProject: ProjectDto = {
    componentName,
    OS: configOption.operationsSystem,
    platformType: configOption.platforms,
    formation: configOption.formations,
    artifactType: "harbor",
    category: configOption.categories,
    // description: process.env.COMPONENT_DESCRIPTION
    description: "Some description"
  }
  const response = await request.post(PROJECT_MANAGEMENT + PROJECT).send(newProject);
  if (response.statusCode == 409) {
    project = await getProjectTest(request);
  } else {
    expect(response.statusCode).toEqual(201)
    project = await getProjectTest(request);
  }
  const configOptionByProject = getConfigOptionByProject(project)
  return {
    currentProject: project,
    configOptionByProject
  }
}

const getProjectTest = async (request: SuperAgentTest) => {
  const response = await request.get(PROJECT_MANAGEMENT + PROJECT).expect(200)
  // TODO check if the toBeValidWithClassValidator(Array<MemberProjectResDto>) works
  expect(response.body.projects).toBeValidWithClassValidator(Array<MemberProjectResDto>);
  const currentProject: ProjectResDto = response.body.projects[response.body.projects.length - 1];

  // TODO need to add validator to class @ProjectResDto
  expect(currentProject).toBeValidWithClassValidator(ProjectResDto);

  // TODO remove the if statement, it needs to be tested every time
  if (!currentProject.tokens || currentProject.tokens.length == 0) {
    await createProjectToken(request, currentProject.id)
    return await getProjectTest(request);
  }
  return currentProject
}

const createProjectToken = async (request: SuperAgentTest, projectId: number) => {
  await request.post(PROJECT_MANAGEMENT + PROJECT + "/" + projectId + CREATE_TOKEN).expect(201);
}

const getConfigOptionByProject: (project: ProjectResDto) => ConfigOption = (project: ProjectResDto) => {
  return {
    operationsSystem: project.OS,
    platforms: project.platformType,
    formations: project.formation,
    categories: project.category
  }
}

const getProjectReleases = async (request: SuperAgentTest, projectId: number) => {
  const releases = (await request.get(`${PROJECT_MANAGEMENT}${PROJECT}/${projectId}${RELEASES}`).expect(200)).body;

  // TODO update the expect fn 
  expect(releases).toBeValidWithClassValidator(Array);
  if (releases.length > 0) {

    // TODO need to add validator to class @ProjectReleasesDto
    expect(releases[0]).toBeValidWithClassValidator(ProjectReleasesDto);
  }
  return releases;
}

function compareVersions(a: ProjectReleasesDto, b: ProjectReleasesDto) {
  const versionA = a.version.split('.').map(Number);
  const versionB = b.version.split('.').map(Number);

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    if (versionA[i] == undefined) return -1;
    if (versionB[i] == undefined) return 1;

    if (versionA[i] > versionB[i]) return 1;
    if (versionA[i] < versionB[i]) return -1;
  }
  return 0;
}

const getCorrectVersionForUpload = (releases: ProjectReleasesDto[], productName: string) => {
  let version = "1.0.0"
  releases = releases.filter(r => r.name == productName)

  if (releases.length) {
    releases = releases.sort(compareVersions)
    const oldVersion = releases[releases.length - 1].version;
    const spilledVersion = oldVersion.split(".")
    const fixVersion = Number(spilledVersion[spilledVersion.length - 1]) + 1
    spilledVersion.splice(spilledVersion.length - 1, 1, fixVersion.toString());
    version = spilledVersion.join(".");
  }
  return version
}

const prepareManifestToUpload = async (productName: string, configOption: any, releases: ProjectReleasesDto[]) => {

  const manifestJson = {
    product: `${configOption.platforms}`,
    name: `${productName}`,
    version: `${getCorrectVersionForUpload(releases, productName)}`,
    formation: `${configOption.formations}`,
    size: 1000000,
    properties: {
      releaseNotes: process.env.RELEASE_NOTE,
    }
  }
  const jsonString = JSON.stringify(manifestJson, null, 2); // null and 2 for pretty formatting
  const filePath = './manifest.json';
  await fs.writeFile(filePath, jsonString);
}

const UploadManifestTest = async (request: SuperAgentTest, awsReq: SuperAgentTest, token: string) => {

  const res = await request.post(UPLOAD + MANIFEST)
    .attach("file", './manifest.json')
    .field('uploadToken', token)
    .expect(201)

  await awsReq.put(res.body.uploadUrl).attach("file", './manifest.json').expect(200)

  const uploadStatus: UpdateUploadStatusDto = {
    uploadToken: token,
    catalogId: res.body.catalogId,
    status: UploadStatus.READY
  }
  await request.post(`${UPLOAD}${UPDATE_UPLOAD_STATUS}`).send(uploadStatus).expect(201)

}

