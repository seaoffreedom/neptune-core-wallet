/**
 * Mining Role Explanation Component
 *
 * Explains the user's role in Neptune's three-step mining process based on their settings
 */

import {
  AlertTriangle,
  CheckCircle,
  Coins,
  Info,
  Network,
  Shield,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NeptuneCoreSettings } from '@/shared/types/neptune-core-settings';

interface MiningRoleExplanationProps {
  settings: NeptuneCoreSettings;
  network: string | null;
  isMining: boolean;
  hasMiningFlags: boolean;
}

interface RoleInfo {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  requirements: string[];
  revenue: string;
  enabled: boolean;
}

export function MiningRoleExplanation({
  settings,
  network,
  isMining,
  hasMiningFlags,
}: MiningRoleExplanationProps) {
  // Determine user's roles based on settings
  const roles: RoleInfo[] = [
    {
      name: 'Proof Upgrader',
      description:
        'Convert Proof Collections to Single Proofs using powerful hardware',
      icon: Zap,
      color: 'text-muted-foreground',
      requirements: [
        '64GB+ RAM for proof generation',
        'Powerful CPU for cryptographic operations',
        'txProofUpgrading enabled',
      ],
      revenue: 'Earn 0.05+ NPT per transaction from users',
      enabled: settings.mining.txProofUpgrading,
    },
    {
      name: 'Composer',
      description: 'Include Single Proofs and transactions in blocks',
      icon: Users,
      color: 'text-muted-foreground',
      requirements: [
        'compose enabled',
        'Network connectivity',
        'Sufficient disk space',
      ],
      revenue: 'Earn block rewards and transaction fees',
      enabled: settings.mining.compose,
    },
    {
      name: 'Guesser (PoW)',
      description: 'Solve cryptographic puzzles to secure the blockchain',
      icon: Shield,
      color: 'text-purple-600',
      requirements: [
        'Computational power for proof-of-work',
        'Network connectivity',
        'Mining enabled',
      ],
      revenue: 'Earn block rewards and transaction fees',
      enabled: isMining,
    },
  ];

  const activeRoles = roles.filter((role) => role.enabled);
  const inactiveRoles = roles.filter((role) => !role.enabled);

  const getRoleStatus = (role: RoleInfo) => {
    if (role.enabled) {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getCliArgsBadge = (role: RoleInfo) => {
    let isEnabledViaCli = false;

    // Check if role is enabled via CLI args
    if (role.name === 'Proof Upgrader') {
      isEnabledViaCli = settings.mining.txProofUpgrading;
    } else if (role.name === 'Composer') {
      isEnabledViaCli = settings.mining.compose;
    } else if (role.name === 'Guesser (PoW)') {
      isEnabledViaCli = settings.mining.guess;
    }

    if (isEnabledViaCli) {
      return (
        <Badge variant="outline" className="text-xs">
          CLI Enabled
        </Badge>
      );
    }
    return null;
  };

  const getNetworkStatus = () => {
    if (network === 'regtest') {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Info className="h-3 w-3 mr-1" />
          Regtest Mode
        </Badge>
      );
    }
    if (network === 'main') {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <Shield className="h-3 w-3 mr-1" />
          Mainnet
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Network className="h-3 w-3 mr-1" />
        {network || 'Unknown'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Network Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Mining Role(s)</h2>
          <p className="text-muted-foreground">
            Based on your current settings, here's your role in Neptune's
            three-step mining process.
          </p>
        </div>
        {getNetworkStatus()}
      </div>

      {/* Mining Flags Status Alert */}
      {!hasMiningFlags && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mining Disabled</AlertTitle>
          <AlertDescription>
            No mining flags were used when starting Neptune Core. To enable
            mining, restart with --compose, --guess, or --tx-proof-upgrading
            flags.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Roles */}
      {activeRoles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Active Roles ({activeRoles.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRoles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card key={role.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${role.color}`} />
                        {role.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getCliArgsBadge(role)}
                        {getRoleStatus(role)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="h-4 w-4" />
                        <span className="font-medium">Revenue:</span>
                        <span className="text-muted-foreground">
                          {role.revenue}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Requirements:
                        </p>
                        <ul className="text-xs space-y-1">
                          {role.requirements.map((req) => (
                            <li key={req} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Roles */}
      {inactiveRoles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Available Roles ({inactiveRoles.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveRoles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card key={role.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${role.color}`} />
                        {role.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getCliArgsBadge(role)}
                        {getRoleStatus(role)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="h-4 w-4" />
                        <span className="font-medium">Revenue:</span>
                        <span className="text-muted-foreground">
                          {role.revenue}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          To Enable:
                        </p>
                        <ul className="text-xs space-y-1">
                          {role.requirements.map((req) => (
                            <li key={req} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Network-Specific Information */}
      {network === 'regtest' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Regtest Mode</AlertTitle>
          <AlertDescription className="mt-2">
            You're running in regtest mode, which allows full mining
            functionality for testing. All mining roles are available and you
            can use advanced mining endpoints.
          </AlertDescription>
        </Alert>
      )}

      {network === 'main' && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Mainnet Restrictions</AlertTitle>
          <AlertDescription className="mt-2">
            On mainnet, some mining features are restricted for network safety.
            Proof upgrading and composition are handled by specialized nodes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
