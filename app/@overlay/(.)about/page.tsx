import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseOverlay from "@/components/portfolio/CaseOverlay";
import PortfolioHeader from "@/components/portfolio/PortfolioHeader";

export default function AboutOverlay() {
  return (
    <CaseOverlay label="Kid Long profile" showCloseControl={false}>
      <PortfolioHeader />
      <AboutTemplate />
    </CaseOverlay>
  );
}
