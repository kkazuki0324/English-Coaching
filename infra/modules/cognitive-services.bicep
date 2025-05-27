@description('The name of the Cognitive Services account')
param name string

@description('The location for the Cognitive Services account')
param location string

@description('Tags to be applied to the resource')
param tags object = {}

@description('The name of the managed identity')
param managedIdentityName string

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

resource cognitiveServicesAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: name
    publicNetworkAccess: 'Enabled'
  }
}

// Role assignment for managed identity
resource speechRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cognitiveServicesAccount.id, managedIdentity.id, 'CognitiveServicesUser')
  scope: cognitiveServicesAccount
  properties: {
    principalId: managedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908')
    principalType: 'ServicePrincipal'
  }
}

output name string = cognitiveServicesAccount.name
output id string = cognitiveServicesAccount.id
output endpoint string = cognitiveServicesAccount.properties.endpoint
