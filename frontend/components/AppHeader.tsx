"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Brandmark, Button, Icon, Segmented } from "./sb/primitives";

type Route = "home" | "log" | "charts";

const ROUTE_TO_PATH: Record<Route, string> = {
  home: "/",
  log: "/log",
  charts: "/analytics",
};

function pathToRoute(path: string): Route {
  if (path.startsWith("/log")) return "log";
  if (path.startsWith("/analytics")) return "charts";
  return "home";
}

export default function AppHeader({
  entryCount,
  onNew,
}: {
  entryCount?: number;
  onNew?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const route = pathToRoute(pathname);

  const [today, setToday] = useState("");
  useEffect(() => {
    const d = new Date();
    setToday(
      d
        .toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
        .toLowerCase(),
    );
  }, []);

  return (
    <header className="sb-topbar">
      <div className="sb-topbar__brand">
        <Brandmark />
        <span className="sb-brandname">
          shippy<span className="sb-brandname__dim">.board</span>
        </span>
      </div>

      <Segmented<Route>
        value={route}
        onChange={(next) => router.push(ROUTE_TO_PATH[next])}
        options={[
          { value: "home", label: "home" },
          { value: "log", label: "log", count: entryCount },
          { value: "charts", label: "charts" },
        ]}
      />

      <div className="sb-topbar__right">
        {today && <span className="sb-topbar__date">{today}</span>}
        {onNew && (
          <Button
            variant="primary"
            size="sm"
            icon={<Icon name="plus" />}
            onClick={onNew}
          >
            log
          </Button>
        )}
      </div>
    </header>
  );
}
