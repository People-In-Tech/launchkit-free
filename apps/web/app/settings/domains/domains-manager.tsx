"use client";

import { useCallback, useState } from "react";
import { DomainList } from "@/components/settings/domain-list";
import { AddDomainDialog } from "@/components/settings/add-domain-dialog";

export function DomainsManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDomainAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddDomainDialog onDomainAdded={handleDomainAdded} />
      </div>
      <DomainList key={refreshKey} />
    </div>
  );
}
