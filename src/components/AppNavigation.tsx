const AppNavigation = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cable Amp Wizard
          </p>
          <h1 className="text-lg font-semibold text-[#334155]">
            海帕龍及PVC軟線安全電流查詢
          </h1>
        </div>
      </div>
    </header>
  );
};

export default AppNavigation;
