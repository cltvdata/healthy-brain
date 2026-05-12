const SYSTEM_TESTS = {
  modules: [],
  results: {},
  
  async runAll() {
    console.log('═══════════════════════════════════════');
    console.log('   HEALTHY + BRAIN - SYSTEM TEST SUITE');
    console.log('═══════════════════════════════════════\n');
    
    await this.testModules();
    await this.testUI();
    await this.testIntegrations();
    await this.testPerformance();
    
    this.printSummary();
  },
  
  async testModules() {
    console.log('[1/4] Testing Modules...\n');
    
    const tests = [
      { name: 'NotebookLM Processor', check: () => window.NotebookLMProcessor },
      { name: 'Haptic Engine', check: () => window.HapticEngine },
      { name: 'Stitch Adapter', check: () => window.StitchAdapter },
      { name: 'Mock Data Engine', check: () => window.mockDataEngine },
      { name: 'Firebase Config', check: () => window.firebaseConfig },
      { name: 'Insights Engine', check: () => window.insightsEngine },
      { name: 'i18n System', check: () => window.i18n },
      { name: 'Nano Banana', check: () => window.nanoBanana }
    ];
    
    tests.forEach(t => {
      try {
        const result = t.check();
        this.results[t.name] = result ? 'PASS' : 'FAIL';
        console.log(`  ${result ? '✓' : '✗'} ${t.name}: ${this.results[t.name]}`);
      } catch(e) {
        this.results[t.name] = 'ERROR';
        console.log(`  ✗ ${t.name}: ERROR - ${e.message}`);
      }
    });
    console.log('');
  },
  
  async testUI() {
    console.log('[2/4] Testing UI Components...\n');
    
    const uiTests = [
      { name: 'Haptic Debug Panel', check: () => document.getElementById('hapticPanel') },
      { name: 'Haptic Toggle', check: () => document.getElementById('hapticToggle') },
      { name: 'App Container', check: () => document.querySelector('.app-container') },
      { name: 'Navigation', check: () => document.querySelector('nav, .nav, [class*="nav"]') },
      { name: 'Design System CSS', check: () => getComputedStyle(document.body).fontFamily }
    ];
    
    uiTests.forEach(t => {
      try {
        const result = t.check();
        this.results[t.name] = result ? 'PASS' : 'FAIL';
        console.log(`  ${result ? '✓' : '✗'} ${t.name}: ${this.results[t.name]}`);
      } catch(e) {
        this.results[t.name] = 'ERROR';
        console.log(`  ✗ ${t.name}: ERROR`);
      }
    });
    console.log('');
  },
  
  async testIntegrations() {
    console.log('[3/4] Testing Integrations...\n');
    
    console.log('  → Testing Haptic Patterns...');
    const hapticPatterns = window.HapticEngine?.vibrationPatterns;
    if (hapticPatterns) {
      const patternCount = Object.keys(hapticPatterns).length;
      console.log(`    ✓ ${patternCount} haptic patterns loaded`);
      this.results['Haptic Patterns'] = 'PASS';
    } else {
      console.log('    ✗ No haptic patterns found');
      this.results['Haptic Patterns'] = 'FAIL';
    }
    
    console.log('\n  → Testing NotebookLM Weights...');
    const weights = window.NotebookLMProcessor?.sources;
    if (weights && Object.keys(weights).length > 0) {
      console.log(`    ✓ Notebooks ingested: ${Object.keys(weights).length}`);
      this.results['NotebookLM Sources'] = 'PASS';
    } else {
      console.log('    ⚠ No notebooks loaded (expected with mock data)');
      this.results['NotebookLM Sources'] = 'WARN';
    }
    
    console.log('\n  → Testing Stitch Context...');
    if (window.StitchAdapter) {
      const ctx = window.StitchAdapter.getContextState();
      console.log(`    ✓ Context: ${ctx.timeOfDay} | ${ctx.biometricState} | ${ctx.activityState}`);
      this.results['Stitch Context'] = 'PASS';
    } else {
      this.results['Stitch Context'] = 'FAIL';
    }
    
    console.log('\n  → Testing appState...');
    if (window.appState) {
      console.log(`    ✓ appState: HRV=${window.appState.hrv}, Cortisol=${window.appState.cortisol}`);
      this.results['App State'] = 'PASS';
    } else {
      console.log('    ⚠ appState not initialized');
      this.results['App State'] = 'WARN';
    }
    
    console.log('\n  → Testing Test Scenarios...');
    if (window.testScenarios) {
      const scenarios = Object.keys(window.testScenarios);
      console.log(`    ✓ ${scenarios.length} scenarios available: ${scenarios.join(', ')}`);
      this.results['Test Scenarios'] = 'PASS';
    } else {
      this.results['Test Scenarios'] = 'FAIL';
    }
    
    console.log('');
  },
  
  async testPerformance() {
    console.log('[4/4] Performance Check...\n');
    
    const timing = performance.timing;
    console.log(`  • Page Load Time: ${timing.loadEventEnd - timing.navigationStart}ms`);
    console.log(`  • DOM Content Loaded: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
    
    const jsFiles = document.querySelectorAll('script[src*="js/"]');
    console.log(`  • JS Modules Loaded: ${jsFiles.length}`);
    
    const cssFiles = document.querySelectorAll('link[href*="css"]');
    console.log(`  • CSS Files Loaded: ${cssFiles.length}`);
    
    console.log('');
  },
  
  printSummary() {
    const passed = Object.values(this.results).filter(r => r === 'PASS').length;
    const failed = Object.values(this.results).filter(r => r === 'FAIL').length;
    const warns = Object.values(this.results).filter(r => r === 'WARN').length;
    const total = Object.keys(this.results).length;
    
    console.log('═══════════════════════════════════════');
    console.log('              SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`  PASS: ${passed}/${total}`);
    console.log(`  FAIL: ${failed}/${total}`);
    console.log(`  WARN: ${warns}/${total}`);
    console.log('');
    
    if (failed === 0) {
      console.log('  ✓ SYSTEM READY FOR DEPLOYMENT');
    } else {
      console.log('  ✗ FIX FAILURES BEFORE DEPLOYMENT');
    }
    console.log('═══════════════════════════════════════\n');
  },
  
  quickTest(pattern) {
    if (window.HapticEngine) {
      window.HapticEngine.trigger(pattern);
      console.log(`[QuickTest] Triggered: ${pattern}`);
    }
  }
};

window.SYSTEM_TESTS = SYSTEM_TESTS;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.SYSTEM_TESTS.runAll();
  }, 1000);
});

console.log('[SystemTester] Run: window.SYSTEM_TESTS.runAll()');
console.log('[SystemTester] Quick: window.SYSTEM_TESTS.quickTest("stress")');