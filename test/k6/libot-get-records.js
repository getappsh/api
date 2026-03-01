import http from "k6/http";

export function getRecords () {
    const url = 'https://raster-pycsw-int-nginx-route-integration.apps.j1lk3njp.eastus.aroapp.io/api/raster/v1/GetRecords';
    const headers = {
        'Content-Type': 'application/xml',
        'X-API-KEY': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im1hcC1jb2xvbmllcy1pbnQifQ.eyJkIjpbInJhc3RlciIsInJhc3RlckV4cG9ydCJdLCJpYXQiOjE2NzYyMTQ5NzIsInN1YiI6ImdldE1hcEN1c3RvbWVyIiwiaXNzIjoibWFwY29sb25pZXMtdG9rZW4tY2xpIn0.TYqpoyw_s1JXoELi2k2wGJ3vEvlt3JH5KexGOeKPKeBWWVMVUkXnU0pDJSMLRNwLvlnkEa0hRT2Ktw9bVcL5lVytHR4Yex_8Tv0EA1RQyrcQ-MndumuwI4O6-6dqI5iGAmd6SAhBSP3cOkdsYDhRz_IT4ZQrqmN17Lty9UfQNEGLJnsH-egc8aQKe3iGas8G5uZE8QlQJkw8k9HMObSk1J70IHmp75S1JEZ3Jvk0fymaeVyAuh1_TLixOPoVFc65vGti2uplMRiylsZNxPML1fAHcLWVZP_VnB_IbcGKiHeWWTxJmVruV6iANCFSiQI8S1GnyA15afJbKZw5ByTAIg',
        'Cookie': '9964564006cc14c489744e37ace71ff5=8e285b5a8c09d99871ad2ec3815bd557'
    };

    const body = `
        <csw:GetRecords
          xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
          xmlns:ogc="http://www.opengis.net/ogc"
          xmlns:mc="http://schema.mapcolonies.com/raster"
          service="CSW" version="2.0.2"
          maxRecords="25"  startPosition="1"
          outputSchema="http://schema.mapcolonies.com/raster" >
          <csw:Query typeNames="mc:MCRasterRecord">
          <csw:ElementSetName>full</csw:ElementSetName>
              <csw:Constraint version="1.1.0">
              <Filter xmlns="http://www.opengis.net/ogc">
              <And>
                  <PropertyIsEqualTo>
                      <PropertyName>mc:productType</PropertyName>
                      <Literal>Orthophoto</Literal>
                  </PropertyIsEqualTo>
                  <PropertyIsEqualTo>
                      <PropertyName>mc:transparency</PropertyName>
                      <Literal>OPAQUE</Literal>
                  </PropertyIsEqualTo>
                  <PropertyIsGreaterThan>
                      <PropertyName>mc:ingestionDate</PropertyName>
                      <Literal>2023-10-15T00:00:01Z</Literal>
                  </PropertyIsGreaterThan>
                  <PropertyIsLessThanOrEqualTo>
                      <PropertyName>mc:maxResolutionDeg</PropertyName>
                      <Literal>0.00000536442</Literal>
                  </PropertyIsLessThanOrEqualTo>
              </And>
          </Filter>
          </csw:Constraint>
          <ogc:SortBy>
              <ogc:SortProperty>
                  <ogc:PropertyName>mc:ingestionDate</ogc:PropertyName>
                  <ogc:SortOrder>DESC</ogc:SortOrder>
              </ogc:SortProperty>
          </ogc:SortBy>
          </csw:Query>
          </csw:GetRecords>
    `;

    const response = http.post(url, body, { headers: headers });

    
    check(response, {
      "Discovery successful": (r) => {if (r.status !== 200) {
        fail(`Discovery failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
    }
    return true;}
  });
  sleep(1)

}