import { NavLink } from "@/components/NavLink";

const AppNavigation = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cable Amp Wizard
          </p>
          <h1 className="text-lg font-semibold text-[#334155]">
            規格與牌價查詢系統
          </h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/"
            end
            className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-[#334155] px-5 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#334155]/5"
            activeClassName="bg-[#334155] text-white shadow-sm hover:bg-[#334155]"
          >
            規格/牌價查詢
          </NavLink>
          <NavLink
            to="/ampacity-calculator"
            className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-[#334155]/60 hover:bg-[#334155]/5"
            activeClassName="border-[#334155] bg-[#334155] text-white shadow-sm hover:bg-[#334155]"
          >
            安全電流查詢
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default AppNavigation;
