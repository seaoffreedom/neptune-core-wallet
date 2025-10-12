import {
  ArrowRight,
  Clock,
  Coins,
  Info,
  Lightbulb,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function MiningEducationSection() {
  return (
    <div className="space-y-6">
      {/* Transaction Proof Lifecycle Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Neptune's Three-Step Mining Process</AlertTitle>
        <AlertDescription className="mt-2">
          Neptune uses a unique three-step mining process that separates proof
          generation, block composition, and proof-of-work validation. This
          creates specialized roles and economic incentives for different types
          of miners.
        </AlertDescription>
      </Alert>

      {/* Step-by-Step Process */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Step 1: Proof Upgrading */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Step 1
              </Badge>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Proof Upgrading
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>Who:</strong> Proof Upgraders (specialized services)
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>What:</strong> Convert Proof Collections → Single Proofs
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Hardware:</strong> 64GB+ RAM, powerful CPUs
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Revenue:</strong> 0.05+ NPT per transaction
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3 inline mr-1" />
              Users pay higher fees for third-party proof generation
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Composition */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Step 2
              </Badge>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Composition
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>Who:</strong> Composers (block builders)
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>What:</strong> Select & merge Single Proofs into blocks
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Hardware:</strong> Standard servers
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Revenue:</strong> 0.02 NPT per transaction
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3 inline mr-1" />
              Similar to Ethereum's block builders
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Guessing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200"
              >
                Step 3
              </Badge>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Guessing
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>Who:</strong> Guessers (traditional miners)
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>What:</strong> Solve proof-of-work puzzle
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Hardware:</strong> ASICs, GPUs, mining hardware
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Revenue:</strong> Block rewards + fees
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3 inline mr-1" />
              Final validation step like Bitcoin mining
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Proof Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction Proof Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              <span className="font-medium">Primitive Witness</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              <span className="font-medium">Proof Collection</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              <span className="font-medium">Single Proof</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary">4</Badge>
              <span className="font-medium">Block Proof</span>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fee Economics</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  • <strong>Proof Collections:</strong> Higher fees (0.05+ NPT)
                </div>
                <div>
                  • <strong>Single Proofs:</strong> Lower fees (0.02 NPT)
                </div>
                <div>
                  • <strong>Direct inclusion:</strong> No third-party fees
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Block Structure</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  • <strong>One transaction per block</strong>
                </div>
                <div>
                  • <strong>Throughput via merging</strong>
                </div>
                <div>
                  • <strong>Privacy-preserving</strong>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economic Incentives */}
      <Alert>
        <Coins className="h-4 w-4" />
        <AlertTitle>Economic Incentives</AlertTitle>
        <AlertDescription className="mt-2">
          The three-step process creates economic incentives for specialization.
          Users can choose to pay higher fees for faster proof generation, or
          generate proofs themselves to save on fees. This creates a competitive
          market for proof upgrading services.
        </AlertDescription>
      </Alert>
    </div>
  );
}
