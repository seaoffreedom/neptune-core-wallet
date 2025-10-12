/**
 * Mining Settings Display Component
 *
 * Shows the user's current mining settings in a readable format
 */

import { Settings, Shield, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { NeptuneCoreSettings } from '@/shared/types/neptune-core-settings';

interface MiningSettingsDisplayProps {
  settings: NeptuneCoreSettings;
}

export function MiningSettingsDisplay({
  settings,
}: MiningSettingsDisplayProps) {
  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (typeof value === 'string') {
      return value || 'Not set';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return String(value);
  };

  const getStatusBadge = (value: boolean) => {
    if (value) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Enabled
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-gray-100 text-gray-600 border-gray-200"
      >
        Disabled
      </Badge>
    );
  };

  const miningSettings = [
    {
      category: 'Proof Upgrading',
      icon: Zap,
      color: 'text-blue-600',
      settings: [
        {
          key: 'txProofUpgrading',
          label: 'Transaction Proof Upgrading',
          value: settings.mining.txProofUpgrading,
          description: 'Convert proof collections to single proofs',
        },
        {
          key: 'txUpgradeFilter',
          label: 'Upgrade Filter',
          value: settings.mining.txUpgradeFilter,
          description: 'Filter for transactions to upgrade',
        },
      ],
    },
    {
      category: 'Block Composition',
      icon: Users,
      color: 'text-green-600',
      settings: [
        {
          key: 'compose',
          label: 'Block Composition',
          value: settings.mining.compose,
          description: 'Include transactions in blocks',
        },
        {
          key: 'maxNumComposeMergers',
          label: 'Max Compose Mergers',
          value: settings.mining.maxNumComposeMergers,
          description: 'Maximum number of compose mergers',
        },
        {
          key: 'secretCompositions',
          label: 'Secret Compositions',
          value: settings.mining.secretCompositions,
          description: 'Use secret compositions',
        },
      ],
    },
    {
      category: 'Mining Parameters',
      icon: Shield,
      color: 'text-purple-600',
      settings: [
        {
          key: 'gobblingFraction',
          label: 'Gobbling Fraction',
          value: settings.mining.gobblingFraction,
          description: 'Fraction of mempool to process',
        },
        {
          key: 'minGobblingFee',
          label: 'Minimum Gobbling Fee',
          value: settings.mining.minGobblingFee,
          description: 'Minimum fee for gobbling transactions',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Current Mining Settings
        </h2>
        <p className="text-muted-foreground">
          Your current mining configuration and parameters.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {miningSettings.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 ${category.color}`} />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.settings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      {typeof setting.value === 'boolean' ? (
                        getStatusBadge(setting.value)
                      ) : (
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatValue(setting.value)}
                        </Badge>
                      )}
                    </div>
                    {setting.key !==
                      category.settings[category.settings.length - 1].key && (
                      <Separator />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
