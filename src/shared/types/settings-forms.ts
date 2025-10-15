/**
 * Settings Forms Type Definitions
 *
 * Shared types for all settings forms to eliminate duplication
 * and ensure consistency across the application.
 */

import type { BaseSettingsFormProps } from "./common";

// ============================================================================
// Settings Form Data Types
// ============================================================================

/**
 * Network settings form data
 */
export interface NetworkSettingsFormData {
    rpcPort: number;
    p2pPort: number;
    maxConnections: number;
    enableUpnp: boolean;
    enableNatPmp: boolean;
    enableDnsSeeds: boolean;
    enablePeerDiscovery: boolean;
    banThreshold: number;
    banDuration: number;
    connectionTimeout: number;
    handshakeTimeout: number;
    keepAliveInterval: number;
    maxInboundConnections: number;
    maxOutboundConnections: number;
    enableCompression: boolean;
    enableEncryption: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerSecond: number;
    maxRequestSize: number;
    enableCors: boolean;
    corsOrigins: string[];
    enableMetrics: boolean;
    metricsPort: number;
    enableHealthCheck: boolean;
    healthCheckInterval: number;
    enableGracefulShutdown: boolean;
    shutdownTimeout: number;
    [key: string]: unknown;
}

/**
 * Mining settings form data
 */
export interface MiningSettingsFormData {
    enableMining: boolean;
    miningThreads: number;
    miningIntensity: number;
    enableProofUpgrading: boolean;
    proofUpgradeThreshold: number;
    enableBlockComposition: boolean;
    blockCompositionStrategy: string;
    enableGuessing: boolean;
    guessingAlgorithm: string;
    guessingThreads: number;
    enableOptimization: boolean;
    optimizationLevel: number;
    enableProfiling: boolean;
    profilingInterval: number;
    enableStatistics: boolean;
    statisticsInterval: number;
    enableNotifications: boolean;
    notificationThreshold: number;
    enableAutoRestart: boolean;
    autoRestartThreshold: number;
    enableResourceMonitoring: boolean;
    resourceMonitoringInterval: number;
    enablePerformanceTuning: boolean;
    performanceTuningLevel: number;
    enableAdvancedFeatures: boolean;
    advancedFeaturesLevel: number;
    [key: string]: unknown;
}

/**
 * Performance settings form data
 */
export interface PerformanceSettingsFormData {
    enableOptimization: boolean;
    optimizationLevel: number;
    enableCaching: boolean;
    cacheSize: number;
    cacheTtl: number;
    enableCompression: boolean;
    compressionLevel: number;
    enableParallelProcessing: boolean;
    maxWorkers: number;
    enableMemoryManagement: boolean;
    maxMemoryUsage: number;
    enableGarbageCollection: boolean;
    gcInterval: number;
    enableProfiling: boolean;
    profilingInterval: number;
    enableStatistics: boolean;
    statisticsInterval: number;
    enableMonitoring: boolean;
    monitoringInterval: number;
    enableAlerting: boolean;
    alertingThreshold: number;
    enableAutoScaling: boolean;
    autoScalingThreshold: number;
    enableLoadBalancing: boolean;
    loadBalancingStrategy: string;
    enableCircuitBreaker: boolean;
    circuitBreakerThreshold: number;
    enableRetryLogic: boolean;
    maxRetries: number;
    retryDelay: number;
    enableTimeout: boolean;
    timeoutDuration: number;
    enableRateLimiting: boolean;
    rateLimitThreshold: number;
    enableThrottling: boolean;
    throttlingThreshold: number;
    [key: string]: unknown;
}

/**
 * Security settings form data
 */
export interface SecuritySettingsFormData {
    enableEncryption: boolean;
    encryptionAlgorithm: string;
    encryptionKeySize: number;
    enableAuthentication: boolean;
    authenticationMethod: string;
    enableAuthorization: boolean;
    authorizationLevel: number;
    enableAuditLogging: boolean;
    auditLogLevel: string;
    enableIntrusionDetection: boolean;
    intrusionDetectionLevel: number;
    enableFirewall: boolean;
    firewallRules: string[];
    enableAntivirus: boolean;
    antivirusEngine: string;
    enableMalwareProtection: boolean;
    malwareProtectionLevel: number;
    enablePhishingProtection: boolean;
    phishingProtectionLevel: number;
    enableSpamProtection: boolean;
    spamProtectionLevel: number;
    enableDdosProtection: boolean;
    ddosProtectionLevel: number;
    enableBruteForceProtection: boolean;
    bruteForceProtectionLevel: number;
    enableSessionManagement: boolean;
    sessionTimeout: number;
    enablePasswordPolicy: boolean;
    passwordPolicyLevel: number;
    enableTwoFactorAuth: boolean;
    twoFactorAuthMethod: string;
    enableBiometricAuth: boolean;
    biometricAuthMethod: string;
    enableHardwareSecurity: boolean;
    hardwareSecurityLevel: number;
    enableSecureBoot: boolean;
    secureBootLevel: number;
    enableSecureStorage: boolean;
    secureStorageLevel: number;
    enableSecureCommunication: boolean;
    secureCommunicationLevel: number;
    enableSecureDeletion: boolean;
    secureDeletionLevel: number;
    enableSecureBackup: boolean;
    secureBackupLevel: number;
    enableSecureRecovery: boolean;
    secureRecoveryLevel: number;
    [key: string]: unknown;
}

/**
 * Data settings form data
 */
export interface DataSettingsFormData {
    enableDataCollection: boolean;
    dataCollectionLevel: number;
    enableDataProcessing: boolean;
    dataProcessingLevel: number;
    enableDataStorage: boolean;
    dataStorageLevel: number;
    enableDataBackup: boolean;
    dataBackupLevel: number;
    enableDataRecovery: boolean;
    dataRecoveryLevel: number;
    enableDataEncryption: boolean;
    dataEncryptionLevel: number;
    enableDataCompression: boolean;
    dataCompressionLevel: number;
    enableDataDeduplication: boolean;
    dataDeduplicationLevel: number;
    enableDataValidation: boolean;
    dataValidationLevel: number;
    enableDataIntegrity: boolean;
    dataIntegrityLevel: number;
    enableDataPrivacy: boolean;
    dataPrivacyLevel: number;
    enableDataRetention: boolean;
    dataRetentionPeriod: number;
    enableDataArchival: boolean;
    dataArchivalLevel: number;
    enableDataMigration: boolean;
    dataMigrationLevel: number;
    enableDataSynchronization: boolean;
    dataSynchronizationLevel: number;
    enableDataReplication: boolean;
    dataReplicationLevel: number;
    enableDataSharding: boolean;
    dataShardingLevel: number;
    enableDataPartitioning: boolean;
    dataPartitioningLevel: number;
    enableDataIndexing: boolean;
    dataIndexingLevel: number;
    enableDataSearching: boolean;
    dataSearchingLevel: number;
    enableDataFiltering: boolean;
    dataFilteringLevel: number;
    enableDataSorting: boolean;
    dataSortingLevel: number;
    enableDataAggregation: boolean;
    dataAggregationLevel: number;
    enableDataAnalytics: boolean;
    dataAnalyticsLevel: number;
    enableDataReporting: boolean;
    dataReportingLevel: number;
    enableDataVisualization: boolean;
    dataVisualizationLevel: number;
    enableDataExport: boolean;
    dataExportLevel: number;
    enableDataImport: boolean;
    dataImportLevel: number;
    [key: string]: unknown;
}

/**
 * Advanced settings form data
 */
export interface AdvancedSettingsFormData {
    enableAdvancedFeatures: boolean;
    advancedFeaturesLevel: number;
    enableExperimentalFeatures: boolean;
    experimentalFeaturesLevel: number;
    enableBetaFeatures: boolean;
    betaFeaturesLevel: number;
    enableAlphaFeatures: boolean;
    alphaFeaturesLevel: number;
    enableDebugMode: boolean;
    debugModeLevel: number;
    enableVerboseLogging: boolean;
    verboseLoggingLevel: number;
    enableTraceLogging: boolean;
    traceLoggingLevel: number;
    enablePerformanceProfiling: boolean;
    performanceProfilingLevel: number;
    enableMemoryProfiling: boolean;
    memoryProfilingLevel: number;
    enableCpuProfiling: boolean;
    cpuProfilingLevel: number;
    enableNetworkProfiling: boolean;
    networkProfilingLevel: number;
    enableDiskProfiling: boolean;
    diskProfilingLevel: number;
    enableDatabaseProfiling: boolean;
    databaseProfilingLevel: number;
    enableApiProfiling: boolean;
    apiProfilingLevel: number;
    enableUiProfiling: boolean;
    uiProfilingLevel: number;
    enableComponentProfiling: boolean;
    componentProfilingLevel: number;
    enableHookProfiling: boolean;
    hookProfilingLevel: number;
    enableStoreProfiling: boolean;
    storeProfilingLevel: number;
    enableServiceProfiling: boolean;
    serviceProfilingLevel: number;
    enableUtilityProfiling: boolean;
    utilityProfilingLevel: number;
    enableMiddlewareProfiling: boolean;
    middlewareProfilingLevel: number;
    enablePluginProfiling: boolean;
    pluginProfilingLevel: number;
    enableExtensionProfiling: boolean;
    extensionProfilingLevel: number;
    enableCustomProfiling: boolean;
    customProfilingLevel: number;
    enableThirdPartyProfiling: boolean;
    thirdPartyProfilingLevel: number;
    enableExternalProfiling: boolean;
    externalProfilingLevel: number;
    enableRemoteProfiling: boolean;
    remoteProfilingLevel: number;
    enableDistributedProfiling: boolean;
    distributedProfilingLevel: number;
    enableCloudProfiling: boolean;
    cloudProfilingLevel: number;
    enableEdgeProfiling: boolean;
    edgeProfilingLevel: number;
    enableMobileProfiling: boolean;
    mobileProfilingLevel: number;
    enableDesktopProfiling: boolean;
    desktopProfilingLevel: number;
    enableWebProfiling: boolean;
    webProfilingLevel: number;
    enableServerProfiling: boolean;
    serverProfilingLevel: number;
    enableClientProfiling: boolean;
    clientProfilingLevel: number;
    enableHybridProfiling: boolean;
    hybridProfilingLevel: number;
    [key: string]: unknown;
}

/**
 * Price settings form data
 */
export interface PriceSettingsFormData {
    enabled: boolean;
    currency: "USD" | "EUR" | "GBP";
    cacheTtl: number;
    [key: string]: unknown;
}

// ============================================================================
// Settings Form Props Types
// ============================================================================

/**
 * Network settings form props
 */
export interface NetworkSettingsFormProps
    extends BaseSettingsFormProps<NetworkSettingsFormData> {}

/**
 * Mining settings form props
 */
export interface MiningSettingsFormProps
    extends BaseSettingsFormProps<MiningSettingsFormData> {}

/**
 * Performance settings form props
 */
export interface PerformanceSettingsFormProps
    extends BaseSettingsFormProps<PerformanceSettingsFormData> {}

/**
 * Security settings form props
 */
export interface SecuritySettingsFormProps
    extends BaseSettingsFormProps<SecuritySettingsFormData> {}

/**
 * Data settings form props
 */
export interface DataSettingsFormProps
    extends BaseSettingsFormProps<DataSettingsFormData> {}

/**
 * Advanced settings form props
 */
export interface AdvancedSettingsFormProps
    extends BaseSettingsFormProps<AdvancedSettingsFormData> {}

/**
 * Price settings form props
 */
export interface PriceSettingsFormProps
    extends BaseSettingsFormProps<PriceSettingsFormData> {}

// ============================================================================
// Settings Form Component Types
// ============================================================================

/**
 * All settings form data types union
 */
export type AllSettingsFormData =
    | NetworkSettingsFormData
    | MiningSettingsFormData
    | PerformanceSettingsFormData
    | SecuritySettingsFormData
    | DataSettingsFormData
    | AdvancedSettingsFormData
    | PriceSettingsFormData;

/**
 * All settings form props types union
 */
export type AllSettingsFormProps =
    | NetworkSettingsFormProps
    | MiningSettingsFormProps
    | PerformanceSettingsFormProps
    | SecuritySettingsFormProps
    | DataSettingsFormProps
    | AdvancedSettingsFormProps
    | PriceSettingsFormProps;

/**
 * Settings form data type map
 */
export interface SettingsFormDataMap {
    network: NetworkSettingsFormData;
    mining: MiningSettingsFormData;
    performance: PerformanceSettingsFormData;
    security: SecuritySettingsFormData;
    data: DataSettingsFormData;
    advanced: AdvancedSettingsFormData;
    priceFetching: PriceSettingsFormData;
}

/**
 * Settings form props type map
 */
export interface SettingsFormPropsMap {
    network: NetworkSettingsFormProps;
    mining: MiningSettingsFormProps;
    performance: PerformanceSettingsFormProps;
    security: SecuritySettingsFormProps;
    data: DataSettingsFormProps;
    advanced: AdvancedSettingsFormProps;
    priceFetching: PriceSettingsFormProps;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract form data type from form props
 */
export type ExtractFormData<T> =
    T extends BaseSettingsFormProps<infer U> ? U : never;

/**
 * Create form props type from form data
 */
export type CreateFormProps<T extends Record<string, unknown>> =
    BaseSettingsFormProps<T>;

/**
 * Settings category type
 */
export type SettingsCategory = keyof SettingsFormDataMap;

/**
 * Get form data type by category
 */
export type GetFormDataByCategory<T extends SettingsCategory> =
    SettingsFormDataMap[T];

/**
 * Get form props type by category
 */
export type GetFormPropsByCategory<T extends SettingsCategory> =
    SettingsFormPropsMap[T];
