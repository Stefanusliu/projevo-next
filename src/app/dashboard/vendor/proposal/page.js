// Block ALL proposal creation routes
function BlockedProposalPage() {
  console.error("ERROR: Proposal creation should be blocked!");
  return null;
}

BlockedProposalPage.displayName = "BlockedProposalPage";

export default BlockedProposalPage;
