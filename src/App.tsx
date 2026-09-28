import { useEffect, useState } from "react";
import { useLab } from "@lab/LabContext";
import LabBar from "@lab/LabBar";
import CompareView from "@lab/CompareView";
import DemoPage from "./page/DemoPage";
import { findVariant, rememberViewed } from "./navbars/registry";

// The hash is the route: #<variant-id> shows one navbar, #compare shows them all.
function useHash() {
  const read = () => decodeURIComponent(window.location.hash.slice(1));
  const [hash, setHash] = useState(read);
  useEffect(() => {
    const onChange = () => setHash(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const { embed } = useLab();
  const hash = useHash();

  if (hash === "compare" && !embed) return <CompareView />;

  const variant = findVariant(hash);
  const { Navbar } = variant;
  rememberViewed(variant.id);

  return (
    <>
      {/* key: remount on switch so each variant's effects start from scratch */}
      <Navbar key={variant.id} />
      <DemoPage />
      {embed ? null : <LabBar current={variant.id} />}
    </>
  );
}
