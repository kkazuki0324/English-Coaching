// Main infrastructure template for English Coaching
targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name of the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

// Generate a unique token for resource names
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

// User assigned managed identity
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'mi-${resourceToken}'
  location: location
  tags: tags
}

// Static Web App for frontend
module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp'
  params: {
    name: 'swa-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'frontend' })
  }
}

// Container Apps Environment
module containerAppsEnvironment 'modules/container-apps-environment.bicep' = {
  name: 'container-apps-environment'
  params: {
    name: 'cae-${resourceToken}'
    location: location
    tags: tags
  }
}

// Backend API on Container Apps
module containerApp 'modules/container-app.bicep' = {
  name: 'container-app'
  params: {
    name: 'ca-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'backend' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    managedIdentityName: managedIdentity.name
  }
}

// Cosmos DB for data storage
module cosmosDb 'modules/cosmos-db.bicep' = {
  name: 'cosmos-db'
  params: {
    name: 'cosmos-${resourceToken}'
    location: location
    tags: tags
    managedIdentityName: managedIdentity.name
  }
}

// Azure OpenAI for AI coaching
module openAI 'modules/openai.bicep' = {
  name: 'openai'
  params: {
    name: 'openai-${resourceToken}'
    location: location
    tags: tags
    managedIdentityName: managedIdentity.name
  }
}

// Cognitive Services for Speech
module cognitiveServices 'modules/cognitive-services.bicep' = {
  name: 'cognitive-services'
  params: {
    name: 'cs-${resourceToken}'
    location: location
    tags: tags
    managedIdentityName: managedIdentity.name
  }
}

// Storage Account for audio files and assets
module storageAccount 'modules/storage-account.bicep' = {
  name: 'storage-account'
  params: {
    name: 'st${resourceToken}'
    location: location
    tags: tags
    managedIdentityName: managedIdentity.name
  }
}

// Outputs for application configuration
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup().name

// Service endpoints
output FRONTEND_URL string = staticWebApp.outputs.uri
output BACKEND_URL string = containerApp.outputs.uri

// Database connection
output COSMOS_DB_ENDPOINT string = cosmosDb.outputs.endpoint
output COSMOS_DB_DATABASE_NAME string = cosmosDb.outputs.databaseName

// AI services
output AZURE_OPENAI_ENDPOINT string = openAI.outputs.endpoint
output AZURE_SPEECH_ENDPOINT string = cognitiveServices.outputs.endpoint

// Storage
output AZURE_STORAGE_ACCOUNT_NAME string = storageAccount.outputs.name
output AZURE_STORAGE_ACCOUNT_ENDPOINT string = storageAccount.outputs.primaryEndpoint

// Managed Identity
output AZURE_CLIENT_ID string = managedIdentity.properties.clientId
