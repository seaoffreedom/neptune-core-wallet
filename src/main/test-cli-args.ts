/**
 * Test CLI Args Builder
 * 
 * Simple test script to verify CLI args generation works correctly
 */

import { NeptuneCoreArgsBuilder } from './services/neptune-core-args-builder';
import { peerService } from './services/peer.service';
import { DEFAULT_NEPTUNE_CORE_SETTINGS } from '../shared/types/neptune-core-settings';
import type { NeptuneCoreSettings } from '../shared/types/neptune-core-settings';

async function testCLIArgsBuilder() {
  console.log('🧪 Testing CLI Args Builder...\n');

  const argsBuilder = new NeptuneCoreArgsBuilder(peerService);

  // Test 1: Default settings (should generate minimal args)
  console.log('Test 1: Default settings');
  const defaultArgs = await argsBuilder.buildArgs(DEFAULT_NEPTUNE_CORE_SETTINGS);
  console.log('Generated args:', defaultArgs.join(' '));
  console.log('Args count:', defaultArgs.length);
  console.log('');

  // Test 2: Modified settings (should generate more args)
  console.log('Test 2: Modified settings');
  const modifiedSettings: NeptuneCoreSettings = {
    ...DEFAULT_NEPTUNE_CORE_SETTINGS,
    network: {
      ...DEFAULT_NEPTUNE_CORE_SETTINGS.network,
      network: 'testnet',
      maxNumPeers: 20,
    },
    mining: {
      ...DEFAULT_NEPTUNE_CORE_SETTINGS.mining,
      compose: true,
      guess: true,
    },
    data: {
      ...DEFAULT_NEPTUNE_CORE_SETTINGS.data,
      dataDir: '/custom/data/path',
    },
  };

  const modifiedArgs = await argsBuilder.buildArgs(modifiedSettings);
  console.log('Generated args:', modifiedArgs.join(' '));
  console.log('Args count:', modifiedArgs.length);
  console.log('');

  // Test 3: Preview functionality
  console.log('Test 3: Preview functionality');
  const preview = await argsBuilder.previewArgs(modifiedSettings);
  console.log('Command:', preview.command);
  console.log('Explanation:');
  preview.explanation.forEach(line => console.log(line));
  console.log('');

  console.log('✅ CLI Args Builder tests completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCLIArgsBuilder().catch(console.error);
}

export { testCLIArgsBuilder };
