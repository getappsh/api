// group("/api/map/configs", () => {
    //     // Request No. 1: GetMapController_setMapConfig
    //     {
    //         let url = BASE_URL + `/api/map/configs`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"deliveryTimeoutMins": "bigdecimal", "maxMapAreaSqKm": "bigdecimal", "maxMapSizeInMB": "bigdecimal", "maxParallelDownloads": "bigdecimal", "downloadRetryTime": "bigdecimal", "downloadTimeoutMins": "bigdecimal", "periodicInventoryIntervalMins": "bigdecimal", "periodicConfIntervalMins": "bigdecimal", "periodicMatomoIntervalMins": "bigdecimal", "minAvailableSpaceMB": "bigdecimal", "mapMinInclusionInPercentages": "bigdecimal", "matomoUrl": "string", "matomoDimensionId": "string", "matomoSiteId": "string", "lastCheckingMapUpdatesDate": "date", "lastConfigUpdateDate": "date"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.put(url, JSON.stringify(body), params);

    //         check(request, {
    //             "Updated map configs": (r) => r.status === 200
    //         });
    //     }
    // });


    // group("/api/projectManagement/devices/project/{projectId}", () => {
    //     let projectId = '12'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_getDevicesByProject
    //     {
    //         let url = BASE_URL + `/api/projectManagement/devices/project/${projectId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    // group("/api/projectManagement/devices/catalogId/{catalogId}", () => {
    //     let catalogId = 'TODO_EDIT_THE_CATALOGID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_getDevicesByCatalogId
    //     {
    //         let url = BASE_URL + `/api/projectManagement/devices/catalogId/${catalogId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/group", () => {

    //     // Request No. 1: GroupController_getGroups
    //     {
    //         let url = BASE_URL + `/api/group`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });

    //         sleep(SLEEP_DURATION);
    //     }

    //     // Request No. 2: GroupController_createGroup
    //     {
    //         let url = BASE_URL + `/api/group`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"name": "string", "description": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/map/maps", () => {

    //     // Request No. 1: GetMapController_getAllMaps
    //     {
    //         let url = BASE_URL + `/api/map/maps`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/upload/artifact", () => {

    //     // Request No. 1: UploadController_uploadArtifact
    //     {
    //         let url = BASE_URL + `/api/upload/artifact`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"platform": "string", "component": "string", "formation": "string", "oS": "string", "version": "string", "releaseNotes": "string", "size": "string", "url": "string", "artifactType": "string", "uploadToken": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/projectManagement/project/{projectId}/member", () => {
    //     let projectId = 'TODO_EDIT_THE_PROJECTID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_addMemberToProject
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project/${projectId}/member`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"email": "string", "firstName": "string", "lastName": "string", "role": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/map/map/{catalogId}", () => {
    //     let catalogId = 'TODO_EDIT_THE_CATALOGID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: GetMapController_getMap
    //     {
    //         let url = BASE_URL + `/api/map/map/${catalogId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    // group("/api/device/im/pull/discovery", () => {

    //     // Request No. 1: DiscoveryController_imPullDiscoveryDevices
    //     {
    //         let url = BASE_URL + `/api/device/im/pull/discovery`;
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, params);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/device/info/installed/{deviceId}", () => {
    //     let deviceId = 'TODO_EDIT_THE_DEVICEID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: DeviceController_getDeviceContentInstalled
    //     {
    //         let url = BASE_URL + `/api/device/info/installed/${deviceId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/device/devices", () => {

    //     // Request No. 1: DeviceController_getRegisteredDevices
    //     {
    //         let url = BASE_URL + `/api/device/devices`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/offering/component/{catalogId}", () => {
    //     let catalogId = 'TODO_EDIT_THE_CATALOGID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: OfferingController_getOfferingOfComp
    //     {
    //         let url = BASE_URL + `/api/offering/component/${catalogId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });


    // group("/api/upload/manifest", () => {

    //     // Request No. 1: UploadController_uploadManifest
    //     {
    //         let url = BASE_URL + `/api/upload/manifest`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"file": http.file(open("/path/to/file.bin", "b"), "test.bin"), "uploadToken": "string"};
    //         let params = {headers: {"Content-Type": "multipart/form-data", "Accept": "application/json"}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/device/register", () => {

    //     // Request No. 1: DeviceController_register
    //     {
    //         let url = BASE_URL + `/api/device/register`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"deviceId": "string", "userName": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/deploy/updateDeployStatus", () => {

    //     // Request No. 1: DeployController_updateDeployStatus
    //     {
    //         let url = BASE_URL + `/api/deploy/updateDeployStatus`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"deviceId": "string", "catalogId": "string", "deployStop": "date", "deployStart": "date", "deployDone": "date", "deployEstimateTime": "bigdecimal", "currentTime": "date", "deployStatus": "string", "type": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/upload/updateUploadStatus", () => {

    //     // Request No. 1: UploadController_updateUploadStatus
    //     {
    //         let url = BASE_URL + `/api/upload/updateUploadStatus`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"catalogId": "string", "status": "string", "uploadToken": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "return 201 with no body": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/projectManagement/project/{projectId}/projectReleases", () => {
    //     let projectId = 'TODO_EDIT_THE_PROJECTID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_getProjectReleases
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project/${projectId}/projectReleases`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    // group("/api/projectManagement/project/{projectId}/member/{memberId}", () => {
    //     let projectId = 'TODO_EDIT_THE_PROJECTID'; // specify value as there is no example value for this parameter in OpenAPI spec
    //     let memberId = 'TODO_EDIT_THE_MEMBERID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_editMember
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project/${projectId}/member/${memberId}`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"firstName": "string", "lastName": "string", "role": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.put(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });

    //         sleep(SLEEP_DURATION);
    //     }

    //     // Request No. 2: ProjectManagementController_removeMemberFromProject
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project/${projectId}/member/${memberId}`;
    //         let request = http.del(url);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/group/devices", () => {

    //     // Request No. 1: GroupController_setDevicesInGroup
    //     {
    //         let url = BASE_URL + `/api/group/devices`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"id": "bigdecimal", "devices": "list", "groups": "list"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/group/{groupId}/devices", () => {
    //     let groupId = 'TODO_EDIT_THE_GROUPID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: GroupController_getGroupDevices
    //     {
    //         let url = BASE_URL + `/api/group/${groupId}/devices`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    //
    // group("/api/device/{deviceId}/maps", () => {
    //     let deviceId = 'TODO_EDIT_THE_DEVICEID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: DeviceController_getDeviceMaps
    //     {
    //         let url = BASE_URL + `/api/device/${deviceId}/maps`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    // group("/api/projectManagement/project/{projectId}/createToken", () => {
    //     let projectId = 'TODO_EDIT_THE_PROJECTID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_createToken
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project/${projectId}/createToken`;
    //         let request = http.post(url);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/map/job/updates/start", () => {

    //     // Request No. 1: GetMapController_startMapUpdatedCronJob
    //     {
    //         let url = BASE_URL + `/api/map/job/updates/start`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/upload/lastVersion/{projectId}", () => {
    //     let projectId = 'TODO_EDIT_THE_PROJECTID'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: UploadController_getLastVersion
    //     {
    //         let url = BASE_URL + `/api/upload/lastVersion/${projectId}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    // 
    // group("/api/projectManagement/projectConfigOption", () => {
    //
    //     // Request No. 1: ProjectManagementController_getProjectConfigOption
    //     {
    //         let url = BASE_URL + `/api/projectManagement/projectConfigOption`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });

    //         sleep(SLEEP_DURATION);
    //     }

    //     // Request No. 2: ProjectManagementController_setProjectConfigOption
    //     {
    //         let url = BASE_URL + `/api/projectManagement/projectConfigOption`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"platforms": "list", "formations": "list", "categories": "list", "operationsSystem": "list"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    //
    // group("/api/map/offering", () => {

    //     // Request No. 1: GetMapController_getOffering
    //     {
    //         let url = BASE_URL + `/api/map/offering`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    //
    // group("/api/projectManagement/devices/platform/{platform}", () => {
    //     let platform = 'TODO_EDIT_THE_PLATFORM'; // specify value as there is no example value for this parameter in OpenAPI spec

    //     // Request No. 1: ProjectManagementController_getDeviceByPlatform
    //     {
    //         let url = BASE_URL + `/api/projectManagement/devices/platform/${platform}`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });
    //
    // group("/api/login/refresh", () => {

    //     // Request No. 1: LoginController_getRefreshToken
    //     {
    //         let url = BASE_URL + `/api/login/refresh`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"refreshToken": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });
    // 
    // group("/api/projectManagement/project", () => {

    //     // Request No. 1: ProjectManagementController_getUserProjects
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project`;
    //         let request = http.get(url);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });

    //         sleep(SLEEP_DURATION);
    //     }

    //     // Request No. 2: ProjectManagementController_createProject
    //     {
    //         let url = BASE_URL + `/api/projectManagement/project`;
    //         // TODO: edit the parameters of the request body.
    //         let body = {"componentName": "string", "oS": "string", "platformType": "string", "formation": "string", "artifactType": "string", "category": "string", "description": "string"};
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, JSON.stringify(body), params);

    //         check(request, {
    //             "": (r) => r.status === 200
    //         });
    //     }
    // });

    // group("/api/map/export-notification", () => {

    //     // Request No. 1: GetMapController_exportNotification
    //     {
    //         let url = BASE_URL + `/api/map/export-notification`;
    //         let request = http.post(url);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });

    // group("/api/device/im/push/discovery", () => {

    //     // Request No. 1: DiscoveryController_imPushDiscoveryDevices
    //     {
    //         let url = BASE_URL + `/api/device/im/push/discovery`;
    //         let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
    //         let request = http.post(url, params);

    //         check(request, {
    //             "": (r) => r.status === 201
    //         });
    //     }
    // });