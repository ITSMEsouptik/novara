export const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-brand-charcoal text-[#f5f5f5] text-center">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-sm opacity-80 mb-4">© 2025 Novara. All rights reserved.</p>
        <p className="text-sm opacity-70 max-w-[600px] mx-auto mb-8 leading-relaxed">
          Building the Fully Autonomous AI Ad Agency. <br className="hidden md:inline"/>
          Powered by Novara Ad Orchestrator — integrating Predictive Market Intelligence with Strategic Creative Direction.
        </p>
        <div className="flex justify-center flex-wrap gap-6 text-sm">
          <a href="#support" className="text-brand-primary hover:opacity-80 transition-opacity">Support</a>
          <a href="#terms" className="text-brand-primary hover:opacity-80 transition-opacity">Terms</a>
          <a href="#investors" className="text-brand-primary hover:opacity-80 transition-opacity">Investor Inquiries</a>
        </div>
      </div>
    </footer>
  );
};

