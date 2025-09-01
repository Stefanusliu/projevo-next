// Debug component to understand proposal data structure
export const DebugProposalData = ({ proposal, index }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
      <h5 className="font-bold text-red-800 mb-2">DEBUG - Proposal {index} Data:</h5>
      <div className="text-xs text-red-700 space-y-1">
        <div><strong>Vendor Name:</strong> {proposal.vendorName || 'MISSING'}</div>
        <div><strong>Vendor ID:</strong> {proposal.vendorId || 'MISSING'}</div>
        <div><strong>Vendor Email:</strong> {proposal.vendorEmail || 'MISSING'}</div>
        <div><strong>BOQ Pricing:</strong> {Array.isArray(proposal.boqPricing) ? `${proposal.boqPricing.length} items` : 'NOT ARRAY or MISSING'}</div>
        <div><strong>Total Amount:</strong> {proposal.totalAmount || 'MISSING'}</div>
        <div><strong>Status:</strong> {proposal.status || 'MISSING'}</div>
        <div><strong>Negotiable:</strong> {proposal.negotiable || 'MISSING'}</div>
        <div><strong>All Keys:</strong> {Object.keys(proposal).join(', ')}</div>
        {proposal.boqPricing && Array.isArray(proposal.boqPricing) && proposal.boqPricing.length > 0 && (
          <div>
            <strong>First BOQ Item:</strong>
            <pre className="text-xs mt-1 bg-red-100 p-2 rounded">
              {JSON.stringify(proposal.boqPricing[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
