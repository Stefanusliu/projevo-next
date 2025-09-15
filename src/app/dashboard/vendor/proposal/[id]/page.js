// Block ALL proposal creation routes
function BlockedProposalDetailPage() {
  console.error("ERROR: Proposal creation should be blocked!");
  return null;
}

BlockedProposalDetailPage.displayName = "BlockedProposalDetailPage";

export default BlockedProposalDetailPage;
